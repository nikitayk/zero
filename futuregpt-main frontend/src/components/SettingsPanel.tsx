import React from 'react';
import { getSession, setSession, setEncryptedLocal } from '../utils/storage';

const defaultSites = [
  'leetcode.com',
  'codeforces.com',
  'www.geeksforgeeks.org'
];

export function SettingsPanel() {
  const [sites, setSites] = React.useState<string[]>(defaultSites);
  const [states, setStates] = React.useState<Record<string, boolean>>({});
  const [persistMode, setPersistMode] = React.useState<'session'|'encrypted'>('session');
  const [pass, setPass] = React.useState('');

  React.useEffect(() => {
    (async () => {
      const s: Record<string, boolean> = {};
      for (const host of sites) {
        const key = `zt_site_enable_${host}`;
        const v = await getSession<boolean>(key);
        s[host] = v !== false;
      }
      setStates(s);
    })();
  }, []);

  const toggle = async (host: string) => {
    const next = { ...states, [host]: !states[host] };
    setStates(next);
    await setSession(`zt_site_enable_${host}`, next[host]);
  };

  const savePersistence = async () => {
    await setSession('zt_persistence_mode', persistMode);
    if (persistMode === 'encrypted' && pass) {
      await setEncryptedLocal('zt_persistence_test', { ok: true, ts: Date.now() }, pass);
    }
  };

  return (
    <div className="p-2 text-xs space-y-2 border-t border-[#2E2E2E]">
      <div className="font-semibold text-white">Settings</div>
      <div className="space-y-1">
        <div className="text-[#B3B3B3]">Per-site adapters</div>
        {sites.map(host => (
          <label key={host} className="flex items-center gap-2">
            <input type="checkbox" checked={!!states[host]} onChange={() => toggle(host)} />
            <span>{host}</span>
          </label>
        ))}
      </div>
      <div className="space-y-1">
        <div className="text-[#B3B3B3]">Persistence</div>
        <label className="flex items-center gap-2">
          <input type="radio" name="persist" checked={persistMode==='session'} onChange={() => setPersistMode('session')} />
          <span>Session-only (ephemeral)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="persist" checked={persistMode==='encrypted'} onChange={() => setPersistMode('encrypted')} />
          <span>Encrypted local (AES‑GCM)</span>
        </label>
        {persistMode==='encrypted' && (
          <input className="w-full bg-[#1A1A1A] border border-[#2E2E2E] p-1 rounded" type="password" placeholder="Passphrase" value={pass} onChange={e=>setPass(e.target.value)} />
        )}
        <button onClick={savePersistence} className="px-2 py-1 border rounded">Save</button>
      </div>
    </div>
  );
}


