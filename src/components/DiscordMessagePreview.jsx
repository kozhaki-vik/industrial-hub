import React, { useState } from 'react';
import { ExternalLink, Hash, Sparkles, X } from 'lucide-react';

/**
 * Parses basic Discord markdown:
 * - Code blocks: ```ansi ... ``` or ``` ... ```
 * - Inline code: `...`
 * - Bold: **...**
 * - Italic: *...*
 * - Mentions: <@id> or @username
 * - Headers: # ...
 * - Links: https://...
 */
function renderDiscordMarkdown(text) {
  if (!text) return null;

  // Split by code blocks first to preserve them
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'codeblock', content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  const renderInline = (str, keyPrefix) => {
    const lines = str.split('\n');
    return lines.map((line, lIdx) => {
      // Check for Discord header (# Header or ## Header)
      const headerMatch = line.match(/^#{1,3}\s+(.*)$/);
      if (headerMatch) {
        return (
          <div key={`${keyPrefix}-line-${lIdx}`} className="font-bold text-[#f2f3f5] text-sm md:text-base my-1">
            {renderInlineSpans(headerMatch[1], `${keyPrefix}-${lIdx}`)}
          </div>
        );
      }

      return (
        <div key={`${keyPrefix}-line-${lIdx}`} className="min-h-[1.25rem]">
          {line.trim() === '' ? (
            <div className="h-2" />
          ) : (
            renderInlineSpans(line, `${keyPrefix}-${lIdx}`)
          )}
        </div>
      );
    });
  };

  const renderInlineSpans = (line, prefix) => {
    // Regex matching:
    // 1. Mentions: <@(\d+)> or @(\w+)
    // 2. Inline code: `(.*?)`
    // 3. Bold: \*\*(.*?)\*\*
    // 4. Links: (https?:\/\/[^\s]+)
    const tokenRegex = /(<@\d+>|@[\wа-яА-ЯёЁ_.-]+|`[^`]+`|\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g;
    const tokens = [];
    let last = 0;
    let tMatch;

    while ((tMatch = tokenRegex.exec(line)) !== null) {
      if (tMatch.index > last) {
        tokens.push({ type: 'plain', text: line.slice(last, tMatch.index) });
      }
      const raw = tMatch[0];
      if (raw.startsWith('<@') && raw.endsWith('>')) {
        tokens.push({ type: 'mention', text: raw.slice(2, -1) });
      } else if (raw.startsWith('@')) {
        tokens.push({ type: 'mention', text: raw });
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        tokens.push({ type: 'code', text: raw.slice(1, -1) });
      } else if (raw.startsWith('**') && raw.endsWith('**')) {
        tokens.push({ type: 'bold', text: raw.slice(2, -2) });
      } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
        tokens.push({ type: 'link', text: raw });
      }
      last = tMatch.index + raw.length;
    }
    if (last < line.length) {
      tokens.push({ type: 'plain', text: line.slice(last) });
    }

    return tokens.map((tok, i) => {
      const key = `${prefix}-tok-${i}`;
      if (tok.type === 'mention') {
        return (
          <span key={key} className="inline-flex items-center px-1 py-0.5 mx-0.5 rounded bg-[#5865f2]/20 text-[#c9cdfb] font-semibold text-[11px] hover:bg-[#5865f2] hover:text-white transition-colors cursor-pointer select-none">
            {tok.text.startsWith('@') ? tok.text : `@${tok.text}`}
          </span>
        );
      }
      if (tok.type === 'bold') {
        return <strong key={key} className="font-bold text-[#f2f3f5]">{tok.text}</strong>;
      }
      if (tok.type === 'code') {
        return (
          <code key={key} className="px-1.5 py-0.5 rounded bg-[#1e1f22] text-[#e0e1e5] font-mono text-[11px] mx-0.5 border border-[#2b2d31]">
            {tok.text}
          </code>
        );
      }
      if (tok.type === 'link') {
        return (
          <span key={key} className="text-[#00a8fc] hover:underline break-all cursor-pointer font-medium">
            {tok.text}
          </span>
        );
      }
      return <span key={key}>{tok.text}</span>;
    });
  };

  return (
    <div className="space-y-1">
      {parts.map((p, idx) => {
        if (p.type === 'codeblock') {
          return (
            <pre key={idx} className="bg-[#1e1f22] p-3 rounded-lg text-xs font-mono text-[#e0e1e5] border border-[#2b2d31] overflow-x-auto whitespace-pre-wrap leading-relaxed my-2 shadow-inner">
              {p.content}
            </pre>
          );
        }
        return <div key={idx}>{renderInline(p.content, `p-${idx}`)}</div>;
      })}
    </div>
  );
}

export default function DiscordMessagePreview({
  channelName = 'набор-в-клан',
  botName = 'Clan Manager',
  botAvatar = null,
  embed = {},
  buttons = [],
  templates = [],
  activeTemplateIndex = 0,
  onSelectTemplate = () => {},
  onClose = null,
  tabTitle = '',
  className = ''
}) {
  const [imgError, setImgError] = useState(false);

  const embedColor = embed.color || '#5865f2';
  const now = new Date();
  const timeString = `Сегодня, в ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className={`flex flex-col h-full w-full bg-[#313338] rounded-2xl border border-[#232428] shadow-2xl overflow-hidden font-sans text-xs sm:text-sm select-none ${className}`}>
      {/* Top Discord Channel Header */}
      <div className="h-12 bg-[#313338] px-4 flex items-center justify-between border-b border-[#232428] text-[#949ba4] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-5 h-5 text-[#80848e] shrink-0" />
          <span className="font-bold text-sm text-[#f2f3f5] truncate tracking-wide">
            {channelName.replace(/^[#️⃣\s]+/, '').toLowerCase() || 'general'}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#4e5058]" />
          <span className="hidden sm:inline-block text-xs text-[#949ba4] truncate font-normal">
            {tabTitle ? `${tabTitle} • Предпросмотр в реальном времени` : t('preview_bot_msg', 'Предпросмотр сообщения бота')}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Preview
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[#949ba4] hover:text-[#f2f3f5] hover:bg-[#35373c] transition-colors cursor-pointer ml-1"
              title={t('preview_close', 'Закрыть предпросмотр')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* If templates exist (e.g. wipe templates in votes) */}
      {Array.isArray(templates) && templates.length > 1 && (
        <div className="px-4 py-2 border-b border-[#232428] bg-[#2b2d31] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-thin">
          {templates.map((tpl, tIdx) => (
            <button
              key={tIdx}
              type="button"
              onClick={() => onSelectTemplate(tIdx)}
              className={`px-3 py-1 rounded-[3px] text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTemplateIndex === tIdx
                  ? 'bg-[#5865f2] text-white shadow-xs'
                  : 'bg-[#313338] text-[#949ba4] hover:text-[#f2f3f5] hover:bg-[#35373c]'
              }`}
            >
              {tpl.name || `\${t('preview_template', 'Шаблон #')}\${tIdx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Discord Message Content */}
      <div className="p-4 sm:p-5 flex gap-4 overflow-y-auto flex-1 leading-relaxed custom-scrollbar">
        {/* Bot Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white shrink-0 shadow-md overflow-hidden relative group">
          {botAvatar ? (
            <img src={botAvatar} alt="Bot Avatar" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
            </svg>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 max-w-[520px]">
          {/* Bot Name and Timestamp */}
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="font-semibold text-[#f2f3f5] text-[15px] hover:underline cursor-pointer">
              {botName}
            </span>
            <span className="bg-[#5865f2] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider select-none leading-none">
              BOT
            </span>
            <span className="text-xs text-[#949ba4] font-normal ml-1.5">
              {timeString}
            </span>
          </div>

          {/* Embed Container - Exactly max-w-[520px] like in real Discord */}
          <div 
            className="bg-[#2b2d31] rounded-r-[4px] rounded-bl-[4px] p-4 text-[#dbdee1] shadow-md w-full border-l-4 transition-all"
            style={{ borderLeftColor: embedColor }}
          >
            {/* Embed Title */}
            {embed.title && (
              <div className="font-semibold text-[#f2f3f5] text-base mb-2 hover:underline cursor-pointer flex items-center gap-1.5 leading-snug">
                <span>{embed.title}</span>
                {embed.url && <ExternalLink className="w-4 h-4 text-[#949ba4] shrink-0" />}
              </div>
            )}

            {/* Embed Description */}
            {embed.description && (
              <div className="text-sm leading-relaxed text-[#dbdee1]">
                {renderDiscordMarkdown(embed.description)}
              </div>
            )}

            {/* Embed Fields */}
            {Array.isArray(embed.fields) && embed.fields.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#35373c]/50">
                {embed.fields.map((f, i) => (
                  <div key={i} className={f.inline ? 'col-span-1' : 'col-span-full'}>
                    <div className="text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-0.5">
                      {f.name}
                    </div>
                    <div className="text-sm text-[#f2f3f5] font-medium">
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Embed Banner Image */}
            {embed.banner && !imgError && (
              <div className="mt-3 rounded-[4px] overflow-hidden border border-[#1e1f22] bg-[#1e1f22]/60">
                <img
                  src={embed.banner}
                  alt="Embed Banner"
                  className="w-full max-h-72 object-cover"
                  onError={() => setImgError(true)}
                />
              </div>
            )}

            {/* Embed Footer */}
            {embed.footer && (
              <div className="mt-3 pt-2.5 border-t border-[#35373c]/40 text-xs text-[#949ba4] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5865f2] shrink-0" />
                <span>{embed.footer}</span>
                <span className="w-1 h-1 rounded-full bg-[#4e5058]" />
                <span>{timeString}</span>
              </div>
            )}
          </div>

          {/* Action Row Component Buttons - Real Discord Size (h-8, px-4, rounded-[3px], text-sm) */}
          {Array.isArray(buttons) && buttons.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {buttons.map((btn, bIdx) => {
                let btnStyle = 'bg-[#4e5058] hover:bg-[#6d6f78] text-white'; // default secondary
                if (btn.style === 'success') {
                  btnStyle = 'bg-[#248046] hover:bg-[#1a6334] text-white';
                } else if (btn.style === 'primary') {
                  btnStyle = 'bg-[#5865f2] hover:bg-[#4752c4] text-white';
                } else if (btn.style === 'danger') {
                  btnStyle = 'bg-[#da373c] hover:bg-[#a12828] text-white';
                } else if (btn.style === 'link') {
                  btnStyle = 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';
                }

                return (
                  <button
                    key={bIdx}
                    type="button"
                    className={`h-8 px-4 rounded-[3px] text-sm font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer select-none ${btnStyle}`}
                  >
                    {btn.emoji && <span className="text-base leading-none">{btn.emoji}</span>}
                    <span className="leading-none">{btn.label}</span>
                    {btn.style === 'link' && <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
