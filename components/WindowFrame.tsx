import React, { useEffect, useState } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { WindowState } from '../types';
import { ContextMenuItem } from './ContextMenu';

interface WindowFrameProps {
  windowState: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  children: React.ReactNode;
}

const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onMove,
  onContextMenu,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isMaximized = !!windowState.isMaximized;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (isMaximized) return;

    e.stopPropagation();
    onFocus(windowState.id);

    const startX = windowState.position?.x || 0;
    const startY = windowState.position?.y || 0;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - startX,
      y: e.clientY - startY,
    });
  };

  const handleTitleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(windowState.id);

    onContextMenu(e.clientX, e.clientY, [
      { label: 'Minimize', action: () => onMinimize(windowState.id) },
      {
        label: isMaximized ? 'Restore' : 'Maximize',
        action: () => onToggleMaximize(windowState.id),
      },
      { separator: true, label: '' },
      { label: 'Close', action: () => onClose(windowState.id), danger: true },
    ]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onMove(windowState.id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onMove, windowState.id]);

  return (
    <div
      className="absolute bg-gray-900 border border-gray-700 shadow-2xl rounded-lg overflow-hidden flex flex-col"
      style={
        isMaximized
          ? {
              top: 0,
              left: 0,
              right: 0,
              bottom: '40px',
              zIndex: windowState.zIndex,
              display: windowState.isMinimized ? 'none' : 'flex',
            }
          : {
              width: '600px',
              height: '450px',
              top: 0,
              left: 0,
              transform: `translate(${windowState.position?.x || 0}px, ${windowState.position?.y || 0}px)`,
              zIndex: windowState.zIndex,
              display: windowState.isMinimized ? 'none' : 'flex',
            }
      }
      onMouseDown={() => onFocus(windowState.id)}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="bg-gray-800 p-2 flex justify-between items-center select-none border-b border-gray-700 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onToggleMaximize(windowState.id)}
        onContextMenu={handleTitleContextMenu}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/50"></div>
          <span className="text-xs font-mono font-bold text-gray-300 tracking-wider pointer-events-none">
            {windowState.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onMinimize(windowState.id);
            }}
            className="p-1 hover:bg-gray-700 rounded text-gray-400"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleMaximize(windowState.id);
            }}
            className="p-1 hover:bg-gray-700 rounded text-gray-400"
          >
            <Square size={12} />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onClose(windowState.id);
            }}
            className="p-1 hover:bg-red-900/50 hover:text-red-400 rounded text-gray-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative bg-gray-950/90 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
