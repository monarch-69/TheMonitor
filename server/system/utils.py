from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.requests import Request
from psycopg_pool import AsyncConnectionPool as PgAsyncConnectionPool
from typing import NoReturn

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state["pool"] = PgAsyncConnectionPool(
        "CONNECTION STRING",
        min_size=5,
        max_size=20,
        timeout=5,
        open=False
    )
    yield await app.state["pool"].open()
    await app.state["pool"].close()

async def get_db(request: Request):
    _pool = request.app.state["pool"]

    async with _pool.connection() as _conn:
        yield _conn


# Exit codes and exit functions
ENV_NOT_FOUND: int = 10


def bail_out(err_msg: str, exit_code: int) -> NoReturn:
    print(f"{err_msg}")
    exit(exit_code)
