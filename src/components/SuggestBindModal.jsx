import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';
import { validateForm } from '../utils/formValidation';

export default function SuggestBindModal({ isOpen, onClose }) {
  const { createTicket, status } = useNetwork();
  
  const [bindCommand, setBindCommand] = useState('');
  const [bindDescription, setBindDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(e.currentTarget)) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Gather some basic logs/context if needed
      const logs = "Route: " + window.location.pathname;
      const combinedMessage = `[New Bind Suggestion]\nBind: ${bindCommand}\nDescription: ${bindDescription}`;
      await createTicket(combinedMessage, logs);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setBindCommand('');
        setBindDescription('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Предложить свой бинд</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {status !== 'online' ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">You must be connected to the server to send a support ticket.</p>
            </div>
          ) : success ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-center h-48">
              <CheckCircle className="w-10 h-10" />
              <div>
                <p className="font-bold text-lg">Ticket Submitted</p>
                <p className="text-sm mt-1 opacity-80">Our team will look into it shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Сам бинд
                </label>
                <input 
                  value={bindCommand}
                  onChange={(e) => setBindCommand(e.target.value)}
                  placeholder='Например: bind [key] "kill"'
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-slate-100 mb-4"
                  required
                />
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Описание функционала или название бинда
                </label>
                <textarea 
                  value={bindDescription}
                  onChange={(e) => setBindDescription(e.target.value)}
                  placeholder="Например: Самоубийство"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none h-24 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Отправить
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
