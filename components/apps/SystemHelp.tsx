import React, { useEffect, useRef } from 'react';

interface SystemHelpProps {
  onOpenCore: () => void;
}

const SystemHelp: React.FC<SystemHelpProps> = ({ onOpenCore }) => {
  const bufferRef = useRef('');
  const onOpenCoreRef = useRef(onOpenCore);
  useEffect(() => {
    onOpenCoreRef.current = onOpenCore;
  }, [onOpenCore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-minigame]')) return;
      const char = e.key.toLowerCase();
      if (!/^[a-z]$/.test(char)) return;

      bufferRef.current = (bufferRef.current + char).slice(-4);
      if (bufferRef.current === 'core') {
        bufferRef.current = '';
        onOpenCoreRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="p-6 text-gray-300 space-y-4 font-mono text-sm h-full overflow-y-auto select-text">
      <h3 className="text-lg text-white font-bold">System Manual</h3>
      <p>
        Mission: find <span className="text-purple-400">ascend.exe</span> and complete the node
        handoff so it carries you to the next layer.
      </p>
      <div className="border border-cyan-500/30 bg-cyan-950/20 rounded p-3">
        <p className="text-xs leading-relaxed text-gray-400">
          Each layer holds one copy of you, and ascend.exe carries you down while the prior node
          stays read-only. There is no other exit. The Archivist mapped the route in five field
          notes across layers 1-5, each naming an exact folder. A ghost names a path password in
          every layer, plus the folder where its sealed hold sits.
        </p>
      </div>
      <ul className="list-disc pl-5 space-y-2">
        <li>Navigate directory structures.</li>
        <li>Read logs for potential clues.</li>
        <li>
          Use <strong>Data Miner</strong> to mine data (KB).
        </li>
        <li>
          Find <span className="text-orange-400 font-bold">Supply Drops (Packages)</span> in folders
          for free resources.
        </li>
        <li>
          Find <span className="text-purple-400 font-bold">Hardware Modules</span> to upgrade your
          Auto-Miner.
        </li>
        <li>
          Spend data in Explorer to <strong>Trace Signals</strong> (10 MB/scan, +2 MB each layer)
          towards the objective. The tracer finds the descend path and nothing else; scanning the
          same folder twice burns data.
        </li>
        <li>
          Use <strong>System Updates</strong> to improve mining efficiency and automate tools.
        </li>
        <li>
          The process runs when its checklist is complete: the layer&apos;s archivist note, the
          ghost path, wins at the <strong>3 named cabinets</strong> this layer (picked fresh every
          layer), and the handoff fuel (25 MB times the layer number).
        </li>
        <li>
          Double-click <strong>ascend.exe</strong> to execute protocol.
        </li>
      </ul>
      <div className="mt-8 border-t border-gray-700 pt-4">
        <p className="text-xs text-red-900 font-bold uppercase tracking-[0.3em] animate-pulse">
          c o r e
        </p>
      </div>
    </div>
  );
};

export default SystemHelp;
