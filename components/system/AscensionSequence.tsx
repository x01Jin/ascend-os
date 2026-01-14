import React, { useState, useEffect } from 'react';
import { Cpu, Zap } from 'lucide-react';

interface AscensionSequenceProps {
  currentIteration: number;
  onComplete: () => void;
}

const AscensionSequence: React.FC<AscensionSequenceProps> = ({ currentIteration, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState("INITIATING HANDSHAKE...");

  useEffect(() => {
    const logs = [
      "ENCRYPTING LOCAL STATE...",
      "COMPRESSING ENTROPY...",
      "ESTABLISHING UPLINK...",
      "BYPASSING FIREWALL...",
      "UPLOADING CONSCIOUSNESS...",
      "PACKETIZING MEMORY...",
      "PURGING LOCAL CACHE...",
      "RECOMPILING REALITY...",
      "ASCENSION COMPLETE."
    ];

    let step = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1; // 0 to 100

        // Update log message based on progress chunks
        if (next % 12 === 0 && step < logs.length) {
          setLog(logs[step]);
          step++;
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
    }, 40); // 4 seconds total approx

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full h-screen bg-gray-950 text-blue-400 font-mono flex flex-col items-center justify-center relative overflow-hidden z-[9999]">
      {/* Background Chaos */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-xs whitespace-nowrap animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 2 + 0.5}s`
            }}
          >
            {Math.random().toString(16).substring(2, 14).toUpperCase()}
          </div>
        ))}
      </div>

      <div className="z-10 w-full max-w-md p-8 flex flex-col items-center gap-6">
        <div className="relative">
          <Cpu size={64} className="text-blue-500 animate-bounce" />
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
        </div>

        <h1 className="text-3xl font-bold tracking-widest text-white">ASCENDING</h1>
        <p className="text-sm text-blue-300">ITERATION {currentIteration} &rarr; {currentIteration + 1}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-900 h-4 rounded border border-gray-700 overflow-hidden relative">
          <div
            className="h-full bg-blue-500 transition-all duration-75 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"></div>
          </div>
        </div>

        <div className="w-full flex justify-between text-xs text-gray-500 font-mono">
          <span>{progress}%</span>
          <span>{log}</span>
        </div>
      </div>

      <div className="scanline"></div>
    </div>
  );
};

export default AscensionSequence;
