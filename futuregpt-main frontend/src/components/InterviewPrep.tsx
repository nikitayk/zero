import React from 'react';
import type { InterviewSessionReport, IngestedProblem } from '../types';
import { setSession, getSession } from '../utils/storage';

export function InterviewPrep({ problem }: { problem?: IngestedProblem }) {
  const [running, setRunning] = React.useState(false);
  const [startTs, setStartTs] = React.useState<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    let id: any;
    if (running && startTs) {
      id = setInterval(() => setElapsed(Math.floor((Date.now() - startTs) / 1000)), 500);
    }
    return () => clearInterval(id);
  }, [running, startTs]);

  const start = () => { setRunning(true); setStartTs(Date.now()); setElapsed(0); };
  const stop = async () => {
    setRunning(false);
    const report: InterviewSessionReport = {
      startedAt: startTs || Date.now(),
      durationSec: elapsed,
      score: score,
      rubric: { correctness: score, clarity: Math.max(0, 100 - Math.abs(50 - score)), efficiency: Math.floor(score * 0.7) },
      notes,
      problem
    };
    await setSession('zt_last_interview_report', report);
  };

  return (
    <div className="p-2 text-xs border-t border-[#2E2E2E] space-y-2">
      <div className="font-semibold text-white">Interview Prep</div>
      <div className="flex items-center gap-2">
        {!running ? (
          <button className="px-2 py-1 border rounded" onClick={start}>Start</button>
        ) : (
          <button className="px-2 py-1 border rounded" onClick={stop}>Stop</button>
        )}
        <div className="text-[#B3B3B3]">Elapsed: {elapsed}s</div>
      </div>
      <label className="flex items-center gap-2">
        <span>Score</span>
        <input type="number" min={0} max={100} value={score} onChange={e=>setScore(parseInt(e.target.value||'0',10))} className="w-16 bg-[#1A1A1A] border border-[#2E2E2E] p-1 rounded" />
      </label>
      <textarea className="w-full bg-[#1A1A1A] border border-[#2E2E2E] p-1 rounded" placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
    </div>
  );
}


