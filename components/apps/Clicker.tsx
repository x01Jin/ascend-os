import React, { useState, useEffect, useRef } from 'react';
import { Database, Zap, Cpu, Play, Square } from 'lucide-react';

interface ClickerProps {
  dataKB: number;
  onIncrement: () => void;
  clickValue: number;
  activeMultiplier: number | null;
  boostBank: Record<number, number>;
  onToggleBoost: (multiplier: number) => void;
  autoMinerData: number;
  autoMinerInterval: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

const formatSize = (kb: number) => {
  if (kb >= 1024 * 1024) return `${(kb / (1024 * 1024)).toFixed(2)} GB`;
  if (kb >= 1024) return `${(kb / 1024).toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
};

const formatTime = (ms: number) => {
  if (ms <= 0) return '00:00';
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const DataStream = React.memo(({ activeMultiplier }: { activeMultiplier: number | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const multiplierRef = useRef(activeMultiplier);

  useEffect(() => {
    multiplierRef.current = activeMultiplier;
  }, [activeMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let frame = 0;
    let lastTime = 0;
    const targetFps = 30;
    const frameInterval = 1000 / targetFps;

    let phase = 0;

    const chars = '0123456789ABCDEF';
    const fontSize = 16;
    const charWidth = fontSize * 0.7;

    const THEMES = {
      BLUE: ['#1e3a8a', '#3b82f6', '#60a5fa'],
      RED: ['#7f1d1d', '#ef4444', '#fca5a5'],
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        if (parent.clientWidth === 0 || parent.clientHeight === 0) return;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let grid: string[][] = [];

    const initGrid = () => {
      if (canvas.width === 0 || canvas.height === 0) return;
      const cols = Math.ceil(canvas.width / charWidth);
      const rows = Math.ceil(canvas.height / fontSize) + 1;
      grid = [];
      for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
          row.push(chars[Math.floor(Math.random() * chars.length)]);
        }
        grid.push(row);
      }
    };
    initGrid();

    const render = (currentTime: number) => {
      animId = requestAnimationFrame(render);

      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);

      if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) {
        return;
      }

      const cols = Math.ceil(canvas.width / charWidth);
      const rows = Math.ceil(canvas.height / fontSize) + 1;

      if (grid.length === 0 || grid.length < rows || (grid[0] && grid[0].length < cols)) {
        initGrid();
      }

      const isOverclocked = !!multiplierRef.current;
      const mult = multiplierRef.current || 1;
      const currentTheme = isOverclocked ? THEMES.RED : THEMES.BLUE;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollThreshold = Math.max(1, Math.floor(8 / mult));
      if (frame % scrollThreshold === 0) {
        grid.shift();
        const newRow = [];
        for (let x = 0; x < cols; x++) {
          newRow.push(chars[Math.floor(Math.random() * chars.length)]);
        }
        grid.push(newRow);
      }

      const mutationCount = Math.floor(10 * mult);
      for (let i = 0; i < mutationCount; i++) {
        const ry = Math.floor(Math.random() * grid.length);
        const rx = Math.floor(Math.random() * cols);
        if (grid[ry]) {
          grid[ry][rx] = chars[Math.floor(Math.random() * chars.length)];
        }
      }

      const buckets: [number, number, string][][] = [[], [], []];

      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = 'top';

      grid.forEach((row, y) => {
        const yPos = y * fontSize;
        if (yPos > canvas.height) return;

        row.forEach((char, x) => {
          const rand = Math.random();
          let bIdx = 0;
          if (rand > 0.95) bIdx = 2;
          else if (rand > 0.85) bIdx = 1;

          buckets[bIdx].push([x * charWidth, yPos, char]);
        });
      });

      buckets.forEach((items, idx) => {
        if (items.length === 0) return;
        ctx.fillStyle = currentTheme[idx];
        for (let i = 0; i < items.length; i++) {
          ctx.fillText(items[i][2] as string, items[i][0] as number, items[i][1] as number);
        }
      });

      const waveAmp = isOverclocked ? 15 : 8;
      const waveSpeed = isOverclocked ? 0.2 : 0.05;
      const waveFreq = 0.02;
      const surfaceBaseY = 30;

      const getWaveY = (x: number) => {
        return (
          surfaceBaseY +
          Math.sin(x * waveFreq + phase) * waveAmp +
          Math.cos(x * (waveFreq * 0.5) + phase * 1.3) * (waveAmp * 0.5)
        );
      };

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, getWaveY(0));

      for (let x = 0; x <= canvas.width; x += 10) {
        ctx.lineTo(x, getWaveY(x));
      }

      ctx.lineTo(canvas.width, getWaveY(canvas.width));

      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';

      phase += waveSpeed;
      frame++;
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
});

const Clicker: React.FC<ClickerProps> = ({
  dataKB,
  onIncrement,
  clickValue,
  activeMultiplier,
  boostBank,
  onToggleBoost,
  autoMinerData,
  autoMinerInterval,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(2);
  const [lastAutoMine, setLastAutoMine] = useState<number>(() => Date.now());

  useEffect(() => {
    if (autoMinerData <= 0) return;

    const interval = setInterval(() => {
      setLastAutoMine(Date.now());
    }, autoMinerInterval);

    return () => clearInterval(interval);
  }, [autoMinerInterval, autoMinerData]);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);

    const id = Date.now() + Math.random();

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 60;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    setFloatingTexts(prev => [...prev, { id, x, y, text: `+${clickValue}` }]);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1000);

    onIncrement();
  };

  const isActive = activeMultiplier === selectedMultiplier;
  const isAnyActive = activeMultiplier !== null;
  const currentBank = boostBank[selectedMultiplier] || 0;
  const hasTime = currentBank > 0;
  const isAutoMining = autoMinerData > 0;

  return (
    <div className="h-full min-h-0 flex flex-col text-gray-200 select-none overflow-hidden relative">
      <style>{`
        @keyframes float-fade {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) translateY(-40px) scale(1.1); opacity: 0; }
        }
        .animate-float-fade {
          animation: float-fade 1s ease-out forwards;
        }
      `}</style>

      {activeMultiplier && (
        <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>
      )}

      <div className="absolute inset-x-0 top-0 p-2 sm:p-4 flex justify-between items-start gap-2 z-20 pointer-events-none">
        <div className="pointer-events-auto min-w-0">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
            Total Data
          </h2>
          <div className="text-2xl font-bold font-mono text-blue-400 flex items-center gap-2 mb-4">
            <Database size={20} />
            {formatSize(dataKB)}
          </div>

          <div className="bg-gray-900/80 border border-gray-700 rounded p-2 w-36 sm:w-44 max-w-[38vw] min-w-0 backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-gray-400">AUTO MINER</span>
              <span
                className={`text-[10px] font-mono ${isAutoMining ? 'text-cyan-400' : 'text-gray-600'}`}
              >
                {isAutoMining ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-500">POWER</span>
                <span className={isAutoMining ? 'text-cyan-200' : 'text-gray-600'}>
                  {autoMinerData} KB/tick
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-500">INTERVAL</span>
                <span className={isAutoMining ? 'text-cyan-200' : 'text-gray-600'}>
                  {(autoMinerInterval / 1000).toFixed(2)}s
                </span>
              </div>
            </div>

            {isAutoMining && (
              <div className="h-0.5 bg-gray-800 mt-2 w-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500/50 shadow-[0_0_5px_rgba(6,182,212,0.8)]"
                  key={lastAutoMine}
                  style={{
                    width: '100%',
                    animation: `shrink ${autoMinerInterval}ms linear forwards`,
                  }}
                ></div>
                <style>{`
                        @keyframes shrink { from { width: 0%; } to { width: 100%; } }
                    `}</style>
              </div>
            )}
          </div>
        </div>

        <div className="text-right flex flex-col items-end pointer-events-auto min-w-0">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
            Mining Rate
          </h2>
          <div
            className={`text-xl font-bold font-mono flex items-center justify-end gap-2 mb-2 ${activeMultiplier ? 'text-red-400 animate-pulse' : 'text-green-400'}`}
          >
            {activeMultiplier && <Zap size={16} />}+{clickValue} KB/op
          </div>

          <div className="bg-gray-900/80 border border-gray-700 rounded p-2 w-36 sm:w-44 max-w-[38vw] min-w-0 backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-gray-400">OVERCLOCKER</span>
              <span
                className={`text-[10px] font-mono ${isActive ? 'text-green-400 animate-pulse' : 'text-gray-500'}`}
              >
                {isActive ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>

            <div className="flex justify-between gap-1 mb-2">
              {[2, 3, 4, 5].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMultiplier(m)}
                  disabled={isAnyActive && !isActive}
                  className={`
                            flex-1 text-xs font-bold py-1 rounded border
                            ${
                              selectedMultiplier === m
                                ? 'bg-red-900/50 border-red-500 text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700'
                            }
                            ${isAnyActive && !isActive && selectedMultiplier !== m ? 'opacity-30 cursor-not-allowed' : ''}
                        `}
                >
                  x{m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/50 border border-gray-700 rounded px-2 py-1 text-right font-mono text-xs text-red-200">
                {formatTime(currentBank)}
              </div>
              <button
                onClick={() => onToggleBoost(selectedMultiplier)}
                disabled={!hasTime && !isActive}
                className={`
                        w-8 h-8 flex items-center justify-center rounded border transition-all
                        ${
                          isActive
                            ? 'bg-red-500 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                        }
                        ${!hasTime && !isActive ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
              >
                {isActive ? (
                  <Square size={12} fill="currentColor" />
                ) : (
                  <Play size={12} fill="currentColor" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 flex flex-wrap items-center justify-center relative z-10 pt-2">
        <button
          onClick={handleClick}
          className={`
            w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all duration-75 outline-none group cursor-pointer
            ${
              activeMultiplier
                ? `border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.6)]`
                : `border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]`
            }
            ${isAnimating ? 'scale-95 bg-gray-800' : 'scale-100 bg-gray-900'}
          `}
        >
          <Cpu
            size={56}
            className={`
                text-gray-400 transition-colors
                ${activeMultiplier ? 'text-red-400 group-hover:text-red-300' : 'group-hover:text-blue-400'}
            `}
          />
          <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300">
            MINE DATA
          </span>
        </button>

        <div className="absolute left-1/2 top-1/2 w-0 h-0 overflow-visible pointer-events-none z-20">
          {floatingTexts.map(ft => (
            <div
              key={ft.id}
              className="absolute font-mono font-bold text-green-400 text-lg whitespace-nowrap animate-float-fade"
              style={{ left: ft.x, top: ft.y }}
            >
              {ft.text}
            </div>
          ))}
        </div>
      </div>

      <div className="h-24 min-h-0 shrink-0 relative z-0">
        <DataStream activeMultiplier={activeMultiplier} />
      </div>
    </div>
  );
};

export default Clicker;
