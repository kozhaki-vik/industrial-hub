import React, { useState } from 'react';
import { X, Send, Sparkles, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from '../contexts/NetworkContext';

const resizeImageToIcon = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 256;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          // PNG preserves transparency for icons
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function EmojiSuggestModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { createTicket, status } = useNetwork();

  const [name, setName] = useState('');
  const [emojiCode, setEmojiCode] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите файл изображения (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Размер изображения не должен превышать 10 МБ');
      return;
    }

    setError(null);
    setImageFile(file);

    try {
      const optimizedDataUrl = await resizeImageToIcon(file);
      setImagePreview(optimizedDataUrl);
      if (!name.trim()) {
        const autoName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
        if (autoName) setName(autoName);
      }
    } catch {
      setError('Не удалось обработать изображение');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!name.trim()) {
      setError('Укажите название эмодзи (например: ak47, c4)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const message = `[Предложение нового эмодзи]\nНазвание: ${name.trim()}\nСимвол/Код: ${emojiCode.trim() || '—'}\nОписание: ${description.trim() || '—'}`;
      const logs = `URL: ${window.location.href} | UserAgent: ${navigator.userAgent}`;

      if (!createTicket) {
        throw new Error('Сервис отправки предложений временно недоступен');
      }

      await createTicket(message, logs, imagePreview);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setEmojiCode('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit emoji suggestion:', err);
      setError(err.message || 'Не удалось отправить предложение. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t('clan_emoji_suggest_title', 'Предложить свой эмодзи')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Заявка разработчику на добавление в стандартный набор
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Предложение успешно отправлено!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Разработчик рассмотрит иконку и добавит её в белый набор Discord-бота и приложение в следующем обновлении.
              </p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                💡 <span className="font-semibold">Совет:</span> Для идеального соответствия используйте белую иконку на прозрачном фоне (PNG или SVG). Эмодзи станет стандартным для всех кланов Industrial Hub.
              </div>

              {/* Emoji Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Название эмодзи <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: rust-ak47, c4, sniper, clan-shield"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/60 dark:text-white focus:ring-2 focus:ring-orange-500/40 outline-none"
                />
              </div>

              {/* Symbol / Unicode fallback */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Стандартный Discord или Unicode символ (опционально)
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={emojiCode}
                  onChange={(e) => setEmojiCode(e.target.value)}
                  placeholder="Например: 🔫, 🛡️, <:ak47:123456...>"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/60 dark:text-white focus:ring-2 focus:ring-orange-500/40 outline-none font-mono"
                />
              </div>

              {/* File upload / preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Изображение / Иконка (PNG, SVG, JPG до 5 МБ)
                </label>
                {imagePreview ? (
                  <div className="relative p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 p-2 flex items-center justify-center border border-slate-700">
                        <img src={imagePreview} alt="Emoji preview" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="text-xs text-white">
                        <p className="font-medium truncate max-w-[200px]">{imageFile?.name || 'Изображение'}</p>
                        <p className="text-[10px] text-slate-400">Готово к отправке</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-orange-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Нажмите для выбора файла или перетащите сюда
                    </span>
                    <span className="text-[10px] text-slate-400">PNG на прозрачном фоне или JPG</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Для чего используется / Комментарий
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите, в каких анкетах или пунктах меню будет полезна эта иконка..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/60 dark:text-white focus:ring-2 focus:ring-orange-500/40 outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Отправить разработчику</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
