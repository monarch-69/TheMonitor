#include <sodium.h>
#include <utility>
#include <chrono>
#include <curl/curl.h>
#include <fstream>
#include <nlohmann/json.hpp>
#include "../include/utils.hpp"

using namespace std;

Config::Config(string& config_file)
{
    using json = nlohmann::json;

    ifstream stream{ config_file };

    if (!stream.is_open()) {
        printf("Fatal error: '%s' file not found\n", config_file.data());
        exit(CONFIG_FILE_NOT_FOUND);
    }

    json config = json::parse(stream);
    
    this->account_id = config.value("account_id", "");
    if (this->account_id.empty()) {
        printf("Fatal error: required field 'account_id' is either not present or empty\n");
        exit(CONFIG_FIELD_NOT_FOUND);
    }

    this->resource_id = config.value("resource_id", "");
    if (this->resource_id.empty()) {
        printf("Fatal error: required field 'resource_id' is either not present or empty\n");
        exit(CONFIG_FIELD_NOT_FOUND);
    }

    this->url_init_auth = config.value("url_init_auth", "");
    if (this->resource_id.empty()) {
        printf("Fatal error: required field 'url_init_auth' is either not present or empty\n");
        exit(CONFIG_FIELD_NOT_FOUND);
    }
    
    this->url_finalize_auth = config.value("url_finalize_auth", "");
    if (this->resource_id.empty()) {
        printf("Fatal error: required field 'url_finalize_auth' is either not present or empty\n");
        exit(CONFIG_FIELD_NOT_FOUND);
    }

    this->url_metric = config.value("url_metric", "");
    if (this->resource_id.empty()) {
        printf("Fatal error: required field 'url_metric' is either not present or empty\n");
        exit(CONFIG_FIELD_NOT_FOUND);
    }
    
    json::iterator authenticated = config.find("authenticated");
    if (authenticated == config.end()) {
        printf("Fatal error: required field 'authenticated' is missing\n");
        exit(CONFIG_FIELD_NOT_FOUND);
    }
    try {
        this->authenticated = config.value("authenticated", false);
    } catch (const exception e) {
        printf("Fatal error: %s\n", e.what());
        exit(CONFIG_FIELD_INVALID_VALUE);
    }
    
    this->home_dir = config.value("home_dir", "/usr/local/share/telemetry");
    if (this->home_dir[this->home_dir.length() - 1] == '/')
        this->home_dir.erase(this->home_dir.length() - 1, 1);

    this->agent_private_key = config.value("agent_private_key", "agent_private.key");
}

// Helper functions
uint8_t gather(MemStat& mem_stat, CpuStat& cpu_stat, SystemStats& sys_stats, json& jobj)
{
    mem_stat.memstat.timestamp = chrono::duration_cast<chrono::seconds>(
        chrono::system_clock::now().time_since_epoch()
    ).count();

    uint8 mem_stat_res = read_mem_stat(mem_stat);
    uint8 cpu_stat_res = read_cpu_stat(cpu_stat);

    if (mem_stat_res != 0) 
        return mem_stat_res;

    if (cpu_stat_res != 0) 
        return cpu_stat_res;

    mem_stat.print_stats();
    cpu_stat.print_stats();

    jobj = sys_stats;
    printf("Serialized the sys stats: \n%s\n", jobj.dump().data());

    return 0;
}
uint8_t sanity_check(const Config &config)
{
    if (!filesystem::exists(config.home_dir)) {
        printf("Fatal error: the home directory '%s' doesn't exist\n", config.home_dir.data());
        return HOME_DIR_NOT_FOUND;
    }
    
    if (!filesystem::exists(config.home_dir + '/' + config.agent_private_key)) {
        printf("Fatal error: agent private key file '%s' doesn't exist\n", config.agent_private_key.data());
        return AGENT_PRIVATE_KEY_NOT_FOUND;
    }
  
    return SUCCESS;
}

pair<string, string> generate_assym_keys()
{
    unsigned char public_key[crypto_sign_PUBLICKEYBYTES], private_key[crypto_sign_SECRETKEYBYTES];
    crypto_sign_keypair(public_key, private_key);
    
    char public_key_hex[crypto_sign_PUBLICKEYBYTES * 2 + 1], private_key_hex[crypto_sign_SECRETKEYBYTES * 2 + 1];
    
    sodium_bin2hex(
        public_key_hex, sizeof(public_key_hex),
        public_key, crypto_sign_PUBLICKEYBYTES
    );
    sodium_bin2hex(
        private_key_hex, sizeof(private_key_hex),
        private_key, crypto_sign_SECRETKEYBYTES
    );

    return pair<string, string> {
        string(public_key_hex),
        string(private_key_hex)
    };
}

int curl_write_cb(void *content, int size, int buf_size, void *user_write_struct)
{
    int total_size = size * buf_size;
    CurlWBStruct* memory = (CurlWBStruct*)user_write_struct;
    memory->data = (char*)realloc(memory->data, memory->size + total_size + 1);

    if (!memory->data) {
        perror("Error: realloc didn't succeed. Out of memory\n");
        return 0;
    }

    memcpy(&(memory->data[memory->size]), content, total_size);

    memory->size += total_size;
    memory->data[memory->size] = 0;
    
    return total_size;
}

string auth_initialize(CURL *curl, const string& pub_key, const Config& config)
{
    printf("In 'auth_initialize'\n");

    CurlWBStruct curl_wb_struct;
    curl_slist *headers{nullptr};
    json post_data_json{};
    
    headers = curl_slist_append(headers, "Content-Type: application/json");
    post_data_json["resource_id"] = config.resource_id;
    post_data_json["account_id"] = config.account_id;
    post_data_json["pub_key"] = pub_key;
    string post_data = post_data_json.dump();
    printf("Data to send: %s\n", post_data.data());

    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);  
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curl_write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void*)&curl_wb_struct);
    curl_easy_setopt(curl, CURLOPT_URL, config.url_init_auth.data());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (uint32_t)post_data.size());
    
    CURLcode res = curl_easy_perform(curl);
    printf("Returned code from the server: %d and CURL_OK: %d\n", res, CURLE_OK);
    if (res != CURLE_OK) {
        printf("Error: %s\n", curl_wb_struct.data);
        return "";
    }
    
    long status_code{};
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &status_code);
    json response = json::parse(curl_wb_struct.data);
    
    if (status_code != 200) {
        printf("Error: %s\n", response.value("detail", "Some error").data());
        return "";
    }

    curl_easy_reset(curl);

    printf("Out 'auth_initialize'\n");
    
    return response.value("nonce", "");
}

string nonce_sign(const string& nonce, const string& priv_key)
{
    printf("In 'nonce_sign'\n");

    unsigned char priv_key_bin[crypto_sign_SECRETKEYBYTES];
    size_t bin_len{};

    int res = sodium_hex2bin(
        priv_key_bin, crypto_sign_SECRETKEYBYTES,
        priv_key.c_str(), priv_key.size(),
        nullptr, &bin_len,
        nullptr
    );
    
    if (res == -1) {
        printf("Error check the sodium docs\n");
        return string{""};
    }
    
    unsigned char signed_nonce[crypto_sign_BYTES + nonce.size()];
    unsigned long long signed_nonce_size{};

    crypto_sign(
        signed_nonce, &signed_nonce_size,
        reinterpret_cast<const unsigned char*>(nonce.c_str()), nonce.size(),
        priv_key_bin
    );
    
    char signed_nonce_hex[sizeof(signed_nonce) * 2 + 1];

    sodium_bin2hex(
        signed_nonce_hex, sizeof(signed_nonce_hex),
        signed_nonce, sizeof(signed_nonce)
    );

    return string{signed_nonce_hex};

    printf("Out 'nonce_sign'\n");
}

bool auth_finalize(CURL *curl, const string& nonce, const string &priv_key, const Config &config)
{
    printf("In 'auth_finalize'\n");

    string signed_nonce = nonce_sign(nonce, priv_key);
    CurlWBStruct curl_wb_struct;
    curl_slist *headers{nullptr};
    json post_data_json{};
    
    headers = curl_slist_append(headers, "Content-Type: application/json");
    post_data_json["account_id"] = config.account_id;
    post_data_json["resource_id"] = config.resource_id;
    post_data_json["nonce_result"] = signed_nonce;
    string post_data = post_data_json.dump();
    
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);  
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curl_write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void*)&curl_wb_struct);
    curl_easy_setopt(curl, CURLOPT_URL, config.url_finalize_auth.data());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (uint32_t)post_data.size());
    
    CURLcode res = curl_easy_perform(curl);
    
    if (res != CURLE_OK) {
        printf("Error: %s\n", curl_wb_struct.data);
        return false;
    }

    long status_code{};
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &status_code);
    json response = json::parse(curl_wb_struct.data);
    
    if (status_code != 200) {
        printf("Error: %s\n", response.value("detail", "Some error").data());
        return false;
    }

    printf("Received from server: %s\n", curl_wb_struct.data);
    printf("Out 'auth_finalize'\n");

    return true;
}

bool authenticate(CURL* curl, const string& pub_key, const string& priv_key, const Config& config)
{
    printf("In 'authenticate'\n");

    string nonce = auth_initialize(curl, pub_key, config);

    if (nonce.empty())
        return false;

    printf("Nonce = %s\n", nonce.data());
    
    return auth_finalize(curl, nonce, priv_key, config);
}

bool save_privkey(const string& priv_key, const Config& config)
{
    ofstream of_stream{ config.home_dir + '/' + config.agent_private_key };

    if (!of_stream.is_open())
        return false;

    of_stream << priv_key;
    of_stream.close();

    return true;
}

bool save_config(const string& config_path, const Config& config)
{
    ofstream _stream{ config_path };
    json config_json = config;
    
    if (!_stream.is_open()) {
        printf("Config file '%s' not found\n", config_path.data());
        return false;
    }

    _stream << config_json.dump(4);
    _stream.close();

    return true;
}

void run()
{
    MemStat mem_stat;
    CpuStat cpu_stat;
    SystemStats sys_stats{ cpu_stat.cpustatagg, mem_stat.memstat };
    json jobj;

    while (true) {
        uint16_t agent_status = STATUS_OK;

        if (gather(mem_stat, cpu_stat, sys_stats, jobj) != 0)
            agent_status = STATUS_INTERNAL_ERROR; 
        // Above means that there is an internal error but the agent is running and no telemetry data will be sent.
        // Otherwise the agent would sent the 200 status code meaning everything was good with the json telemetry data
    }
}
