"""
Centralized security helpers — additive, no impact on existing code.
- In-memory rate limiter (per IP+endpoint, sliding window)
- File upload validator (size, MIME, magic bytes)
- HTML/text sanitizer
- Hash helpers for idempotency / replay protection
"""
import time
import re
import hashlib
import hmac
from collections import defaultdict, deque
from typing import Optional, Tuple
from fastapi import HTTPException, Request

# === RATE LIMITER (sliding window) ===
_rate_buckets: dict = defaultdict(deque)

def rate_limit(request: Request, key: str, max_calls: int = 30, window_sec: int = 60) -> None:
    """Raise 429 if more than `max_calls` within `window_sec`. Identifies caller by IP+key."""
    ip = (request.client.host if request.client else "unknown")
    bucket_key = f"{ip}:{key}"
    now = time.time()
    bucket = _rate_buckets[bucket_key]
    # purge old
    while bucket and bucket[0] < now - window_sec:
        bucket.popleft()
    if len(bucket) >= max_calls:
        raise HTTPException(429, f"Trop de requêtes. Réessayez dans {window_sec}s.")
    bucket.append(now)


# === IDEMPOTENCY / REPLAY PROTECTION ===
_seen_nonces: dict = {}  # nonce -> expiry timestamp

def check_replay(nonce: str, ttl_sec: int = 300) -> None:
    """Reject if `nonce` was already seen within `ttl_sec` seconds."""
    now = time.time()
    # purge expired
    expired = [k for k, v in _seen_nonces.items() if v < now]
    for k in expired:
        _seen_nonces.pop(k, None)
    if nonce in _seen_nonces:
        raise HTTPException(409, "Requête déjà traitée (replay détecté).")
    _seen_nonces[nonce] = now + ttl_sec


# === HMAC SIGNATURE (for callbacks) ===
def sign_payload(payload: str, secret: str) -> str:
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

def verify_signature(payload: str, secret: str, signature: str) -> bool:
    expected = sign_payload(payload, secret)
    return hmac.compare_digest(expected, signature)


# === FILE UPLOAD VALIDATION ===
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_DOC_MIMES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}

# Magic bytes for common formats (anti-spoofing)
MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"RIFF": "image/webp",
    b"GIF8": "image/gif",
    b"%PDF-": "application/pdf",
}

def validate_upload(content: bytes, declared_mime: str, max_bytes: int = 5_000_000,
                    allowed: Optional[set] = None) -> Tuple[bool, str]:
    """Returns (is_valid, error_message_or_detected_mime)."""
    if len(content) > max_bytes:
        return False, f"Fichier trop volumineux (max {max_bytes // 1_000_000} Mo)"
    if len(content) < 16:
        return False, "Fichier trop petit ou corrompu"
    allowed = allowed or ALLOWED_DOC_MIMES
    if declared_mime not in allowed:
        return False, f"Type MIME non autorisé: {declared_mime}"
    # Magic bytes check
    detected = None
    for magic, mime in MAGIC_BYTES.items():
        if content.startswith(magic):
            detected = mime
            break
    if not detected:
        return False, "Format de fichier non reconnu (signature invalide)"
    if detected not in allowed:
        return False, f"Le fichier est en réalité {detected}, non autorisé"
    return True, detected


# === HTML SANITIZER (anti-XSS) ===
_TAG_RE = re.compile(r"<[^>]*>")
_DANGEROUS_RE = re.compile(r"(javascript:|on\w+\s*=|<script|<iframe)", re.IGNORECASE)

def sanitize_text(text: str, max_len: int = 5000) -> str:
    """Strip HTML tags + dangerous patterns. Truncate to max_len."""
    if not text:
        return ""
    text = str(text)[:max_len]
    text = _TAG_RE.sub("", text)
    text = _DANGEROUS_RE.sub("", text)
    return text.strip()


# === PASSWORD STRENGTH ===
def is_strong_password(pwd: str) -> Tuple[bool, str]:
    if len(pwd) < 8:
        return False, "Mot de passe trop court (min 8 caractères)"
    if not re.search(r"[A-Z]", pwd):
        return False, "Doit contenir une majuscule"
    if not re.search(r"[a-z]", pwd):
        return False, "Doit contenir une minuscule"
    if not re.search(r"\d", pwd):
        return False, "Doit contenir un chiffre"
    return True, "OK"
