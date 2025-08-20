import React from 'react';

interface MCQ { q: string; options: string[]; a: number; }

export function QuizPanel() {
  const [mcqs, setMcqs] = React.useState<MCQ[]>([]);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [score, setScore] = React.useState<number | null>(null);

  const gen = () => {
    setMcqs([
      { q: 'Time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], a: 1 },
      { q: 'Space complexity of Kadane’s Algorithm?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], a: 2 }
    ]);
    setAnswers({});
    setScore(null);
  };

  const grade = () => {
    let s = 0; mcqs.forEach((m,i)=>{ if (answers[i] === m.a) s++; });
    setScore(Math.round(100 * s / Math.max(1, mcqs.length)));
  };

  return (
    <div className="p-2 text-xs border-t border-[#2E2E2E] space-y-2">
      <div className="font-semibold text-white">Local Quiz</div>
      <button className="px-2 py-1 border rounded" onClick={gen}>Generate</button>
      {mcqs.map((m, i) => (
        <div key={i} className="space-y-1">
          <div className="text-white">Q{i+1}. {m.q}</div>
          <div className="grid grid-cols-2 gap-1">
            {m.options.map((opt, j) => (
              <label key={j} className="flex items-center gap-1 text-[#B3B3B3]">
                <input type="radio" name={`q${i}`} checked={answers[i]===j} onChange={()=>setAnswers({...answers,[i]:j})} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {mcqs.length>0 && <button className="px-2 py-1 border rounded" onClick={grade}>Grade</button>}
      {score!==null && <div className="text-[#B3B3B3]">Score: {score}/100</div>}
    </div>
  );
}


