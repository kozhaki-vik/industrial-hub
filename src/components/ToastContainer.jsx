import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { X, CheckCircle, Info, MessageSquare } from 'lucide-react';

const ToastContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {notifications.map((notif) => {
        const isSuccess = notif.type === 'success';
        const isInfo = notif.type === 'info';
        
        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300
              ${isSuccess 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-200'
              }
            `}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <MessageSquare className="w-5 h-5 text-indigo-500" />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold mb-1">
                {isSuccess ? 'Обращение решено' : 'Ответ техподдержки'}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed whitespace-pre-wrap">
                {notif.message}
              </p>
            </div>
            
            <button 
              onClick={() => removeNotification(notif.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
