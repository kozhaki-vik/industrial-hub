import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Card({ title, description, icon: Icon, value, onClick }) {
  const { t } = useTranslation();

  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/50 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-all duration-300 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-slate-400">
          <Icon className="w-5 h-5" />
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 transition-all duration-300 group-hover:text-orange-500 group-hover:translate-x-1" />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{description}</p>
      
      {value && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('current_status')}</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
        </div>
      )}
    </div>
  );
}
