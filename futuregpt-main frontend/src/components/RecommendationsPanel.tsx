import React from 'react';
import type { MasteryProfile } from '../types';
import { getSession, setSession } from '../utils/storage';

function nextDifficulty(streak: number, current: 'easy'|'medium'|'hard'|'expert'): 'easy'|'medium'|'hard'|'expert' {
  const order: any = ['easy','medium','hard','expert'];
  const idx = order.indexOf(current);
  if (streak >= 3 && idx < order.length-1) return order[idx+1];
  return current;
}

export function RecommendationsPanel() {
  const [profile, setProfile] = React.useState<MasteryProfile>({ updatedAt: Date.now(), entries: [] });
  const [recommendation, setRecommendation] = React.useState<string>('');

  React.useEffect(() => { (async () => {
    const p = await getSession<MasteryProfile>('zt_mastery');
    if (p) setProfile(p);
  })(); }, []);

  const compute = () => {
    const worst = [...profile.entries].sort((a,b)=> b.errorRate - a.errorRate)[0];
    if (!worst) { setRecommendation('Start with easy array/string problems to build momentum.'); return; }
    const difficulty = worst.successStreak >= 3 ? nextDifficulty(worst.successStreak, 'medium') : 'easy';
    setRecommendation(`Focus: ${worst.topic}. Next: ${difficulty} level, 5 problems. Add a micro-lesson first if error_rate > 40%.`);
  };

  return (
    <div className="p-2 text-xs border-t border-[#2E2E2E] space-y-2">
      <div className="font-semibold text-white">Recommendations</div>
      <button className="px-2 py-1 border rounded" onClick={compute}>Compute</button>
      <div className="text-[#B3B3B3]">{recommendation}</div>
    </div>
  );
}


