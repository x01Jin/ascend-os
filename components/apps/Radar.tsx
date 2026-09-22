import React, { useMemo } from 'react';
import { DirectoryNode, FileExtension, FileNode, FileType } from '../../types';

interface RadarProps {
  root: DirectoryNode;
  onTeleport: (dirId: string) => void;
}

interface Contact {
  file: FileNode;
  parentId: string;
  tag: string;
}

const tagFor = (f: FileNode): string | null => {
  if (f.isWinningPath) return null;
  if (f.type === FileType.PACKAGE) return 'PACKAGE';
  if (f.type === FileType.MODULE) return 'MODULE';
  if (f.extension === FileExtension.EXE) return `MINIGAME: ${f.name.toUpperCase()}`;
  if (f.password) return 'LOCKED';
  if (f.secretId === 'ghost') return 'GHOST';
  if (f.loreId?.startsWith('lore_archivist')) return 'TRAIL';
  if (f.loreId) return 'LORE';
  return null;
};

const Radar: React.FC<RadarProps> = ({ root, onTeleport }) => {
  const contacts = useMemo(() => {
    const out: Contact[] = [];
    const walk = (node: DirectoryNode) => {
      for (const child of node.children) {
        if (child.type === FileType.FOLDER) {
          walk(child as DirectoryNode);
        } else {
          const tag = tagFor(child as FileNode);
          if (tag) out.push({ file: child as FileNode, parentId: node.id, tag });
        }
      }
    };
    walk(root);
    return out;
  }, [root]);

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
      <div className="p-2 border-b border-gray-800 text-xs text-gray-500">
        {contacts.length} special files detected. the ferry stays invisible.
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {contacts.map(c => (
          <div
            key={c.file.id}
            className="flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded border border-gray-800/50"
          >
            <span className="text-[10px] text-cyan-400 border border-cyan-800 rounded px-1">
              {c.tag}
            </span>
            <span className="text-xs text-gray-200 truncate">
              {c.file.name}.{c.file.extension}
            </span>
            <span className="text-[10px] text-gray-600 truncate">in {c.parentId}</span>
            <button
              onClick={() => c.file.parentId && onTeleport(c.file.parentId)}
              className="ml-auto text-[10px] text-purple-400 hover:text-purple-200 border border-purple-800 rounded px-1 shrink-0"
            >
              TELEPORT
            </button>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="text-xs text-gray-600 p-2">no contacts. ascend for a fresh sweep.</p>
        )}
      </div>
    </div>
  );
};

export default Radar;
