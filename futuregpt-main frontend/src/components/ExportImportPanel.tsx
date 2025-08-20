import React from 'react';
import { encryptJson, decryptJson } from '../utils/crypto';
import { listKeys, getSession } from '../utils/storage';

export function ExportImportPanel() {
  const [pass, setPass] = React.useState('');
  const [status, setStatus] = React.useState('');

  const doExport = async () => {
    try {
      const keys = await listKeys('session');
      const payload: Record<string, unknown> = {};
      for (const k of keys) {
        payload[k] = await getSession(k as any);
      }
      const bundle = await encryptJson(payload, pass || 'pass');
      const blob = new Blob([bundle], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'export.zerotrace';
      a.click();
      setStatus('Exported encrypted bundle.');
    } catch (e: any) {
      setStatus(e?.message || 'Export failed');
    }
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    try {
      const obj = await decryptJson<Record<string, unknown>>(text, pass || 'pass');
      // Import into session: keys and values
      for (const [k, v] of Object.entries(obj)) {
        (chrome.storage as any).session?.set({ [k]: v });
      }
      setStatus('Imported successfully into session.');
    } catch (e: any) {
      setStatus(e?.message || 'Import failed');
    }
  };

  return (
    <div className="p-2 text-xs border-t border-[#2E2E2E] space-y-2">
      <div className="font-semibold text-white">Export / Import</div>
      <input className="w-full bg-[#1A1A1A] border border-[#2E2E2E] p-1 rounded" type="password" placeholder="Passphrase" value={pass} onChange={e=>setPass(e.target.value)} />
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border rounded" onClick={doExport}>Export Encrypted</button>
        <label className="px-2 py-1 border rounded cursor-pointer">
          Import
          <input type="file" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) doImport(f); }} />
        </label>
      </div>
      <div className="text-[#B3B3B3]">{status}</div>
    </div>
  );
}


