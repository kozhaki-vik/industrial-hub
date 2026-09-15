import React, { useState, useEffect } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

let confirmHandler = null;

export const showConfirm = (options) => {
  return new Promise((resolve) => {
    if (confirmHandler) {
      confirmHandler(options, resolve);
    } else {
      resolve(false);
    }
  });
};

export default function ConfirmModal() {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState(null);

  useEffect(() => {
    confirmHandler = (options, resolve) => {
      const opts = typeof options === 'string' ? { message: options } : (options || {});
      setModalState({
        title: opts.title || t('confirm_title', 'Подтверждение действия'),
        message: opts.message || '',
        confirmText: opts.confirmText || t('confirm_btn', 'Подтвердить'),
        cancelText: opts.cancelText || t('cancel_btn', 'Отмена'),
        danger: opts.danger !== undefined ? opts.danger : false,
        resolve
      });
    };

    return () => {
      confirmHandler = null;
    };
  }, [t]);

  useEffect(() => {
    if (!modalState) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleClose(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState]);

  if (!modalState) return null;

  const handleClose = (confirmed) => {
    const res = modalState.resolve;
    setModalState(null);
    if (res) res(confirmed);
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={() => handleClose(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
            modalState.danger 
              ? 'bg-red-500/10 border border-red-500/20 text-red-500' 
              : 'bg-orange-500/10 border border-orange-500/20 text-orange-500'
          }`}>
            {modalState.danger ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {modalState.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-line">
              {modalState.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {modalState.cancelText}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => handleClose(true)}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer ${
              modalState.danger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
            }`}
          >
            {modalState.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
