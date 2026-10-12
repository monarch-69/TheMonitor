from fastapi import FastAPI
from dotenv import load_dotenv

from system.utils import *
# from system.agent import router as agent_router
from system.account import router as acc_router

# Load the env's
load_dotenv()

app = FastAPI(lifespan=lifespan)
# app.include_router(agent_router)
app.include_router(acc_router)


# Test route
@app.get("/app/hello")
def hello():
    return {
        "Hello": 69
    }
