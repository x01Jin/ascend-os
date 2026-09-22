import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Folder } from 'lucide-react';
import { DirectoryNode, FileType } from '../../types';

interface CartographerProps {
  root: DirectoryNode;
  revealedDepths: number[];
  exploredDirIds: string[];
  explorerDirId: string | null;
  autoMarkCount: number;
  onTeleport: (id: string) => void;
  onRevealLevel: (level: number) => void;
}

interface PlacedNode {
  node: DirectoryNode;
  depth: number;
  x: number;
  y: number;
  path: string;
  sealedCount: number;
  tripCost: number;
}

interface Edge {
  key: string;
  d: string;
}

const NODE_W = 132;
const NODE_H = 64;
const PITCH_X = 168;
const ROW_H = 170;
const PAD = 80;
const RAIL_W_PX = 132;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4;

export const revealCostFor = (root: DirectoryNode, level: number, explored: string[]): number => {
  if (level <= 0) return 0;
  const counts: number[] = [];
  const known = new Set<string>();
  const exploredSet = new Set(explored);
  const walk = (node: DirectoryNode, depth: number) => {
    counts[depth] = (counts[depth] ?? 0) + 1;
    if (depth < level && (exploredSet.has(node.id) || node.isScanned || node.isMarked)) {
      known.add(node.id);
    }
    for (const child of node.children) {
      if (child.type === FileType.FOLDER) walk(child as DirectoryNode, depth + 1);
    }
  };
  walk(root, 0);
  return Math.max(1, Math.ceil((counts[level - 1] ?? 0) * 1.1) - known.size);
};

interface TeleportIndex {
  parent: Map<string, string | null>;
  depth: Map<string, number>;
}

const buildTeleportIndex = (root: DirectoryNode): TeleportIndex => {
  const parent = new Map<string, string | null>();
  const depth = new Map<string, number>();
  const walk = (node: DirectoryNode, parentId: string | null, nodeDepth: number) => {
    parent.set(node.id, parentId);
    depth.set(node.id, nodeDepth);
    for (const child of node.children) {
      if (child.type === FileType.FOLDER) walk(child as DirectoryNode, node.id, nodeDepth + 1);
    }
  };
  walk(root, null, 0);
  return { parent, depth };
};

const costFromIndex = (
  index: TeleportIndex,
  rootId: string,
  fromId: string | null,
  toId: string,
  explored: Set<string>
): number => {
  const from = fromId && index.parent.has(fromId) ? fromId : rootId;
  if (!index.parent.has(toId)) return 1;
  if (from === toId) return 0;
  const chain: string[] = [];
  let cursor: string | null = from;
  while (cursor) {
    chain.push(cursor);
    cursor = index.parent.get(cursor) ?? null;
  }
  const chainSet = new Set(chain);
  const climb: string[] = [];
  cursor = toId;
  while (cursor && !chainSet.has(cursor)) {
    climb.push(cursor);
    cursor = index.parent.get(cursor) ?? null;
  }
  const below: string[] = [];
  const stop = cursor ? chain.indexOf(cursor) : chain.length;
  for (let i = stop - 1; i >= 0; i--) {
    const id = chain[i];
    if (id !== undefined) below.push(id);
  }
  const path = [...climb, ...(cursor ? [cursor] : []), ...below];
  const dist = climb.length + below.length;
  const discount = path.filter(id => id !== from && explored.has(id)).length;
  return Math.max(1, Math.ceil(dist * 1.1) - discount);
};

export const teleportCostFor = (
  root: DirectoryNode,
  fromId: string | null,
  toId: string,
  explored: string[]
): number => costFromIndex(buildTeleportIndex(root), root.id, fromId, toId, new Set(explored));

const foldersOf = (node: DirectoryNode): DirectoryNode[] =>
  node.children.filter(c => c.type === FileType.FOLDER) as DirectoryNode[];

const Cartographer: React.FC<CartographerProps> = ({
  root,
  revealedDepths,
  exploredDirIds,
  explorerDirId,
  autoMarkCount,
  onTeleport,
  onRevealLevel,
}) => {
  const revealed = useMemo(() => new Set(revealedDepths), [revealedDepths]);

  const deepestLevel = useMemo(() => {
    let deepest = 0;
    const walk = (node: DirectoryNode, depth: number) => {
      if (depth > deepest) deepest = depth;
      for (const child of node.children) {
        if (child.type === FileType.FOLDER) walk(child as DirectoryNode, depth + 1);
      }
    };
    walk(root, 0);
    return deepest;
  }, [root]);

  const { nodes, edges, worldW, worldH } = useMemo(() => {
    const placed: PlacedNode[] = [];
    const drawn: Edge[] = [];
    const index = buildTeleportIndex(root);
    const exploredSet = new Set(exploredDirIds);
    let slot = 0;
    const assign = (node: DirectoryNode, depth: number, parentPath: string): number => {
      const path = parentPath ? `${parentPath}/${node.name}` : node.name || '/';
      const folders = foldersOf(node);
      const shown = revealed.has(depth + 1) ? folders : [];
      const sealedCount = shown.length === 0 ? folders.length : 0;
      const y = PAD + depth * ROW_H;
      const tripCost = costFromIndex(index, root.id, explorerDirId, node.id, exploredSet);
      if (shown.length === 0) {
        const x = PAD + slot * PITCH_X;
        slot += 1;
        placed.push({ node, depth, x, y, path, sealedCount, tripCost });
        return x;
      }
      const childX = shown.map(child => assign(child, depth + 1, path));
      const x = (childX[0]! + childX[childX.length - 1]!) / 2;
      placed.push({ node, depth, x, y, path, sealedCount, tripCost });
      const childY = PAD + (depth + 1) * ROW_H;
      const midY = (y + NODE_H + childY) / 2;
      for (let i = 0; i < shown.length; i++) {
        const cx = childX[i]!;
        drawn.push({
          key: `${node.id}>${shown[i]!.id}`,
          d: `M ${x} ${y + NODE_H} L ${x} ${midY} L ${cx} ${midY} L ${cx} ${childY}`,
        });
      }
      return x;
    };
    assign(root, 0, '');
    return {
      nodes: placed,
      edges: drawn,
      worldW: Math.max(slot * PITCH_X + PAD * 2, 800),
      worldH: (deepestLevel + 1) * ROW_H + PAD * 2,
    };
  }, [root, revealed, exploredDirIds, explorerDirId, deepestLevel]);

  const costs = useMemo(() => {
    const next = new Map<number, number>();
    for (let level = 0; level <= deepestLevel; level++) {
      if (!revealed.has(level)) next.set(level, revealCostFor(root, level, exploredDirIds));
    }
    return next;
  }, [root, deepestLevel, revealed, exploredDirIds]);

  const maxRevealed = useMemo(
    () => revealedDepths.reduce((max, d) => Math.max(max, d), 0),
    [revealedDepths]
  );

  const [view, setView] = useState({ x: RAIL_W_PX, y: 0, k: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const bounds = el.getBoundingClientRect();
      const cx = e.clientX - bounds.left;
      const cy = e.clientY - bounds.top;
      const factor = Math.pow(1.0015, -e.deltaY);
      setView(v => {
        const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.k * factor));
        const scale = k / v.k;
        return { k, x: cx - (cx - v.x) * scale, y: cy - (cy - v.y) * scale };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    const el = viewportRef.current;
    const cx = (el?.clientWidth ?? 0) / 2;
    const cy = (el?.clientHeight ?? 0) / 2;
    setView(v => {
      const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.k * factor));
      const scale = k / v.k;
      return { k, x: cx - (cx - v.x) * scale, y: cy - (cy - v.y) * scale };
    });
  };

  const guarded = (fn: () => void) => () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    fn();
  };

  const rulerLevels = Array.from({ length: deepestLevel + 1 }, (_, level) => level);

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
      <div className="p-2 border-b border-gray-800 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
        <span className="shrink-0">folder tree. dbl-click teleports for ◈.</span>
        <span className="shrink-0 text-cyan-300">◈ {autoMarkCount}</span>
        <span className="flex items-center gap-1 ml-auto shrink-0">
          <button
            onClick={() => zoomBy(1.25)}
            className="border border-gray-700 rounded px-1.5 hover:bg-gray-800 text-gray-300"
          >
            +
          </button>
          <button
            onClick={() => zoomBy(0.8)}
            className="border border-gray-700 rounded px-1.5 hover:bg-gray-800 text-gray-300"
          >
            −
          </button>
          <button
            onClick={() => setView({ x: RAIL_W_PX, y: 0, k: 1 })}
            className="border border-gray-700 rounded px-1.5 hover:bg-gray-800 text-gray-300"
          >
            reset
          </button>
        </span>
      </div>
      <div
        ref={viewportRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={e => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          dragRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
        }}
        onPointerMove={e => {
          const drag = dragRef.current;
          if (!drag) return;
          const dx = e.clientX - drag.sx;
          const dy = e.clientY - drag.sy;
          if (Math.abs(dx) + Math.abs(dy) > 4) suppressClickRef.current = true;
          setView(v => ({ ...v, x: drag.ox + dx, y: drag.oy + dy }));
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <div
          className="absolute origin-top-left"
          style={{
            width: worldW,
            height: worldH,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
          }}
        >
          <svg
            className="absolute left-0 top-0 overflow-visible"
            width={worldW}
            height={worldH}
            fill="none"
          >
            {edges.map(edge => (
              <path key={edge.key} d={edge.d} stroke="#374151" strokeWidth={3} />
            ))}
          </svg>
          {nodes.map(placed => {
            const { node, x, y, path, sealedCount, tripCost } = placed;
            const selected = selectedId === node.id;
            const mark =
              node.markKind === 'gate' ? 'text-purple-400' : node.isMarked ? 'text-yellow-400' : '';
            return (
              <div
                key={node.id}
                title={`${node.name || '/'}\n${node.id}\n${path}\n◈${tripCost}`}
                onClick={guarded(() => setSelectedId(node.id))}
                onDoubleClick={guarded(() => onTeleport(node.id))}
                className={`absolute rounded border overflow-hidden cursor-pointer hover:brightness-150 ${
                  selected
                    ? 'border-cyan-400 bg-cyan-950/40'
                    : node.isScanned
                      ? 'border-green-700 bg-green-950/40'
                      : 'border-gray-700 bg-gray-900/90'
                }`}
                style={{ left: x - NODE_W / 2, top: y, width: NODE_W, height: NODE_H }}
              >
                <div className="p-1.5 font-mono leading-tight">
                  <div
                    className={`text-[15px] truncate flex items-center gap-1 ${
                      node.isScanned ? 'text-green-300' : 'text-gray-200'
                    }`}
                  >
                    <Folder size={15} className="shrink-0 text-gray-500" />
                    <span className="truncate">{node.name || '/'}</span>
                    {mark ? <span className={`${mark} shrink-0`}>★</span> : ''}
                  </div>
                  {node.isScanned ? (
                    <div className="text-[11px] text-green-600 font-mono">scanned</div>
                  ) : sealedCount > 0 ? (
                    <div className="text-[11px] text-gray-500 font-mono">
                      ? {sealedCount} inside
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="absolute left-0 top-0 bottom-0 pointer-events-none border-r border-gray-800 bg-gray-950/85"
          style={{ width: RAIL_W_PX }}
        >
          {rulerLevels.map(level => {
            const cost = costs.get(level);
            const isNext = level === maxRevealed + 1;
            const afford = autoMarkCount >= (cost ?? 1);
            return (
              <div
                key={`rail-${level}`}
                className="absolute left-0 right-0 flex items-center px-2 font-mono text-[11px]"
                style={{
                  top: (PAD + level * ROW_H + NODE_H / 2) * view.k + view.y,
                  transform: 'translateY(-50%)',
                }}
              >
                {revealed.has(level) ? (
                  <span className="text-green-600">L{level} ✓</span>
                ) : isNext && cost !== undefined ? (
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={guarded(() => onRevealLevel(level))}
                    disabled={!afford}
                    title={`Reveal depth ${level} for ${cost} automarkers`}
                    className={`pointer-events-auto border rounded px-1.5 ${
                      afford
                        ? 'border-purple-700 text-purple-300 hover:bg-purple-950'
                        : 'border-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    L{level} ◈{cost}
                  </button>
                ) : (
                  <span className="text-gray-700">L{level} 🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Cartographer;
