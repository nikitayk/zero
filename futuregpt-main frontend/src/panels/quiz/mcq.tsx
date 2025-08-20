import React from 'react';
import { setSession, getSession } from '../../utils/storage';
import { encryptJson, decryptJson } from '../../utils/crypto';

type MCQ = { q: string; options: string[]; a: number; rationale?: string };
type Session = { ts: number; items: MCQ[]; answers: Record<number, number>; graded: boolean; score?: number };

const KEY = 'zt_quiz_mcq_session_v1';

function localGenerate(topic: string, num: number, difficulty: string): MCQ[] {
  const base = [
    { q: `Which data structure is best for ${topic}?`, options: ['Array','Stack','Queue','HashMap'], a: 3, rationale: 'HashMap offers average O(1) access for key-based lookups.' },
    { q: `Time complexity for ${topic} traversal?`, options: ['O(n)','O(log n)','O(n log n)','O(1)'], a: 0, rationale: 'Linear traversal touches each node/element once.' },
    { q: `What property defines ${topic}?`, options: ['A','B','C','D'], a: 1, rationale: 'By definition, property B holds.' }
  ];
  const out: MCQ[] = [];
  for (let i=0;i<num;i++) out.push(base[i % base.length]);
  return out.map((m, i) => ({ ...m, q: `${m.q} [${difficulty}]` }));
}

export default function MCQ() {
  const [topic, setTopic] = React.useState('Graph Traversal');
  const [num, setNum] = React.useState(3);
  const [difficulty, setDifficulty] = React.useState('Medium');
  const [session, setSessionState] = React.useState<Session | null>(null);

  React.useEffect(() => { (async()=>{ const s = await getSession<Session>(KEY); if (s) setSessionState(s); })(); }, []);

  const persist = async (s: Session) => { setSessionState(s); await setSession(KEY, s); };

  const generate = async () => {
    const items = localGenerate(topic.trim(), Math.max(1, num), difficulty);
    await persist({ ts: Date.now(), items, answers: {}, graded: false });
  };

  const setAnswer = async (idx: number, value: number) => {
    if (!session) return;
    await persist({ ...session, answers: { ...session.answers, [idx]: value } });
  };

  const grade = async () => {
    if (!session) return;
    const { items, answers } = session;
    let s = 0; items.forEach((m,i)=>{ if (answers[i] === m.a) s++; });
    await persist({ ...session, graded: true, score: Math.round(100 * s / Math.max(1, items.length)) });
  };

  const exportEncrypted = async () => {
    if (!session) return;
    const password = prompt('Enter password to encrypt export (.zeroquiz)') || '';
    if (!password) return;
    const bundle = await encryptJson(session, password);
    const blob = new Blob([bundle], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `quiz_${new Date().toISOString()}.zeroquiz`; a.click();
    URL.revokeObjectURL(url);
  };

  const importEncrypted = async () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.zeroquiz';
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return; const password = prompt('Password to decrypt') || '';
      if (!password) return; const text = await f.text();
      try { const s = await decryptJson<Session>(text, password); await persist(s); } catch { alert('Decryption failed'); }
    };
    input.click();
  };

  return (
    <div className="p-2 text-xs space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <input className="px-2 py-1 bg-transparent border rounded" placeholder="Topic" value={topic} onChange={e=>setTopic(e.target.value)} />
        <input className="px-2 py-1 bg-transparent border rounded" type="number" min={1} max={10} value={num} onChange={e=>setNum(Number(e.target.value))} />
        <select className="px-2 py-1 bg-transparent border rounded" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
          {['Easy','Medium','Hard'].map(d=> <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button className="px-2 py-1 border rounded" onClick={generate}>Generate</button>
        <button className="px-2 py-1 border rounded" onClick={grade} disabled={!session}>Submit</button>
        <button className="ml-auto px-2 py-1 border rounded" onClick={exportEncrypted} disabled={!session}>Export Encrypted (.zeroquiz)</button>
        <button className="px-2 py-1 border rounded" onClick={importEncrypted}>Import</button>
      </div>
      {session && (
        <div className="space-y-2">
          {session.items.map((m, i) => (
            <div key={i} className="border border-[#2E2E2E] rounded p-2 space-y-1">
              <div className="text-white">Q{i+1}. {m.q}</div>
              <div className="grid grid-cols-2 gap-1">
                {m.options.map((opt, j) => (
                  <label key={j} className="flex items-center gap-1 text-[#B3B3B3]">
                    <input type="radio" name={`q${i}`} checked={session.answers[i]===j} onChange={()=>setAnswer(i, j)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              {session.graded && (
                <div className="text-[#9AD27F]">
                  Correct: {m.options[m.a]}{m.rationale ? ` — ${m.rationale}`: ''}
                </div>
              )}
            </div>
          ))}
          {session.graded && <div className="text-white">Score: {session.score}/100</div>}
        </div>
      )}
    </div>
  );
}


