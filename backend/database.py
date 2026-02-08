"""
AGRICAM IA - Database Module
MongoDB connection management
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URL, DB_NAME

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

def get_database():
    """Get database instance"""
    return db

def get_collection(name: str):
    """Get a specific collection"""
    return db[name]
