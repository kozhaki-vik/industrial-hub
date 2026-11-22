import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LifeBuoy, Bot, Image as ImageIcon, Smile, Palette, Bug,
  Send, Upload, Trash2, CheckCircle2, AlertCircle, Loader2,
  Sparkles, ExternalLink, MessageSquare, Info
} from 'lucide-react';
import { useNetwork } from '../../contexts/NetworkContext';

const CATEGORIES = [
  {
    id: 'bot',
    title: 'Предложения по боту',
    shortDesc: 'Команды, интеграции, роли, авто-настройка',
    icon: Bot,
    color: 'blue',
    placeholder: 'Опишите, какую команду или функцию Discord-бота вы хотите видеть...',
    badge: 'Discord Bot'
  },
  {
    id: 'banners',
    title: 'Предложения по баннерам',
    shortDesc: 'Готовые баннеры Rust, арты, стили набора',
    icon: ImageIcon,
    color: 'orange',
    placeholder: 'Предложите тему, стиль или прикрепите ссылку на красивый баннер для набора...',
    badge: 'Дизайн & Арты'
  },
  {
    id: 'emojis',
    title: 'Предложить свой эмодзи',
    shortDesc: 'Кастомные иконки Rust и Discord для бота и хаба',
    icon: Smile,
    color: 'amber',
    placeholder: 'Опишите эмодзи или загрузите файл изображения ниже...',
    badge: 'Иконки & Emojis'
  },
  {
    id: 'design',
    title: 'Дизайн программы',
    shortDesc: 'Интерфейс Industrial Hub, темная тема, удобство',
    icon: Palette,
    color: 'emerald',
    placeholder: 'Какие элементы интерфейса приложения стоит улучшить или изменить?...',
    badge: 'Интерфейс'
  },
  {
    id: 'bug',
    title: 'Сообщить о баге',
    shortDesc: 'Технические ошибки, сбои, вылеты или проблемы синхронизации',
    icon: Bug,
    color: 'rose',
    placeholder: 'Опишите, что пошло не так, и шаги для повторения ошибки...',
    badge: 'Техподдержка'
  }
];

export default function SupportTab() {
  const { t } = useTranslation();
  const { createTicket, status } = useNetwork();

  const [selectedCategory, setSelectedCategory] = useState('bot');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emojiName, setEmojiName] = useState('');
  const [emojiCode, setEmojiCode] = useState('');

  const [attachedImage, setAttachedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Пожалуйста, выберите файл изображения (PNG, JPG, WebP, SVG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Размер файла превышает лимит 10 МБ');
      return;
    }

    setErrorMessage('');
    setAttachedImage(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      if (selectedCategory === 'emojis' && !emojiName.trim()) {
        const auto = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        if (auto) setEmojiName(auto);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!description.trim() && !attachedImage) {
      setErrorMessage('Пожалуйста, опишите ваше предложение или проблему');
      return;
    }

    if (selectedCategory === 'emojis' && !emojiName.trim() && !description.trim()) {
      setErrorMessage('Укажите название эмодзи или описание');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let subjectHeader = `[${activeCategoryObj.title}]`;
      if (title.trim()) {
        subjectHeader += ` ${title.trim()}`;
      }

      let formattedMessage = `${subjectHeader}\n\n`;

      if (selectedCategory === 'emojis') {
        if (emojiName.trim()) formattedMessage += `Название эмодзи: ${emojiName.trim()}\n`;
        if (emojiCode.trim()) formattedMessage += `Код/Символ: ${emojiCode.trim()}\n`;
      }

      formattedMessage += `Описание: ${description.trim() || '—'}`;

      const logs = `Категория: ${selectedCategory} | Версия приложения: 2.23.46 | URL: ${window.location.href}`;

      if (typeof createTicket !== 'function') {
        throw new Error('Служба отправки тикетов временно недоступна');
      }

      await createTicket(formattedMessage, logs, imagePreview);

      setSubmittedSuccess(true);
      setTitle('');
      setDescription('');
      setEmojiName('');
      setEmojiCode('');
      handleRemoveImage();

      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Не удалось отправить тикет. Проверьте подключение к серверу.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Центр поддержки & Предложений сообщества</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Поддержка и новые идеи
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Мы постоянно улучшаем Industrial Hub и Discord-бота. Выберите интересующую категорию, отправьте предложение или сообщите об ошибке — разработчики рассмотрят ваш тикет в Discord в реальном времени.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Сервер Industrial Hub</div>
                <div className="text-xs font-semibold text-white">
                  {status === 'online' ? 'Подключено онлайн' : 'Нет связи с сервером'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Category Selector Pills */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
          Выберите тему обращения:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setErrorMessage('');
                }}
                className={`flex flex-col p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {cat.badge}
                  </span>
                </div>
                <div className="font-bold text-sm mb-1 leading-snug">
                  {cat.title}
                </div>
                <div className={`text-xs line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {cat.shortDesc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feedback & Suggestion Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
              <activeCategoryObj.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {activeCategoryObj.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeCategoryObj.shortDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Тикет будет создан в канале разработчиков</span>
          </div>
        </div>

        {submittedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">Ваше обращение успешно отправлено!</div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Спасибо за вклад в развитие проекта! Ваше предложение передано разработчикам в специальный канал Discord.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 animate-in fade-in duration-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title or Brief Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Тема обращения / Краткая суть
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Добавить фильтр по часам при поиске игроков"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
            />
          </div>

          {/* Emoji Specific Fields */}
          {selectedCategory === 'emojis' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
              <div>
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1.5">
                  Название эмодзи <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={emojiName}
                  onChange={(e) => setEmojiName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="ak47, bolt, sulfur..."
                  className="w-full px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1.5">
                  Код в Discord (опционально)
                </label>
                <input
                  type="text"
                  value={emojiCode}
                  onChange={(e) => setEmojiCode(e.target.value)}
                  placeholder=":rust_ak47: или символ"
                  className="w-full px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* Detailed Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Подробное описание <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={activeCategoryObj.placeholder}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm resize-y min-h-[100px]"
            />
          </div>

          {/* Image & File Attachment Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Прикрепить скриншот, арты или файл эмодзи (опционально)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
              >
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Нажмите для выбора изображения
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    PNG, JPG, SVG, WebP до 10 МБ
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img
                      src={imagePreview}
                      alt="Attachment Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {attachedImage?.name || 'Изображение прикреплено'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {attachedImage ? `${(attachedImage.size / 1024).toFixed(1)} КБ` : 'Готово к отправке'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50 transition-colors cursor-pointer"
                  title="Удалить прикрепленное изображение"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs text-slate-400">
              * Все обращения фиксируются в системе тикетов Discord
            </span>

            <button
              type="submit"
              disabled={isSubmitting || status !== 'online'}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Отправка обращения...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Отправить обращение</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
