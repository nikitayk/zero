import React from 'react';
import MCQ from './mcq';
import Code from './code';

const firstRunKey = 'zt_quiz_first_run_seen';

function HowItWorks({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[560px] max-w-[95vw] bg-[#121212] border border-[#2E2E2E] rounded-lg p-4 space-y-3 text-sm">
        <div className="text-white font-semibold text-base">Quiz — How it works</div>
        <div className="text-[#B3B3B3] space-y-2">
          <div>
            <div className="text-white font-medium">MCQ</div>
            <div>Enter a topic + #questions → Generate. Answers and rationales appear after ‘Submit’.</div>
          </div>
          <div>
            <div className="text-white font-medium">Coding</div>
            <div>Pick Python/JS → write solution → Run Tests. Code runs in a sandbox; we only store results in session.</div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

export default function QuizTabs() {
  const [tab, setTab] = React.useState<'mcq'|'code'>('mcq');
  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try { const r = await chrome?.storage?.session?.get(firstRunKey); if (!r?.[firstRunKey]) setShowHelp(true); } catch { setShowHelp(true); }
    })();
  }, []);

  const onCloseHelp = async () => { setShowHelp(false); try { await chrome?.storage?.session?.set({ [firstRunKey]: true }); } catch {} };

  return (
    <div className="flex flex-col h-full">
      {showHelp && <HowItWorks onClose={onCloseHelp} />}
      <div className="px-2 pt-2">
        <div className="inline-flex gap-1 text-xs">
          {['mcq','code'].map((k) => (
            <button key={k} onClick={() => setTab(k as any)} className={`px-2 py-1 border rounded ${tab===k? 'border-[#9A4DFF] text-[#9A4DFF] bg-[#2B0F45]' : ''}`}>{k.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {tab==='mcq' && <MCQ />}
        {tab==='code' && <Code />}
      </div>
    </div>
  );
}


