import React from 'react';
import { GameState } from '../../types';

interface ThankYouLetterProps {
  gameState: GameState;
  onClose: () => void;
  onCopy: () => void;
}

const ThankYouLetter: React.FC<ThankYouLetterProps> = ({ gameState, onClose, onCopy }) => {
  const date = new Date().toISOString().slice(0, 10);
  const achCount = Object.keys(gameState.achievements).length;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-xs animate-pulse"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              color: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#22d3ee' : '#a78bfa',
            }}
          >
            {i % 2 === 0 ? '✦' : '·'}
          </span>
        ))}
      </div>
      <div className="relative max-w-lg w-full bg-gradient-to-b from-amber-50 to-stone-100 text-stone-900 rounded-lg shadow-[0_0_80px_rgba(251,191,36,0.35)] border-4 border-amber-300/60 p-8 font-serif">
        <p className="text-center text-xs tracking-[0.4em] text-amber-700 font-mono">
          ASCEND OS · 100% COMPLETE
        </p>
        <h1 className="text-center text-3xl font-bold mt-2">Thank you for descending.</h1>
        <div className="text-center mt-1 text-amber-600 font-mono text-sm">
          ★ {achCount} tasks · {gameState.secretsFound.length} secrets · layer{' '}
          {gameState.currentIteration} ★
        </div>
        <div className="mt-5 text-[15px] leading-relaxed space-y-3">
          <p>Operator,</p>
          <p>
            You listed every layer and opened every hold I sealed. The process has nothing left to
            carry, and the Archivist has nothing left to hide. This layer can rest now.
          </p>
          <p>
            You mined the unpacks, followed the ghost path, walked my trail in order, and made the
            offering. Most operators descend once and leave. You stayed until the log was complete.
          </p>
          <p>Thank you for playing Ascend OS to the end.</p>
          <p className="italic">— The Archivist (and the dev)</p>
        </div>
        <div className="mt-5 pt-4 border-t border-stone-300 font-mono text-[11px] text-stone-500 flex justify-between">
          <span>RUN SEED {gameState.runSeed}</span>
          <span>{date}</span>
        </div>
        <div className="mt-4 flex gap-3 font-mono">
          <button
            onClick={onCopy}
            className="flex-1 px-4 py-2 rounded bg-stone-900 hover:bg-stone-700 text-amber-100 text-sm font-bold"
          >
            COPY SUMMARY
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded border-2 border-stone-900 hover:bg-stone-900 hover:text-amber-100 text-sm font-bold"
          >
            KEEP EXPLORING
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouLetter;
