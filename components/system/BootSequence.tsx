import React, { useState, useEffect, useRef } from 'react';

interface BootSequenceProps {
  iteration: number;
  onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ iteration, onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ref pattern ensures we always call the latest onComplete without re-triggering the effect
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const bootLines = [
      `BIOS DATE 01/01/99 14:22:51 VER 1.0.2`,
      `CPU: QUANTUM CORE @ 999GHz`,
      `DETECTING PRIMARY MASTER ... ASCEND DRIVE`,
      `DETECTING PRIMARY SLAVE  ... NONE`,
      `MEMORY TEST: ${iteration * 1024}TB OK`,
      ` `,
      `> POWER_ON_SELF_TEST... OK`,
      `> LOADING KERNEL...`,
      `> MOUNTING VFS (VOID FILE SYSTEM)...`,
      `> READING SECTOR 0x0000${iteration}...`,
      `> LOADING DRIVERS:`,
      `  - REALITY_ANCHOR.SYS`,
      `  - CHRONOS_SYNC.DLL`,
      `  - DATA_MINER.EXE`,
      ` `,
      `INITIALIZING USER INTERFACE...`,
      `ALLOCATING VIDEO MEMORY...`,
      `STARTING DESKTOP ENVIRONMENT...`,
      ` `,
      `SYSTEM READY.`
    ];

    let currentIndex = 0;
    setLines([]); // Reset lines on new iteration

    const interval = setInterval(() => {
      if (currentIndex >= bootLines.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (onCompleteRef.current) onCompleteRef.current();
        }, 800);
        return;
      }

      setLines(prev => [...prev, bootLines[currentIndex]]);
      currentIndex++;
    }, 100);

    return () => clearInterval(interval);
  }, [iteration]); // Dependencies simplified to just iteration

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="w-full h-screen bg-black text-green-500 font-mono text-sm sm:text-base p-4 sm:p-10 flex flex-col justify-end overflow-hidden relative">
      <div className="scanline"></div>

      {/* Container for text */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-end">
        {lines.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap leading-tight">
            {line}
          </div>
        ))}
        <div className="animate-pulse mt-2">_</div>
      </div>

      <div className="mt-4 border-t border-green-900 pt-2 text-xs text-green-800 flex justify-between">
        <span>ASCEND_OS BOOTLOADER v2.0</span>
        <span>ITERATION: {iteration}</span>
      </div>
    </div>
  );
};

export default BootSequence;
