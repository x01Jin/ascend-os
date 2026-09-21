import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { GameState } from '../../types';
import { fuelFeeKB, getGateStatus } from '../../services/gate';

interface AscensionGateProps {
  gameState: GameState;
  onPayFuel: () => void;
  onConfirm: () => void;
  onAbort: () => void;
}

const AscensionGate: React.FC<AscensionGateProps> = ({
  gameState,
  onPayFuel,
  onConfirm,
  onAbort,
}) => {
  const { items, complete } = getGateStatus(gameState);
  const fee = fuelFeeKB(gameState.currentIteration);
  const fuelPaid = gameState.fuelPaidIter === gameState.currentIteration;
  const canPay = !fuelPaid && gameState.dataKB >= fee;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 p-4 text-center bg-gray-950 select-none overflow-hidden">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-2 animate-pulse" />
      <h2 className="text-2xl font-bold text-red-500 mb-1 tracking-wider">SYSTEM WARNING</h2>
      <p className="text-red-200/70 font-mono text-xs mb-3">
        EXECUTING RESETS LOCAL DIRECTORY STRUCTURE. THE FERRY RUNS ON REQUIREMENTS.
      </p>
      <div className="w-full max-w-md flex-1 min-h-0 overflow-y-auto text-left font-mono text-sm mb-3 space-y-2 py-1">
        {items.map(item => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-3 py-2 rounded border ${
              item.done
                ? 'border-green-800 bg-green-950/30 text-green-300'
                : 'border-gray-800 bg-gray-900 text-gray-400'
            }`}
          >
            <span className="w-6 text-center">{item.done ? '[x]' : '[ ]'}</span>
            <span className="flex-1">{item.label}</span>
            {item.id === 'fuel' && !fuelPaid && (
              <button
                onClick={onPayFuel}
                disabled={!canPay}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  canPay
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                PAY {(fee / 1024).toFixed(0)} MB
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-6 shrink-0">
        <button
          onClick={onAbort}
          className="px-6 py-3 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm transition-colors border border-gray-700"
        >
          ABORT
        </button>
        <button
          onClick={onConfirm}
          disabled={!complete}
          className={`px-6 py-3 rounded font-mono font-bold text-sm transition-all border ${
            complete
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 border-red-400'
              : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
          }`}
        >
          CONFIRM UPLOAD
        </button>
      </div>
    </div>
  );
};

export default AscensionGate;
