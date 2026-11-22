import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Smile, Image as ImageIcon, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EMOJI_FILES, resolveDiscordEmoji } from '../utils/discordEmojis';
import EmojiSuggestModal from './EmojiSuggestModal';

const POPULAR_UNICODE_EMOJIS = [
  '👤', '🎂', '⏱️', '🔗', '📝', '🎮', '⚔️', '🛡️',
  '💎', '🎯', '🚀', '⚡', '⭐', '🔥', '🏆', '📦',
  '🔨', '🏹', '🔫', '💰', '💬', '📜', '🎪', '🌟',
  '🎲', '⚙️', '💀', '👑', '🚁', '🚜', '🧭', '✅'
];

export default function EmojiPickerModal({ isOpen, onClose, onSelect, currentEmoji }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('white'); // 'white' | 'unicode' | 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  // Filter white icons
  const filteredWhiteIcons = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const entries = Object.entries(EMOJI_FILES);
    if (!query) return entries;
    return entries.filter(([key]) => key.toLowerCase().includes(query));
  }, [searchQuery]);

  // Filter unicode icons
  const filteredUnicode = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return POPULAR_UNICODE_EMOJIS;
    return POPULAR_UNICODE_EMOJIS.filter(e => e.includes(query));
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectEmoji = (emojiKeyOrStr) => {
    onSelect(emojiKeyOrStr);
    onClose();
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSelect(customInput.trim());
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('clan_emoji_picker_title', 'Выбор эмодзи поля')}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar & Tabs */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/40 dark:bg-slate-850/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или символу..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/80 dark:text-white focus:ring-2 focus:ring-orange-500/40 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('white')}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'white'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3 h-3 text-orange-500" />
                <span>Белые иконки ({Object.keys(EMOJI_FILES).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('unicode')}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'unicode'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Эмодзи Discord</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`py-1 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Свой ввод
              </button>
            </div>
          </div>

          {/* Emoji Grid / Content */}
          <div className="p-3 overflow-y-auto flex-1 min-h-[260px] max-h-[360px]">
            {activeTab === 'white' && (
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                {filteredWhiteIcons.map(([key, filename]) => {
                  const isSelected = currentEmoji === key || currentEmoji === key.replace(/-/g, '');
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectEmoji(key)}
                      title={key}
                      className={`relative p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-orange-500/20 border-2 border-orange-500 shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-orange-500/50'
                      }`}
                    >
                      <img
                        src={`./emojis/${filename}`}
                        alt={key}
                        className="w-5 h-5 object-contain filter drop-shadow group-hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                      {isSelected && (
                        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center text-[8px] text-white">
                          <Check className="w-2 h-2" />
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredWhiteIcons.length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-slate-400">
                    Иконки по запросу «{searchQuery}» не найдены
                  </div>
                )}
              </div>
            )}

            {activeTab === 'unicode' && (
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                {filteredUnicode.map((emojiChar) => {
                  const isSelected = currentEmoji === emojiChar;
                  return (
                    <button
                      key={emojiChar}
                      type="button"
                      onClick={() => handleSelectEmoji(emojiChar)}
                      className={`h-10 text-xl rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-100 dark:bg-orange-950/60 border-2 border-orange-500 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <span>{emojiChar}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'custom' && (
              <form onSubmit={handleApplyCustom} className="p-3 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Вы можете вручную вставить любой символ Unicode или кастомный код эмодзи Discord в формате <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">&lt;:name:id&gt;</code>.
                </p>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Символ или Discord код
                  </label>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Например: 🛡️ или <:ak47:123456789...>"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/80 dark:text-white focus:ring-2 focus:ring-orange-500/40 outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customInput.trim()}
                  className="w-full py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Применить этот эмодзи
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
