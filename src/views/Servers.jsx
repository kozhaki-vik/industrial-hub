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
      tags: [
        t('servers_training_tag1'),
        t('servers_training_tag2'),
        t('servers_training_tag3')
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-main-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('nav_servers')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('servers_desc')}
          </p>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-6 dark:border-amber-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t('servers_banner_title')}
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                Beta
              </span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {t('servers_banner_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Servers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serversList.map((server) => {
          const IconComponent = server.icon;
          return (
            <div 
              key={server.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-orange-500/30 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-orange-500 shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full shadow-sm">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    {t('servers_status_coming_soon')}
                  </span>
                </div>

                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                  {server.name}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  {server.desc}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {server.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  disabled={true}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  <Clock className="w-4 h-4" />
                  {t('servers_btn_in_dev')}
                </button>
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('servers_discord_hint')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Новости, анонсы дат вайпов и открытие доступа к тестовым серверам.
            </p>
          </div>
        </div>
        <button 
          onClick={handleOpenDiscord}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium shadow-sm shadow-orange-500/20 transition-all whitespace-nowrap cursor-pointer"
        >
          {t('servers_discord_btn')}
        </button>
      </div>
    </div>
  );
}
