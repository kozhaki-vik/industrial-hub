import React, { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from '../contexts/NetworkContext';

export default function FeedbackButton() {
  const { t } = useTranslation();
  const { createTicket, status } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('Bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const typeStr = type === 'Bug' ? t('feedback_bug') : type === 'Idea' ? t('feedback_idea') : t('feedback_other');
      await createTicket(message, "Feedback: " + typeStr);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setMessage('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-white dark:bg-slate-800 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700/60 font-semibold text-sm cursor-pointer group"
        title={t('feedback_btn')}
      >
        <MessageSquarePlus className="w-5 h-5 text-orange-500 shrink-0 transition-transform duration-300 group-hover:scale-110" />
        <span className="whitespace-nowrap">{t('feedback_btn')}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-main-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl relative flex flex-col">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('feedback_title')}</h3>

            {success ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-center h-48 animate-main-fade-in">
                <div className="text-4xl">🎉</div>
                <div className="font-medium">{t('feedback_success')}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                  {['Bug', 'Idea', 'Other'].map(tType => (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => setType(tType)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === tType ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      {tType === 'Bug' ? t('feedback_bug') : tType === 'Idea' ? t('feedback_idea') : t('feedback_other')}
                    </button>
                  ))}
                </div>

                <div>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('feedback_placeholder')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-h-[120px] resize-y"
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                {status !== 'online' && (
                  <div className="text-xs text-red-500 text-center">
                    Нет подключения к серверу
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting || !message.trim() || status !== 'online'}
                  className="mt-2 flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-spin text-xl">↻</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t('feedback_send')}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
