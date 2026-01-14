import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 shadow-2xl rounded-lg max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          {isDanger && <AlertTriangle className="text-red-500" size={24} />}
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`
                    px-4 py-2 rounded text-sm font-bold text-white shadow-lg transition-all
                    ${isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}
                `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;