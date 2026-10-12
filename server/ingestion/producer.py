from aiokafka import AIOKafkaProducer
from fastapi import APIRouter, FastAPI, HTTPException, Request, status

from utils import Telemetry

router: APIRouter = APIRouter(
    prefix="/v1/ingestion"
)

@router.post("/record", status_code=status.HTTP_202_ACCEPTED)
async def record(
    request: Request,
    telemetry: Telemetry
):
    _len: int = len(telemetry.samples)
    
    try:
        producer: AIOKafkaProducer = request.app.state.kafka_producer
        await producer.send_and_wait(
            topic=request.app.state.consumer_settings.topic,
            key=(telemetry.host_id + telemetry.tenant_id).encode("utf-8"),
            value=telemetry.model_dump_json().encode("utf-8")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")

    return {
        "status": "success",
        "processed": _len
    }
