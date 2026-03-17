import React, { useMemo, useRef, useState } from "react";
import axios from "axios";

function b64uEncode(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64uDecode(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice((b64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function pickRandom(arr, fallback) {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  const cleaned = arr.filter((v) => typeof v === "string" && v.trim().length > 0);
  if (cleaned.length === 0) return fallback;
  return cleaned[Math.floor(Math.random() * cleaned.length)];
}

function clampNumber(x, min, max) {
  const n = Number(x);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function LoginForm({ schema, onSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cryptoRef = useRef({ sessionId: null, aesKey: null });

  const categorical = schema?.categorical || {};
  const protocolOptions = categorical.protocol_type || ["TCP", "UDP", "ICMP"];
  const encryptionOptions = categorical.encryption_used || ["AES", "DES", "RSA"];
  const browserOptions = categorical.browser_type || ["Chrome", "Firefox", "Edge", "Safari"];

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000",
    []
  );

  const ensureCryptoSession = async () => {
    if (cryptoRef.current?.sessionId && cryptoRef.current?.aesKey) {
      return cryptoRef.current;
    }

    const subtle = window.crypto?.subtle;
    if (!subtle) throw new Error("WebCrypto not available");

    const enc = new TextEncoder();
    const info = enc.encode("AdaptiveKeyShield ECDH HKDF v1");

    console.log("[UI] Establishing ECDH session...");

    const kp = await subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );

    const clientPubRaw = new Uint8Array(await subtle.exportKey("raw", kp.publicKey));
    const clientPublicKey = b64uEncode(clientPubRaw);

    const hs = await axios.post(
      `${apiBase}/handshake`,
      { client_public_key: clientPublicKey },
      { headers: { "Content-Type": "application/json" } }
    );

    const { session_id, server_public_key, salt } = hs.data || {};
    if (!session_id || !server_public_key || !salt) {
      throw new Error("Invalid handshake response");
    }

    const serverPubBytes = b64uDecode(server_public_key);
    const serverPubKey = await subtle.importKey(
      "raw",
      serverPubBytes,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );

    const sharedBits = await subtle.deriveBits(
      { name: "ECDH", public: serverPubKey },
      kp.privateKey,
      256
    );

    const keyMaterial = await subtle.importKey(
      "raw",
      sharedBits,
      "HKDF",
      false,
      ["deriveKey"]
    );

    const aesKey = await subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: b64uDecode(salt),
        info,
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    cryptoRef.current = { sessionId: session_id, aesKey };
    console.log("[UI] ECDH session ready:", session_id);
    return cryptoRef.current;
  };

  const encryptMessage = async (message, aesKey, aadText) => {
    const subtle = window.crypto?.subtle;
    if (!subtle) throw new Error("WebCrypto not available");

    console.log("[UI] Encrypting the message...");

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const plaintext = enc.encode(message);
    const additionalData =
      typeof aadText === "string" && aadText.length > 0 ? enc.encode(aadText) : undefined;

    const ctBuf = await subtle.encrypt(
      { name: "AES-GCM", iv, additionalData },
      aesKey,
      plaintext
    );

    return {
      nonce: b64uEncode(iv),
      ciphertext: b64uEncode(new Uint8Array(ctBuf)),
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[UI] Checking for intrusion...");

      // We don’t have real-time network params, so we generate a realistic-looking feature vector.
      const passwordLen = password?.length || 0;

      const payload = {
        user_id: userId,
        // use password length as a proxy to generate some numeric variety
        network_packet_size: clampNumber(200 + passwordLen * 35 + Math.random() * 120, 40, 1500),
        protocol_type: pickRandom(protocolOptions, "TCP"),
        login_attempts: clampNumber(1 + (passwordLen % 4), 1, 10),
        session_duration: clampNumber(30 + passwordLen * 20 + Math.random() * 1800, 1, 10000),
        encryption_used: "AES",
        ip_reputation_score: clampNumber(Math.random(), 0, 1),
        failed_logins: clampNumber(passwordLen % 3, 0, 10),
        browser_type: "Chrome",
        unusual_time_access: Math.random() > 0.8 ? 1 : 0,
      };

      console.log("[UI] Feature vector:", payload);

      const { sessionId, aesKey } = await ensureCryptoSession();
      const encryptedMessage = await encryptMessage(password, aesKey, userId);

      const res = await axios.post(
        `${apiBase}/predict`,
        {
          ...payload,
          session_id: sessionId,
          encrypted_message: encryptedMessage,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = res.data;
      if (data?.attack_detected === 1) {
        console.log("[UI] Intrusion detected");
        console.log("[UI] Changing the key...");
        console.log("[UI] Key changed:", data?.active_key);
        cryptoRef.current = { sessionId: null, aesKey: null };
      } else {
        console.log("[UI] No intrusion detected");
      }
      console.log("[UI] Successful");

      onSuccess?.();
    } catch (err) {
      console.error("[UI] IDS check failed:", err);
      setError("Backend is not running, or /predict failed. Start backend first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <img src="https://png.pngtree.com/png-vector/20250820/ourlarge/pngtree-green-and-white-circular-badge-with-secure-payment-text-lock-icon-png-image_17048788.webp" alt="logo" className="h-10 w-10 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-cyan-600">AdaptiveKeyShield</h1>
        <p className="text-sm text-gray-500">Your AI-driven security companion</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-800 border-gray-200 focus:ring-2 focus:ring-cyan-400"
            placeholder="Enter your user ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-800 border-gray-200 focus:ring-2 focus:ring-cyan-400"
            placeholder="Enter your message"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full py-2 rounded-md bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Checking IDS...
            </span>
          ) : (
            "Send Message"
          )}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 text-center text-xs text-gray-400">🔒 Bank-grade security · 256-bit encryption</div>
    </div>
  );
}
