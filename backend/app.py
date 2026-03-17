import base64
import hashlib
import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF


MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
PIPELINE_PATH = os.path.join(MODEL_DIR, "ids_pipeline.joblib")


FEATURE_COLUMNS = [
    "network_packet_size",
    "protocol_type",
    "login_attempts",
    "session_duration",
    "encryption_used",
    "ip_reputation_score",
    "failed_logins",
    "browser_type",
    "unusual_time_access",
]


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def b64u_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def b64u_decode(s: str) -> bytes:
    padded = s + "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(padded.encode("ascii"))


@dataclass
class ActiveKey:
    key_id: str
    key_bytes: bytes
    rotated_at: str


class KeyManager:
    """
    Demo-grade in-memory key manager.
    For a real system, store keys in an HSM/KMS and never return raw key material.
    """

    def __init__(self) -> None:
        self._active: Optional[ActiveKey] = None

    def get_active(self) -> ActiveKey:
        if self._active is None:
            self.rotate()
        assert self._active is not None
        return self._active

    def rotate(self) -> ActiveKey:
        key_id = secrets.token_urlsafe(16)
        key_bytes = secrets.token_bytes(32)  # 256-bit symmetric key (demo)
        self._active = ActiveKey(key_id=key_id, key_bytes=key_bytes, rotated_at=utc_now_iso())
        return self._active

    def active_fingerprint(self) -> str:
        active = self.get_active()
        digest = hashlib.sha256(active.key_bytes).digest()
        return b64u_encode(digest[:8])


@dataclass
class CryptoSession:
    session_id: str
    aes_key: bytes
    created_at: str


CRYPTO_INFO = b"AdaptiveKeyShield ECDH HKDF v1"
crypto_sessions: Dict[str, CryptoSession] = {}


def load_pipeline():
    if not os.path.exists(PIPELINE_PATH):
        raise FileNotFoundError(
            f"Missing IDS pipeline at '{PIPELINE_PATH}'. "
            "Run backend/train_ids_pipeline.py to generate it."
        )
    return joblib.load(PIPELINE_PATH)


def extract_features(payload: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    missing = [c for c in FEATURE_COLUMNS if c not in payload]
    if missing:
        return {}, {"error": "missing_required_features", "missing": missing}

    row = {c: payload.get(c) for c in FEATURE_COLUMNS}
    return row, {}


def predict_attack(pipeline, row: Dict[str, Any]) -> Tuple[int, Optional[float]]:
    df = pd.DataFrame([row], columns=FEATURE_COLUMNS)
    proba = None
    if hasattr(pipeline, "predict_proba"):
        proba = float(pipeline.predict_proba(df)[0][1])
        pred = 1 if proba >= 0.5 else 0
        return pred, proba
    pred = int(pipeline.predict(df)[0])
    return pred, None


app = Flask(__name__)
CORS(app)

pipeline = load_pipeline()
keys = KeyManager()


def get_schema() -> Dict[str, Any]:
    """
    Return categorical choices learned by the fitted OneHotEncoder.
    Used by the frontend to generate realistic demo inputs.
    """
    preprocess = getattr(pipeline, "named_steps", {}).get("preprocess")
    if preprocess is None:
        return {"feature_columns": FEATURE_COLUMNS, "categorical": {}}

    try:
        cat_names = list(preprocess.transformers_[0][2])
        encoder = preprocess.named_transformers_.get("cat")
        categories = getattr(encoder, "categories_", None)
        if categories is None:
            return {"feature_columns": FEATURE_COLUMNS, "categorical": {}}
        def _clean(v: Any) -> Any:
            # JSON-safe: drop NaN/None-like values
            try:
                if v is None:
                    return None
                if isinstance(v, float) and pd.isna(v):
                    return None
            except Exception:
                pass
            return v

        cleaned = {}
        for name, cats in zip(cat_names, categories):
            vals = []
            for v in list(cats):
                cv = _clean(v)
                if cv is None:
                    continue
                vals.append(cv)
            cleaned[name] = vals

        return {"feature_columns": FEATURE_COLUMNS, "categorical": cleaned}
    except Exception:
        return {"feature_columns": FEATURE_COLUMNS, "categorical": {}}


@app.get("/health")
def health():
    active = keys.get_active()
    return jsonify(
        {
            "ok": True,
            "time_utc": utc_now_iso(),
            "model_loaded": True,
            "pipeline_path": os.path.relpath(PIPELINE_PATH, os.path.dirname(__file__)),
            "active_key": {"key_id": active.key_id, "fingerprint": keys.active_fingerprint()},
        }
    )


@app.get("/schema")
def schema():
    return jsonify(get_schema())


@app.post("/handshake")
def handshake():
    """
    ECDH (P-256) + HKDF-SHA256 -> AES-256-GCM key.
    Client sends raw uncompressed EC point (base64url), server returns its public key + salt + session_id.
    """
    payload = request.get_json(silent=True) or {}
    client_pub_b64 = payload.get("client_public_key")
    if not isinstance(client_pub_b64, str) or not client_pub_b64:
        return jsonify({"error": "missing_client_public_key"}), 400

    try:
        client_pub_raw = b64u_decode(client_pub_b64)
        client_pub = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), client_pub_raw)
    except Exception:
        return jsonify({"error": "invalid_client_public_key"}), 400

    print("\n[CRYPTO] Establishing ECDH session...", flush=True)
    server_priv = ec.generate_private_key(ec.SECP256R1())
    server_pub_raw = server_priv.public_key().public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint,
    )

    shared = server_priv.exchange(ec.ECDH(), client_pub)
    salt = secrets.token_bytes(16)
    aes_key = HKDF(algorithm=hashes.SHA256(), length=32, salt=salt, info=CRYPTO_INFO).derive(shared)

    session_id = secrets.token_urlsafe(18)
    crypto_sessions[session_id] = CryptoSession(session_id=session_id, aes_key=aes_key, created_at=utc_now_iso())
    print(f"[CRYPTO] Session ready: session_id={session_id}", flush=True)

    digest = hashlib.sha256(aes_key).digest()
    return jsonify(
        {
            "session_id": session_id,
            "server_public_key": b64u_encode(server_pub_raw),
            "salt": b64u_encode(salt),
            "key_fingerprint": b64u_encode(digest[:8]),
        }
    )


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    row, err = extract_features(payload)
    if err:
        return jsonify(err), 400

    # Optional application-layer crypto demo (decrypt the user's message)
    if "encrypted_message" in payload:
        enc = payload.get("encrypted_message") or {}
        session_id = payload.get("session_id")
        if not isinstance(session_id, str) or session_id not in crypto_sessions:
            return jsonify({"error": "missing_or_invalid_session"}), 400

        nonce_b64 = enc.get("nonce")
        ct_b64 = enc.get("ciphertext")
        if not isinstance(nonce_b64, str) or not isinstance(ct_b64, str):
            return jsonify({"error": "invalid_encrypted_message"}), 400

        try:
            nonce = b64u_decode(nonce_b64)
            ciphertext = b64u_decode(ct_b64)
            aad = None
            if isinstance(payload.get("user_id"), str) and payload["user_id"]:
                aad = payload["user_id"].encode("utf-8")
            print("[CRYPTO] Encrypting the message (client-side)...", flush=True)
            print("[CRYPTO] Decrypting the message...", flush=True)
            aes_key = crypto_sessions[session_id].aes_key
            plaintext = AESGCM(aes_key).decrypt(nonce, ciphertext, aad)
            msg = plaintext.decode("utf-8", errors="replace")
            print(f"[CRYPTO] Message decrypted: {msg[:120]}", flush=True)
        except Exception:
            return jsonify({"error": "decrypt_failed"}), 400

    print("\n[IDS] Checking for intrusion...", flush=True)
    attack_detected, attack_probability = predict_attack(pipeline, row)
    print(
        f"[IDS] Result: {'INTRUSION DETECTED' if attack_detected == 1 else 'No intrusion detected'}"
        + (f" (p={attack_probability:.4f})" if attack_probability is not None else ""),
        flush=True,
    )

    rotated = False
    new_key = None
    if attack_detected == 1:
        print("[KEY] Changing the key...", flush=True)
        rotated = True
        active = keys.rotate()
        new_key = {"key_id": active.key_id, "fingerprint": keys.active_fingerprint(), "rotated_at": active.rotated_at}
        print(f"[KEY] Key changed: key_id={active.key_id}", flush=True)
        # Force a new ECDH session next time (demo rotation)
        if isinstance(payload.get("session_id"), str):
            crypto_sessions.pop(payload["session_id"], None)

    print("[OK] Successful\n", flush=True)
    return jsonify(
        {
            "attack_detected": int(attack_detected),
            "attack_probability": attack_probability,
            "key_rotated": rotated,
            "crypto_session_valid": (payload.get("session_id") in crypto_sessions) if isinstance(payload.get("session_id"), str) else False,
            "active_key": new_key or {"key_id": keys.get_active().key_id, "fingerprint": keys.active_fingerprint()},
            "time_utc": utc_now_iso(),
        }
    )


@app.post("/rotate-key")
def rotate_key():
    active = keys.rotate()
    return jsonify(
        {
            "rotated": True,
            "active_key": {"key_id": active.key_id, "fingerprint": keys.active_fingerprint(), "rotated_at": active.rotated_at},
            "time_utc": utc_now_iso(),
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
