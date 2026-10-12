from uuid import UUID
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: int
    name: str
    age: int

class AgentAuth(BaseModel):
    resource_id: UUID
    account_id: UUID
    pub_key: str | None = None
    nonce_result: str | None = None

class AccountSignup(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    password: str | None

class AccountAuth(BaseModel):
    email_or_username: str
    password: str
