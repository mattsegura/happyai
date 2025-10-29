/**
 * Canvas Token Encryption Utilities
 *
 * Provides encryption/decryption for Canvas OAuth tokens before storage in Supabase.
 * Uses Web Crypto API for secure encryption in the browser.
 *
 * SECURITY NOTES:
 * - Tokens are encrypted before storage in the database
 * - Encryption key should be stored in Supabase secrets (server-side)
 * - For browser-based encryption, we use a derived key from user session
 * - Production should use server-side encryption via Supabase Edge Functions
 */

/**
 * Generate a cryptographic key from a password/secret
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a token using AES-GCM
 *
 * @param token - The plaintext token to encrypt
 * @param encryptionKey - The encryption key (optional, uses default if not provided)
 * @returns Base64-encoded encrypted token with IV and salt
 *
 * IMPORTANT SECURITY NOTE:
 * - The default encryption key is NOT secure for production use
 * - In production, set CANVAS_ENCRYPTION_KEY in Supabase secrets:
 *   supabase secrets set CANVAS_ENCRYPTION_KEY=$(openssl rand -base64 32)
 * - The encryption key should be retrieved server-side via edge functions
 * - For maximum security, use Supabase Vault for token storage
 */
export async function encryptToken(
  token: string,
  encryptionKey?: string
): Promise<string> {
  try {
    // Use provided key or default key
    // ⚠️ WARNING: Default key is for development only!
    // ⚠️ PRODUCTION: Must set CANVAS_ENCRYPTION_KEY in Supabase secrets
    const key = encryptionKey || 'default-encryption-key-replace-in-production';

    // Log warning in development if using default key
    if (!encryptionKey && import.meta.env.DEV) {
      console.warn(
        '[Security Warning] Using default encryption key. ' +
        'Set CANVAS_ENCRYPTION_KEY in production via Supabase secrets.'
      );
    }

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive encryption key
    const cryptoKey = await deriveKey(key, salt);

    // Encrypt the token
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      enc.encode(token)
    );

    // Combine salt + IV + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Encode as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Token encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt an encrypted token
 *
 * @param encryptedToken - Base64-encoded encrypted token
 * @param encryptionKey - The encryption key (optional, uses default if not provided)
 * @returns Decrypted plaintext token
 */
export async function decryptToken(
  encryptedToken: string,
  encryptionKey?: string
): Promise<string> {
  try {
    // Use provided key or generate a session-based key
    const key = encryptionKey || 'default-encryption-key-replace-in-production';

    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0));

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    // Derive decryption key
    const cryptoKey = await deriveKey(key, salt);

    // Decrypt the token
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );

    // Decode to string
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.error('Token decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Validate that a token can be encrypted and decrypted
 */
export async function validateEncryption(): Promise<boolean> {
  try {
    const testToken = 'test-token-' + Date.now();
    const encrypted = await encryptToken(testToken);
    const decrypted = await decryptToken(encrypted);
    return testToken === decrypted;
  } catch {
    return false;
  }
}

/**
 * Redact a token for logging (show only first/last 4 characters)
 */
export function redactToken(token: string): string {
  if (token.length <= 8) {
    return '****';
  }
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Generate a secure random state for OAuth flow
 */
export function generateOAuthState(): string {
  return crypto.randomUUID();
}

/**
 * Generate PKCE code verifier and challenge
 * PKCE (Proof Key for Code Exchange) adds security to OAuth flow
 */
export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  // Generate random code verifier
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Generate code challenge (SHA-256 hash of verifier)
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    codeVerifier,
    codeChallenge,
  };
}
