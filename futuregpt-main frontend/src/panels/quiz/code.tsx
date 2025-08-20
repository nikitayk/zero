import React from 'react';
import { setSession, getSession } from '../../utils/storage';

type Case = { input: string; output: string };
type CodeSession = { lang: 'python'|'javascript'; prompt: string; userCode: string; cases: Case[]; results?: { passed: number; total: number; details: { ok: boolean; got: string; expected: string }[] } };

const KEY = 'zt_quiz_code_session_v1';

async function loadPyodide(): Promise<any> {
  throw new Error('Pyodide is disabled by MV3 CSP (no remote scripts).');
}

function runJsSafely(code: string, input: string): { ok: boolean; output: string; error?: string } {
  // Conservative static check + isolated function scope
  const banned = /(eval|Function|import\(|require\(|process\.|window\.|document\.|XMLHttpRequest|fetch|WebSocket|Worker|SharedArrayBuffer)/;
  if (banned.test(code)) return { ok: false, output: '', error: 'Disallowed APIs in code' };
  try {
    const wrapped = `"use strict"; let solveRef; { ${code}\nsolveRef = (typeof solve==='function') ? solve : undefined; } return solveRef;`;
    const factory = new Function(wrapped);
    const solve = factory();
    if (typeof solve !== 'function') return { ok: false, output: '', error: 'Define function solve(input)' };
    const res = solve(input);
    return { ok: true, output: String(res) };
  } catch (e: any) { return { ok: false, output: '', error: e?.message || 'Runtime error' }; }
}

export default function Code() {
  const [session, setSessionState] = React.useState<CodeSession>({ lang: 'python', prompt: 'Reverse a string', userCode: '', cases: [ { input: 'abc', output:'cba' }, { input: 'racecar', output:'racecar' } ] });
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => { (async()=>{ const s = await getSession<CodeSession>(KEY); if (s) setSessionState(s); })(); }, []);
  const persist = async (s: CodeSession) => { setSessionState(s); await setSession(KEY, s); };

  const runTests = async () => {
    setRunning(true);
    try {
      const details: { ok: boolean; got: string; expected: string }[] = [];
      if (session.lang === 'python') {
        for (const t of session.cases) {
          details.push({ ok: false, got: 'Python runner unavailable (MV3 CSP).', expected: String(t.output).trim() });
        }
      } else {
        for (const t of session.cases) {
          const r = runJsSafely(session.userCode, t.input);
          details.push({ ok: r.ok && String(r.output).trim() === String(t.output).trim(), got: r.error ? `Error: ${r.error}` : String(r.output).trim(), expected: String(t.output).trim() });
        }
      }
      const passed = details.filter(d=>d.ok).length; const total = details.length;
      await persist({ ...session, results: { passed, total, details } });
    } finally { setRunning(false); }
  };

  return (
    <div className="p-2 text-xs space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <select className="px-2 py-1 bg-transparent border rounded" value={session.lang} onChange={e=>persist({ ...session, lang: e.target.value as any })}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <input className="px-2 py-1 bg-transparent border rounded col-span-2" placeholder="Problem brief" value={session.prompt} onChange={e=>persist({ ...session, prompt: e.target.value })} />
      </div>
      <textarea className="w-full h-40 bg-transparent border border-[#2E2E2E] rounded p-2 font-mono" placeholder={session.lang==='python'? 'def solve(x):\n    return x[::-1]' : 'function solve(x){ return x.split(\'\').reverse().join(\'\'); }'} value={session.userCode} onChange={e=>persist({ ...session, userCode: e.target.value })} />
      <div className="space-y-1">
        <div className="text-white">Test Cases</div>
        {session.cases.map((c, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-2">
            <input className="px-2 py-1 bg-transparent border rounded" placeholder="Input" value={c.input} onChange={e=>{
              const next = [...session.cases]; next[idx] = { ...next[idx], input: e.target.value }; persist({ ...session, cases: next });
            }} />
            <input className="px-2 py-1 bg-transparent border rounded" placeholder="Expected Output" value={c.output} onChange={e=>{
              const next = [...session.cases]; next[idx] = { ...next[idx], output: e.target.value }; persist({ ...session, cases: next });
            }} />
          </div>
        ))}
        <button className="px-2 py-1 border rounded" onClick={()=>persist({ ...session, cases: [...session.cases, { input:'', output:'' }] })}>Add Case</button>
      </div>
      <button className="px-2 py-1 border rounded" onClick={runTests} disabled={running}>Run Tests</button>
      {session.results && (
        <div className="space-y-1">
          <div className="text-white">Results: {session.results.passed}/{session.results.total} passed</div>
          {session.results.details.map((d, i) => (
            <div key={i} className={`border rounded p-2 ${d.ok? 'border-green-600' : 'border-red-600'}`}>
              <div className="text-[#B3B3B3]">Expected: {d.expected}</div>
              <div className="text-[#E5E5E5]">Got: {d.got}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


