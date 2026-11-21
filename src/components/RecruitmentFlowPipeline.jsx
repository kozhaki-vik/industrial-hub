import React, { useState } from 'react';
import { 
  ArrowRight, Check, X, Lock, AlertTriangle, ShieldCheck, 
  ExternalLink, Sparkles, Clock, User, Link as LinkIcon, 
  ListChecks, FileText, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { resolveDiscordEmoji, EMOJI_FILES } from '../utils/discordEmojis';
import { normalizeImageUrl } from '../utils/urlHelper';

function renderEmojiPreview(emojiKeyOrStr) {
  if (!emojiKeyOrStr) return null;
  const resolved = resolveDiscordEmoji(emojiKeyOrStr);
  if (resolved?.type === 'local') {
    return <img src={resolved.url} alt={resolved.alt || 'emoji'} className="w-3.5 h-3.5 inline-block object-contain mr-1 filter drop-shadow" />;
  }
  if (resolved?.type === 'cdn') {
    return <img src={resolved.url} alt={resolved.alt || 'emoji'} className="w-3.5 h-3.5 inline-block object-contain mr-1" />;
  }
  return <span className="mr-1 text-xs">{resolved?.text || emojiKeyOrStr}</span>;
}

export default function RecruitmentFlowPipeline({
  bannerUrl,
  embedColor = '#f97316',
  title = 'Набор в клан',
  text = 'Требования к кандидатам...',
  buttonText = 'Подать заявку',
  buttonStyle = 'success',
  isRecruitmentActive = true,
  includeMetadataLines = true,
  customLeaderId = '',
  serverInviteLink = '',
  formConfig = null,
  autoRejectConfig = {}
}) {
  const [ticketPreviewMode, setTicketPreviewMode] = useState('accepted'); // 'accepted' | 'rejected'

  const fields = formConfig?.fields && formConfig.fields.length > 0
    ? formConfig.fields
    : [
        { id: 'f_name', role: 'name', label: 'Ваше имя', placeholder: 'Иван', emoji: 'user', required: true, style: 'short' },
        { id: 'f_age', role: 'age', label: 'Ваш возраст', placeholder: '18', emoji: 'user', required: true, style: 'short' },
        { id: 'f_hours', role: 'hours', label: 'Часы в Rust (со всех аккаунтов)', placeholder: '3500ч', emoji: 'clock', required: true, style: 'short' },
        { id: 'f_steam', role: 'steam', label: 'Steam профиль (на котором играете)', placeholder: 'https://steamcommunity.com/id/...', emoji: 'link', required: true, style: 'short' },
        { id: 'f_exp', role: 'experience', label: 'Опыт игры / предыдущие кланы', placeholder: 'Играл в кланах ..., позиция фармер/пвп', emoji: 'listdetails', required: false, style: 'paragraph' }
      ];

  const modalTitle = formConfig?.title || 'Подача заявки в клан';

  // Sample applicant data for ticket preview
  const sampleData = {
    name: 'Alex_Rust',
    age: ticketPreviewMode === 'rejected' ? '16' : '20',
    hours: ticketPreviewMode === 'rejected' ? '850 ч.' : '3 800 ч.',
    steam: 'https://steamcommunity.com/id/rust_pro_alex',
    exp: 'Играл в кланах RED, TORN, опыт 4 вайпа на Rustafied Main, позиция стрелок/электрик.',
    custom: 'Готов уделять 6+ часов в день'
  };

  const getButtonBgClass = () => {
    switch (buttonStyle) {
      case 'primary': return 'bg-[#5865F2] hover:bg-[#4752C4] text-white';
      case 'secondary': return 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';
      case 'danger': return 'bg-[#DA373C] hover:bg-[#A12828] text-white';
      case 'success':
      default: return 'bg-[#248046] hover:bg-[#1a6334] text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-500 border border-orange-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Интерактивная цепочка набора: от кнопки до тикета</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-800/50">
                Live Flow
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Наглядный путь кандидата: сообщение набора ➔ заполнение модального окна ➔ созданный тикет
            </p>
          </div>
        </div>
      </div>

      {/* 3-Stage Pipeline Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start relative">
        
        {/* ================= STAGE 1: Recruitment Message Embed ================= */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center">1</span>
              <span>Сообщение в Discord</span>
            </span>
            <span className="text-[11px] text-slate-400">Канал набора</span>
          </div>

          <div className="flex-1 bg-[#313338] text-[#dbdee1] rounded-2xl border border-slate-700/60 shadow-lg overflow-hidden flex flex-col font-sans text-xs">
            {/* Discord Channel header mockup */}
            <div className="px-4 py-2 bg-[#2b2d31] border-b border-[#1f2023] flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="font-bold text-[#80848e]">#</span>
              <span className="text-[#f2f3f5] font-semibold">заявки-в-клан</span>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col">
              {/* Embed Box */}
              <div 
                className="rounded-lg bg-[#2b2d31] overflow-hidden border border-[#1e1f22] flex flex-col shadow-xs"
                style={{ borderLeft: `4px solid ${embedColor || '#f97316'}` }}
              >
                {/* Banner */}
                {bannerUrl && (
                  <div className="w-full max-h-36 overflow-hidden bg-black/40">
                    <img 
                      src={normalizeImageUrl(bannerUrl)} 
                      alt="Clan Banner" 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div className="p-3.5 space-y-2">
                  <h4 className="text-sm font-bold text-[#f2f3f5] leading-snug">
                    {title || 'Набор в клан'}
                  </h4>

                  <div className="text-[11px] text-[#dbdee1] whitespace-pre-line leading-relaxed">
                    {text || 'Мы ищем активных игроков...'}
                  </div>

                  {includeMetadataLines && (
                    <div className="pt-2 border-t border-[#3f4147] text-[10px] text-[#949ba4] space-y-0.5">
                      {customLeaderId && (
                        <div>👑 Лидер: <span className="text-[#5865f2] font-medium">&lt;@{customLeaderId}&gt;</span></div>
                      )}
                      {serverInviteLink && (
                        <div>🔗 Ссылка: <span className="text-[#00a8fc] underline">{serverInviteLink}</span></div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recruitment Button */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={!isRecruitmentActive}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isRecruitmentActive ? getButtonBgClass() : 'bg-[#4e5058] text-[#949ba4] cursor-not-allowed'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{buttonText || 'Подать заявку'}</span>
                </button>
              </div>

              <div className="text-center pt-1 text-[10px] text-slate-500">
                {isRecruitmentActive ? '🟢 Кнопка активна для всех участников' : '🔴 Набор закрыт'}
              </div>
            </div>
          </div>
        </div>

        {/* ================= STAGE 2: Discord Modal Form ================= */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <span>Всплывающая форма (Modal)</span>
            </span>
            <span className="text-[11px] font-mono text-orange-500 font-semibold">{fields.length} / 5 полей</span>
          </div>

          <div className="flex-1 bg-[#313338] rounded-2xl border-2 border-orange-500/40 shadow-xl overflow-hidden flex flex-col font-sans text-xs">
            {/* Modal Window Header */}
            <div className="px-4 py-3 bg-[#2b2d31] border-b border-[#1f2023] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <h4 className="text-xs font-bold text-[#f2f3f5] truncate">
                  {modalTitle}
                </h4>
              </div>
              <button type="button" className="text-[#949ba4] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Input Fields */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin">
              {fields.map((f, idx) => (
                <div key={f.id || idx} className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b5bac1] flex items-center justify-between">
                    <span className="flex items-center">
                      {renderEmojiPreview(f.emoji)}
                      <span>{f.label || `Поле ${idx + 1}`}</span>
                      {f.required !== false && <span className="text-[#fa777c] ml-1">*</span>}
                    </span>
                    <span className="text-[9px] font-mono text-[#80848e]">
                      {f.style === 'paragraph' ? 'многострочное' : 'строка'}
                    </span>
                  </label>

                  {f.style === 'paragraph' ? (
                    <div className="w-full min-h-[50px] p-2 bg-[#1e1f22] border border-[#3f4147] rounded-md text-[11px] text-[#dbdee1] flex items-start">
                      <span className="text-[#80848e] italic">{f.placeholder || 'Введите развернутый ответ...'}</span>
                    </div>
                  ) : (
                    <div className="w-full h-8 px-2.5 bg-[#1e1f22] border border-[#3f4147] rounded-md text-[11px] text-[#dbdee1] flex items-center">
                      <span className="text-[#80848e] italic truncate">{f.placeholder || 'Введите ответ...'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Buttons Footer */}
            <div className="p-3 bg-[#2b2d31] border-t border-[#1f2023] flex items-center justify-end gap-2">
              <span className="text-[11px] font-semibold text-white px-3 py-1.5 rounded-md hover:underline cursor-pointer">
                Отмена
              </span>
              <button
                type="button"
                className="px-4 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Отправить</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= STAGE 3: Ticket Channel Result ================= */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center">3</span>
              <span>Созданный тикет заявки</span>
            </span>

            {/* Outcome Switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-[10px]">
              <button
                type="button"
                onClick={() => setTicketPreviewMode('accepted')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  ticketPreviewMode === 'accepted'
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Одобрена
              </button>
              <button
                type="button"
                onClick={() => setTicketPreviewMode('rejected')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  ticketPreviewMode === 'rejected'
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Авто-отказ
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#313338] text-[#dbdee1] rounded-2xl border border-slate-700/60 shadow-lg overflow-hidden flex flex-col font-sans text-xs">
            {/* Channel bar */}
            <div className="px-4 py-2 bg-[#2b2d31] border-b border-[#1f2023] flex items-center justify-between text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#80848e]">#</span>
                <span className="text-[#f2f3f5] font-semibold">
                  {ticketPreviewMode === 'rejected' ? 'отказ-alex_rust' : 'заявка-alex_rust'}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                ticketPreviewMode === 'rejected' ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
              }`}>
                {ticketPreviewMode === 'rejected' ? '10 мин до удаления' : 'Ожидает модератора'}
              </span>
            </div>

            {/* Ticket Content */}
            <div className="p-4 space-y-3 flex-1 flex flex-col overflow-y-auto max-h-[380px] scrollbar-thin">
              {/* Bot Mention Notification */}
              <div className="text-[10px] text-[#949ba4]">
                <span className="text-[#5865F2] font-medium">@Alex_Rust</span> <span className="text-[#e6c02a] font-medium">@Лидер</span> <span className="text-[#e6c02a] font-medium">@Рекрутер</span>
              </div>

              {/* Ticket Card Embed */}
              <div 
                className="rounded-lg bg-[#2b2d31] p-3.5 space-y-2.5 border border-[#1e1f22]"
                style={{ borderLeft: `4px solid ${ticketPreviewMode === 'rejected' ? '#ef4444' : (embedColor || '#f97316')}` }}
              >
                {/* Embed Title & Avatar */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#f2f3f5] flex items-center gap-1.5">
                      {ticketPreviewMode === 'rejected' ? (
                        <>
                          <span className="text-rose-500 font-bold">✕</span>
                          <span>Заявка отклонена ботом: Alex_Rust</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Новая анкета кандидата: Alex_Rust</span>
                        </>
                      )}
                    </h4>
                    <span className="text-[10px] text-[#80848e]">Специализация: <code className="bg-[#1e1f22] px-1 rounded text-orange-400">Общая</code></span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0 border border-slate-600">
                    A
                  </div>
                </div>

                {/* Candidate Answers Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#3f4147]">
                  {fields.map((f, idx) => {
                    let displayVal = '—';
                    if (f.role === 'name') displayVal = sampleData.name;
                    else if (f.role === 'age') displayVal = `${sampleData.age} лет`;
                    else if (f.role === 'hours') displayVal = `${sampleData.hours} (Steam: verified ✅)`;
                    else if (f.role === 'steam') displayVal = '[Steam Профиль](https://steamcommunity.com/)';
                    else if (f.role === 'experience') displayVal = sampleData.exp;
                    else displayVal = sampleData.custom;

                    const isFullWidth = f.style === 'paragraph' || f.role === 'steam' || f.role === 'experience';

                    return (
                      <div key={f.id || idx} className={isFullWidth ? 'col-span-2' : 'col-span-1'}>
                        <div className="text-[10px] font-bold text-[#949ba4] flex items-center">
                          {renderEmojiPreview(f.emoji)}
                          <span>{f.label}</span>
                        </div>
                        <div className="text-[11px] text-[#dbdee1] font-medium truncate">
                          {displayVal}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Auto-reject alert banner */}
                {ticketPreviewMode === 'rejected' && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 space-y-1 text-[10px] text-rose-200">
                    <div className="font-bold flex items-center gap-1 text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Причина автоматического отклонения:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-rose-300">
                      <li>Возраст (16 лет) ниже минимального порога (18 лет)</li>
                      <li>Игровые часы (850 ч.) меньше требуемых (2000 ч.)</li>
                    </ul>
                    <div className="pt-1 text-[9px] text-rose-400/80 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Канал будет автоматически удален через 10 минут.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {ticketPreviewMode === 'accepted' ? (
                  <>
                    <button
                      type="button"
                      className="flex-1 py-1.5 px-2 bg-[#248046] hover:bg-[#1a6334] text-white rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Принять</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-1.5 px-2 bg-[#DA373C] hover:bg-[#A12828] text-white rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Отклонить</span>
                    </button>
                    <button
                      type="button"
                      className="py-1.5 px-2.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Закрыть</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="w-full py-1.5 px-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Закрыть тикет сейчас</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
