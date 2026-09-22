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

const randomFree = (free: number[]): number => free[Math.floor(Math.random() * free.length)];

const bestMove = (b: Board): number => {
  const free = freeCells(b);
  for (const i of free) {
    const next: Board = [...b];
    next[i] = 'O';
    if (winner(next) === 'O') return i;
  }
  for (const i of free) {
    const next: Board = [...b];
    next[i] = 'X';
    if (winner(next) === 'X') return i;
  }
  if (b[4] === '') return 4;
  const corners = [0, 2, 6, 8].filter(i => b[i] === '');
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  return randomFree(free);
};

const SERIES_TARGET = 3;
const SKILL_BY_ROUND = [0, 0.35, 0.6, 0.8, 0.9];

const replyMove = (b: Board, skill: number): number => {
  if (Math.random() < skill) return bestMove(b);
  return randomFree(freeCells(b));
};

const TicTacToeGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(''));
  const [playerSeries, setPlayerSeries] = useState(0);
  const [machineSeries, setMachineSeries] = useState(0);
  const [seriesWon, setSeriesWon] = useState(false);
  const [roundOver, setRoundOver] = useState(false);

  const result = winner(board);
  const round = Math.min(playerSeries + machineSeries + 1, SKILL_BY_ROUND.length);

  const play = (i: number) => {
    if (board[i] !== '' || result !== '' || roundOver || seriesWon) return;
    const next: Board = [...board];
    next[i] = 'X';
    if (winner(next) === 'X') {
      const total = playerSeries + 1;
      setBoard(next);
      setPlayerSeries(total);
      setRoundOver(true);
      if (total >= SERIES_TARGET) {
        setSeriesWon(true);
        onWin();
      }
      return;
    }
    const free = freeCells(next);
    if (free.length > 0) {
      next[replyMove(next, SKILL_BY_ROUND[round - 1])] = 'O';
    }
    if (winner(next) === 'O') {
      const total = machineSeries + 1;
      setBoard(next);
      if (total >= SERIES_TARGET) {
        setPlayerSeries(0);
        setMachineSeries(0);
      } else {
        setMachineSeries(total);
      }
      setRoundOver(true);
      return;
    }
    setBoard(next);
    if (free.length === 0 || next.every(v => v !== '')) setRoundOver(true);
  };

  const nextRound = () => {
    setBoard(Array(9).fill(''));
    setRoundOver(false);
  };

  const restart = () => {
    setBoard(Array(9).fill(''));
    setPlayerSeries(0);
    setMachineSeries(0);
    setSeriesWon(false);
    setRoundOver(false);
  };

  const status = seriesWon
    ? 'series won. cabinet satisfied.'
    : roundOver
      ? result === 'X'
        ? `round yours. series ${playerSeries}-${machineSeries}.`
        : result === 'O'
          ? machineSeries === 0 && playerSeries === 0
            ? 'machine takes the series. scores reset.'
            : `round lost. series ${playerSeries}-${machineSeries}.`
          : 'draw. replay the round.'
      : `series ${playerSeries}-${machineSeries}, first to ${SERIES_TARGET}. you are X.`;

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
      <p className="text-xs text-gray-500 font-mono">{status}</p>
      {roundOver && !seriesWon && (
        <button onClick={nextRound} className="text-xs font-mono text-gray-200 hover:text-white">
          next round
        </button>
      )}
      <button onClick={restart} className="text-xs font-mono text-gray-400 hover:text-white">
        restart
      </button>
    </div>
  );
};

export default TicTacToeGame;
