#include <assert.h>
#include "../include/utils.hpp"

void test_config_with_defaults(std::string&& config_path)
{
    Config config{ config_path };
    
    if (config.home_dir[config.home_dir.length() - 1] == '/')
        config.home_dir.erase(config.home_dir.length() - 1, 1);
    
    printf("home_dir: %s\n", config.home_dir.data());

    assert(config.account_id ==  "069cde34-1876-757d-8000-48d936fd718c");
    assert(config.resource_id == "069cde34-1876-7ca2-8000-65ce9b272769");
    assert(config.url_auth ==    "http://localhost:8000/app/agent/authenticate");
    assert(config.url_metric ==  "http://localhost:8000/app/agent/metrics");
    assert(config.authenticated == false);
    assert(config.home_dir == "~/.config/telemetry");
    assert(config.meta_file == "resource.meta.json");
    assert(config.agent_private_key == "agent.private.key");
}

int main(int argc, char** argv)
{
    test_config_with_defaults(argv[2]);

    return 0;
}
