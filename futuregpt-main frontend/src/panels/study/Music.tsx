import React from 'react';

const STORAGE_KEY = 'zt_music_prefs_v1';

type Prefs = { sourceType: 'file'|'url'|null; url?: string; volume: number; loop: boolean };

export default function Music() {
  const [prefs, setPrefs] = React.useState<Prefs>({ sourceType: null, volume: 0.6, loop: false });
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => { (async ()=>{ try { const r = await chrome?.storage?.local?.get(STORAGE_KEY); if (r?.[STORAGE_KEY]) setPrefs(r[STORAGE_KEY]); } catch {} })(); }, []);
  React.useEffect(() => { (async ()=>{ try { await chrome?.storage?.local?.set({ [STORAGE_KEY]: prefs }); } catch {} })(); }, [prefs]);

  React.useEffect(() => { if (audioRef.current) { audioRef.current.volume = prefs.volume; audioRef.current.loop = prefs.loop; } }, [prefs.volume, prefs.loop]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(url);
    setPrefs({ ...prefs, sourceType: 'file' });
  };

  const src = prefs.sourceType === 'file' ? fileUrl || undefined : (prefs.sourceType === 'url' ? prefs.url : undefined);

  return (
    <div className="p-2 text-xs space-y-2">
      <div className="flex gap-2 items-center">
        <input type="file" accept="audio/*" onChange={onFile} />
        <input className="px-2 py-1 bg-transparent border rounded flex-1" placeholder="Public audio URL" value={prefs.url || ''} onChange={e=>setPrefs({ ...prefs, url: e.target.value })} />
        <button className="px-2 py-1 border rounded" onClick={()=>setPrefs({ ...prefs, sourceType: 'url' })}>Use URL</button>
      </div>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">Volume <input type="range" min={0} max={1} step={0.01} value={prefs.volume} onChange={e=>setPrefs({ ...prefs, volume: Number(e.target.value) })} /></label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={prefs.loop} onChange={e=>setPrefs({ ...prefs, loop: e.target.checked })} /> Loop</label>
      </div>
      <audio ref={audioRef} controls src={src} className="w-full" />
    </div>
  );
}


