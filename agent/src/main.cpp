#include <iostream>
#include <chrono>
#include <nlohmann/json.hpp>
#include "../include/network.hpp"
#include "../include/system.hpp"

using namespace std;

uint8_t run(MemInfo& mem_stat, CpuStat& cpu_stat, SystemStats& sys_stats, json& jobj)
{
    mem_stat.memstat.timestamp = chrono::duration_cast<chrono::seconds>(chrono::system_clock::now().time_since_epoch()).count();
    
    uint8 mem_stat_res = read_mem_stat(mem_stat);
    uint8 cpu_stat_res = read_cpu_stat(cpu_stat);

    if (mem_stat_res != 0) 
        return mem_stat_res;

    if (cpu_stat_res != 0) 
        return cpu_stat_res;

    mem_stat.print_stats();
    cpu_stat.print_stats();

    jobj = sys_stats;
    cout << "Serialized the sys stats: \n" << jobj << '\n';

    return 0;
}

int main()
{  
    // Open up a listener
    TcpSocket socket;
    socket.listener();

    MemInfo mem_stat;
    CpuStat cpu_stat;
    SystemStats sys_stats{ cpu_stat.cpustatagg, mem_stat.memstat };
    json jobj;

    while (true) {
        uint16_t agent_status = STATUS_OK;

        if (run(mem_stat, cpu_stat, sys_stats, jobj) != 0)
            agent_status = STATUS_INTERNAL_ERROR; 
        // Above means that there is an internal error but the agent is running and no telemetry data will be sent.
        // Otherwise the agent would send the 200 status code meaning everything was good with the json telemetry data
        HttpResponse response;
        response.socketfd = socket.descriptor();
        response.statuscode = agent_status;
        response.header("Content-Type", "application/json");
        
        uint64_t content_length = 0;

        switch (agent_status) {
            case STATUS_OK:             response.body = jobj.dump(); content_length = response.body.size(); break;
            case STATUS_INTERNAL_ERROR: content_length = 0; break;
        }
        response.header("Content-Length", to_string(content_length));

        auto result = response.send();
    }

    return 0;
}
