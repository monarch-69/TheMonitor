import asyncio
from dataclasses import dataclass
from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict


@dataclass
class ConsumerSettings():
    topic: str = "test.raw"
    bootstrap_servers: str = "localhost:9092"
    auto_commit: bool = False
    auto_offset_reset: str = "earliest"

def read_settings():
    return ConsumerSettings()

# Telemetry Models
# CPU samples
class CpuStat(BaseModel):
    class PerCoreStat(BaseModel):
        user: int
        usernice: int
        system: int
        idle: int
        iowait: int
        irq: int
        softirq: int
        steal: int
        guest: int
        guestnice: int 

    cores: List[PerCoreStat]
    totalcores: int

# Ram / Memory Sample
class MemStat(BaseModel):
    memtotal: int
    memavail: int
    memused: int
    usedpercent: float
    swaptotal: int
    swapfree: int
    swapused: int
    swapusedpercent: float

# Disk Sample
class DiskSample(BaseModel):
    usage: float

# Sample clas
class Sample(BaseModel):
    timestamp: int
    cpustat: CpuStat
    memstat: MemStat

# Wrapper class which will hold list of `Sample`
class Telemetry(BaseModel):
    resource_id: str
    tenant_id: str
    samples: List[Sample]
    timestamp: int
