#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <sodium/crypto_sign.h>
#include "../include/utils.hpp"

using namespace std;

int main(int argc, char** argv)
{  
    std::string config_file{ "/usr/local/share/telemetry/config.json" };

    for (int i = 1; i < argc; i++) {
        if (std::strcmp("--config-file", argv[i]) == 0) {
            if ((i + 1) < argc) {
                config_file = argv[++i];
            }
            else
                printf("Warning: used '--config-file' but no path was provided. Using 'config.json'\n");
        }
        else {
            printf("Unknown flag used: '%s'\n", argv[i]);
            exit(UNKNOWN_FLAG_USED);
        }
    }
    
    printf("Initializing the agent...\n");
    printf("Reading the config at: '%s'\n", config_file.data());
    
    Config config{ config_file }; 
    // cURL related Initializations
    curl_global_init(CURL_GLOBAL_ALL);
    CURL* curl = curl_easy_init();
    
    if (!curl) {
        perror("Network error. Couldn't start curl\n");
        exit(NETWORK_ERROR);
    }
    
    // Do some sanity checks.
    if (config.authenticated) {
        if (uint8_t res = sanity_check(config); res != SUCCESS)
            exit(res);

        printf("Already authenticated\n");
    }
    else { 
        // Now generate the keys (public and private)
        auto [pub_key, priv_key] = generate_assym_keys();

        // Now authenticate
        bool authenticated = authenticate(curl, pub_key, priv_key, config);

        if (!authenticated) {
            printf("Authentication Error. \nExiting.\n");
            exit(AGENT_AUTH_FAILED);
        }
        printf("BINGO! Authenticated.\n");
      
        // Write the private key to the file
        save_privkey(priv_key, config);
        config.authenticated = true;
        // Now write the final changed config to the config file
        save_config(config_file, config);
    }
    // run the actual run function

    return 0;
}
