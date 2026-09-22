import React, { useEffect, useRef } from 'react';

const W = 400;
const H = 300;

const AI_BASE_TRACK = 0.3;
const AI_BASE_MAX_STEP = 1.1;
const AI_TRACK_GAIN = 0.05;
const AI_STEP_GAIN = 0.2;
const AI_MAX_TRACK = 0.6;
const AI_MAX_STEP = 2.2;
const AI_DEADZONE = 14;
const AI_TARGET = 5;

const PongGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  }, [onWin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerY = H / 2 - 25;
    let aiY = H / 2 - 25;
    let bx = W / 2;
    let by = H / 2;
    let vx = 3;
    let vy = 2;
    let playerScore = 0;
    let aiScore = 0;
    let aiTrack = AI_BASE_TRACK;
    let aiMaxStep = AI_BASE_MAX_STEP;
    let aiError = 0;
    let frames = 0;
    let lostAt = 0;
    let raf = 0;
    const keys = new Set<string>();

    const keyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'KeyW' ||
        e.code === 'KeyS'
      ) {
        e.preventDefault();
        keys.add(e.code);
      }
    };
    const keyUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    const reset = (dir: number) => {
      bx = W / 2;
      by = H / 2;
      vx = 3 * dir;
      vy = Math.random() > 0.5 ? 2 : -2;
    };

    const step = () => {
      if (keys.has('ArrowUp') || keys.has('KeyW')) playerY = Math.max(0, playerY - 5);
      if (keys.has('ArrowDown') || keys.has('KeyS')) playerY = Math.min(H - 50, playerY + 5);
      frames++;
      if (frames % 90 === 0) aiError = (Math.random() - 0.5) * 60;
      const dy = by + aiError - (aiY + 25);
      if (Math.abs(dy) > AI_DEADZONE) {
        aiY += Math.max(-aiMaxStep, Math.min(aiMaxStep, dy * aiTrack));
      }
      aiY = Math.max(0, Math.min(H - 50, aiY));

      bx += vx;
      by += vy;
      if (by < 4 || by > H - 4) vy = -vy;
      if (vx < 0 && bx < 16 && by > playerY && by < playerY + 50) vx = -vx * 1.05;
      if (vx > 0 && bx > W - 16 && by > aiY && by < aiY + 50) vx = -vx * 1.05;
      if (bx < 0) {
        aiScore++;
        if (aiScore >= AI_TARGET) {
          playerScore = 0;
          aiScore = 0;
          lostAt = performance.now();
        }
        reset(1);
      }
      if (bx > W) {
        playerScore++;
        aiTrack = Math.min(AI_MAX_TRACK, aiTrack + AI_TRACK_GAIN);
        aiMaxStep = Math.min(AI_MAX_STEP, aiMaxStep + AI_STEP_GAIN);
        reset(-1);
      }
      if (playerScore >= AI_TARGET && !wonRef.current) {
        wonRef.current = true;
        onWinRef.current();
      }

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(8, playerY, 6, 50);
      ctx.fillRect(W - 14, aiY, 6, 50);
      ctx.fillStyle = wonRef.current ? '#4ade80' : '#f472b6';
      ctx.fillRect(bx - 4, by - 4, 8, 8);
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px monospace';
      ctx.fillText(`${playerScore} : ${aiScore}`, W / 2 - 20, 24);
      if (wonRef.current) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText('YOU WIN', W / 2 - 36, H / 2);
      } else if (performance.now() - lostAt < 2000) {
        ctx.fillStyle = '#f87171';
        ctx.fillText('SIGNAL LOST. SCORE RESET.', W / 2 - 100, H / 2);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
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
      <p className="text-xs text-gray-500 font-mono">
        up/down arrows. first to 5. machine at 5 resets the score.
      </p>
    </div>
  );
};

export default PongGame;
