#pragma once

#include <string>
#include <utility>
#include <nlohmann/json.hpp>

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

class MemStat {
public:
    uint64 memtotal{};
    uint64 memavail{};
    uint64 memused{};
    double usedpercent{};
    uint64 swaptotal{};
    uint64 swapfree{};
    uint64 swapused{};
    double swapusedpercent{};
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(
    MemStat,
    memtotal, memavail, memused, usedpercent,
    swaptotal, swapfree, swapused, swapusedpercent
);

class CpuStat {
public:
    class PerCoreStat {
    public:
        uint64 user{};
        uint64 usernice{};
        uint64 system{};
        uint64 idle{};
        uint64 iowait{};
        uint64 irq{};
        uint64 softirq{};
        uint64 steal{};
        uint64 guest{};
        uint64 guestnice{};

        friend std::istream& operator>>(std::istream& stream, PerCoreStat& stat)
        {
            return stream >> stat.user >> stat.usernice >> stat.system >> stat.idle >> stat.iowait \
                >> stat.irq >> stat.softirq >> stat.steal >> stat.guest >> stat.guestnice;
        }
    };
    
    std::vector<PerCoreStat> cores;
    uint64 totalcores;

    CpuStat() = default;
    CpuStat(uint64 totalcores) : cores(totalcores + 1), totalcores(totalcores) {}
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(
    CpuStat,
    cores, totalcores
);
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(
    CpuStat::PerCoreStat,
    user, usernice, system, idle, iowait,
    irq, softirq, steal, guest, guestnice
);

class Telemetry {
public:
    class Sample {
    public:    
        CpuStat cpustat;
        MemStat memstat;
        uint64 timestamp{};

        Sample() = default;
        Sample(const uint64& phy_no_of_cores) : cpustat(phy_no_of_cores) {}
    };

    std::string tenant_id{};
    std::string resource_id{};
    std::vector<Sample> samples{};
    uint64 timestamp{};
    // Right now have elided all the Constructors and will let compiler do it.
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Telemetry, 
        resource_id, tenant_id, samples, timestamp);
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Telemetry::Sample, 
        cpustat, memstat, timestamp);


// System or Helper Functions
uint8 read_mem_stat(MemStat& mem_stat);
uint8 read_cpu_stat(CpuStat& cpu_stat);
void print_stats(const Telemetry::Sample& sample);
void print_memstats(const MemStat& mem_stat);
void print_cpustats(const CpuStat& cpu_stat);
std::pair<uint64, uint64> get_num_pos_len(const std::string& line);
// void to_json(json& jobj, CpuStat::CpuStatStruct& sysstats);
// void to_json(json& jobj, MemStats& sysstats);
