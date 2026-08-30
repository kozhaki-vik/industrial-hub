import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FeedbackButton() {
  const { t } = useTranslation();

  const handleClick = () => {
    window.open('https://t.me/DimitryVik', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 p-3 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700/50"
      title={t('feedback_btn')}
    >
      <MessageSquarePlus className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-500 ease-in-out font-medium text-sm">
        <span className="pl-1 pr-2">{t('feedback_btn')}</span>
      </span>
    </button>
  );
}
