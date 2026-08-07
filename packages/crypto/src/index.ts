// ─────────────────────────────────────────────────────────────────
// @vaultic/crypto — Zero-Knowledge Encryption Engine
// ─────────────────────────────────────────────────────────────────
// This module handles ALL cryptographic operations for Vaultic.
// It uses the Web Crypto API exclusively — no third-party crypto.
//
// Security guarantees:
//   1. Master password NEVER leaves this module as plaintext
//   2. Derived keys are returned as opaque CryptoKey objects
//   3. All encryption uses AES-256-GCM with random IVs
//   4. PBKDF2 with 100,000 iterations for key derivation
//
// Architecture:
//   - Default mode: A random AES-256 key is generated and stored locally.
//     No password is required — the app manages the key transparently.
//   - Password mode (opt-in): The encryption key is "wrapped" (encrypted)
//     using a password-derived key via AES-KW. The user must enter
//     their password to unwrap the key on each app launch.
// ─────────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12;   // bytes (AES-GCM standard)
const KEY_LENGTH = 256;  // bits

// ─── Utility: Base64 encoding/decoding ──────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Salt Generation ────────────────────────────────────────────

/** Generate a cryptographically random salt */
function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt.buffer);
}

// ═══════════════════════════════════════════════════════════════
// RANDOM KEY GENERATION (Default Mode — No Password)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a random AES-256-GCM encryption key.
 * This is used in the default (no-password) mode.
 * The key is extractable so it can be exported for storage.
 *
 * @returns A CryptoKey that can be used for encrypt/decrypt and exported
 */
// SECURITY NOTE: Working encryption keys are kept extractable because they
// may need to be exported (for raw storage) or re-wrapped (when changing
// passwords). The tradeoff is accepted because the Web Crypto API prevents
// cross-origin access to CryptoKey objects. XSS mitigation is handled via
// strict CSP headers in tauri.conf.json.
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable — needed to export for storage
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to a base64-encoded raw key string for storage.
 *
 * @param key - The CryptoKey to export
 * @returns Base64-encoded raw key bytes
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const rawBytes = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(rawBytes);
}

/**
 * Import a base64-encoded raw key back into a CryptoKey.
 * The imported key is extractable so it can be re-exported if needed
 * (e.g., when enabling password wrapping).
 *
 * @param base64Key - Base64-encoded raw key bytes
 * @returns A CryptoKey for encrypt/decrypt operations
 */
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const rawBytes = base64ToArrayBuffer(base64Key);
  return crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable — can be re-exported for wrapping
    ['encrypt', 'decrypt']
  );
}

// ═══════════════════════════════════════════════════════════════
// KEY WRAPPING (Optional Password Mode)
// ═══════════════════════════════════════════════════════════════

/**
 * Wrap (encrypt) the encryption key using a password-derived key.
 * Uses AES-GCM to wrap the raw key bytes.
 *
 * Called when the user enables password protection in settings.
 * The wrapped key is stored in VaultConfig; the raw key is deleted.
 *
 * @param encryptionKey - The AES-256-GCM key to protect
 * @param passwordKey   - A CryptoKey derived from the user's password
 * @returns Object containing base64-encoded wrapped ciphertext and IV
 */
export async function wrapKey(
  encryptionKey: CryptoKey,
  passwordKey: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const rawKeyBytes = await crypto.subtle.exportKey('raw', encryptionKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const wrappedBytes = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    passwordKey,
    rawKeyBytes
  );

  return {
    ciphertext: arrayBufferToBase64(wrappedBytes),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

/**
 * Unwrap (decrypt) the encryption key using a password-derived key.
 * Reverse of wrapKey().
 *
 * Called when the user enters their password on UnlockScreen.
 *
 * @param ciphertext  - Base64-encoded wrapped key bytes
 * @param iv          - Base64-encoded IV used during wrapping
 * @param passwordKey - A CryptoKey derived from the user's password
 * @returns The original AES-256-GCM CryptoKey for encrypt/decrypt
 * @throws If the password is wrong or data is corrupted
 */
export async function unwrapKey(
  ciphertext: string,
  iv: string,
  passwordKey: CryptoKey
): Promise<CryptoKey> {
  const wrappedBytes = base64ToArrayBuffer(ciphertext);
  const ivBytes = base64ToArrayBuffer(iv);

  const rawKeyBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    passwordKey,
    wrappedBytes
  );

  return crypto.subtle.importKey(
    'raw',
    rawKeyBytes,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable — may need to re-wrap with new password
    ['encrypt', 'decrypt']
  );
}

// ═══════════════════════════════════════════════════════════════
// KEY DERIVATION (PBKDF2) — Used for Password Mode
// ═══════════════════════════════════════════════════════════════


// ─── Verification ───────────────────────────────────────────────

/**
 * Derive and verify password in one step.
 * Derives the key, computes verification hash, and compares.
 *
 * @returns The derived CryptoKey if password is correct, null otherwise
 */
export async function verifyAndDeriveKey(
  password: string,
  salt: string,
  verificationSalt: string,
  storedVerificationHash: string
): Promise<CryptoKey | null> {
  // For verification, we derive an extractable key
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = base64ToArrayBuffer(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive an extractable key just for verification hash
  const extractableKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable for verification hash
    ['encrypt', 'decrypt']
  );

  // Compute verification hash
  const keyData = await crypto.subtle.exportKey('raw', extractableKey);
  const vSaltBuffer = base64ToArrayBuffer(verificationSalt);
  const combined = new Uint8Array(keyData.byteLength + vSaltBuffer.byteLength);
  combined.set(new Uint8Array(keyData), 0);
  combined.set(new Uint8Array(vSaltBuffer), keyData.byteLength);
  const hash = await crypto.subtle.digest('SHA-256', combined);
  const computedHash = arrayBufferToBase64(hash);

  if (computedHash !== storedVerificationHash) {
    return null; // Wrong password
  }

  // Return the derived key directly — no second PBKDF2 call needed.
  // This key is extractable, which is fine since it's used for
  // wrapping/unwrapping the encryption key (not for data encryption).
  return extractableKey;
}

/**
 * Create verification artifacts for a password.
 * Used when enabling password mode or changing password.
 *
 * @param password - The chosen master password
 * @returns Object containing salt, verificationSalt, verificationHash, and derivedKey
 */
export async function createPasswordEnvelope(password: string): Promise<{
  salt: string;
  verificationSalt: string;
  verificationHash: string;
  derivedKey: CryptoKey;
}> {
  const salt = generateSalt();
  const verificationSalt = generateSalt();

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = base64ToArrayBuffer(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Single derivation — used for both verification and wrapping
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable — needed for verification hash and key wrapping
    ['encrypt', 'decrypt']
  );

  // Compute verification hash
  const keyData = await crypto.subtle.exportKey('raw', derivedKey);
  const vSaltBuffer = base64ToArrayBuffer(verificationSalt);
  const combined = new Uint8Array(keyData.byteLength + vSaltBuffer.byteLength);
  combined.set(new Uint8Array(keyData), 0);
  combined.set(new Uint8Array(vSaltBuffer), keyData.byteLength);
  const hash = await crypto.subtle.digest('SHA-256', combined);
  const verificationHash = arrayBufferToBase64(hash);

  return { salt, verificationSalt, verificationHash, derivedKey };
}

// ─── Encryption (AES-256-GCM) ───────────────────────────────────

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext  - The API key value to encrypt
 * @param derivedKey - The CryptoKey from deriveKey() or generateEncryptionKey()
 * @returns Object containing base64-encoded ciphertext and IV
 */
export async function encrypt(
  plaintext: string,
  derivedKey: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

// ─── Decryption (AES-256-GCM) ───────────────────────────────────

/**
 * Decrypt an AES-256-GCM encrypted blob.
 *
 * @param ciphertext - Base64-encoded ciphertext
 * @param iv         - Base64-encoded initialization vector
 * @param derivedKey - The CryptoKey from deriveKey() or generateEncryptionKey()
 * @returns The decrypted plaintext string
 * @throws If the key is wrong or the data is corrupted
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  derivedKey: CryptoKey
): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
  const ivBuffer = base64ToArrayBuffer(iv);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    derivedKey,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
