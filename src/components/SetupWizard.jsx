import React, { useState } from 'react';

const SetupWizard = ({ onClose, onConfirm }) => {
  const [options, setOptions] = useState({
    createRoles: true,
    createCategory: true,
    createText: true,
    createVoice: true
  });

  const toggleOption = (key) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            Мастер настройки сервера
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Бот может автоматически создать базовую структуру каналов и ролей на вашем Discord сервере. Выберите, что именно вы хотите создать.
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createRoles} onChange={() => toggleOption('createRoles')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">Базовые роли</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Создает роли Leader, Deputy Leader, Caller, Main, Trial, VIP с базовыми цветами. Если роль уже привязана, она не будет дублироваться.</p>
            </div>
          </label>

          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createCategory} onChange={() => toggleOption('createCategory')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">Категория "CLAN HUB"</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Создает основную категорию, в которой будут находиться новые каналы.</p>
            </div>
          </label>

          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createText} onChange={() => toggleOption('createText')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">Текстовые каналы</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Создает каналы: logs, applications, leaderboard, news, votes, ads, roster.</p>
            </div>
          </label>

          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createVoice} onChange={() => toggleOption('createVoice')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">Голосовые каналы</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Создает базовые голосовые каналы (Waiting Room).</p>
            </div>
          </label>
        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/30">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            Отмена
          </button>
          <button onClick={() => onConfirm(options)} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors">
            Начать создание
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
