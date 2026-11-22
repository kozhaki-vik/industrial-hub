import React, { memo } from 'react';
import { Hash, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveDiscordEmoji } from '../utils/discordEmojis';

function DiscordModalPreview({
  channelName = 'набор-в-клан',
  modalTitle = 'Подача заявки в клан',
  fields = [],
  onSubmit = null,
  className = ''
}) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col h-full w-full bg-[#313338] rounded-2xl border border-[#232428] shadow-2xl overflow-hidden font-sans text-xs sm:text-sm select-none relative ${className}`}>
      {/* Top Discord Channel Header */}
      <div className="h-12 bg-[#313338] px-4 flex items-center justify-between border-b border-[#232428] text-[#949ba4] shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-5 h-5 text-[#80848e] shrink-0" />
          <span className="font-bold text-sm text-[#f2f3f5] truncate tracking-wide">
            {channelName.replace(/^[#️⃣\s]+/, '').toLowerCase() || 'набор-в-клан'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#949ba4] font-medium bg-[#2b2d31] px-2.5 py-1 rounded-md border border-[#232428]">
          <span>Discord Modal Dialog</span>
        </div>
      </div>

      {/* Backdrop overlay simulating Discord modal pop-up over channel */}
      <div className="relative flex-1 overflow-y-auto p-3 sm:p-4 flex items-center justify-center bg-black/55 backdrop-blur-[2px] custom-scrollbar">
        {/* Discord Modal Dialog Window */}
        <div className="w-full max-w-[420px] bg-[#313338] rounded-2xl shadow-2xl border border-[#232428] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#232428]/60 bg-[#313338]">
            <h3 className="font-bold text-[#f2f3f5] text-base truncate tracking-tight pr-2">
              {modalTitle || t('clan_rec_base', 'Подача заявки в клан')}
            </h3>
            <button
              type="button"
              className="text-[#949ba4] hover:text-[#f2f3f5] p-1.5 rounded-full hover:bg-[#35373c] transition-colors shrink-0 cursor-pointer"
              title={t('preview_close', 'Закрыть')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Form Fields */}
          <div className="p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
            {Array.isArray(fields) && fields.length > 0 ? (
              fields.map((field, idx) => {
                const resolvedEmoji = resolveDiscordEmoji(field.emoji);
                const isParagraph = field.style === 'paragraph';

                return (
                  <div key={field.id || idx} className="space-y-1.5">
                    {/* Field Label & Required Asterisk */}
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#b5bac1] uppercase tracking-wider">
                      {resolvedEmoji && (
                        resolvedEmoji.type === 'local' || resolvedEmoji.type === 'cdn' ? (
                          <img
                            src={resolvedEmoji.url}
                            alt="emoji"
                            className="w-3.5 h-3.5 object-contain inline-block shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-xs normal-case">{resolvedEmoji.text}</span>
                        )
                      )}
                      <span className="truncate">{field.label || `Поле #${idx + 1}`}</span>
                      {field.required !== false && (
                        <span className="text-[#fa777c] font-bold text-xs" title="Обязательное поле">*</span>
                      )}
                    </label>

                    {/* Discord Input or Textarea with smooth rounding */}
                    {isParagraph ? (
                      <textarea
                        readOnly
                        disabled
                        rows={3}
                        placeholder={field.placeholder || ''}
                        className="w-full bg-[#1e1f22] text-[#dbdee1] placeholder-[#80848e] rounded-xl px-3.5 py-2.5 text-xs border border-transparent cursor-default resize-none leading-relaxed outline-none"
                      />
                    ) : (
                      <input
                        readOnly
                        disabled
                        type="text"
                        placeholder={field.placeholder || ''}
                        className="w-full bg-[#1e1f22] text-[#dbdee1] placeholder-[#80848e] rounded-xl px-3.5 py-2.5 text-xs border border-transparent cursor-default outline-none"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-[#1e1f22] text-[#949ba4] text-xs text-center">
                Поля формы ещё не добавлены в конструкторе.
              </div>
            )}
          </div>

          {/* Modal Footer with pill/oval shaped buttons */}
          <div className="px-5 py-3.5 bg-[#2b2d31] flex items-center justify-end gap-3 border-t border-[#232428]/60 shrink-0">
            <button
              type="button"
              className="text-xs font-semibold text-white hover:underline px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSubmit) onSubmit();
              }}
              title="Нажмите для перехода к отправленному тикету"
              className="bg-[#5865f2] hover:bg-[#4752c4] active:scale-[0.98] text-white text-xs font-semibold px-6 py-2 rounded-full shadow-sm transition-all cursor-pointer"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DiscordModalPreview);
