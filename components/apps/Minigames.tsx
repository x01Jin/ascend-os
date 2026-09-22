import React from 'react';
import { MINIGAMES } from '../../services/gate';
import PongGame from './minigames/PongGame';
import DinoGame from './minigames/DinoGame';
import TicTacToeGame from './minigames/TicTacToeGame';
import SnakeGame from './minigames/SnakeGame';
import MemoryGame from './minigames/MemoryGame';

interface MinigameProps {
  gameId: string;
  wins: Record<string, number>;
  currentIteration: number;
  passes: number;
  onWin: (gameId: string) => void;
  onRedeem: (gameId: string) => void;
}

const GAMES: Record<string, React.FC<{ onWin: () => void }>> = {
  pong: PongGame,
  dino: DinoGame,
  tictactoe: TicTacToeGame,
  snake: SnakeGame,
  memory: MemoryGame,
};

const Minigames: React.FC<MinigameProps> = ({
  gameId,
  wins,
  currentIteration,
  passes,
  onWin,
  onRedeem,
}) => {
  const Game = GAMES[gameId];
  const meta = MINIGAMES.find(g => g.id === gameId);

  return (
    <div
      data-minigame="true"
      className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm"
    >
      <div className="flex items-center gap-2 p-2 border-b border-gray-800">
        <span className="text-xs font-bold text-white">{meta?.title ?? gameId}</span>
        <span className="text-xs text-gray-500">{meta?.goal ?? ''}</span>
        <span className="ml-auto text-xs text-gray-500">passes: {passes}</span>
        {passes > 0 && wins[gameId] !== currentIteration && (
          <button
            onClick={() => onRedeem(gameId)}
            className="px-2 py-1 rounded text-xs border bg-purple-600 text-white border-purple-400 hover:bg-purple-500"
          >
            Clear it
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-2">
        <Game key={`${gameId}_${currentIteration}`} onWin={() => onWin(gameId)} />
      </div>
    </div>
  );
};

export default Minigames;
