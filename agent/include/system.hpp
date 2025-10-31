#pragma once

#include <nlohmann/json.hpp>
#include <string>
#include <cstdint>
#include <utility>

#define MEMINFO "/proc/meminfo"
#define CPUINFO "/proc/cpuinfo"
#define CPUSTAT "/proc/stat"

// Exit codes
#define MEM_STAT_READ_SUCCESS 0 
#define CPU_STAT_READ_SUCCESS 0
#define MEM_STAT_MEMTOTAL_READ_FAIL 1
#define MEM_STAT_MEMAVAIL_READ_FAIL 2
#define MEM_STAT_SWAPTOTAL_READ_FAIL 3
#define MEM_STAT_SWAPFREE_READ_FAIL 4
#define MEM_STAT_FILE_OPEN_FAIL 5 // thrown when error occurred while opening the /proc/meminfo file
#define CPU_STAT_READ_FAIL 6
#define UNKNOWN_ERROR 255

#define uint8  uint8_t
#define uint16 uint16_t
#define uint32 uint32_t
#define uint64 uint64_t

using json = nlohmann::json;

class MemInfo {
public:
    struct MemStatStruct {
        uint64 memtotal;
        uint64 memavail;
        uint64 memused;
        double usedpercent;
        uint64 swaptotal;
        uint64 swapfree;
        uint64 swapused;
        double swapusedpercent;
        uint64 timestamp; 
    };
    
    MemStatStruct memstat;

    MemInfo() : MemInfo(0) { };
    MemInfo(uint64_t initializer) { this->memstat = { 0 }; };
    
    MemInfo(MemInfo &&);
    MemInfo(const MemInfo &);
    MemInfo& operator=(MemInfo &&);
    MemInfo& operator=(const MemInfo &);
    ~MemInfo() {};

    void print_stats() {
        printf("Snapshot at = %lu\n", this->memstat.timestamp);
        printf("MemTotal = %lf, MemUsed = %lf, MemAvail = %lf, Percentage = %lf\n",
               (double)this->memstat.memtotal / 1024,
               (double)this->memstat.memused / 1024,
               (double)this->memstat.memavail / 1024,
               this->memstat.usedpercent);
        printf("SwapTotal = %lf, SwapFree = %lf, SwapAvail = %lf, Percentage = %lf\n",
               (double)this->memstat.swaptotal / 1024,
               (double)this->memstat.swapfree / 1024,
               (double)this->memstat.swapused / 1024,
               this->memstat.swapusedpercent);
    }
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(MemInfo::MemStatStruct,
                                           memtotal, memavail, memused, usedpercent,
                                           swaptotal, swapfree, swapused, swapusedpercent, timestamp);

class CpuStat {
public:
    struct CpuStatStruct {
        uint64 user;
        uint64 usernice;
        uint64 system;
        uint64 idle;
        uint64 iowait;
        uint64 irq;
        uint64 softirq;
        uint64 steal;
        uint64 guest;
        uint64 guestnice;
    }; // This is the overall usage of all the cpu cores
    
    CpuStatStruct cpustatagg;
    uint64 totalcores;

    CpuStat(): CpuStat(0) { };
    CpuStat(uint64 initializer) {
        this->cpustatagg = { 0 }; // Initializing the entire struct with 0 
        this->totalcores = initializer;
    }

    CpuStat(CpuStat &&);
    CpuStat(const CpuStat &);
    CpuStat& operator=(CpuStat &&);
    CpuStat& operator=(const CpuStat &);
    ~CpuStat() {};

    void print_stats() {
        printf("No of cores = %lu\n", this->totalcores);
        printf("User = %lu, UserNice = %lu, System = %lu, Idle = %lu, IoWait = %lu, Irq = %lu, SoftIrq = %lu, Steal = %lu, Guest = %lu, GuestNice = %lu\n",
               this->cpustatagg.user,
               this->cpustatagg.usernice,
               this->cpustatagg.system,
               this->cpustatagg.idle,
               this->cpustatagg.iowait,
               this->cpustatagg.irq,
               this->cpustatagg.softirq,
               this->cpustatagg.steal,
               this->cpustatagg.guest,
               this->cpustatagg.guestnice);
    }
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(CpuStat::CpuStatStruct,
                                        user, usernice, system, idle, iowait,
                                        irq, softirq, steal, guest, guestnice);


struct SystemStats {
    CpuStat::CpuStatStruct& cpustat;
    MemInfo::MemStatStruct& memstat;
    
    SystemStats(CpuStat::CpuStatStruct& cpustat, MemInfo::MemStatStruct& memstat) : cpustat(cpustat), memstat(memstat) {}
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(SystemStats, cpustat, memstat);


// System Functions
uint8 read_mem_stat(MemInfo& mem_stat);
uint8 read_cpu_stat(CpuStat& cpu_stat);

// Helpers Functions
std::pair<uint64, uint64> get_num_pos_len(const std::string& line);
// void to_json(json& jobj, CpuStat::CpuStatStruct& sysstats);
// void to_json(json& jobj, MemStats& sysstats);
