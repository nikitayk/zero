import React from 'react';
import { Logo } from './Logo';
import type { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  model: string;
  credits: number;
}

const modeDescriptions = {
  chat: 'Chat with AI',
  vision: 'Vision Analysis',
  'dsa-solver': 'DSA Problem Solver',
  interview: 'Interview Prep',
  gamification: 'Gamification',
};

export function Header({ mode, model, credits }: HeaderProps) {
  const [backendOnline, setBackendOnline] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('http://localhost:3000/health', { method: 'GET' });
        if (!cancelled) setBackendOnline(res.ok);
      } catch {
        if (!cancelled) setBackendOnline(false);
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="h-12 bg-[#0D0D0D] border-b border-[#2E2E2E] px-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Logo size="sm" />
        <div>
          <h1 className="text-xs font-medium text-white/90">{modeDescriptions[mode]}</h1>
          <p className="text-[10px] text-[#B3B3B3]">{model}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-[#B3B3B3]">
        <div className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${backendOnline ? 'bg-[#9A4DFF]' : 'bg-[#2E2E2E]'}`} />
          <span className="hidden sm:inline">{backendOnline ? 'Backend Connected' : 'Backend Offline'}</span>
        </div>
        <span className="text-[#9A4DFF] font-medium">{credits}</span>
        <span>credits</span>
      </div>
    </div>
  );
}