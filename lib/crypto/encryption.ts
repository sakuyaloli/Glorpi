/**
 * Server-side encryption utilities for API key storage
 * Uses AES-256-GCM with random IV
 * 
 * SECURITY: This file must only be imported on the server
 */

import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits

export interface EncryptedPayload {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag: Uint8Array;
  last4: string;
}

/**
 * Get the encryption key from environment
 * Throws if not configured (required in production)
 */
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.DATA_ENCRYPTION_KEY;
  
  if (!keyEnv) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATA_ENCRYPTION_KEY is required in production');
    }
    // Dev fallback - NOT SECURE, only for local development
    console.warn('[CRYPTO] Using insecure dev key - set DATA_ENCRYPTION_KEY in production');
    return Buffer.from('0'.repeat(64), 'hex'); // 32 bytes of zeros
  }
  
  // Support both base64 and hex encoded keys
  let key: Buffer;
  if (keyEnv.length === 64) {
    // Hex encoded (64 chars = 32 bytes)
    key = Buffer.from(keyEnv, 'hex');
  } else if (keyEnv.length === 44) {
    // Base64 encoded (44 chars = 32 bytes)
    key = Buffer.from(keyEnv, 'base64');
  } else {
    throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes (64 hex chars or 44 base64 chars)');
  }
  
  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must decode to exactly 32 bytes');
  }
  
  return key;
}

/**
 * Encrypt a string value (e.g., API key)
 * Returns encrypted payload with IV and auth tag
 */
export function encryptString(plaintext: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  const tag = cipher.getAuthTag();
  
  // Extract last 4 characters for display hint
  const last4 = plaintext.slice(-4);
  
  return {
    ciphertext: new Uint8Array(encrypted),
    iv: new Uint8Array(iv),
    tag: new Uint8Array(tag),
    last4,
  };
}

/**
 * Decrypt an encrypted payload back to string
 * Throws if decryption fails (wrong key or tampered data)
 */
export function decryptToString(payload: {
  ciphertext: Uint8Array | Buffer;
  iv: Uint8Array | Buffer;
  tag: Uint8Array | Buffer;
}): string {
  const key = getEncryptionKey();
  
  // Convert to Buffer for crypto module
  const iv = Buffer.from(payload.iv);
  const tag = Buffer.from(payload.tag);
  const ciphertext = Buffer.from(payload.ciphertext);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
}

/**
 * Generate a new random encryption key (for initial setup)
 * Returns hex-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}
