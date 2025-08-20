import React from 'react';

const STORAGE_KEY = 'zt_notes_md_v1';

export default function Notes() {
  const [markdown, setMarkdown] = React.useState('');
  const [ephemeral, setEphemeral] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      try { const r = await chrome?.storage?.local?.get(STORAGE_KEY); if (r?.[STORAGE_KEY]) setMarkdown(r[STORAGE_KEY]); } catch {}
    })();
  }, []);

  React.useEffect(() => {
    const id = setInterval(async () => {
      if (!ephemeral) {
        try { await chrome?.storage?.local?.set({ [STORAGE_KEY]: markdown }); setSavedAt(Date.now()); } catch {}
      }
    }, 1500);
    return () => clearInterval(id);
  }, [markdown, ephemeral]);

  const onKey = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (!ephemeral) {
        try { await chrome?.storage?.local?.set({ [STORAGE_KEY]: markdown }); setSavedAt(Date.now()); } catch {}
      }
    }
  };

  return (
    <div className="p-2 text-xs space-y-2 h-full flex flex-col">
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1"><input type="checkbox" checked={ephemeral} onChange={e=>setEphemeral(e.target.checked)} /> Ephemeral</label>
        {!ephemeral && <div className="text-[#B3B3B3]">{savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Autosave on'}</div>}
      </div>
      <textarea className="flex-1 bg-transparent border border-[#2E2E2E] rounded p-2 font-mono text-xs" value={markdown} onChange={e=>setMarkdown(e.target.value)} onKeyDown={onKey} placeholder="Type markdown..." />
    </div>
  );
}


