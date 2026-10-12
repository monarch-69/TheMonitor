from typing import Callable, List, Dict, Tuple
from threading import Event
from confluent_kafka import Consumer, Message
from confluent_kafka.cimpl import KafkaError

from utils import ConsumerSettings

# Handler for the storage writer
def storage_writer_handler(
    records: List[Message]
):
    for msg in records:
        if msg and msg.value():
            value: str = (msg.value() or b'').decode("utf-8")
            topic: str = msg.topic() or ""
            key: str = (msg.key() or b'').decode("utf-8")
            
            print(f"============== From `storage_writer` ===============`")
            print(f"Topic: {topic}, key: {key}, value: {value}")

# Handler for the storage writer
def spike_checker_hanlder(
    records: List[Message]
):
    for msg in records:
        if msg and msg.value():
            value: str = (msg.value() or b'').decode("utf-8")
            topic: str = msg.topic() or ""
            key: str = (msg.key() or b'').decode("utf-8")
            
            print(f"============== From `spike_checker` ===============`")
            print(f"Topic: {topic}, key: {key}, value: {value}")

def runner(
    consumer_settings: ConsumerSettings,
    group_id: str,
    handler: Callable[[List[Message]], None],
    stop: Event
):
    # Configuration for the consumer
    config: Dict = {
        "bootstrap.servers": "localhost:9092",
        "group.id": group_id,
        "auto.offset.reset": consumer_settings.auto_offset_reset
    }
    consumer: Consumer = Consumer(config)
    consumer.subscribe(topics=[consumer_settings.topic])
    
    try:
        while not stop.is_set():
            msgs: List[Message] = consumer.consume(500, 1.0)
            # Few messages could have errors let's get them and filter out only good one's
            good: List[Message] = [
                msg for msg in msgs if not msg.error()
            ]

            for msg in msgs:
                error: KafkaError | None = msg.error()
                
                if error:
                    print(f"Kafka Error : {error.str()}")

            if not good:
                continue

            handler(good)
    finally:
        consumer.close()
