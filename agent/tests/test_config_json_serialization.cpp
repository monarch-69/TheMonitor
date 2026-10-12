#include <fstream>
#include "../include/utils.hpp"

int main()
{
    ifstream _stream{ "../config.json" };

    if (!_stream.is_open()) {
        printf("Can't open file 'config.json'\n");
        return 1;
    }

    // First read json from the file
    json config_json = json::parse(_stream);
    printf("json:\n%s\n", config_json.dump().data());
    // Now serialize into Config from json
    auto config = config_json.get<Config>();
    printf("Config:\n%d,%s,%s,%s,%s,%s,%s,%s\n", 
            config.authenticated,
            config.account_id.data(),
            config.resource_id.data(),
            config.agent_private_key.data(),
            config.home_dir.data(),
            config.url_init_auth.data(),
            config.url_finalize_auth.data(),
            config.url_metric.data());
    
    config.authenticated = true;
    config.home_dir = "another home";
    config.agent_private_key = "agent private key";
    
    json config_json_to_write = config;
    ofstream _o_stream{ "../config.json" };
    
    _o_stream << config_json_to_write.dump(4);
    _o_stream.close();

    return 0;
}
