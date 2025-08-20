import React from 'react';

const STORAGE_STATE = 'zt_pomodoro_state_v1';
const STORAGE_PREF = 'zt_pomodoro_pref_v1';

type PomodoroState = { mode: 'focus'|'break'|'idle'; endsAt: number|null; running: boolean; focusMs: number; breakMs: number; completed: number };

async function loadState(): Promise<PomodoroState|undefined> {
  try { const r = await chrome?.storage?.local?.get(STORAGE_STATE); return r?.[STORAGE_STATE]; } catch { return undefined; }
}
async function saveState(s: PomodoroState) { try { await chrome?.storage?.local?.set({ [STORAGE_STATE]: s }); } catch {} }

export default function Timer() {
  const [state, setState] = React.useState<PomodoroState>({ mode: 'idle', endsAt: null, running: false, focusMs: 25*60*1000, breakMs: 5*60*1000, completed: 0 });
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => { loadState().then(s=>{ if (s) setState(s); }); }, []);

  React.useEffect(() => {
    const id = setInterval(()=>setTick(t=>t+1), 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => { saveState(state); }, [state]);

  const remainingMs = React.useMemo(() => {
    if (!state.running || !state.endsAt) return 0;
    return Math.max(0, state.endsAt - Date.now());
  }, [state, tick]);

  const fmt = (ms: number) => {
    const s = Math.floor(ms/1000); const m = Math.floor(s/60); const sec = s%60; const min = m%60; const hr = Math.floor(m/60);
    return `${hr>0? hr+':':''}${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const startFocus = () => setState({ ...state, mode: 'focus', running: true, endsAt: Date.now() + state.focusMs });
  const startBreak = () => setState({ ...state, mode: 'break', running: true, endsAt: Date.now() + state.breakMs });
  const stop = () => setState({ ...state, running: false, endsAt: null, mode: 'idle' });

  React.useEffect(() => {
    if (state.running && state.endsAt && Date.now() >= state.endsAt) {
      // session ended
      const nextMode = state.mode === 'focus' ? 'break' : 'focus';
      const next = { ...state, mode: nextMode, running: true, endsAt: Date.now() + (nextMode==='focus'? state.focusMs : state.breakMs), completed: state.mode==='focus'? state.completed+1 : state.completed };
      setState(next);
      try {
        const iconData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNyIgZmlsbD0iIzk5MjRGRiIvPjxwYXRoIGQ9Ik04IDMuNXY1bDMuNSAzLjUiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
        chrome?.notifications?.create?.({ type: 'basic', iconUrl: iconData, title: 'Pomodoro', message: state.mode==='focus'? 'Focus session complete. Break time!' : 'Break over. Back to focus!' });
      } catch {}
    }
  }, [tick]);

  return (
    <div className="p-2 text-xs space-y-2">
      <div className="flex gap-2 items-center">
        <div className="text-white text-xl tabular-nums">{state.running ? fmt(remainingMs) : fmt(state.focusMs)}</div>
        <div className="text-[#B3B3B3]">Mode: {state.mode}</div>
        <div className="ml-auto text-[#B3B3B3]">Completed: {state.completed}</div>
      </div>
      <div className="flex gap-2">
        <button className="px-2 py-1 border rounded" onClick={startFocus}>Start Focus</button>
        <button className="px-2 py-1 border rounded" onClick={startBreak}>Start Break</button>
        <button className="px-2 py-1 border rounded" onClick={stop}>Stop</button>
      </div>
      <div className="flex gap-2 items-center">
        <label className="flex items-center gap-1">Focus (min)<input className="w-16 px-2 py-1 bg-transparent border rounded" type="number" value={Math.round(state.focusMs/60000)} onChange={e=>setState({ ...state, focusMs: Math.max(1, Number(e.target.value)) * 60000 })} /></label>
        <label className="flex items-center gap-1">Break (min)<input className="w-16 px-2 py-1 bg-transparent border rounded" type="number" value={Math.round(state.breakMs/60000)} onChange={e=>setState({ ...state, breakMs: Math.max(1, Number(e.target.value)) * 60000 })} /></label>
      </div>
    </div>
  );
}


