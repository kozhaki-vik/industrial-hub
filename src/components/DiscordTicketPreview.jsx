import React, { useState, useMemo, memo } from 'react';
import { Lock, Hash, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { renderTextWithDiscordEmojis } from '../utils/discordEmojis';

function DiscordTicketPreview({
  channelName = 'заявка-alex_rust',
  rConfig = {},
  formConfig = {},
  config = {},
  className = ''
}) {
  const { t } = useTranslation();
  const [ticketMode, setTicketMode] = useState('approved'); // 'approved' | 'rejected'

  const fields = useMemo(() => {
    return Array.isArray(formConfig?.fields) && formConfig.fields.length > 0
      ? formConfig.fields
      : [
          { id: 'f_name', role: 'name', label: 'Ваше имя', placeholder: 'Иван', emoji: 'user', required: true, style: 'short' },
          { id: 'f_age', role: 'age', label: 'Ваш возраст', placeholder: '18', emoji: 'user', required: true, style: 'short' },
          { id: 'f_hours', role: 'hours', label: 'Часы в Rust (со всех аккаунтов)', placeholder: '3500ч', emoji: 'clock', required: true, style: 'short' },
          { id: 'f_steam', role: 'steam', label: 'Ссылка на Steam (на котором играете)', placeholder: 'https://steamcommunity.com/id/...', emoji: 'link', required: true, style: 'short' },
          { id: 'f_exp', role: 'experience', label: 'Опыт игры / предыдущие кланы', placeholder: 'Играл в кланах...', emoji: 'listdetails', required: false, style: 'paragraph' }
        ];
  }, [formConfig?.fields]);

  const botName = config?.name ? `Clan Manager (${config.name})` : 'Clan Manager';

  // Sample answers based on field metadata (plain Discord text, no fake colored text)
  const getSampleAnswer = (field, idx) => {
    const role = field.role || '';
    const labelLower = (field.label || '').toLowerCase();

    if (role === 'name' || labelLower.includes('имя') || labelLower.includes('name')) {
      return 'Alex_Rust';
    }
    if (role === 'age' || labelLower.includes('возраст') || labelLower.includes('age')) {
      if (ticketMode === 'rejected' && rConfig.minAge > 0) {
        return `${Math.max(14, rConfig.minAge - 2)} лет`;
      }
      return '21 год';
    }
    if (role === 'hours' || labelLower.includes('час') || labelLower.includes('hour')) {
      if (ticketMode === 'rejected' && rConfig.minHours > 0) {
        return `${Math.max(100, rConfig.minHours - 600)} ч.`;
      }
      return '3,850 ч.';
    }
    if (role === 'steam' || labelLower.includes('steam')) {
      return 'https://steamcommunity.com/id/alex_rust';
    }
    if (role === 'experience' || labelLower.includes('опыт') || labelLower.includes('клан')) {
      return 'Играл в кланах T9, RND. Позиция: мейн-роумер, билдер. Хороший микроконтроль и стабильный вечерний онлайн.';
    }
    return field.placeholder || 'Ответ кандидата...';
  };

  const resolveTemplateText = (template = '') => {
    if (!template) return '—';
    const sampleAnswers = {
      'имя': 'Alex_Rust',
      'ваше имя': 'Alex_Rust',
      'ваше имя / никнейм': 'Alex_Rust',
      'name': 'Alex_Rust',
      'ник': 'Alex_Rust',
      'никнейм': 'Alex_Rust',
      'возраст': ticketMode === 'rejected' && rConfig.minAge > 0 ? `${Math.max(14, rConfig.minAge - 2)}` : '21',
      'ваш возраст': ticketMode === 'rejected' && rConfig.minAge > 0 ? `${Math.max(14, rConfig.minAge - 2)}` : '21',
      'age': ticketMode === 'rejected' && rConfig.minAge > 0 ? `${Math.max(14, rConfig.minAge - 2)}` : '21',
      'часы': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ч.` : '3,850 ч.',
      'часы в rust': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ч.` : '3,850 ч.',
      'часы в rust (со всех аккаунтов)': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ч.` : '3,850 ч.',
      'часы в игре': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ч.` : '3,850 ч.',
      'hours': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ч.` : '3,850 ч.',
      'реальные часы': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ("${Math.max(100, rConfig.minHours - 600)}")` : '3500 ("3850")',
      'реальные_часы': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ("${Math.max(100, rConfig.minHours - 600)}")` : '3500 ("3850")',
      'реальныечасы': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ("${Math.max(100, rConfig.minHours - 600)}")` : '3500 ("3850")',
      'real_hours': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ("${Math.max(100, rConfig.minHours - 600)}")` : '3500 ("3850")',
      'realhours': ticketMode === 'rejected' && rConfig.minHours > 0 ? `${Math.max(100, rConfig.minHours - 600)} ("${Math.max(100, rConfig.minHours - 600)}")` : '3500 ("3850")',
      'steam': 'https://steamcommunity.com/id/alex_rust',
      'стим': 'https://steamcommunity.com/id/alex_rust',
      'ссылка на steam': 'https://steamcommunity.com/id/alex_rust',
      'ссылка на steam (на котором играете)': 'https://steamcommunity.com/id/alex_rust',
      'ссылка на steam / battlemetrics': 'https://steamcommunity.com/id/alex_rust',
      'кланы': 'T9, RND',
      'история': 'T9, RND',
      'история кланов': 'T9, RND (ушел по инактивам)',
      'предыдущие кланы / история': 'T9, RND',
      'навыки': 'ПВП, Билдинг',
      'роль': 'Мейн-роумер, билдер',
      'роль в команде / навыки': 'Мейн-роумер, билдер, ПВП',
      'пк': 'i7 13700K, RTX 4070, 140 FPS',
      'девайсы': 'Logitech G Pro X Superlight',
      'характеристики пк': 'i7 13700K, RTX 4070, 140 FPS',
      'характеристики пк / fps в игре': 'i7 13700K, RTX 4070, 140 FPS',
      'онлайн': '18:00 - 02:00 МСК (7+ ч.)',
      'прайм-тайм': 'Вечерний (18:00 - 02:00)',
      'прайм-тайм / онлайн в день': 'Вечерний (18:00 - 02:00, 7+ ч.)',
      'город': 'Москва (МСК +0)',
      'город / часовой пояс': 'Москва (МСК +0)',
      'часовой пояс': 'UTC+3',
      'опыт': 'Опыт 5 лет, хороший микроконтроль',
      'о себе': 'Адекватный, стабильный вечерний онлайн',
      'опыт игры / предыдущие кланы': 'Опыт 5 лет, хороший микроконтроль',
      'о себе / дополнительно': 'Адекватный, стабильный вечерний онлайн'
    };

    return template.replace(/\{([^}]+)\}/g, (match, token) => {
      const key = token.trim().toLowerCase();
      if (sampleAnswers[key] !== undefined) {
        return sampleAnswers[key];
      }
      if (Array.isArray(fields)) {
        const found = fields.find(f => (f.label || '').trim().toLowerCase() === key || (f.role || '').toLowerCase() === key);
        if (found) {
          return getSampleAnswer(found, 0);
        }
      }
      return sampleAnswers[key] || match;
    });
  };

  const defaultTicketCardFields = useMemo(() => [
    { id: 'tcf_1', name: '<:usercircle:1571506569705824367> Имя', value: '{Имя}', inline: true },
    { id: 'tcf_2', name: '<:hourglassempty:1571506480337915914> Возраст', value: '{Возраст} лет', inline: true },
    { id: 'tcf_3', name: '<:devicedesktop:1571506456048566354> Игровые часы', value: '{Часы}', inline: true },
    { id: 'tcf_4', name: '<:link:1571506483718258850> Steam профиль', value: '{Steam}', inline: false },
    { id: 'tcf_5', name: '<:filedescription:1571506468723761233> Информация о кандидате', value: '{Опыт}', inline: false }
  ], []);

  const displayFields = useMemo(() => {
    const rawFields = (rConfig.ticketCardConfig && Array.isArray(rConfig.ticketCardConfig.fields) && rConfig.ticketCardConfig.fields.length > 0)
      ? rConfig.ticketCardConfig.fields
      : defaultTicketCardFields;

    return rawFields.map(f => {
      let name = f.name || f.label || '';
      if (name === '<:calendarweek:1571506435991543818> Возраст') {
        name = '<:hourglassempty:1571506480337915914> Возраст';
      } else if (name === '<:clock:1571506445999017984> Игровые часы') {
        name = '<:devicedesktop:1571506456048566354> Игровые часы';
      } else if (name === '<:listdetails:1571506487929606224> Информация о кандидате') {
        name = '<:filedescription:1571506468723761233> Информация о кандидате';
      }
      return name !== f.name ? { ...f, name } : f;
    });
  }, [rConfig.ticketCardConfig, defaultTicketCardFields]);

  // Group fields into rows matching Discord Desktop layout (up to 3 inline fields per row)
  const fieldRows = useMemo(() => {
    const rows = [];
    let currentInlineRow = [];
    for (const f of displayFields) {
      if (!f.inline) {
        if (currentInlineRow.length > 0) {
          rows.push(currentInlineRow);
          currentInlineRow = [];
        }
        rows.push([f]);
      } else {
        currentInlineRow.push(f);
        if (currentInlineRow.length === 3) {
          rows.push(currentInlineRow);
          currentInlineRow = [];
        }
      }
    }
    if (currentInlineRow.length > 0) {
      rows.push(currentInlineRow);
    }
    return rows;
  }, [displayFields]);

  const isRejected = ticketMode === 'rejected';
  const effectiveChannelName = isRejected ? 'отказ-alex_rust' : (channelName || 'заявка-alex_rust');
  const embedColor = isRejected ? '#da373c' : '#248046';

  const defaultRejectMsg = 'Вы не подходите.';
  const rejectMsg = rConfig.autoRejectMessage || defaultRejectMsg;

  return (
    <div className={`flex flex-col h-full w-full bg-[#313338] rounded-2xl border border-[#232428] shadow-2xl overflow-hidden font-sans text-xs sm:text-sm select-none ${className}`}>
      {/* Top Channel Header with Lock Icon */}
      <div className="h-12 bg-[#313338] px-4 flex items-center justify-between border-b border-[#232428] text-[#949ba4] shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Lock className="w-4 h-4 text-[#80848e] shrink-0" />
          <Hash className="w-4 h-4 text-[#80848e] shrink-0 -ml-1" />
          <span className="font-bold text-sm text-[#f2f3f5] truncate tracking-wide">
            {effectiveChannelName.replace(/^[#️⃣\s]+/, '').toLowerCase()}
          </span>
        </div>

        {/* Live Simulation Mode Pill */}
        <div className="flex items-center bg-[#1e1f22] p-1 rounded-full border border-[#232428]">
          <button
            type="button"
            onClick={() => setTicketMode('approved')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              ticketMode === 'approved'
                ? 'bg-[#248046] text-white shadow-xs'
                : 'text-[#949ba4] hover:text-[#f2f3f5]'
            }`}
          >
            Одобрено
          </button>
          <button
            type="button"
            onClick={() => setTicketMode('rejected')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              ticketMode === 'rejected'
                ? 'bg-[#da373c] text-white shadow-xs'
                : 'text-[#949ba4] hover:text-[#f2f3f5]'
            }`}
          >
            Авто-отказ
          </button>
        </div>
      </div>

      {/* Discord Message Content */}
      <div className="p-4 sm:p-5 flex gap-4 overflow-y-auto flex-1 leading-relaxed custom-scrollbar">
        {/* Bot Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white shrink-0 shadow-md overflow-hidden">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
          </svg>
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 max-w-[520px]">
          {/* Bot Name and Timestamp */}
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="font-semibold text-[#f2f3f5] text-[15px] hover:underline cursor-pointer">
              {botName}
            </span>
            <span className="bg-[#5865f2] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider select-none leading-none">
              BOT
            </span>
            <span className="text-xs text-[#949ba4] font-normal ml-1.5">
              Сегодня, в 14:32
            </span>
          </div>

          {/* User Ping Mentions */}
          <div className="text-xs text-[#dbdee1] mb-2 leading-relaxed">
            {isRejected ? (
              <span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#5865f2]/20 text-[#c9cdfb] font-semibold mr-1">@Alex_Rust</span>
                ваша заявка проверена автоматической системой фильтрации.
              </span>
            ) : (
              <span>
                Приветствуем, <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#5865f2]/20 text-[#c9cdfb] font-semibold mr-1">@Alex_Rust</span>! 
                Ваша анкета передана <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#5865f2]/20 text-[#c9cdfb] font-semibold mx-1">@Рекрутер</span>.
              </span>
            )}
          </div>

          {/* Embed Container - Authentic Discord 4px radius */}
          <div 
            className="bg-[#2b2d31] rounded-r-[4px] rounded-bl-[4px] p-4 text-[#dbdee1] shadow-md w-full border-l-4 transition-all space-y-3.5"
            style={{ borderLeftColor: embedColor }}
          >
            {/* Embed Title */}
            <div className="font-bold text-[#f2f3f5] text-base flex items-center gap-2">
              {isRejected ? (
                <>
                  <img src="./emojis/x.png" alt="x" className="w-4 h-4 object-contain inline-block shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span>Анкета отклонена: Alex_Rust</span>
                </>
              ) : (
                <>
                  <img src="./emojis/clipboard-text.png" alt="clipboard" className="w-4 h-4 object-contain inline-block shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span>Новая заявка в клан: Alex_Rust</span>
                </>
              )}
            </div>

            {/* Candidate Answers Grid - Authentic Discord Desktop: up to 3 inline fields per row */}
            <div className="space-y-2 pt-1">
              {fieldRows.map((row, rIdx) => {
                const isFullWidth = row.length === 1 && !row[0].inline;
                const gridClass = isFullWidth
                  ? 'grid grid-cols-1'
                  : row.length === 3
                  ? 'grid grid-cols-1 sm:grid-cols-3 gap-2'
                  : row.length === 2
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-2'
                  : 'grid grid-cols-1 sm:grid-cols-3 gap-2';

                return (
                  <div key={rIdx} className={gridClass}>
                    {row.map((field, idx) => {
                      const resolvedAnswer = (rConfig.ticketCardConfig && rConfig.ticketCardConfig.fields)
                        ? resolveTemplateText(field.value)
                        : getSampleAnswer(fields[idx] || field, idx);

                      return (
                        <div 
                          key={field.id || `${rIdx}-${idx}`} 
                          className="bg-[#1e1f22]/70 rounded-[4px] p-2.5 border border-[#232428] min-w-0"
                        >
                          <div className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1 truncate flex items-center">
                            {renderTextWithDiscordEmojis(field.name || field.label || `Поле #${idx + 1}`)}
                          </div>
                          {/* Natural Discord text: light grey/white, no arbitrary neon colors */}
                          <div className="text-xs font-medium leading-relaxed text-[#f2f3f5] whitespace-pre-wrap break-words">
                            {renderTextWithDiscordEmojis(resolvedAnswer)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Status / Auto-Reject Embed Section (authentic Discord embed fields) */}
            {isRejected && (
              <div className="mt-3 p-3.5 rounded-[4px] bg-[#232428] border border-[#35373c] text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-[#f2f3f5] font-bold">
                  {renderTextWithDiscordEmojis('<:alerttriangle:1571506419998396568>')}
                  <span>Сработал автоматический отказ:</span>
                </div>
                {rConfig.notifyRejectReason !== false ? (
                  <div className="bg-[#1e1f22] p-2.5 rounded-[4px] text-[11px] text-[#dbdee1] border border-[#2b2d31] space-y-1">
                    {rConfig.minHours > 0 && (
                      <div className="flex items-center gap-1.5">
                        {renderTextWithDiscordEmojis('<:devicedesktop:1571506456048566354>')}
                        <span>Недостаточно игровых часов: 1,400 ч. (требуется от {rConfig.minHours} ч.)</span>
                      </div>
                    )}
                    {rConfig.minAge > 0 && (
                      <div className="flex items-center gap-1.5">
                        {renderTextWithDiscordEmojis('<:hourglassempty:1571506480337915914>')}
                        <span>Возраст кандидата не соответствует порогу (требуется от {rConfig.minAge} лет)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#1e1f22] p-2.5 rounded-[4px] text-[11px] text-[#dbdee1] border border-[#2b2d31]">
                    Вы не подходите.
                  </div>
                )}
                <div className="text-[11px] text-[#dbdee1] bg-[#1e1f22] p-2.5 rounded-[4px] border border-[#2b2d31]">
                  <span className="font-semibold text-[#f2f3f5] block mb-0.5">Сообщение кандидату:</span>
                  «{rejectMsg}»
                </div>
                <div className="flex items-center gap-1.5 text-[#949ba4] font-medium text-[11px] pt-0.5">
                  {renderTextWithDiscordEmojis('<:clock:1571506445999017984>')}
                  <span>Канал будет автоматически удален ботом через 10 минут.</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Row with authentic rounded-[6px] buttons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {isRejected ? (
              <>
                <button
                  type="button"
                  className="h-8 px-4 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 bg-[#da373c] hover:bg-[#a12828] text-white shadow-xs cursor-pointer transition-colors"
                >
                  <span>Удалить канал</span>
                </button>
                <button
                  type="button"
                  className="h-8 px-4 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white shadow-xs cursor-pointer transition-colors"
                >
                  <span>Пересмотреть вручную</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="h-8 px-4 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 bg-[#248046] hover:bg-[#1a6334] text-white shadow-xs cursor-pointer transition-colors"
                >
                  <span>Принять в клан</span>
                </button>
                <button
                  type="button"
                  className="h-8 px-4 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 bg-[#da373c] hover:bg-[#a12828] text-white shadow-xs cursor-pointer transition-colors"
                >
                  <span>Отклонить заявку</span>
                </button>
                <button
                  type="button"
                  className="h-8 px-4 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white shadow-xs cursor-pointer transition-colors"
                >
                  <span>Закрыть тикет</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DiscordTicketPreview);
