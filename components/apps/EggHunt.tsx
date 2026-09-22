import React, { useState } from 'react';
import { Egg } from 'lucide-react';

interface EggHuntProps {
  alreadyCracked: boolean;
  onCrack: (rewardKB: number) => void;
}

const EggHunt: React.FC<EggHuntProps> = ({ alreadyCracked, onCrack }) => {
  const [clicks, setClicks] = useState(0);
  const cracked = alreadyCracked || clicks >= 7;

  const handleClick = () => {
    if (cracked) return;
    const next = clicks + 1;
    setClicks(next);
    if (next >= 7) {
      onCrack((10 + Math.floor(Math.random() * 41)) * 1024);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col items-center justify-center bg-gray-950 text-gray-300 font-mono gap-4 p-6 text-center overflow-hidden">
      <button onClick={handleClick} title={cracked ? 'Cracked' : 'Egg'} className="cursor-pointer">
        <Egg
          size={120}
          className={
            cracked
              ? 'text-yellow-200/40'
              : 'text-yellow-100 animate-pulse hover:scale-105 transition-transform'
          }
        />
      </button>
      {cracked ? (
        <p className="text-sm text-yellow-200/70">cracked open. yolk was data.</p>
      ) : (
        <p className="text-sm text-gray-500">a renamed egg. it feels fragile. ({clicks}/7)</p>
      )}
    </div>
  );
};

export default EggHunt;
