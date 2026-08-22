import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderSearch, FolderOpen, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { autoDetectRustPath, browseForRustPath } from '../services/rustPath';
import { setConfigKey, getConfigKey } from '../services/store';

export default function RustPathModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState('');
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error'|'info', text: '' }
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getConfigKey('rustPath') || '';
      setCurrentPath(existing);
      
      if (!existing) {
        // Auto-run detection when modal opens
        handleAutoDetect();
      }
    }
  }, [isOpen]);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setStatusMsg({ type: 'info', text: t('rust_modal_detecting') || 'Поиск игры Rust...' });
    try {
      const detected = await autoDetectRustPath();
      if (detected) {
        setCurrentPath(detected);
        setConfigKey('rustPath', detected);
        setStatusMsg({ type: 'success', text: t('rust_modal_found') || 'Папка Rust успешно найдена!' });
      } else {
        setStatusMsg({ type: 'error', text: t('rust_modal_not_found') || 'Папка Rust не найдена автоматически. Укажите путь вручную.' });
      }
    } catch (e) {
      setStatusMsg({ type: 'error', text: t('rust_modal_error') || 'Ошибка при поиске папки Rust.' });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleBrowse = async () => {
    try {
      const selected = await browseForRustPath();
      if (selected) {
        setCurrentPath(selected);
        setStatusMsg({ type: 'info', text: t('rust_modal_selected') || 'Выбрана новая папка.' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    if (currentPath) {
      setConfigKey('rustPath', currentPath);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
            <FolderSearch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t('rust_modal_title') || 'Укажите путь к игре Rust'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('rust_modal_desc') || 'Первичная настройка для работы конфигураций, графика и биндов'}
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : statusMsg.type === 'error'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t('rust_path') || 'Путь к папке Rust'}
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={currentPath} 
              onChange={(e) => setCurrentPath(e.target.value)}
              placeholder="C:\Program Files (x86)\Steam\steamapps\common\Rust" 
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <button
              onClick={handleBrowse}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors"
              title="Выбрать папку"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Обзор</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Автоопределение</span>
          </button>

          <div className="sm:ml-auto flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-medium text-xs transition-colors"
            >
              Пропустить
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105"
            >
              Сохранить
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
