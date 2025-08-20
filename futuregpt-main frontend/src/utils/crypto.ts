// Minimal WebCrypto helpers for AES-GCM with passphrase-derived key
// Local-first: used for optional encrypted persistence and exports

export async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 120_000,
      hash: 'SHA-256'
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJson<T>(data: T, passphrase: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const combined = new Uint8Array(1 + salt.byteLength + iv.byteLength + ciphertext.byteLength);
  combined[0] = 1; // version
  combined.set(salt, 1);
  combined.set(iv, 1 + salt.byteLength);
  combined.set(new Uint8Array(ciphertext), 1 + salt.byteLength + iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptJson<T>(bundle: string, passphrase: string): Promise<T> {
  const bytes = Uint8Array.from(atob(bundle), c => c.charCodeAt(0));
  const version = bytes[0];
  if (version !== 1) throw new Error('Unsupported bundle version');
  const salt = bytes.slice(1, 17);
  const iv = bytes.slice(17, 29);
  const ciphertext = bytes.slice(29);
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(new Uint8Array(plaintext)));
}


