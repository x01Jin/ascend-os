import React, { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Bounds checking to keep menu on screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuRef.current.style.left = `${window.innerWidth - rect.width - 5}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = `${window.innerHeight - rect.height - 5}px`;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="fixed z-[10000] bg-gray-800 border border-gray-600 shadow-2xl rounded py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 flex flex-col"
      style={{ top: y, left: x }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={index} className="h-[1px] bg-gray-700 my-1 mx-2" />;
        }

        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full text-left px-4 py-1.5 text-xs font-medium flex items-center gap-2 select-none
              ${item.disabled
                ? 'text-gray-500 cursor-not-allowed'
                : item.danger
                  ? 'text-red-400 hover:bg-red-900/30'
                  : 'text-gray-200 hover:bg-blue-600 hover:text-white'}
            `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
