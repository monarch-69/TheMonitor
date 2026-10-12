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
class CPUCore(BaseModel):
    core: str
    burst: float

class CPUSample(BaseModel):
    cores: List[CPUCore]
    avg: float

# Disk Sample
class DiskSample(BaseModel):
    usage: float

# Sample clas
class Sample(BaseModel):
    timestamp: datetime
    cpu: CPUSample
    disk: DiskSample

# Wrapper class which will hold list of `Sample`
class Telemetry(BaseModel):
    host_id: str
    tenant_id: str
    samples: List[Sample]
