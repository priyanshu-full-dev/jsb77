import { webcrypto as crypto } from 'crypto';

const SECRET_KEY = "f3a9b2c8e4d1a7f9b8c6e3d2a1f4c7b9d8e6f5a3b1c2d4e6f8a9b0c1d2e3f4";

async function getKey() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  const hash = await crypto.subtle.digest("SHA-256", keyData);
  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function decryptPayload(base64Data) {
  if (!base64Data || typeof base64Data !== "string") return null;

  try {
    const key = await getKey();
    if (!key) return null;

    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const iv = buffer.slice(0, 12);
    const tag = buffer.slice(12, 28);
    const encrypted = buffer.slice(28);

    const encryptedWithTag = new Uint8Array(encrypted.length + tag.length);
    encryptedWithTag.set(encrypted, 0);
    encryptedWithTag.set(tag, encrypted.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedWithTag
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error("Payload decryption error:", err);
    return null;
  }
}

async function testEndpoint(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "Domainid": "6a85553b526a2dbeb187f070",
        "admindomainId": "6a85553b526a2dbeb187f071",
        "X_Panel_Type": "user"
      }
    });
    const json = await res.json();
    if (json._data) {
      const decrypted = await decryptPayload(json._data);
      console.log(`[${url}] Decrypted:`, decrypted ? JSON.parse(decrypted) : "Failed");
    } else {
      console.log(`[${url}] Raw:`, json);
    }
  } catch (err) {
    console.error(`[${url}] Error:`, err.message);
  }
}

async function run() {
  console.log("=== Testing Provider Endpoints ===");
  await testEndpoint("https://api.professor.monster/api/v1/int-c/list/spribe");
  await testEndpoint("https://api.professor.monster/api/v1/int-c/list/aura");
  await testEndpoint("https://api.professor.monster/api/v1/int-c/list/evolution");
}

run();
