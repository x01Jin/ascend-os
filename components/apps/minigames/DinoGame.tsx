import React, { useEffect, useRef, useState } from 'react';

const W = 400;
const H = 160;

const DinoGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  }, [onWin]);
  const [status, setStatus] = useState('space/w/up to jump. survive 20s.');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let y = H - 30;
    let vy = 0;
    let obstacles = [{ x: W }];
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let dead = false;

    const jump = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (dead) {
          dead = false;
          obstacles = [{ x: W }];
          time = 0;
          y = H - 30;
          vy = 0;
          setStatus('space/w/up to jump. survive 20s.');
        } else if (y >= H - 30) vy = -9;
      }
    };
    window.addEventListener('keydown', jump);

    const step = (now: number) => {
      const dt = Math.min(50, now - last) / 16.7;
      last = now;
      if (!dead) {
        time += dt / 60;
        vy += 0.6 * dt;
        y = Math.min(H - 30, y + vy * dt);
        if (obstacles[obstacles.length - 1].x < W - 220) obstacles.push({ x: W });
        obstacles = obstacles.map(o => ({ x: o.x - 4 * dt })).filter(o => o.x > -20);
        const hit = obstacles.some(o => o.x < 40 && o.x > 10 && y > H - 55);
        if (hit) {
          dead = true;
          setStatus('wrecked. space/w/up to retry.');
        }
        if (time >= 20 && !wonRef.current) {
          wonRef.current = true;
          onWinRef.current();
          setStatus('20 seconds. cabinet satisfied.');
        }
      }

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#374151';
      ctx.beginPath();
      ctx.moveTo(0, H - 10);
      ctx.lineTo(W, H - 10);
      ctx.stroke();
      ctx.fillStyle = wonRef.current ? '#4ade80' : '#e5e7eb';
      ctx.fillRect(15, y - 20, 20, 20);
      ctx.fillStyle = '#f472b6';
      obstacles.forEach(o => ctx.fillRect(o.x, H - 35, 14, 25));
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px monospace';
      ctx.fillText(`${Math.floor(time)}s / 20s`, 10, 20);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', jump);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-2 min-h-0 min-w-0 w-full">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="border border-gray-700 rounded max-w-full h-auto"
      />
      <p className="text-xs text-gray-500 font-mono">{status}</p>
    </div>
  );
};

export default DinoGame;
