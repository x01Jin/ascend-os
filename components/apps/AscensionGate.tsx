import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DirectoryNode, FileExtension, FileNode, FileType, GameState } from '../../types';
import { MINIGAMES, fuelFeeKB, getGateStatus } from '../../services/gate';
import { locateCostFor } from '../../constants';
import { findNodeById } from '../../services/filesystem';

interface AscensionGateProps {
  gameState: GameState;
  root: DirectoryNode | null;
  dataKB: number;
  onSpendData: (amount: number) => void;
  onShowLocation: (file: FileNode) => void;
  onPayFuel: () => void;
  onConfirm: () => void;
  onAbort: () => void;
}

const AscensionGate: React.FC<AscensionGateProps> = ({
  gameState,
  root,
  dataKB,
  onSpendData,
  onShowLocation,
  onPayFuel,
  onConfirm,
  onAbort,
}) => {
  const { items, complete } = getGateStatus(gameState);
  const iteration = gameState.currentIteration;
  const fee = fuelFeeKB(iteration);
  const fuelPaid = gameState.fuelPaidIter === iteration;
  const canPay = !fuelPaid && dataKB >= fee;
  const locateCost = locateCostFor(iteration);
  const [revealed, setRevealed] = useState<Record<string, number>>({});

  const exeDirId = (gameId: string): string | null => {
    if (!root) return null;
    const node = findNodeById(root, `${gameId}_${iteration}`);
    return node?.parentId ?? null;
  };

  const handleLocate = (gameId: string) => {
    if (dataKB < locateCost) return;
    const dirId = exeDirId(gameId);
    if (!dirId) return;
    onSpendData(locateCost);
    setRevealed(prev => ({ ...prev, [gameId]: iteration }));
  };

  const handleShow = (gameId: string) => {
    const dirId = exeDirId(gameId);
    if (!dirId) return;
    const meta = MINIGAMES.find(g => g.id === gameId);
    onShowLocation({
      id: `locate_${gameId}_${iteration}`,
      name: `${gameId}_location`,
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `// ${(meta?.title ?? gameId).toUpperCase()} TERMINAL - ITERATION ${iteration}\n\n> DIRECTORY: ${dirId}\n> Teleport an explorer straight there.`,
      parentId: null,
      isWinningPath: false,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 p-4 text-center bg-gray-950 select-none overflow-hidden">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-2 animate-pulse" />
      <h2 className="text-2xl font-bold text-red-500 mb-1 tracking-wider">SYSTEM WARNING</h2>
      <p className="text-red-200/70 font-mono text-xs mb-3">
        EXECUTING RESETS LOCAL DIRECTORY STRUCTURE. THE FERRY RUNS ON REQUIREMENTS.
      </p>
      <div className="w-full max-w-md flex-1 min-h-0 overflow-y-auto text-left font-mono text-sm mb-3 space-y-2 py-1">
        {items.map(item => {
          const gameId = item.minigameId;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2 rounded border ${
                item.done
                  ? 'border-green-800 bg-green-950/30 text-green-300'
                  : 'border-gray-800 bg-gray-900 text-gray-400'
              }`}
            >
              <span className="w-6 text-center shrink-0 whitespace-nowrap">
                {item.done ? '[x]' : '[ ]'}
              </span>
              <span className="flex-1">{item.label}</span>
              {gameId && !item.done && (
                <button
                  onClick={() =>
                    revealed[gameId] === iteration ? handleShow(gameId) : handleLocate(gameId)
                  }
                  disabled={revealed[gameId] !== iteration && (dataKB < locateCost || !root)}
                  className={`px-3 py-1 rounded text-xs font-bold shrink-0 ${
                    revealed[gameId] === iteration
                      ? 'border border-cyan-700 text-cyan-300 hover:bg-cyan-950'
                      : dataKB >= locateCost && root
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {revealed[gameId] === iteration
                    ? 'SHOW FILE'
                    : `LOCATE ${(locateCost / 1024).toFixed(0)} MB`}
                </button>
              )}
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
          );
        })}
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
