#pragma once

#include <string>
#include <string>
#include <utility>
#include <curl/curl.h>
#include "../include/system.hpp"
#include "../include/network.hpp"

#define SUCCESS 0
#define UNKNOWN_FLAG_USED 1
#define CONFIG_FILE_NOT_FOUND 2
#define UNKNOWN_CONFIG_FIELD 3
#define CONFIG_FIELD_NOT_FOUND 4
#define CONFIG_FIELD_INVALID_VALUE 5

#define HOME_DIR_NOT_FOUND 6
#define AGENT_PRIVATE_KEY_NOT_FOUND 7
#define META_FILE_NOT_FOUND 8

#define NETWORK_ERROR 10
#define AGENT_AUTH_FAILED 11

using namespace std;

struct Config {
    string account_id;
    string resource_id;
    string url_init_auth;
    string url_finalize_auth;
    string url_metric;
    string home_dir;
    string agent_private_key;
    bool authenticated;

    Config(string& config_file);
    Config() = default;
    ~Config() = default;
    Config(Config &&) = default;
    Config(const Config &) = default;
    Config& operator=(Config &&) = default;
    Config& operator=(const Config &) = default;
    
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(
    Config,
    authenticated, account_id, resource_id,
    url_init_auth, url_finalize_auth, url_metric,
    home_dir, agent_private_key
);


struct CurlWBStruct {
    char* data{nullptr};
    int size{0};
};

void run(CURL* curl, const uint64& phy_no_of_cores);
uint8_t gather(Telemetry::Sample& sample);
void generate_payload(CURL* curl, CurlWBStruct* curl_wb_struct, curl_slist* headers, string& data);
bool send_telemetry(CURL* curl, CurlWBStruct* curl_wb_struct);

HttpResponse generate_res(uint16_t status, json& jobj);
pair<string, string> generate_assym_keys();
uint16_t get_phy_no_of_cores(const string& cpuinfo_path);
uint8_t sanity_check(const Config& config);

string nonce_sign(const string& nonce, const string& priv_key);
string auth_initialize(CURL* curl, const string& pub_key, const Config& config);
bool auth_finalize(CURL* curl, const string& nonce, const string& priv_key, const Config& config);
bool authenticate(CURL* curl, const string& pub_key, const string& priv_key, const Config& config);
bool save_privkey(const string& priv_key, const Config& config);
bool save_config(const string& config_path, const Config& config);

int curl_write_cb(void* content, int size, int buf_size, void* user_write_struct);
