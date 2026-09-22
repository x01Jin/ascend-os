import React, { useState } from 'react';

type Board = ('' | 'X' | 'O')[];

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const winner = (b: Board): '' | 'X' | 'O' => {
  for (const [a, c, d] of lines) {
    if (b[a] !== '' && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return '';
};

const freeCells = (b: Board): number[] =>
  b.map((v, idx) => (v === '' ? idx : -1)).filter(idx => idx !== -1);

const replyMove = (free: number[]): number => free[Math.floor(Math.random() * free.length)];

const TicTacToeGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(''));
  const [won, setWon] = useState(false);
  const result = winner(board);
  const full = board.every(v => v !== '');

  const play = (i: number) => {
    if (board[i] !== '' || result !== '' || won) return;
    const next: Board = [...board];
    next[i] = 'X';
    if (winner(next) === 'X') {
      setBoard(next);
      setWon(true);
      onWin();
      return;
    }
    const free = freeCells(next);
    if (free.length > 0) {
      next[replyMove(free)] = 'O';
    }
    if (winner(next) === 'O') {
      setBoard(next);
      return;
    }
    setBoard(next);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 min-h-0 min-w-0 w-full">
      <div className="grid grid-cols-3 gap-1 w-full max-w-[210px] min-w-0">
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className="aspect-square w-full bg-gray-900 border border-gray-700 rounded font-mono text-2xl text-purple-300 hover:bg-gray-800"
          >
            {v}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 font-mono">
        {won
          ? 'machine beaten. cabinet satisfied.'
          : result === 'O'
            ? 'machine wins. try again.'
            : full
              ? 'draw. try again.'
              : 'you are X.'}
      </p>
      <button
        onClick={() => {
          setBoard(Array(9).fill(''));
          setWon(false);
        }}
        className="text-xs font-mono text-gray-400 hover:text-white"
      >
        restart
      </button>
    </div>
  );
};

export default TicTacToeGame;
