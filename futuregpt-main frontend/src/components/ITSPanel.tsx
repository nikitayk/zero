import React from 'react';
import type { MasteryProfile } from '../types';
import { getSession, setSession } from '../utils/storage';

export function ITSPanel() {
  const [topic, setTopic] = React.useState('arrays');
  const [feedback, setFeedback] = React.useState('');

  const applyFeedback = async (correct: boolean) => {
    const profile = (await getSession<MasteryProfile>('zt_mastery')) || { updatedAt: Date.now(), entries: [] };
    const entry = profile.entries.find(e => e.topic === topic) || { topic, mastery: 0.5, errorRate: 0.5, successStreak: 0 };
    if (!profile.entries.includes(entry)) profile.entries.push(entry);
    if (correct) {
      entry.mastery = Math.min(1, entry.mastery + 0.05);
      entry.errorRate = Math.max(0, entry.errorRate - 0.05);
      entry.successStreak += 1;
      setFeedback('Great! Increasing difficulty soon if streak continues.');
    } else {
      entry.mastery = Math.max(0, entry.mastery - 0.05);
      entry.errorRate = Math.min(1, entry.errorRate + 0.1);
      entry.successStreak = 0;
      setFeedback('Let’s review micro-lesson and practice 5 targeted questions.');
    }
    profile.updatedAt = Date.now();
    await setSession('zt_mastery', profile);
  };

  return (
    <div className="p-2 text-xs border-t border-[#2E2E2E] space-y-2">
      <div className="font-semibold text-white">Intelligent Tutoring</div>
      <label className="flex items-center gap-2">
        <span>Topic</span>
        <input className="bg-[#1A1A1A] border border-[#2E2E2E] p-1 rounded" value={topic} onChange={e=>setTopic(e.target.value)} />
      </label>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border rounded" onClick={()=>applyFeedback(true)}>Mark Correct</button>
        <button className="px-2 py-1 border rounded" onClick={()=>applyFeedback(false)}>Mark Incorrect</button>
      </div>
      <div className="text-[#B3B3B3]">{feedback}</div>
    </div>
  );
}


