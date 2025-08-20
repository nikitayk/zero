import React from 'react';
import type { IngestedProblem, HintTier } from '../types';
import { scheduleHints, getUnlockedHints } from '../features/hints/progressiveHints';

interface Props {
  problem?: IngestedProblem;
}

export function HintsPanel({ problem }: Props) {
  const [tiers, setTiers] = React.useState<HintTier[]>([]);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const plan = async () => {
    if (!problem) return;
    const scheduled = await scheduleHints(problem, [
      { tier: 1, content: 'Think about the simplest substructure first.' },
      { tier: 2, content: 'Try a prefix/suffix technique or DP relation.' },
      { tier: 3, content: 'Consider edge cases: empty, single element, extremes.' }
    ] as any, 10);
    setTiers(scheduled);
  };

  const load = async () => {
    if (!problem) return;
    const unlocked = await getUnlockedHints(problem);
    setTiers(unlocked);
  };

  React.useEffect(() => { load(); }, [problem]);

  return (
    <div className="p-2 text-xs border-t border-[#2E2E2E] space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-white">Progressive Hints</div>
        <button className="px-2 py-1 border rounded" onClick={plan}>Schedule</button>
        <button className="px-2 py-1 border rounded" onClick={load}>Refresh</button>
      </div>
      <ul className="space-y-1">
        {tiers.map((t, idx) => (
          <li key={idx} className="text-[#B3B3B3]">
            <span className="text-white mr-1">Tier {t.tier}:</span>
            {t.content}
          </li>
        ))}
      </ul>
      {(!tiers || tiers.length === 0) && (
        <div className="text-[#B3B3B3]">No hints unlocked yet. Use Schedule or wait for unlock time.</div>
      )}
    </div>
  );
}


