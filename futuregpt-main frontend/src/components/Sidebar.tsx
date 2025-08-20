import { MessageSquare, Eye, Plus, Settings, Target, Users, Trophy, BookOpen, ClipboardCheck } from 'lucide-react';
import type { AppMode } from '../types';

interface SidebarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewChat: () => void;
}

const modeIcons = {
  chat: MessageSquare,
  vision: Eye,
  'dsa-solver': Target,
  interview: Users,
  gamification: Trophy,
  study: BookOpen,
  quiz: ClipboardCheck,
};

const modeLabels = {
  chat: 'Chat',
  vision: 'Vision',
  'dsa-solver': 'DSA Solver',
  interview: 'Interview',
  gamification: 'Gamification',
  study: 'Study',
  quiz: 'Quiz',
};

export function Sidebar({ mode, onModeChange, onNewChat }: SidebarProps) {
  return (
    <div className="w-16 bg-[#1A1A1A] border-l border-[#2E2E2E] flex flex-col items-center py-2">
      {/* New Chat */}
      <button
        onClick={onNewChat}
        className="w-8 h-8 rounded-md bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center text-[#FFFFFF] hover:text-[#9A4DFF] hover:border-[#9A4DFF] hover:bg-[#2B0F45] transition-colors duration-200 group"
        title="New Chat"
      >
        <Plus size={16} />
      </button>

      <div className="h-px w-8 bg-[#2E2E2E] my-2" />

      {/* Mode Buttons */}
      <div className="w-full flex flex-col items-center gap-1">
        {(Object.keys(modeIcons) as AppMode[]).map((modeKey) => {
          const Icon = modeIcons[modeKey];
          const isActive = mode === modeKey;
          
          return (
            <button
              key={modeKey}
              onClick={() => onModeChange(modeKey)}
              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors duration-200 group ${
                isActive
                  ? 'bg-[#2B0F45] border-[#9A4DFF] text-[#9A4DFF]'
                  : 'bg-[#1A1A1A] border-[#2E2E2E] text-[#FFFFFF] hover:text-[#9A4DFF] hover:border-[#9A4DFF] hover:bg-[#2B0F45]'
              }`}
              title={modeLabels[modeKey]}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <button
        className="w-8 h-8 mt-2 rounded-md bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center text-[#FFFFFF] hover:text-[#9A4DFF] hover:border-[#9A4DFF] hover:bg-[#2B0F45] transition-colors duration-200 group"
        title="Settings"
      >
        <Settings size={14} />
      </button>
    </div>
  );
}