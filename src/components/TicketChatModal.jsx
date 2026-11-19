import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';

export default function TicketChatModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { status, ticketHistory, createTicket, markTicketsRead } = useNetwork();
  
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      markTicketsRead();
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, ticketHistory, markTicketsRead]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size < 1MB
    if (file.size > 1024 * 1024) {
      setError(t('chat_image_too_large', 'Изображение слишком большое. Максимум 1 МБ.'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageFile(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await createTicket(message.trim() || t('chat_image_attached', 'Изображение прикреплено'), "Chat reply", imageFile);
      setMessage('');
      setImageFile(null);
    } catch (err) {
      setError(err.message || t('chat_failed_to_send', 'Не удалось отправить'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[80vh] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
            {t('support_chats', 'Поддержка / Чаты')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-950/50">
          {ticketHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
              {t('chat_no_history', 'Нет истории сообщений. Создайте тикет или отправьте сообщение здесь.')}
            </div>
          ) : (
            ticketHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="text-xs text-slate-400 mb-1 ml-1 mr-1">
                  {msg.sender === 'user' ? t('chat_sender_you', 'Вы') : t('chat_sender_admin', 'Администратор')} • {new Date(msg.created_at).toLocaleString()}
                </span>
                <div className={`p-3 rounded-2xl whitespace-pre-wrap break-words ${msg.sender === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                  {msg.message}
                  {msg.image_data && msg.image_data.startsWith('data:image') && (
                    <img src={msg.image_data} alt="attachment" className="mt-2 rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(msg.image_data)} />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
          {error && (
            <div className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg mb-1 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}><X className="w-4 h-4"/></button>
            </div>
          )}
          {imageFile && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-2">
              <img src={imageFile} alt="preview" className="w-full h-full object-cover" />
              <button onClick={() => setImageFile(null)} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/80">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSend} className="flex gap-2">
            <label className="flex items-center justify-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-orange-500 cursor-pointer transition-colors">
              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} />
            </label>
            
            <input 
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('chat_input_placeholder', 'Написать сообщение...')}
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-slate-100"
            />
            
            <button 
              type="submit"
              disabled={isSubmitting || status !== 'online'}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
        
      </div>
    </div>,
    document.body
  );
}
