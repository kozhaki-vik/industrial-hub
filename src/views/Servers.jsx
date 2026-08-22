import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const electron = window.electronAPI ? window.electronAPI : null;

export default function Servers() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleConnect = (ip) => {
    if (electron && electron.shell) {
      electron.shell.openExternal(`steam://connect/${ip}`);
    }
  };

  const handleCopy = (ip) => {
    navigator.clipboard.writeText(`client.connect ${ip}`);
    alert(t('servers_ip_copied'));
  };

  return (
    <div className="space-y-6 animate-main-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('nav_servers')}
        </h1>
      </div>
      
      <p className="text-slate-500 dark:text-slate-400">
        {t('servers_desc')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 1, name: "Industrial Hub [Test Server #1]", ip: "127.0.0.1:28015", players: 142 },
          { id: 2, name: "Industrial Hub [Test Server #2]", ip: "127.0.0.1:28016", players: 198 }
        ].map((server) => (
          <div key={server.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t('servers_online')} ({server.players}/200)
              </span>
            </div>
            <h3 className="font-bold text-xl dark:text-slate-100 mb-2">{server.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">X3 Loot, No BP, Auto-Auth. Вайп был вчера.</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => handleConnect(server.ip)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
              >
                <Play className="w-4 h-4" />
                {t('connect')}
              </button>
              <button 
                onClick={() => handleCopy(server.ip)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                IP
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
