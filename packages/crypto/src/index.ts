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
// ─────────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
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
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt.buffer);
}

// ─── Key Derivation (PBKDF2) ────────────────────────────────────

/**
 * Derive an AES-256-GCM encryption key from a master password.
 *
 * @param password - The user's master password (never stored)
 * @param salt     - Base64-encoded salt (stored in VaultConfig)
 * @returns An opaque CryptoKey that can be used for encrypt/decrypt
 */
export async function deriveKey(
  password: string,
  salt: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = base64ToArrayBuffer(salt);

  // Import the raw password as a PBKDF2 key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false, // not extractable
    ['deriveKey']
  );

  // Derive the AES-GCM key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false, // not extractable — stays in Web Crypto
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

// ─── Verification ───────────────────────────────────────────────
// Note: Verification hashing is performed inline within setupVault()
// and verifyAndDeriveKey() using extractable key derivations. There
// is no standalone generateVerificationHash() function because the
// Web Crypto API does not allow re-importing a non-extractable key
// as extractable after the fact.

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

  // Now derive the non-extractable key for actual use
  const usableKey = await deriveKey(password, salt);
  return usableKey;
}

/**
 * Setup: Create initial vault config salts and verification hash.
 *
 * @param password - The chosen master password
 * @returns Object containing salt, verificationSalt, verificationHash, and derivedKey
 */
export async function setupVault(password: string): Promise<{
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

  // Derive extractable key for verification hash
  const extractableKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  const keyData = await crypto.subtle.exportKey('raw', extractableKey);
  const vSaltBuffer = base64ToArrayBuffer(verificationSalt);
  const combined = new Uint8Array(keyData.byteLength + vSaltBuffer.byteLength);
  combined.set(new Uint8Array(keyData), 0);
  combined.set(new Uint8Array(vSaltBuffer), keyData.byteLength);
  const hash = await crypto.subtle.digest('SHA-256', combined);
  const verificationHash = arrayBufferToBase64(hash);

  // Derive the non-extractable key for runtime use
  const derivedKey = await deriveKey(password, salt);

  return { salt, verificationSalt, verificationHash, derivedKey };
}

// ─── Encryption (AES-256-GCM) ───────────────────────────────────

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext  - The API key value to encrypt
 * @param derivedKey - The CryptoKey from deriveKey()
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
 * @param derivedKey - The CryptoKey from deriveKey()
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
