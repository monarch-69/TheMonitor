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
#define UNKNOWN_CONFIG_FIELD & nonce3
#define CONFIG_FIELD_NOT_FOUND 4
#define CONFIG_FIELD_INVALID_VALUE 5

#define HOME_DIR_NOT_FOUND 6
#define AGENT_PRIVATE_KEY_NOT_FOUND 7
#define META_FILE_NOT_FOUND 8

#define NETWORK_ERROR 10
#define AGENT_AUTH_FAILED 11

using namespace std;

struct Config {
    bool authenticated;
    string account_id;
    string resource_id;
    string url_init_auth;
    string url_finalize_auth;
    string url_metric;
    string home_dir;
    string agent_private_key;

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

void run();
uint8_t gather(MemStat& mem_stat, CpuStat& cpu_stat, SystemStats& sys_stats, json& jobj);

HttpResponse generate_res(uint16_t status, json& jobj);
pair<string, string> generate_assym_keys();

string nonce_sign(const string& nonce, const string& priv_key);
string auth_initialize(CURL* curl, const string& pub_key, const Config& config);
bool auth_finalize(CURL* curl, const string& nonce, const string& priv_key, const Config& config);
bool authenticate(CURL* curl, const string& pub_key, const string& priv_key, const Config& config);
bool save_privkey(const string& priv_key, const Config& config);
bool save_config(const string& config_path, const Config& config);

int curl_write_cb(void* content, int size, int buf_size, void* user_write_struct);
uint8_t sanity_check(const Config& config);
