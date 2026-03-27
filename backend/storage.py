"""
AGRICAM IA - Object Storage Module
Handles file uploads (videos, ebooks, images) via Emergent Object Storage
"""
import os
import uuid
import logging
import requests

logger = logging.getLogger(__name__)

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "agricam-ia"
storage_key = None


def init_storage():
    """Initialize storage - call once at startup"""
    global storage_key
    if storage_key:
        return storage_key
    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    if not emergent_key:
        logger.warning("EMERGENT_LLM_KEY not set - storage unavailable")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Object storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload file to storage"""
    key = init_storage()
    if not key:
        raise Exception("Storage not initialized")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    """Download file from storage"""
    key = init_storage()
    if not key:
        raise Exception("Storage not initialized")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def generate_path(user_id: str, filename: str, folder: str = "uploads") -> str:
    """Generate a unique storage path"""
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    return f"{APP_NAME}/{folder}/{user_id}/{uuid.uuid4()}.{ext}"


MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "pdf": "application/pdf",
    "mp4": "video/mp4", "avi": "video/avi", "mov": "video/quicktime",
    "doc": "application/msword", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "epub": "application/epub+zip", "txt": "text/plain",
}
