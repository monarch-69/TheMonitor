from typing import List
from fastapi import APIRouter, Depends, HTTPException
from uuid_extension import uuid7
from argon2 import PasswordHasher, exceptions as argon2_expections
import os

from schema.backend.payload import AccountAuth, AccountSignup
from schema.database.tables import ACCOUNT_DETAILS, CREDENTIALS
from .utils import *

ACCOUNT_AUTH_PEPPER: str = os.environ.get("ACCOUNT_AUTH_PEPPER") or bail_out("ACCOUNT_AUTH_PEPPER env not found", ENV_NOT_FOUND)

router: APIRouter = APIRouter(
    prefix="/app/account"
)

@router.post("/signup")
async def acc_signup(
    payload: AccountSignup,
    connection = Depends(get_db)
):
    if not payload.email:
        raise HTTPException(status_code=400, detail=f"Provide an email")
    if not payload.username:
        raise HTTPException(status_code=400, detail=f"Provide a username")
    if not payload.password:
        raise HTTPException(status_code=400, detail=f"Provide a password")

    async with connection.cursor() as cursor:
        details: List[List] = []
        try:
            # First check whether the email or username already exists, if yes return saying already exists
            await cursor.execute(
                f"select email, primary_username from {CREDENTIALS} where email = %s OR primary_username = %s",
                (payload.email, payload.username,)
            )
            details = await cursor.fetchall() 
        except:
            raise HTTPException(status_code=500, detail="Internal server error")
        if details != []:
            email_found, username_found = False, False
            for [email, username] in details:
                if email == payload.email:
                    email_found = True 
                    break
                if username == payload.username:
                    username_found = True
            
            raise HTTPException(
                status_code=400, 
                detail=f"'{payload.email if email_found else payload.username}' already exists"
            )

        # If here, then the email or username didn't exist
        # Now take care of the password
        pwhasher = PasswordHasher()
        hashed_pass = pwhasher.hash(ACCOUNT_AUTH_PEPPER + payload.password)
        # Now store in the DB
        try:
            await cursor.execute(
                f"insert into {CREDENTIALS} values (%s, %s, %s)",
                (payload.email, payload.username, hashed_pass)
            )
        except:
            raise HTTPException(status_code=500, detail="Internal Server Error")
        
        # Now generate account_id
        account_id = uuid7()
        db_name = "table__" + str(account_id).replace('-', '_')
        try:
            await cursor.execute(
                f"insert into {ACCOUNT_DETAILS} values (%s, %s, %s)",
                (account_id, db_name, payload.email,)
            )
        except:
            raise HTTPException(status_code=500, detail=f"Internal Server Error")
        
        # Now create the table named db_name where each resource of this account (account_id) will be stored
        create_table_query = f"""create table %s (
                resource_id uuid primary key unique not null,
                type_of_service text not null
            )"""
        
        await connection.commit()

    return {
        "res" : "Success",
        "details" : payload,
        "DB name" : db_name
    }

@router.post("/signin")
async def acc_signin(
    payload: AccountAuth,
    connection = Depends(get_db)
):
    if not payload.email_or_username:
        raise HTTPException(status_code=400, detail=f"Provide email or username")
    if not payload.password:
        raise HTTPException(status_code=400, detail=f"Provide a password")

    async with connection.cursor() as cursor:
        try:
            await cursor.execute(
                f"select hashed_pass from {CREDENTIALS} where email = %s OR primary_username = %s",
                (payload.email_or_username, payload.email_or_username,)
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error; {e}")
        record: List = await cursor.fetchone()
        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"Account with '{payload.email_or_username}' as email or username not found"
            )
        print(record) 
        hashed_pass = record[0]
        pwhasher = PasswordHasher()
        try:
            pwhasher.verify(hashed_pass, ACCOUNT_AUTH_PEPPER + payload.password)
        except argon2_expections.VerifyMismatchError:
            raise HTTPException(status_code=400, detail=f"Invalid password")

    return {
        "status" : "Authenticated"
    }
