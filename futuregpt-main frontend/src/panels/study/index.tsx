import React from 'react';
import Flashcards from './Flashcards';
import Timer from './Timer';
import Notes from './Notes';
import Music from './Music';

interface Props {
  pageContext?: { webpageContent?: string; selectedText?: string };
}

const firstRunKey = 'zt_study_first_run_seen';

function HowItWorks({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[560px] max-w-[95vw] bg-[#121212] border border-[#2E2E2E] rounded-lg p-4 space-y-3 text-sm">
        <div className="text-white font-semibold text-base">Study Utilities — How it works</div>
        <div className="text-[#B3B3B3] space-y-2">
          <div>
            <div className="text-white font-medium">Flashcards</div>
            <div>Select any text (problem statement/hints) → Generate. Use ⌘/Ctrl+K to add a card manually. Spaced repetition schedules your next review automatically.</div>
          </div>
          <div>
            <div className="text-white font-medium">Timer</div>
            <div>Pomodoro defaults to 25/5; customize in Settings. Enable notifications to get end-of-session alerts.</div>
          </div>
          <div>
            <div className="text-white font-medium">Notes</div>
            <div>Markdown supported. Toggle Ephemeral to avoid saving to disk.</div>
          </div>
          <div>
            <div className="text-white font-medium">Music</div>
            <div>Load a local MP3 (stays on your device) or paste a URL.</div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

export default function StudyPanel({ pageContext }: Props) {
  const [tab, setTab] = React.useState<'flashcards'|'timer'|'notes'|'music'>('flashcards');
  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await chrome?.storage?.local?.get(firstRunKey);
        if (!res?.[firstRunKey]) setShowHelp(true);
      } catch {
        setShowHelp(true);
      }
    })();
  }, []);

  const onCloseHelp = async () => {
    setShowHelp(false);
    try { await chrome?.storage?.local?.set({ [firstRunKey]: true }); } catch {}
  };

  return (
    <div className="flex flex-col h-full">
      {showHelp && <HowItWorks onClose={onCloseHelp} />}
      <div className="px-2 pt-2">
        <div className="inline-flex gap-1 text-xs">
          {['flashcards','timer','notes','music'].map((k) => (
            <button key={k} onClick={() => setTab(k as any)} className={`px-2 py-1 border rounded ${tab===k? 'border-[#9A4DFF] text-[#9A4DFF] bg-[#2B0F45]' : ''}`}>{k[0].toUpperCase()+k.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {tab==='flashcards' && <Flashcards pageContext={pageContext} />}
        {tab==='timer' && <Timer />}
        {tab==='notes' && <Notes />}
        {tab==='music' && <Music />}
      </div>
    </div>
  );
}


