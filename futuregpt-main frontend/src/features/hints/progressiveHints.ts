import { getSession, setSession } from '../../utils/storage';
import type { HintTier, IngestedProblem } from '../../types';

interface HintState {
  [problemKey: string]: HintTier[];
}

const KEY = 'zt_hint_state_v1';

export async function scheduleHints(problem: IngestedProblem, tiers: Omit<HintTier, 'unlockAt'>[], delayMinutes = 10): Promise<HintTier[]> {
  const now = Date.now();
  const schedule = tiers.map((t, i) => ({ ...t, unlockAt: now + (i + 1) * delayMinutes * 60_000 }));
  const id = `${problem.source}:${problem.title}`;
  const state = (await getSession<HintState>(KEY)) || {};
  state[id] = schedule;
  await setSession(KEY, state);
  return schedule;
}

export async function getUnlockedHints(problem: IngestedProblem): Promise<HintTier[]> {
  const id = `${problem.source}:${problem.title}`;
  const state = (await getSession<HintState>(KEY)) || {};
  const tiers = state[id] || [];
  const now = Date.now();
  return tiers.filter(t => t.unlockAt <= now);
}


