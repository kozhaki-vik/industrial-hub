import React from 'react';
import { LayoutDashboard, Settings, Server, Wrench, Users, Bell, Download } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNetwork } from '../contexts/NetworkContext';
import TicketChatModal from './TicketChatModal';

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const { status, onlineCount, unreadAdminCount, updateProgress, deferredUpdatePayload } = useNetwork();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const isConveyorsRoute = location.pathname === '/conveyors';
  const bgClasses = isConveyorsRoute 
    ? "bg-[#F8F9FA] dark:bg-slate-950" 
    : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md";

  return (
    <header className={`sticky top-0 z-50 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 transition-colors duration-300 ${bgClasses}`}>
      <div className="flex items-center gap-2 max-w-6xl w-full mx-auto">
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('app_title')}</h1>
        </NavLink>
        
        <nav className="ml-10 flex gap-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => `text-sm font-medium flex items-center gap-2 transition-all duration-300 ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> {t('nav_dashboard')}
          </NavLink>
          <NavLink 
            to="/servers" 
            className={({ isActive }) => `text-sm font-medium flex items-center gap-2 transition-all duration-300 ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
          >
            <Server className="w-4 h-4" /> {t('nav_servers')}
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `text-sm font-medium flex items-center gap-2 transition-all duration-300 ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
          >
            <Settings className="w-4 h-4" /> {t('nav_settings')}
          </NavLink>
        </nav>

        {/* Online Status */}
        <div className="ml-auto flex items-center gap-3">
          {updateProgress?.status === 'deferred' && deferredUpdatePayload && (
            <button 
              onClick={() => {
                if (window.electronAPI && window.electronAPI.ipcRenderer) {
                  window.electronAPI.ipcRenderer.invoke('network:apply-deferred-update', deferredUpdatePayload);
                }
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all rounded-full border border-orange-600 text-white shadow-md shadow-orange-500/20"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-bold">
                {t('update_restart_now', 'Обновить сейчас')}
              </span>
            </button>
          )}

          {status === 'online' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {t('online_count')} {onlineCount.toLocaleString()}
              </span>
            </div>
          )}
          {status === 'connecting' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-800">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {t('status_connecting', 'Подключение...')}
              </span>
            </div>
          )}
          {status === 'offline' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-800">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                {t('status_offline', 'Не в сети')}
              </span>
            </div>
          )}
          
          {status === 'online' && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors ml-2"
              title={t('support_chats', 'Поддержка / Чаты')}
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              {unreadAdminCount > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-950">
                  {unreadAdminCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      <TicketChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  );
}
