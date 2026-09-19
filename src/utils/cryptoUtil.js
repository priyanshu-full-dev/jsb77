const SECRET_KEY =
  import.meta.env.VITE_CRYPTO_SECRET ||
  "f3a9b2c8e4d1a7f9b8c6e3d2a1f4c7b9d8e6f5a3b1c2d4e6f8a9b0c1d2e3f4";

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

export async function encryptPayload(text) {
  try {
    const key = await getKey();
    if (!key) return null;

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const tag = encryptedArray.slice(encryptedArray.length - 16);
    const encrypted = encryptedArray.slice(0, encryptedArray.length - 16);
    const combined = new Uint8Array(iv.length + tag.length + encrypted.length);
    combined.set(iv, 0);
    combined.set(tag, iv.length);
    combined.set(encrypted, iv.length + tag.length);
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error("Payload encryption error:", err);
    return null;
  }
}

export async function decryptPayload(base64Data) {
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
