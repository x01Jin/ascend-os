import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DirectoryNode, FileExtension, FileNode, FileType, GameState } from '../../types';
import { MINIGAMES, fuelFeeKB, gatePartFor, getGateStatus } from '../../services/gate';
import { locateCostFor } from '../../constants';
import {
  archivistFileIdFor,
  trailLocateCostFor,
  trailLocateFileIdFor,
} from '../../services/trailScramble';
import { findNodeById } from '../../services/filesystem';

interface AscensionGateProps {
  gameState: GameState;
  root: DirectoryNode | null;
  dataKB: number;
  locatedMinigames: string[];
  locatedTrail: number[];
  onLocate: (gameId: string) => void;
  onLocateTrail: () => void;
  onShowLocation: (file: FileNode) => void;
  onPayFuel: () => void;
  onConfirm: () => void;
  onAbort: () => void;
}

const AscensionGate: React.FC<AscensionGateProps> = ({
  gameState,
  root,
  dataKB,
  locatedMinigames,
  locatedTrail,
  onLocate,
  onLocateTrail,
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

  const exeDirId = (gameId: string): string | null => {
    if (!root) return null;
    const node = findNodeById(root, `${gameId}_${iteration}`);
    return node?.parentId ?? null;
  };

  const handleLocate = (gameId: string) => {
    if (dataKB < locateCost) return;
    if (!exeDirId(gameId)) return;
    onLocate(gameId);
  };

  const part = gatePartFor(iteration);
  const trailFileId = archivistFileIdFor(iteration);
  const trailDirId = root ? (findNodeById(root, trailFileId)?.parentId ?? null) : null;
  const trailCost = trailLocateCostFor(iteration);
  const trailLocated = locatedTrail.includes(iteration);

  const handleLocateTrail = () => {
    if (dataKB < trailCost) return;
    if (!trailDirId) return;
    onLocateTrail();
  };

  const handleShowTrail = () => {
    if (!trailDirId) return;
    onShowLocation({
      id: trailLocateFileIdFor(iteration),
      name: `archivist_${part}_location`,
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `// ARCHIVIST TRAIL TERMINAL - LAYER ${iteration}\n\nThe host directory stays sealed until the margin words are set right.\nUnscramble all three words below to reveal the trail file location.`,
      parentId: null,
      isWinningPath: false,
    });
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
      content: `// ${(meta?.title ?? gameId).toUpperCase()} TERMINAL - LAYER ${iteration}\n\n> DIRECTORY: ${dirId}\n> Teleport an explorer straight there.`,
      parentId: null,
      isWinningPath: false,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 p-4 text-center bg-gray-950 select-none overflow-hidden">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-2 animate-pulse" />
      <h2 className="text-2xl font-bold text-red-500 mb-1 tracking-wider">SYSTEM WARNING</h2>
      <p className="text-red-200/70 font-mono text-xs mb-3">
        EXECUTING RESETS LOCAL DIRECTORY STRUCTURE. THE HANDOFF RUNS ON REQUIREMENTS.
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
                    locatedMinigames.includes(gameId) ? handleShow(gameId) : handleLocate(gameId)
                  }
                  disabled={!locatedMinigames.includes(gameId) && (dataKB < locateCost || !root)}
                  className={`px-3 py-1 rounded text-xs font-bold shrink-0 ${
                    locatedMinigames.includes(gameId)
                      ? 'border border-cyan-700 text-cyan-300 hover:bg-cyan-950'
                      : dataKB >= locateCost && root
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {locatedMinigames.includes(gameId)
                    ? 'SHOW FILE'
                    : `LOCATE ${(locateCost / 1024).toFixed(0)} MB`}
                </button>
              )}
              {item.id === 'trail' && !item.done && (
                <button
                  onClick={() => (trailLocated ? handleShowTrail() : handleLocateTrail())}
                  disabled={!trailLocated && (dataKB < trailCost || !root || !trailDirId)}
                  className={`px-3 py-1 rounded text-xs font-bold shrink-0 ${
                    trailLocated
                      ? 'border border-cyan-700 text-cyan-300 hover:bg-cyan-950'
                      : dataKB >= trailCost && root && trailDirId
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {trailLocated ? 'SHOW FILE' : `LOCATE ${(trailCost / 1024).toFixed(0)} MB`}
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
