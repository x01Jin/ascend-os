import React, { useEffect, useState } from 'react';

interface SystemHelpProps {
  onOpenCore: () => void;
}

const SystemHelp: React.FC<SystemHelpProps> = ({ onOpenCore }) => {
  const [buffer, setBuffer] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const char = e.key.toLowerCase();
      // Only allow letters
      if (!/^[a-z]$/.test(char)) return;

      // Maintain a rolling 4-char buffer, but DO NOT call parent setters from inside state updater
      setBuffer(prev => ((prev + char).slice(-4)));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // React effect watches buffer and calls onOpenCore from an effect (safe timing)
  useEffect(() => {
    if (buffer === 'core') {
      onOpenCore();
      setBuffer('');
    }
  }, [buffer, onOpenCore]);

  return (
    <div className="p-6 text-gray-300 space-y-4 font-mono text-sm h-full overflow-y-auto select-text">
      <h3 className="text-lg text-white font-bold">System Manual</h3>
      <p>Mission: Locate <span className="text-purple-400">ascend.exe</span> to upgrade system firmware.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Navigate directory structures.</li>
        <li>Read logs for potential clues.</li>
        <li>Use <strong>Data Miner</strong> to mine data (KB).</li>
        <li>Find <span className="text-orange-400 font-bold">Supply Drops (Packages)</span> in folders for free resources.</li>
        <li>Find <span className="text-purple-400 font-bold">Hardware Modules</span> to upgrade your Auto-Miner.</li>
        <li>Spend data in Explorer to <strong>Trace Signals</strong> (10 MB/scan) towards the objective.</li>
        <li>Use <strong>System Updates</strong> to improve mining efficiency and automate tools.</li>
        <li>Double-click <strong>ascend.exe</strong> to execute protocol.</li>
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