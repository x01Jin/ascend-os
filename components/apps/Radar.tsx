import React, { useMemo, useState } from 'react';
import { DirectoryNode, FileExtension, FileNode, FileType } from '../../types';
import { isSpecialFile, triangulationCostFor } from '../../constants';

interface RadarProps {
  root: DirectoryNode;
  iteration: number;
  dataKB: number;
  triangulated: Record<string, 1 | 2 | 3>;
  onTriangulate: (fileId: string, tier: 1 | 2 | 3) => void;
}

interface Contact {
  file: FileNode;
  parentId: string;
  depth: number;
  tag: string;
}

const TIERS: { tier: 1 | 2 | 3; label: string }[] = [
  { tier: 1, label: 'VAGUE' },
  { tier: 2, label: 'ACCURATE' },
  { tier: 3, label: 'PRECISE' },
];

type SortKey = 'type' | 'name';

const typeRank = (tag: string): number => {
  if (tag === 'TRAIL') return 0;
  if (tag === 'LORE') return 1;
  if (tag === 'GHOST') return 2;
  if (tag === 'LOCKED') return 3;
  if (tag.startsWith('MINIGAME')) return 4;
  if (tag === 'MODULE') return 5;
  return 6;
};

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

const vagueDepths = (depth: number, maxDepth: number): number[] => {
  let lo = Math.max(0, depth - 1);
  let hi = Math.min(maxDepth, depth + 1);
  while (hi - lo < 2 && (lo > 0 || hi < maxDepth)) {
    if (lo > 0) lo -= 1;
    else hi += 1;
  }
  const out: number[] = [];
  for (let d = lo; d <= hi; d++) out.push(d);
  return out;
};

const Radar: React.FC<RadarProps> = ({ root, iteration, dataKB, triangulated, onTriangulate }) => {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('type');

  const { contacts, maxDepth } = useMemo(() => {
    const out: Contact[] = [];
    let deepest = 0;
    const walk = (node: DirectoryNode, depth: number) => {
      if (depth > deepest) deepest = depth;
      for (const child of node.children) {
        if (child.type === FileType.FOLDER) {
          walk(child as DirectoryNode, depth + 1);
        } else {
          const tag = tagFor(child as FileNode);
          if (tag)
            out.push({
              file: child as FileNode,
              parentId: node.id,
              depth,
              tag,
            });
        }
      }
    };
    walk(root, 0);
    return { contacts: out, maxDepth: deepest };
  }, [root]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? contacts.filter(
          c =>
            `${c.file.name}.${c.file.extension}`.toLowerCase().includes(q) ||
            c.tag.toLowerCase().includes(q)
        )
      : [...contacts];
    filtered.sort((a, b) =>
      sortKey === 'name'
        ? `${a.file.name}.${a.file.extension}`.localeCompare(`${b.file.name}.${b.file.extension}`)
        : typeRank(a.tag) - typeRank(b.tag) ||
          `${a.file.name}.${a.file.extension}`.localeCompare(`${b.file.name}.${b.file.extension}`)
    );
    return filtered;
  }, [contacts, query, sortKey]);

  const locationFor = (c: Contact): string => {
    const tier = triangulated[c.file.id] ?? 0;
    if (tier >= 3) return `in ${c.parentId}`;
    if (tier === 2) return `in L${c.depth}`;
    if (tier === 1)
      return `in ${vagueDepths(c.depth, maxDepth)
        .map(d => `L${d}`)
        .join(' / ')}?`;
    return 'in ???';
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
      <div className="p-2 border-b border-gray-800 text-xs text-gray-500 space-y-2">
        <div>{contacts.length} special files detected. the process stays invisible.</div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="search name or tag"
            className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none focus:border-cyan-700 placeholder:text-gray-600"
          />
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs text-gray-300 outline-none"
          >
            <option value="type">by type</option>
            <option value="name">by name</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {visible.map(c => {
          const tier = triangulated[c.file.id] ?? 0;
          const special = isSpecialFile(c.file);
          return (
            <div
              key={c.file.id}
              className="py-1 px-2 hover:bg-white/5 rounded border border-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-400 border border-cyan-800 rounded px-1">
                  {c.tag}
                </span>
                <span className="text-xs text-gray-200 truncate">
                  {c.file.name}.{c.file.extension}
                </span>
                <span className="text-[10px] text-gray-600 truncate">{locationFor(c)}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {TIERS.filter(t => t.tier > tier).map(t => {
                  const cost = triangulationCostFor(t.tier, iteration, special);
                  const afford = dataKB >= cost;
                  return (
                    <button
                      key={t.tier}
                      onClick={() => onTriangulate(c.file.id, t.tier)}
                      disabled={!afford}
                      title={`${t.label} triangulation for ${(cost / 1024).toFixed(0)} MB of data`}
                      className={`text-[10px] border rounded px-1 shrink-0 ${
                        afford
                          ? 'text-purple-400 hover:text-purple-200 border-purple-800'
                          : 'text-gray-600 border-gray-800 cursor-not-allowed'
                      }`}
                    >
                      {t.label} {(cost / 1024).toFixed(0)}MB
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-xs text-gray-600 p-2">
            {contacts.length === 0 ? 'no contacts. descend for a fresh sweep.' : 'no matches.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Radar;
