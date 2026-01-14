import React, { useState, useEffect } from 'react';
import { Box, AppWindow, Folder, MousePointer2, HelpCircle, Cpu, Download } from 'lucide-react';
import { AppId, WindowState } from '../types';
import { START_MENU_ITEMS } from '../constants';
import { ContextMenuItem } from './ContextMenu';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (appId: AppId) => void;
  onFocusWindow: (windowId: string) => void;
  onCloseWindow: (windowId: string) => void;
  onContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  onPinToDesktop: (appId: AppId, label: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onOpenApp,
  onFocusWindow,
  onCloseWindow,
  onMinimize,
  onContextMenu,
  onPinToDesktop
}) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleStart = () => setIsStartOpen(!isStartOpen);

  const handleWindowContextMenu = (e: React.MouseEvent, win: WindowState) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY, [
      { label: win.title, disabled: true },
      { separator: true, label: '' },
      { label: win.isMinimized ? 'Restore' : 'Minimize', action: () => win.isMinimized ? onFocusWindow(win.id) : onMinimize(win.id) },
      { label: 'Close Window', action: () => onCloseWindow(win.id), danger: true }
    ]);
  };

  const handleStartItemContextMenu = (e: React.MouseEvent, item: typeof START_MENU_ITEMS[0]) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY, [
      { label: item.label, disabled: true },
      { separator: true, label: '' },
      { label: 'Open', action: () => { onOpenApp(item.id as AppId); setIsStartOpen(false); } },
      { label: 'Pin to Desktop', action: () => { onPinToDesktop(item.id as AppId, item.label); setIsStartOpen(false); } }
    ]);
  };

  return (
    <>
      {/* Start Menu */}
      {isStartOpen && (
        <div
          className="absolute bottom-12 left-2 w-64 bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-lg shadow-2xl z-[9999] overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-200"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <span className="font-bold text-gray-100">Ascend OS</span>
            <span className="block text-xs text-gray-500">v1.0.4 build 8821</span>
          </div>
          <div className="p-2 space-y-1">
            {START_MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                className="w-full text-left px-3 py-2 rounded hover:bg-white/10 flex items-center gap-3 text-sm text-gray-200"
                onClick={() => {
                  onOpenApp(item.id as AppId);
                  setIsStartOpen(false);
                }}
                onContextMenu={(e) => handleStartItemContextMenu(e, item)}
              >
                {item.icon === 'Folder' && <Folder size={18} className="text-yellow-400" />}
                {item.icon === 'MousePointer2' && <MousePointer2 size={18} className="text-blue-400" />}
                {item.icon === 'Cpu' && <Cpu size={18} className="text-cyan-400" />}
                {item.icon === 'Download' && <Download size={18} className="text-purple-400" />}
                {item.icon === 'HelpCircle' && <HelpCircle size={18} className="text-green-400" />}
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-2 bg-gray-900/50 border-t border-gray-700 text-xs text-center text-gray-500">
            System Stable
          </div>
        </div>
      )}

      {/* Click outside listener to close start menu (simple overlay) */}
      {isStartOpen && <div className="fixed inset-0 z-[9998]" onClick={() => setIsStartOpen(false)}></div>}

      {/* Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 bg-gray-900/80 backdrop-blur-md border-t border-white/5 flex items-center px-2 gap-2 z-[9999]"
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >

        {/* Start Button */}
        <button
          onClick={toggleStart}
          className={`p-1.5 rounded transition-colors ${isStartOpen ? 'bg-blue-600/50 text-blue-200' : 'hover:bg-white/10 text-gray-300'}`}
        >
          <Box size={20} />
        </button>

        {/* Separator */}
        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

        {/* Window List */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => onFocusWindow(win.id)}
              onContextMenu={(e) => handleWindowContextMenu(e, win)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded text-xs max-w-[150px] truncate transition-all
                ${activeWindowId === win.id && !win.isMinimized
                  ? 'bg-white/10 text-white shadow-inner border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
              `}
            >
              <AppWindow size={14} className={activeWindowId === win.id ? "text-blue-400" : "text-gray-500"} />
              <span className="truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 px-3 text-xs text-gray-400 font-mono border-l border-white/10 pl-4">
          <span>ASCEND-NET</span>
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </>
  );
};

export default Taskbar;
