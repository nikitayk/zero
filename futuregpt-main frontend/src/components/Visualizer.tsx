import React from 'react';

interface Frame { label: string; state: any; }

export function Visualizer() {
  const [frames, setFrames] = React.useState<Frame[]>([]);
  const [idx, setIdx] = React.useState(0);

  const loadDemo = () => {
    setFrames([
      { label: 'Start', state: { array: [2, -1, 3], i: 0, best: 2 } },
      { label: 'Step 1', state: { array: [2, -1, 3], i: 1, best: 2 } },
      { label: 'Step 2', state: { array: [2, -1, 3], i: 2, best: 4 } }
    ]);
    setIdx(0);
  };

  const next = () => setIdx(i => Math.min(i + 1, frames.length - 1));
  const prev = () => setIdx(i => Math.max(i - 1, 0));

  return (
    <div className="p-2 text-xs border-t border-[#2E2E2E] space-y-2">
      <div className="font-semibold text-white">Visualization</div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border rounded" onClick={loadDemo}>Load Demo</button>
        <button className="px-2 py-1 border rounded" onClick={prev}>Prev</button>
        <button className="px-2 py-1 border rounded" onClick={next}>Next</button>
      </div>
      <div className="text-[#B3B3B3]">{frames[idx]?.label || 'No frames'}</div>
      <pre className="bg-[#0D0D0D] border border-[#2E2E2E] p-2 rounded text-white text-[11px] overflow-x-auto">{JSON.stringify(frames[idx]?.state || {}, null, 2)}</pre>
    </div>
  );
}


