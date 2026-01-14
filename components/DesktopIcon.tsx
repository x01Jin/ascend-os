import React, { useState, useEffect, useRef } from 'react';
import { Folder, MousePointer2, HelpCircle, FileText, Cpu, AppWindow, HardDrive, Download } from 'lucide-react';
import { AppId, DesktopShortcut } from '../types';
import { DESKTOP_GRID } from '../constants';

interface DesktopIconProps {
  shortcut: DesktopShortcut;
  onOpen: (appId: AppId) => void;
  onMove: (id: string, gridX: number, gridY: number) => void;
  onContextMenu: (e: React.MouseEvent, shortcut: DesktopShortcut) => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ shortcut, onOpen, onMove, onContextMenu }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse position
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 }); // Pixel position

  // Calculate initial pixel position from grid
  const getPixelPos = (gx: number, gy: number) => ({
    x: DESKTOP_GRID.MARGIN_LEFT + gx * DESKTOP_GRID.WIDTH,
    y: DESKTOP_GRID.MARGIN_TOP + gy * DESKTOP_GRID.HEIGHT
  });

  // Sync state with props when not dragging
  useEffect(() => {
    if (!isDragging) {
      setCurrentPos(getPixelPos(shortcut.gridX, shortcut.gridY));
    }
  }, [shortcut.gridX, shortcut.gridY, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const basePos = getPixelPos(shortcut.gridX, shortcut.gridY);
      setCurrentPos({
        x: basePos.x + dx,
        y: basePos.y + dy
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      setIsDragging(false);

      // Snap to grid logic
      const relX = currentPos.x - DESKTOP_GRID.MARGIN_LEFT + (DESKTOP_GRID.WIDTH / 2);
      const relY = currentPos.y - DESKTOP_GRID.MARGIN_TOP + (DESKTOP_GRID.HEIGHT / 2);

      const newGridX = Math.max(0, Math.floor(relX / DESKTOP_GRID.WIDTH));
      const newGridY = Math.max(0, Math.floor(relY / DESKTOP_GRID.HEIGHT));

      if (newGridX !== shortcut.gridX || newGridY !== shortcut.gridY) {
        onMove(shortcut.id, newGridX, newGridY);
      } else {
        // Reset visual position if snapped back to same spot
        setCurrentPos(getPixelPos(shortcut.gridX, shortcut.gridY));
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, currentPos, shortcut, onMove]);

  // Icon Resolver
  const renderIcon = () => {
    const commonClasses = "w-14 h-14 rounded-xl flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm border";

    switch (shortcut.appId) {
      case AppId.EXPLORER:
        return (
          <div className={`${commonClasses} bg-blue-500/20 border-blue-500/30 group-hover:bg-blue-500/40`}>
            <div className="text-blue-200"><Folder size={32} /></div>
          </div>
        );
      case AppId.CLICKER:
        return (
          <div className={`${commonClasses} bg-cyan-500/20 border-cyan-500/30 group-hover:bg-cyan-500/40`}>
            <div className="text-cyan-200"><Cpu size={32} /></div>
          </div>
        );
      case AppId.UPDATES:
        return (
          <div className={`${commonClasses} bg-purple-500/20 border-purple-500/30 group-hover:bg-purple-500/40`}>
            <div className="text-purple-200"><Download size={32} /></div>
          </div>
        );
      case AppId.HELP:
        return (
          <div className={`${commonClasses} bg-green-500/20 border-green-500/30 group-hover:bg-green-500/40`}>
            <div className="text-green-200"><HelpCircle size={32} /></div>
          </div>
        );
      default:
        return (
          <div className={`${commonClasses} bg-gray-500/20 border-gray-500/30 group-hover:bg-gray-500/40`}>
            <div className="text-gray-200"><AppWindow size={32} /></div>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute flex flex-col items-center gap-2 group w-24 cursor-pointer select-none ${!isDragging ? 'transition-all duration-200 ease-out' : ''}`}
      style={{
        left: currentPos.x,
        top: currentPos.y,
        zIndex: isDragging ? 50 : 0
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => onOpen(shortcut.appId)}
      onContextMenu={(e) => onContextMenu(e, shortcut)}
    >
      {renderIcon()}
      <span className="text-xs font-medium text-blue-100 drop-shadow-md bg-black/40 px-2 py-0.5 rounded text-center leading-tight break-words w-full">
        {shortcut.label}
      </span>
    </div>
  );
};

export default DesktopIcon;