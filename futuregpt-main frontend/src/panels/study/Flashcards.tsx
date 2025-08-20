import React from 'react';

type Card = { id: string; q: string; a: string; nextDue: number; interval: number; ease: number; repetitions: number };

const STORAGE_KEY = 'zt_study_flashcards_v1';

function now() { return Date.now(); }

function scheduleSM2(card: Card, rating: 0|1|2): Card {
  // SM-2 lite
  let { ease, interval, repetitions } = card;
  if (rating === 0) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ease);
    ease = Math.max(1.3, ease + (0.1 - (2 - rating) * (0.08 + (2 - rating) * 0.02)));
  }
  return { ...card, ease, interval, repetitions, nextDue: now() + interval * 24 * 60 * 60 * 1000 };
}

async function loadCards(): Promise<Card[]> {
  try { const res = await chrome?.storage?.local?.get(STORAGE_KEY); return res?.[STORAGE_KEY] || []; } catch { return []; }
}
async function saveCards(cards: Card[]) {
  try { await chrome?.storage?.local?.set({ [STORAGE_KEY]: cards }); } catch {}
}

export default function Flashcards({ pageContext }: { pageContext?: { webpageContent?: string; selectedText?: string } }) {
  const [cards, setCards] = React.useState<Card[]>([]);
  const [q, setQ] = React.useState('');
  const [a, setA] = React.useState('');

  React.useEffect(() => { loadCards().then(setCards); }, []);

  const addCard = async (question: string, answer: string) => {
    const c: Card = { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, q: question, a: answer, nextDue: now(), interval: 1, ease: 2.5, repetitions: 0 };
    const next = [c, ...cards];
    setCards(next);
    await saveCards(next);
  };

  const onGenerate = async () => {
    const base = (pageContext?.selectedText || pageContext?.webpageContent || '').trim().slice(0, 800);
    if (!base) return;
    // Lightweight local generation: split into sentences and make Q/A pairs
    const sentences = base.split(/(?<=[.!?])\s+/).filter(s=>s.length>20).slice(0, 4);
    for (const s of sentences) {
      const question = `What is the key point about: "${s.slice(0, 80)}"?`;
      const answer = s;
      await addCard(question, answer);
    }
  };

  const reviewable = cards.filter(c => c.nextDue <= now());

  const grade = async (id: string, rating: 0|1|2) => {
    const next = cards.map(c => c.id===id ? scheduleSM2(c, rating) : c);
    setCards(next);
    await saveCards(next);
  };

  const remove = async (id: string) => {
    const next = cards.filter(c => c.id !== id);
    setCards(next);
    await saveCards(next);
  };

  return (
    <div className="p-2 text-xs space-y-2">
      <div className="flex gap-2">
        <button className="px-2 py-1 border rounded" onClick={onGenerate}>Generate Cards</button>
        <input className="px-2 py-1 bg-transparent border rounded flex-1" placeholder="Question" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={(e)=>{ if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); const valQ=q.trim(); const valA=a.trim(); if(valQ && valA){ addCard(valQ,valA); setQ(''); setA(''); } } }} />
        <input className="px-2 py-1 bg-transparent border rounded flex-1" placeholder="Answer" value={a} onChange={e=>setA(e.target.value)} />
        <button className="px-2 py-1 border rounded" onClick={()=>{ const valQ=q.trim(); const valA=a.trim(); if(valQ && valA){ addCard(valQ,valA); setQ(''); setA(''); } }}>Add</button>
      </div>

      <div className="text-[#B3B3B3]">Due now: {reviewable.length} / Total: {cards.length}</div>

      <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
        {cards.map(card => (
          <div key={card.id} className="border border-[#2E2E2E] rounded p-2">
            <div className="text-white font-medium">Q: {card.q}</div>
            <details className="mt-1">
              <summary className="cursor-pointer text-[#B3B3B3]">Show answer</summary>
              <div className="mt-1 text-[#E5E5E5] whitespace-pre-wrap">{card.a}</div>
            </details>
            <div className="flex gap-1 mt-2">
              <button className="px-2 py-1 border rounded" onClick={()=>grade(card.id,0)}>Again</button>
              <button className="px-2 py-1 border rounded" onClick={()=>grade(card.id,1)}>Good</button>
              <button className="px-2 py-1 border rounded" onClick={()=>grade(card.id,2)}>Easy</button>
              <button className="ml-auto px-2 py-1 border rounded" onClick={()=>remove(card.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


