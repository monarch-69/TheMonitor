#include <fstream>
#include <string>
#include <sstream>
#include <utility>
#include "../include/system.hpp"

using namespace std;

void print_memstats(const MemStat& mem_stat)
{
    printf(
        "MemTotal = %lf, MemUsed = %lf, MemAvail = %lf, Percentage = %lf\n",
       (double)mem_stat.memtotal / 1024,
       (double)mem_stat.memused / 1024,
       (double)mem_stat.memavail / 1024,
       mem_stat.usedpercent
    );
    printf(
        "SwapTotal = %lf, SwapFree = %lf, SwapAvail = %lf, Percentage = %lf\n",
       (double)mem_stat.swaptotal / 1024,
       (double)mem_stat.swapfree / 1024,
       (double)mem_stat.swapused / 1024,
       mem_stat.swapusedpercent
    );
}

void print_cpustats(const CpuStat& cpu_stat)
{
    printf("No of cores = %lu\n", cpu_stat.totalcores);
    printf("User, UserNice, System, Idle, IoWait, Irq, SoftIrq, Steal, Guest, GuestNice\n");
    
    for (size_t i{0}, size{cpu_stat.cores.size()}; i < size; ++i) {
        if (i == 0)
            printf("Aggregate\n");
        else
            printf("Core: %lu\n", i - 1);
        printf(
            "%lu, %lu, %lu, %lu, %lu, %lu, %lu, %lu, %lu, %lu\n",
            cpu_stat.cores[0].user,
            cpu_stat.cores[0].usernice,
            cpu_stat.cores[0].system,
            cpu_stat.cores[0].idle,
            cpu_stat.cores[0].iowait,
            cpu_stat.cores[0].irq,
            cpu_stat.cores[0].softirq,
            cpu_stat.cores[0].steal,
            cpu_stat.cores[0].guest,
            cpu_stat.cores[0].guestnice
        );
    }
}

void print_stats(const Telemetry::Sample& sample)
{
    printf("Snapshot at = %lu\n", sample.timestamp);
    // First print the memstat
    print_memstats(sample.memstat);
    // Now cpu stats
    print_cpustats(sample.cpustat);
}

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

uint8 read_mem_stat(MemStat& memstat)
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
                memstat.memtotal = stoull(line.substr(spos, len));
                printf("MemTotal = %ld\n", memstat.memtotal);
            } catch (...) {
                printf("Error reading while MemTotal\n");
                return MEM_STAT_MEMTOTAL_READ_FAIL;
            }
        }
        
        if (line.find("MemAvailable:") != string::npos) {
            auto [spos, len] = get_num_pos_len(line);
            try {
                memstat.memavail = stoull(line.substr(spos, len));
                printf("MemAvailable = %ld\n", memstat.memavail);
            } catch (...) {
                printf("Error while reading MemAvailable\n");
                return MEM_STAT_MEMAVAIL_READ_FAIL;
            }   
        }
        
        if (line.find("SwapTotal:") != string::npos) {
            auto [spos, len] = get_num_pos_len(line);
            try {
                memstat.swaptotal = stoull(line.substr(spos, len));
                printf("SwapTotal = %ld\n", memstat.swaptotal);
            } catch (...) {
                printf("Error while reading SwapTotal\n");
                return MEM_STAT_SWAPTOTAL_READ_FAIL;
            }
        }
        
        if (line.find("SwapFree:") != string::npos) {
            auto [spos, len] = get_num_pos_len(line);
            try {
                memstat.swapfree = stoull(line.substr(spos, len));
                printf("SwapFree = %ld\n", memstat.swapfree);
            } catch (...) {
                printf("Error while reading SwapFree\n");
                return MEM_STAT_SWAPFREE_READ_FAIL;
            }
            done = true;
        }

        if (done)
            break;
    }
    memstat.memused = memstat.memtotal - memstat.memavail;
    memstat.usedpercent = ((double)memstat.memused / memstat.memtotal) * 100;
    memstat.swapused = memstat.swaptotal - memstat.swapfree;
    memstat.swapusedpercent = ((double)memstat.swapused / memstat.swaptotal) * 100;
    in_file.close();

    return MEM_STAT_READ_SUCCESS;
}

uint8 read_cpu_stat(CpuStat& cpu_stat)
{
    ifstream in_file{ CPUSTAT };
    
    if (!in_file.is_open()) {
        perror("reading `/proc/stat` failed");
        exit(CPU_STAT_READ_FAIL);
    }
    
    // We don't have to read all the lines read only till cpu_stat.totalcores lines
    for (size_t i{0}; i < cpu_stat.totalcores + 1; ++i) {
        string line{};
        string label{};

        if (!getline(in_file, line)) {
            printf("error `getline`, reading failed: %s", line.data());
            exit(UNKNOWN_ERROR);
        }
        
        istringstream ss{line};
        
        if (!(ss >> label >> cpu_stat.cores[i])) {
            printf("error `stream (ss)`: line - %s, label - %s\n", line.data(), label.data());
            exit(UNKNOWN_ERROR);
        }
        // if (!getline(in_file, line) || !(ss >> label >> cpu_stat.cores[i])) {
        //     const auto& c = cpu_stat.cores[i];
        //
        //     printf("%lu %lu %lu %lu %lu %lu %lu %lu %lu %lu\n",
        //         c.user, c.usernice, c.system, c.idle, c.iowait,
        //         c.irq, c.softirq, c.steal, c.guest, c.guestnice
        //     );
        //
        //     perror("error while reading `/proc/stat`");
        //     in_file.close();
        //     exit(UNKNOWN_ERROR);
        // }
        // const auto& c = cpu_stat.cores[i];
        //
        // printf("%lu %lu %lu %lu %lu %lu %lu %lu %lu %lu\n",
        //     c.user, c.usernice, c.system, c.idle, c.iowait,
        //     c.irq, c.softirq, c.steal, c.guest, c.guestnice
        // );
    }

    in_file.close();

    return CPU_STAT_READ_SUCCESS;
}
