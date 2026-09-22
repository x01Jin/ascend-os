import React, { useMemo, useState } from 'react';

const SYMBOLS = ['▲', '●', '■', '★', '◆', '✚'];

const shuffled = (): string[] => {
  const deck = [...SYMBOLS, ...SYMBOLS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const MemoryGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [deck, setDeck] = useState<string[]>(() => shuffled());
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const cleared = useMemo(() => matched.length === 12, [matched]);

  const flip = (i: number) => {
    if (lock || open.includes(i) || matched.includes(i) || cleared) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (deck[a] === deck[b]) {
        const m = [...matched, a, b];
        setMatched(m);
        setOpen([]);
        if (m.length === 12) onWin();
      } else {
        setLock(true);
        setTimeout(() => {
          setOpen([]);
          setLock(false);
        }, 600);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 min-h-0 min-w-0 w-full">
      <div className="grid grid-cols-4 gap-1 w-full max-w-[240px] min-w-0">
        {deck.map((s, i) => {
          const face = open.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              onClick={() => flip(i)}
              className={`aspect-square w-full rounded font-mono text-xl border ${
                face
                  ? 'bg-purple-700 text-white border-purple-500'
                  : 'bg-gray-900 text-transparent border-gray-700 hover:bg-gray-800'
              }`}
            >
              {face ? s : '?'}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 font-mono">
        {cleared ? 'all pairs. cabinet satisfied.' : `${matched.length / 2}/6 pairs.`}
      </p>
      <button
        onClick={() => {
          setDeck(shuffled());
          setOpen([]);
          setMatched([]);
        }}
        className="text-xs font-mono text-gray-400 hover:text-white"
      >
        restart
      </button>
    </div>
  );
};

export default MemoryGame;
