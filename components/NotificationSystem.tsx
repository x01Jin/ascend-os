import React from 'react';
import { AppNotification, NotificationType } from '../types';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface NotificationSystemProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-12 right-4 flex flex-col items-end gap-2 z-[10000] max-w-sm w-full pointer-events-none">
      <style>{`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
       `}</style>

      {notifications.map((n) => {
        let icon = <Info size={20} className="text-blue-400" />;
        let borderColor = "border-blue-500/30";
        let bgColor = "bg-blue-900/10"; // Inner glow

        switch (n.type) {
          case NotificationType.SUCCESS:
            icon = <CheckCircle size={20} className="text-green-400" />;
            borderColor = "border-green-500/50";
            bgColor = "bg-green-900/20";
            break;
          case NotificationType.WARNING:
            icon = <AlertTriangle size={20} className="text-yellow-400" />;
            borderColor = "border-yellow-500/50";
            bgColor = "bg-yellow-900/20";
            break;
          case NotificationType.ERROR:
            icon = <XCircle size={20} className="text-red-400" />;
            borderColor = "border-red-500/50";
            bgColor = "bg-red-900/20";
            break;
        }

        return (
          <div
            key={n.id}
            className={`
                    pointer-events-auto relative w-full
                    bg-gray-900/95 backdrop-blur-md 
                    border ${borderColor} 
                    shadow-2xl rounded-lg overflow-hidden
                    flex items-start
                    transform transition-all duration-300
                 `}
            style={{
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Color Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${bgColor.replace('/10', '/80').replace('/20', '/80')}`}></div>

            <div className="p-4 pl-5 flex gap-3 w-full">
              <div className="shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-100 leading-tight mb-1">{n.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{n.message}</p>
              </div>
              <button
                onClick={() => onDismiss(n.id)}
                className="shrink-0 text-gray-500 hover:text-white transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;
