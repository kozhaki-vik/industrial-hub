import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, Sparkles, Wrench, Target, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const electron = window.electronAPI ? window.electronAPI : null;

export default function Servers() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCopy = () => {
    alert(t('servers_ip_coming_soon'));
  };

  const handleOpenDiscord = () => {
    if (electron && electron.shell) {
      electron.shell.openExternal('https://discord.gg/invite');
    } else {
      window.open('https://discord.gg/invite', '_blank');
    }
  };

  const serversList = [
    {
      id: 1,
      name: t('server_creative_name'),
      desc: t('server_creative_desc'),
      icon: Wrench,
      status: t('servers_status_coming_soon'),
      badgeColor: 'amber',
      tags: [
        t('servers_creative_tag1'),
        t('servers_creative_tag2'),
        t('servers_creative_tag3')
      ]
    },
    {
      id: 2,
      name: t('server_training_name'),
      desc: t('server_training_desc'),
      icon: Target,
      status: t('servers_status_in_plans'),
      badgeColor: 'indigo',
      tags: [
        t('servers_training_tag1'),
        t('servers_training_tag2'),
        t('servers_training_tag3')
      ]
    }
  ];

  return (
    <div className="space-y-5 animate-main-fade-in pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('nav_servers')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('servers_desc')}
          </p>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 sm:p-5 dark:border-amber-500/30">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t('servers_banner_title')}
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                Beta
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {t('servers_banner_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Servers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {serversList.map((server) => {
          const IconComponent = server.icon;
          return (
            <div 
              key={server.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-orange-500/30 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-orange-500 shrink-0">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                    server.badgeColor === 'indigo'
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60'
                  }`}>
                    <Clock className="w-3 h-3 animate-pulse" />
                    {server.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-1">
                  {server.name}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                  {server.desc}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {server.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <button 
                  disabled={true}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {t('servers_btn_in_dev')}
                </button>
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm cursor-pointer"
                  title={t('servers_ip_coming_soon')}
                >
                  IP
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Discord Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('servers_discord_hint')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('servers_discord_subhint')}
            </p>
          </div>
        </div>
        <button 
          onClick={handleOpenDiscord}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm shadow-orange-500/20 transition-all whitespace-nowrap cursor-pointer"
        >
          {t('servers_discord_btn')}
        </button>
      </div>
    </div>
  );
}
