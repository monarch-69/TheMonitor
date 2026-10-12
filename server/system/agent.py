from fastapi import APIRouter, Depends, HTTPException
from typing import List
import nacl.exceptions
from nacl.encoding import HexEncoder
from uuid_extension import uuid7
from nacl.signing  import VerifyKey
import psycopg
import datetime

from .utils import *
from schema.backend.payload import AgentAuth
from schema.database.tables import *

# Some constants
AGENT_AUTH_TIME_DELTA_IN_HOURS = 2

router = APIRouter(
    prefix="/app/agent"
)

@router.get("/generate")
async def agent_generate(
    connection = Depends(get_db)
):
    resource_id = uuid7()
    
    async with connection.cursor() as cursor:
        try:
            await cursor.execute(
                f"insert into {AGENT_DETAILS} values (%s, %s, %s)",
                (resource_id, False,)
            )
            await cursor.execute(
                f"insert into {AGENT_INIT_AUTH} values (%s)",
                (resource_id,)
            )
        
        except psycopg.errors.UniqueViolation:
            raise HTTPException(409, f"{resource_id} already exists.")
        except Exception as e:
            raise HTTPException(409, f"Some different exception. {e}")
        
        await connection.commit()

    return {
        "resource_id": resource_id
    }

@router.post("/initialize")
async def agent_initialize(
    payload: AgentAuth,
    connection = Depends(get_db)
):
    if not payload.account_id:
        raise HTTPException(status_code=400, detail="AccountIDMissingFromPayloadError")
    if not payload.resource_id:
        raise HTTPException(status_code=400, detail="ResourceIDMissingFromPayloadError")
    if not payload.pub_key:
        raise HTTPException(status_code=400, detail="PublicKeyMissingFromPayloadError")

    # Get the nonce from the DB
    nonce = None

    async with connection.cursor() as cursor:
        try:
            await cursor.execute(
                f"update {AGENT_DETAILS} set public_key = %s where resource_id = %s",
                (payload.pub_key,payload.resource_id,)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"ResourceIDNotFoundError")
            
            # Get the nonce
            await cursor.execute(
                f"select nonce from {AGENT_INIT_AUTH} where resource_id = %s",
                (payload.resource_id,)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"ResourceIDNotFoundError")
            
            res: List = await cursor.fetchone()
            nonce = res[0] 

        except psycopg.errors.Error:
            raise HTTPException(status_code=404, detail=f"ResourceIDNotFoundError")
        
        await connection.commit()

    return {
        "nonce": str(nonce)
    }

@router.post("/authenticate")
async def agent_authenticate(
    payload: AgentAuth,
    connection = Depends(get_db)
):
    if not payload.account_id:
        raise HTTPException(status_code=400, detail="AccountIDMissingFromPayloadError")
    if not payload.resource_id:
        raise HTTPException(status_code=400, detail="ResourceIDMissingFromPayloadError")
    if not payload.nonce_result:
        raise HTTPException(status_code=400, detail="NonceMissingFromPayloadError")
    
    async with connection.cursor() as cursor:
        try:
            await cursor.execute(
                f"select nonce, auth_init_time from {AGENT_INIT_AUTH} where resource_id = %s",
                (payload.resource_id,)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"ResourceIDNotFoundError")
            
            res: List = await cursor.fetchone()
            nonce, auth_init_time_with_tz = res
            auth_init_time = datetime.datetime.fromisoformat(str(auth_init_time_with_tz))
        
            # Now check for the nonce expiry, if it's expired then reject
            # Compare the diff utc_time_now - auth_init_time > AGENT_AUTH_TIME_DELTA
            utc_now_time = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
            
            print(auth_init_time - utc_now_time)
            if utc_now_time < auth_init_time:
                raise HTTPException(status_code=500, detail=f"InternalServerError")
        
            if (utc_now_time - auth_init_time) > datetime.timedelta(hours=AGENT_AUTH_TIME_DELTA_IN_HOURS):
                raise HTTPException(status_code=403, detail=f"AuthenticationExpiredError")

            await cursor.execute(
                f"select public_key from {AGENT_DETAILS} where resource_id = %s",
                (payload.resource_id,)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"ResourceIDNotFoundError")
            
            res: List = await cursor.fetchone()
            pub_key = res[0]
            verify_key = VerifyKey(pub_key, encoder=HexEncoder)

            try:
                verified_nonce = verify_key.verify(payload.nonce_result.encode("utf-8"), encoder=HexEncoder)
            except nacl.exceptions.BadSignatureError:
                raise HTTPException(status_code=403, detail="NonceBadSignatureError")
            
            # Now check the match the nonce nonce_from_agent == nonce_in_DB
            if int(nonce) != int(verified_nonce):
                raise HTTPException(status_code=403, detail=f"BadNonceError")
        
        except psycopg.errors.Error:
            raise HTTPException(status_code=500, detail=f"InternalServerError")

    return {
        "res": "Success!",
        "verified_nonce": verified_nonce
    }
