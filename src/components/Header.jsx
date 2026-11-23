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
  const isClanRoute = location.pathname === '/clan';
  const bgClasses = isConveyorsRoute 
    ? "bg-[#F8F9FA] dark:bg-slate-950" 
    : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md";

  return (
    <header className={`sticky top-0 z-50 h-14 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center px-4 sm:px-6 transition-colors duration-300 ${bgClasses}`}>
      <div className={`flex items-center gap-2 w-full ${isClanRoute ? 'px-2' : 'max-w-7xl 2xl:max-w-[1800px] mx-auto'}`}>
        <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('app_title')}</h1>
        </NavLink>
        
        <nav className="ml-8 flex gap-5">
          <NavLink 
            to="/" 
            className={({ isActive }) => `text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> {t('nav_dashboard')}
          </NavLink>
          <NavLink 
            to="/servers" 
            className={({ isActive }) => `text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            <Server className="w-3.5 h-3.5" /> {t('nav_servers')}
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            <Settings className="w-3.5 h-3.5" /> {t('nav_settings')}
          </NavLink>
        </nav>

        {/* Online Status */}
        <div className="ml-auto flex items-center gap-2.5">
          {updateProgress?.status === 'deferred' && deferredUpdatePayload && (
            <button 
              onClick={() => {
                if (window.electronAPI && window.electronAPI.ipcRenderer) {
                  window.electronAPI.ipcRenderer.invoke('network:apply-deferred-update', deferredUpdatePayload);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-lg text-white text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {t('update_restart_now', 'Обновить сейчас')}
              </span>
            </button>
          )}

          {status === 'online' && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/50 rounded-full text-xs text-slate-600 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">
                {t('online_count')} {onlineCount.toLocaleString()}
              </span>
            </div>
          )}
          {status === 'connecting' && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/50 rounded-full text-xs text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span className="font-medium">
                {t('status_connecting', 'Подключение...')}
              </span>
            </div>
          )}
          {status === 'offline' && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/50 rounded-full text-xs text-slate-400 dark:text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="font-medium">
                {t('status_offline', 'Не в сети')}
              </span>
            </div>
          )}
          
          {status === 'online' && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title={t('support_chats', 'Поддержка / Чаты')}
            >
              <Bell className="w-4 h-4" />
              {unreadAdminCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          )}
        </div>
      </div>
      <TicketChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  );
}
