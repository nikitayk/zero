// Storage helpers: defaults to chrome.storage.session, with optional encrypted local persistence
import { encryptJson, decryptJson } from './crypto';

const SESSION = () => (chrome?.storage?.session ?? chrome?.storage?.local);
const LOCAL = () => chrome?.storage?.local;

export async function setSession<T>(key: string, value: T): Promise<void> {
  await SESSION()?.set({ [key]: value });
}

export async function getSession<T>(key: string): Promise<T | undefined> {
  const res = await SESSION()?.get(key);
  return res?.[key];
}

export async function setEncryptedLocal<T>(key: string, value: T, passphrase: string): Promise<void> {
  const bundle = await encryptJson(value, passphrase);
  await LOCAL()?.set({ [key]: bundle });
}

export async function getEncryptedLocal<T>(key: string, passphrase: string): Promise<T | undefined> {
  const res = await LOCAL()?.get(key);
  const bundle = res?.[key];
  if (!bundle) return undefined;
  try {
    return await decryptJson<T>(bundle, passphrase);
  } catch {
    return undefined;
  }
}

export async function listKeys(area: 'session' | 'local' = 'session'): Promise<string[]> {
  const api = area === 'session' ? SESSION() : LOCAL();
  const all = await api?.get(null);
  return Object.keys(all || {});
}


