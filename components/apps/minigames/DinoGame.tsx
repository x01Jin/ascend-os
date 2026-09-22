import React, { useEffect, useRef, useState } from 'react';

const W = 400;
const H = 160;
const GROUND_Y = H - 10;
const WIN_TIME = 20;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  flyY: number | null;
  flap: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
}

const STARS: Star[] = [
  { x: 20, y: 14, r: 1 },
  { x: 60, y: 30, r: 1 },
  { x: 110, y: 10, r: 1 },
  { x: 150, y: 26, r: 2 },
  { x: 195, y: 12, r: 1 },
  { x: 240, y: 32, r: 1 },
  { x: 285, y: 16, r: 2 },
  { x: 330, y: 28, r: 1 },
  { x: 370, y: 12, r: 1 },
];

const MOUNTAINS = [30, 70, 55, 90, 60, 80, 50, 85, 65, 75];
const MOUNTAIN_W = 80;

const spawnObstacle = (x: number, time: number): Obstacle => {
  const roll = Math.random();
  if (time >= WIN_TIME / 2 && roll > 0.72) {
    return { x, w: 20, h: 10, flyY: GROUND_Y - 52, flap: 0 };
  }
  if (roll > 0.66) return { x, w: 10, h: 32, flyY: null, flap: 0 };
  if (roll > 0.38) return { x, w: 24, h: 22, flyY: null, flap: 0 };
  return { x, w: 12, h: 16, flyY: null, flap: 0 };
};

const drawDino = (
  ctx: CanvasRenderingContext2D,
  feetY: number,
  airborne: boolean,
  frame: number,
  color: string
): void => {
  const x = 15;
  ctx.fillStyle = color;
  if (airborne) {
    ctx.fillRect(x, feetY - 28, 20, 16);
    ctx.fillRect(x + 12, feetY - 40, 12, 12);
    ctx.fillRect(x + 22, feetY - 36, 5, 6);
    ctx.fillRect(x - 7, feetY - 26, 7, 6);
    ctx.fillRect(x + 3, feetY - 12, 5, 6);
    ctx.fillRect(x + 12, feetY - 12, 5, 6);
  } else {
    ctx.fillRect(x, feetY - 26, 20, 14);
    ctx.fillRect(x + 12, feetY - 38, 12, 12);
    ctx.fillRect(x + 22, feetY - 34, 5, 6);
    ctx.fillRect(x - 6, feetY - 24, 6, 6);
    if (frame === 0) {
      ctx.fillRect(x + 3, feetY - 12, 5, 12);
      ctx.fillRect(x + 12, feetY - 7, 5, 7);
    } else {
      ctx.fillRect(x + 3, feetY - 7, 5, 7);
      ctx.fillRect(x + 12, feetY - 12, 5, 12);
    }
  }
  ctx.fillStyle = '#030712';
  ctx.fillRect(x + 16, feetY - 35, 3, 3);
};

const drawObstacle = (ctx: CanvasRenderingContext2D, o: Obstacle, frame: number): void => {
  if (o.flyY !== null) {
    const y = o.flyY + (frame === 0 ? -3 : 3);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(o.x, y, o.w, 6);
    ctx.fillRect(o.x + 14, y + 1, 6, 4);
    if (frame === 0) ctx.fillRect(o.x + 4, y - 6, 10, 6);
    else ctx.fillRect(o.x + 4, y + 6, 10, 6);
    return;
  }
  ctx.fillStyle = '#34d399';
  const baseY = GROUND_Y - o.h;
  ctx.fillRect(o.x, baseY, o.w, o.h);
  if (o.w >= 20) {
    ctx.fillRect(o.x - 6, baseY + 6, 6, 10);
    ctx.fillRect(o.x + o.w, baseY + 4, 6, 12);
  } else if (o.h >= 30) {
    ctx.fillRect(o.x - 5, baseY + 10, 5, 8);
    ctx.fillRect(o.x + o.w, baseY + 14, 5, 8);
  }
};

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

    let feetY = GROUND_Y;
    let vy = 0;
    let airborne = false;
    let obstacles: Obstacle[] = [spawnObstacle(W, 0)];
    let particles: Particle[] = [];
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let dead = false;
    let shake = 0;
    let mountainX = 0;
    let duneX = 0;
    let groundX = 0;
    let dustTimer = 0;
    let halfMarked = false;

    const reset = () => {
      dead = false;
      obstacles = [spawnObstacle(W, 0)];
      particles = [];
      time = 0;
      feetY = GROUND_Y;
      vy = 0;
      airborne = false;
      shake = 0;
      halfMarked = false;
      setStatus('space/w/up to jump. survive 20s.');
    };

    const jump = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (dead) reset();
        else if (!airborne) {
          vy = -9.5;
          airborne = true;
        }
      }
    };
    window.addEventListener('keydown', jump);

    const step = (now: number) => {
      const dt = Math.min(50, now - last) / 16.7;
      last = now;
      if (!dead) {
        time += dt / 60;
        const speed = 4 + (Math.min(time, WIN_TIME) / WIN_TIME) * 2.5;
        vy += 0.6 * dt;
        feetY = Math.min(GROUND_Y, feetY + vy * dt);
        if (airborne && feetY >= GROUND_Y) {
          airborne = false;
          for (let i = 0; i < 8; i++) {
            particles.push({
              x: 20 + Math.random() * 14,
              y: GROUND_Y - 2,
              vx: -1 - Math.random() * 2,
              vy: -Math.random() * 2,
              life: 20,
            });
          }
        }
        if (!airborne) {
          dustTimer += dt;
          if (dustTimer > 8) {
            dustTimer = 0;
            particles.push({
              x: 16,
              y: GROUND_Y - 2,
              vx: -1 - Math.random(),
              vy: -Math.random(),
              life: 16,
            });
          }
        }
        const tail = obstacles[obstacles.length - 1];
        if (tail.x < W - (200 + speed * 14)) obstacles.push(spawnObstacle(W, time));
        obstacles = obstacles
          .map(o => ({ ...o, x: o.x - speed * dt, flap: o.flap + dt }))
          .filter(o => o.x > -40);
        const px0 = 17;
        const px1 = 35;
        const py0 = feetY - 40;
        const py1 = feetY;
        const hit = obstacles.some(o => {
          const top = o.flyY ?? GROUND_Y - o.h;
          const bottom = o.flyY !== null ? o.flyY + 12 : GROUND_Y;
          return o.x < px1 && o.x + o.w > px0 && top < py1 && bottom > py0;
        });
        if (hit) {
          dead = true;
          shake = 18;
          setStatus('wrecked. space/w/up to retry.');
        }
        if (time >= WIN_TIME / 2 && !halfMarked) {
          halfMarked = true;
          setStatus('halfway. hold the line.');
        }
        if (time >= WIN_TIME && !wonRef.current) {
          wonRef.current = true;
          onWinRef.current();
          setStatus('20 seconds. cabinet satisfied.');
        }
        mountainX = (mountainX + speed * 0.15 * dt) % (MOUNTAINS.length * MOUNTAIN_W);
        duneX = (duneX + speed * 0.45 * dt) % 120;
        groundX = (groundX + speed * dt) % 48;
      }

      particles = particles
        .map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          life: p.life - dt,
        }))
        .filter(p => p.life > 0);

      ctx.save();
      if (shake > 0) {
        shake -= dt;
        ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      }
      ctx.fillStyle = '#030712';
      ctx.fillRect(-10, -10, W + 20, H + 20);
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(W - 40, 26, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      STARS.forEach(s => ctx.fillRect(s.x, s.y, s.r, s.r));
      ctx.fillStyle = '#1f2937';
      for (let i = -1; i < MOUNTAINS.length + 1; i++) {
        const mx = i * MOUNTAIN_W - mountainX;
        const mh = MOUNTAINS[((i % MOUNTAINS.length) + MOUNTAINS.length) % MOUNTAINS.length];
        ctx.beginPath();
        ctx.moveTo(mx, GROUND_Y);
        ctx.lineTo(mx + MOUNTAIN_W / 2, GROUND_Y - mh);
        ctx.lineTo(mx + MOUNTAIN_W, GROUND_Y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#111827';
      for (let i = -1; i < 6; i++) {
        const dx = i * 120 - duneX;
        ctx.beginPath();
        ctx.moveTo(dx, GROUND_Y);
        ctx.quadraticCurveTo(dx + 30, GROUND_Y - 18, dx + 60, GROUND_Y);
        ctx.quadraticCurveTo(dx + 90, GROUND_Y - 14, dx + 120, GROUND_Y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = '#374151';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.fillStyle = '#4b5563';
      for (let gx = -48; gx < W + 48; gx += 48) {
        ctx.fillRect(gx - groundX, GROUND_Y + 3, 22, 2);
      }
      const frame = Math.floor(now / 120) % 2;
      obstacles.forEach(o => drawObstacle(ctx, o, Math.floor(o.flap / 24) % 2));
      drawDino(ctx, feetY, airborne, frame, wonRef.current ? '#4ade80' : '#e5e7eb');
      particles.forEach(p => {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(p.x, p.y, 2, 2);
      });
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px monospace';
      ctx.fillText(`${Math.floor(Math.min(time, WIN_TIME))}s / ${WIN_TIME}s`, 10, 20);
      if (dead) {
        ctx.fillStyle = 'rgba(248, 113, 113, 0.15)';
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
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
