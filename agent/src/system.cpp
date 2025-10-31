#include <fstream>
#include <string>
#include <utility>
#include "../include/system.hpp"

using namespace std;

// Below function is only meant for read_mem_stat
pair<uint64, uint64> get_num_pos_len(const string& line)
{
    uint64 spos = 0, len = 0, linelen = line.length(), i = 0;
    const string numbers = "0123456789";
    
    for (; numbers.find(line[i]) == string::npos; i++);
    spos = i;
    for (; line[i] != ' '; i++);
    len = i - spos;

    printf("spos = %ld, len = %ld\n", spos, len);

    return make_pair(spos, len);
}

uint8 read_mem_stat(MemInfo& memstat)
{
    ifstream in_file{ MEMINFO };
    string line;
    bool done = false;

    if (!in_file.is_open()) {
        printf("Can't open the file\n");
        return MEM_STAT_FILE_OPEN_FAIL;
    }
    
    while (getline(in_file, line)) {
        printf("%s\n", line.c_str());
        
        if (line.find("MemTotal:") != string::npos) {
            auto [spos, len] = get_num_pos_len(line);
            try {
                memstat.memstat.memtotal = stoull(line.substr(spos, len));
                printf("MemTotal = %ld\n", memstat.memstat.memtotal);
            } catch (...) {
                printf("Error reading while MemTotal\n");
                return MEM_STAT_MEMTOTAL_READ_FAIL;
            }
        }
        
        if (line.find("MemAvailable:") != string::npos) {
            auto [spos, len] = get_num_pos_len(line);
            try {
                memstat.memstat.memavail = stoull(line.substr(spos, len));
                printf("MemAvailable = %ld\n", memstat.memstat.memavail);
            } catch (...) {
                printf("Error while reading MemAvailable\n");
                return MEM_STAT_MEMAVAIL_READ_FAIL;
            }   
        }
        
        if (line.find("SwapTotal:") != string::npos) {
            auto [spos, len] = get_num_pos_len(line);
            try {
                memstat.memstat.swaptotal = stoull(line.substr(spos, len));
                printf("SwapTotal = %ld\n", memstat.memstat.swaptotal);
            } catch (...) {
                printf("Error while reading SwapTotal\n");
                return MEM_STAT_SWAPTOTAL_READ_FAIL;
            }
        }
        
        if (line.find("SwapFree:") != string::npos) {
            auto [spos, len] = get_num_pos_len(line);
            try {
                memstat.memstat.swapfree = stoull(line.substr(spos, len));
                printf("SwapFree = %ld\n", memstat.memstat.swapfree);
            } catch (...) {
                printf("Error while reading SwapFree\n");
                return MEM_STAT_SWAPFREE_READ_FAIL;
            }
            done = true;
        }

        if (done)
            break;
    }
    memstat.memstat.memused = memstat.memstat.memtotal - memstat.memstat.memavail;
    memstat.memstat.usedpercent = ((double)memstat.memstat.memused / memstat.memstat.memtotal) * 100;
    memstat.memstat.swapused = memstat.memstat.swaptotal - memstat.memstat.swapfree;
    memstat.memstat.swapusedpercent = ((double)memstat.memstat.swapused / memstat.memstat.swaptotal) * 100;
    in_file.close();

    return MEM_STAT_READ_SUCCESS;
}

uint8 read_cpu_stat(CpuStat& cpu_stat)
{
    ifstream in_file{ CPUSTAT };
    string line;
    
    // We just have to get the first line for now
    // in future update or upgrade maybe we read more lines and make it more complex
    if (!getline(in_file, line)) {
        printf("Error reading the cpu stat\n");
        return CPU_STAT_READ_FAIL;
    }

    // Let's get teh overall cpu stat
    printf("CpuStat: %s\n", line.c_str());

    uint8 pos = 5, spos = 0; // cpu 12893923 0 192839123 121 121 123 8899 0 0 0
    
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.user = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.usernice = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.system = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.idle = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.iowait = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.irq = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.softirq = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.steal = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.guest = stoull(line.substr(pos, spos - pos));
    pos = spos + 1;
    spos = line.find_first_of(' ', pos);
    cpu_stat.cpustatagg.guestnice = stoull(line.substr(pos, spos - pos));
    
    // Now let's get the no of cores
    if (cpu_stat.totalcores == 0) {
        while (getline(in_file, line)) {
            if (line.find("cpu") == string::npos)
                break;
            ++cpu_stat.totalcores;
        }
    }
    in_file.close();

    return CPU_STAT_READ_SUCCESS;
}

// void to_json(json& jobj, MemStats& memstats)
// {
//     jobj = json {
//         {"memused",         memstats.memused},
//         {"memavail",        memstats.memavail},
//         {"memtotal",        memstats.memtotal},
//         {"usedpercent",     memstats.usedpercent},
//         {"swaptotal",       memstats.swaptotal},
//         {"swapfree",        memstats.swapfree},
//         {"swapused",        memstats.swapused},
//         {"swapusedpercent", memstats.swapusedpercent},
//         {"timestamp",       memstats.timestamp}
//     };
// }
//
// void to_json(json& jobj, CpuStat::CpuStatColInfo& cpustats)
// {
//     jobj = json {
//         {"user",      cpustats.user},
//         {"usernice",  cpustats.usernice},
//         {"system",    cpustats.system},
//         {"idle",      cpustats.idle},
//         {"iowait",    cpustats.iowait},
//         {"irq",       cpustats.irq},
//         {"softirq",   cpustats.softirq},
//         {"steal",     cpustats.steal},
//         {"guest",     cpustats.guest},
//         {"guestnice", cpustats.guestnice},
//     };
// }

// void to_json(json& jobj, SystemStats& sysstats)
// {
//     jobj = json {
//         {"cpustat", sysstats.cpustat},
//         {"memstat", sysstats.memstat}
//     };
// }
