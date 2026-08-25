"""Shared DB dependency — breaks the server.py <-> routes circular import."""
import os
from motor.motor_asyncio import AsyncIOMotorClient

_client = None


def get_db():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(os.environ.get("MONGO_URL"))
    return _client[os.environ.get("DB_NAME")]
