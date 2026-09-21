import React, { useState } from 'react';
import { Trophy, ScrollText, KeyRound, PackageOpen } from 'lucide-react';
import { ACHIEVEMENTS, ACH_FOR_ZIP } from '../../services/achievements';
import { SECRETS, SECRETS_ZIP_TEXT } from '../../services/secrets';
import { LORE_FRAGMENTS } from '../../services/lore';
import { GameState } from '../../types';

interface AchievementsProps {
  gameState: GameState;
  progress: number;
  zipEarned: boolean;
  onOpenZip: () => void;
}

type Tab = 'achievements' | 'secrets' | 'lore';

const Achievements: React.FC<AchievementsProps> = ({
  gameState,
  progress,
  zipEarned,
  onOpenZip,
}) => {
  const [tab, setTab] = useState<Tab>('achievements');
  const done = Object.keys(gameState.achievements).length;

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold tracking-wider">COMPLETION: {progress}%</span>
          <span className="text-xs text-gray-500">
            {done}/{ACHIEVEMENTS.length} tasks · {gameState.secretsFound.length}/{SECRETS.length}{' '}
            secrets · {gameState.loreSeen.length}/{LORE_FRAGMENTS.length} lore
          </span>
        </div>
        <div className="h-2 rounded bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTab('achievements')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs border ${tab === 'achievements' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
          >
            <Trophy size={12} /> Tasks
          </button>
          <button
            onClick={() => setTab('secrets')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs border ${tab === 'secrets' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
          >
            <KeyRound size={12} /> Secrets
          </button>
          <button
            onClick={() => setTab('lore')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs border ${tab === 'lore' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
          >
            <ScrollText size={12} /> Lore
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tab === 'achievements' &&
          ACHIEVEMENTS.map(a => {
            const earned = gameState.achievements[a.id] !== undefined;
            return (
              <div
                key={a.id}
                className={`p-3 rounded border ${earned ? 'border-yellow-500/30 bg-yellow-950/10' : 'border-gray-800 bg-gray-900/30'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${earned ? 'text-yellow-300' : 'text-gray-400'}`}>
                    {earned ? '✓ ' : '○ '}
                    {a.title}
                  </span>
                  {a.requiresIteration && (
                    <span className="text-[10px] text-gray-600">ITER ≥ {a.requiresIteration}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{a.description}</p>
                {!earned && <p className="text-[11px] text-gray-600 mt-1">Hint: {a.hint}</p>}
              </div>
            );
          })}

        {tab === 'secrets' && (
          <>
            <div
              className={`p-3 rounded border ${zipEarned ? 'border-purple-500/40 bg-purple-950/20' : 'border-gray-800 bg-gray-900/30'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-2">
                  <PackageOpen size={14} /> secrets.zip
                </span>
                {zipEarned ? (
                  <button
                    onClick={onOpenZip}
                    className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    OPEN
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-600">
                    Earn the other {ACH_FOR_ZIP.length} tasks first
                  </span>
                )}
              </div>
              {zipEarned && (
                <pre className="text-[11px] text-gray-400 mt-2 whitespace-pre-wrap">
                  {SECRETS_ZIP_TEXT}
                </pre>
              )}
            </div>
            {SECRETS.map(s => {
              const found = gameState.secretsFound.includes(s.id);
              return (
                <div
                  key={s.id}
                  className={`p-3 rounded border ${found ? 'border-green-500/30 bg-green-950/10' : 'border-gray-800 bg-gray-900/30'}`}
                >
                  <span className={`font-bold ${found ? 'text-green-300' : 'text-gray-400'}`}>
                    {found ? '✓ ' : '○ '}
                    {found ? s.title : '???'}
                  </span>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {found ? s.instructions : 'Undiscovered. secrets.zip holds the instructions.'}
                  </p>
                </div>
              );
            })}
          </>
        )}

        {tab === 'lore' &&
          LORE_FRAGMENTS.map(l => {
            const seen = gameState.loreSeen.includes(l.id);
            return (
              <div
                key={l.id}
                className={`p-3 rounded border ${seen ? 'border-cyan-500/30 bg-cyan-950/10' : 'border-gray-800 bg-gray-900/30'}`}
              >
                <span className={`font-bold ${seen ? 'text-cyan-300' : 'text-gray-600'}`}>
                  {seen ? l.title : '/// sealed fragment ///'}
                </span>
                {seen && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{l.body}</p>}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Achievements;
