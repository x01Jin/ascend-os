import React from 'react';
import { DirectoryNode, FileType } from '../../types';

interface CartographerProps {
  root: DirectoryNode;
  onTeleport: (dirId: string) => void;
}

const FolderRow: React.FC<{
  node: DirectoryNode;
  depth: number;
  onTeleport: (id: string) => void;
}> = ({ node, depth, onTeleport }) => {
  const folders = node.children.filter(c => c.type === FileType.FOLDER) as DirectoryNode[];
  const mark = node.isMarked
    ? node.markKind === 'gate'
      ? 'text-purple-400'
      : 'text-yellow-400'
    : '';
  return (
    <div>
      <div
        className="flex items-center gap-2 py-0.5 hover:bg-white/5 rounded px-1"
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        <span
          className={`font-mono text-xs ${node.isScanned ? 'text-green-400' : 'text-gray-300'}`}
        >
          {mark ? '★ ' : ''}
          {node.name || '/'}
        </span>
        {node.isScanned && <span className="text-[10px] text-green-600 font-mono">scanned</span>}
        <button
          onClick={() => onTeleport(node.id)}
          className="ml-auto text-[10px] font-mono text-purple-400 hover:text-purple-200 border border-purple-800 rounded px-1"
        >
          TELEPORT
        </button>
      </div>
      {folders.map(f => (
        <FolderRow key={f.id} node={f} depth={depth + 1} onTeleport={onTeleport} />
      ))}
    </div>
  );
};

const Cartographer: React.FC<CartographerProps> = ({ root, onTeleport }) => (
  <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
    <div className="p-2 border-b border-gray-800 text-xs text-gray-500">
      full folder chart. teleport jumps an explorer straight there.
    </div>
    <div className="flex-1 overflow-y-auto p-2">
      <FolderRow node={root} depth={0} onTeleport={onTeleport} />
    </div>
  </div>
);

export default Cartographer;
