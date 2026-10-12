from threading import Thread
from fastapi import FastAPI
from contextlib import asynccontextmanager
from aiokafka import AIOKafkaProducer
from typing import Callable, List, Dict
from threading import Event
import asyncio
import signal
import logging

from consumer import runner, storage_writer_handler, spike_checker_hanlder
from utils import ConsumerSettings, read_settings

logger = logging.getLogger(__name__)

def stop_consumer_threads(
    threads: List[Thread],
    stop: Event
):
    # Set the stop signal once
    stop.set()
    for thread in threads:
        logger.info(msg=f"Graceful shut down of instance")
        thread.join()

@asynccontextmanager
async def lifespan(app: FastAPI):
    consumer_settings: ConsumerSettings = read_settings()
    app.state.consumer_settings = consumer_settings
    # Kafka producer
    # There should just be a single producer (for now)
    kafka_producer: AIOKafkaProducer = AIOKafkaProducer(
            bootstrap_servers="localhost:9092",
            acks="all",
            enable_idempotence=True,
            linger_ms=20
    )
    app.state.kafka_producer = kafka_producer
    await app.state.kafka_producer.start()
    # Now kafka consumer groups, for now there should be 2 groups
    # Structure is Dict[("idn", func_handler_for_n]
    KAFKA_CONSUMER_GROUPS: Dict[str, Callable] = {
        "storage_writer": storage_writer_handler,
        "spike_checker": spike_checker_hanlder
    }
    app.state.kafka_consumer_group_ids = KAFKA_CONSUMER_GROUPS
    # Above is built lazy, meaning the AIOKafkaConsumer will be spinned up groups handlers
    # Right now total_thread_spin = no_of_groups
    app.state.consumer_stop_event = Event()
    kafka_consumer_group_threads: List[Thread] = []
    
    for group_id, handler in app.state.kafka_consumer_group_ids.items():
        thread: Thread = Thread(
            target=runner,
            args=(
                app.state.consumer_settings,
                group_id,
                handler,
                app.state.consumer_stop_event
            ),
            name=group_id
        )
        thread.start()
        kafka_consumer_group_threads.append(thread)
   
    app.state.kafka_consumer_group_threads = kafka_consumer_group_threads

    yield
    # Till above was application startup

    # Called at the application closing
    await app.state.kafka_producer.stop()
    # Wait for all the consumer threads to join
    stop_consumer_threads(
        app.state.kafka_consumer_group_threads, 
        app.state.consumer_stop_event
    )

app: FastAPI = FastAPI(
    lifespan=lifespan
)

from producer import router as prod_router

app.include_router(prod_router)

# Just test it whether the fastapi works or not
@app.get("/{name}")
async def test(
    name: str
):
    return {
        "Name": name
    }
