import React, { useEffect, useRef, useState } from 'react';

const N = 20;
const CELL = 14;

const SnakeGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  }, [onWin]);
  const [eaten, setEaten] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let snake = [{ x: 10, y: 10 }];
    let dir = { x: 1, y: 0 };
    let food = { x: 15, y: 10 };
    let count = 0;

    const placeFood = () => {
      food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    };

    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir.y !== 1) dir = { x: 0, y: -1 };
      else if (e.key === 'ArrowDown' && dir.y !== -1) dir = { x: 0, y: 1 };
      else if (e.key === 'ArrowLeft' && dir.x !== 1) dir = { x: -1, y: 0 };
      else if (e.key === 'ArrowRight' && dir.x !== -1) dir = { x: 1, y: 0 };
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', key);

    const timer = setInterval(() => {
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= N ||
        head.y >= N ||
        snake.some(s => s.x === head.x && s.y === head.y)
      ) {
        snake = [{ x: 10, y: 10 }];
        dir = { x: 1, y: 0 };
        count = 0;
        setEaten(0);
        placeFood();
      } else {
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          count++;
          setEaten(count);
          placeFood();
          if (count >= 10 && !wonRef.current) {
            wonRef.current = true;
            onWinRef.current();
          }
        } else {
          snake.pop();
        }
      }

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, N * CELL, N * CELL);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);
      ctx.fillStyle = wonRef.current ? '#4ade80' : '#e5e7eb';
      snake.forEach(s => ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2));
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px monospace';
      ctx.fillText(`${count}/10`, 6, 14);
    }, 120);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', key);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-2 min-h-0 min-w-0 w-full">
      <canvas
        ref={canvasRef}
        width={N * CELL}
        height={N * CELL}
        className="border border-gray-700 rounded max-w-full h-auto"
      />
      <p className="text-xs text-gray-500 font-mono">
        {eaten >= 10 ? '10 pellets. cabinet satisfied.' : 'arrow keys. eat 10.'}
      </p>
    </div>
  );
};

export default SnakeGame;
