import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Gift, ExternalLink, Activity } from 'lucide-react';
import { getAppVersionInfo } from '../services/diagnostics';

const DiscordIcon = ({ className = 'w-4 h-4' }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.0777.0777 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

function parseMarkdownBlocks(text) {
  if (!text) return [];
  const normalized = String(text)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  const lines = normalized.split('\n');
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'divider' });
      continue;
    }

    if (trimmed.startsWith('>')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s*/, '') });
      continue;
    }

    const hMatch = rawLine.match(/^(\s*)(#{1,6})\s+(.*)$/);
    if (hMatch) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'heading', level: hMatch[2].length, text: hMatch[3] });
      continue;
    }

    const listMatch = rawLine.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const indent = listMatch[1].length;
      const isSub = indent >= 2;
      const content = listMatch[3];
      if (!currentList) {
        currentList = { type: 'list', items: [] };
      }
      currentList.items.push({ isSub, text: content });
      continue;
    }

    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    blocks.push({ type: 'paragraph', text: trimmed });
  }

  if (currentList) {
    blocks.push(currentList);
  }

  return blocks;
}

function renderInline(text, keyPrefix = 'inline') {
  if (!text) return null;

  const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|https?:\/\/[^\s]+)/g;
  const elements = [];
  let lastIndex = 0;
  let match;
  let tokenIdx = 0;

  const handleOpenLink = (e, url) => {
    e.preventDefault();
    if (window.electronAPI?.shell?.openExternal) {
      window.electronAPI.shell.openExternal(url);
    } else if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <span key={`${keyPrefix}-t-${tokenIdx++}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    const raw = match[0];
    if (raw.startsWith('[') && raw.includes('](')) {
      const linkMatch = raw.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        elements.push(
          <a
            key={`${keyPrefix}-l-${tokenIdx++}`}
            href={href}
            onClick={(e) => handleOpenLink(e, href)}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 underline underline-offset-2 transition-colors cursor-pointer font-medium"
          >
            {label}
          </a>
        );
      } else {
        elements.push(<span key={`${keyPrefix}-t-${tokenIdx++}`}>{raw}</span>);
      }
    } else if (raw.startsWith('**') && raw.endsWith('**')) {
      elements.push(
        <strong key={`${keyPrefix}-b-${tokenIdx++}`} className="font-bold text-slate-900 dark:text-slate-100">
          {raw.slice(2, -2)}
        </strong>
      );
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      elements.push(
        <code
          key={`${keyPrefix}-c-${tokenIdx++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-mono text-xs border border-slate-300/60 dark:border-slate-700/60"
        >
          {raw.slice(1, -1)}
        </code>
      );
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      elements.push(
        <em key={`${keyPrefix}-i-${tokenIdx++}`} className="italic text-slate-800 dark:text-slate-200">
          {raw.slice(1, -1)}
        </em>
      );
    } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
      elements.push(
        <a
          key={`${keyPrefix}-u-${tokenIdx++}`}
          href={raw}
          onClick={(e) => handleOpenLink(e, raw)}
          className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 underline underline-offset-2 transition-colors cursor-pointer"
        >
          {raw}
        </a>
      );
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    elements.push(
      <span key={`${keyPrefix}-t-${tokenIdx++}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return elements;
}

function MarkdownRenderer({ content }) {
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

  if (!blocks || blocks.length === 0) {
    return <p className="text-slate-400 text-sm">{content}</p>;
  }

  return (
    <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
      {blocks.map((block, bIdx) => {
        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h1 key={`b-${bIdx}`} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                {renderInline(block.text, `h1-${bIdx}`)}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2 key={`b-${bIdx}`} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
                {renderInline(block.text, `h2-${bIdx}`)}
              </h2>
            );
          }
          return (
            <h3 key={`b-${bIdx}`} className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1.5 flex items-center gap-2 text-orange-600 dark:text-orange-400">
              {renderInline(block.text, `h3-${bIdx}`)}
            </h3>
          );
        }

        if (block.type === 'list') {
          return (
            <div key={`b-${bIdx}`} className="space-y-2 my-2">
              {block.items.map((item, itemIdx) => {
                if (item.isSub) {
                  return (
                    <div
                      key={`b-${bIdx}-i-${itemIdx}`}
                      className="ml-6 pl-3 border-l-2 border-slate-200 dark:border-slate-800/80 flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 py-0.5 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        {renderInline(item.text, `sub-${bIdx}-${itemIdx}`)}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`b-${bIdx}-i-${itemIdx}`}
                    className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-200 py-1 leading-relaxed"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0 shadow-sm shadow-orange-500/50" />
                    <div className="flex-1">
                      {renderInline(item.text, `item-${bIdx}-${itemIdx}`)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={`b-${bIdx}`} className="border-l-4 border-orange-500 bg-orange-500/5 dark:bg-orange-500/10 px-3.5 py-2 rounded-r-xl my-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic">
              {renderInline(block.text, `q-${bIdx}`)}
            </blockquote>
          );
        }

        if (block.type === 'divider') {
          return <hr key={`b-${bIdx}`} className="border-slate-200 dark:border-slate-800 my-3" />;
        }

        return (
          <p key={`b-${bIdx}`} className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed my-1.5">
            {renderInline(block.text, `p-${bIdx}`)}
          </p>
        );
      })}
    </div>
  );
}

export default function ReleaseNotesModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [version, setVersion] = useState('');
  const [isTestBranch, setIsTestBranch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVersionAndFetchNotes = async () => {
      try {
        const info = await getAppVersionInfo();
        const currentVersion = info.version || '0.0.0';
        
        const lastSeenVersion = localStorage.getItem('industrial-hub-last-seen-version');
        const showReleaseNotes = localStorage.getItem('industrial-hub-show-release-notes');
        
        // Always update last seen version so we don't show it again for this version
        if (lastSeenVersion !== currentVersion) {
          localStorage.setItem('industrial-hub-last-seen-version', currentVersion);
          
          if (showReleaseNotes !== 'false') {
            setVersion(currentVersion);
            const hasNotes = await fetchReleaseNotes(currentVersion);
            if (hasNotes) {
              setIsOpen(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to check version:', err);
      }
    };
    
    // Slight delay to not interrupt initial startup flow
    const timer = setTimeout(checkVersionAndFetchNotes, 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchReleaseNotes = async (currentVersion) => {
    setIsLoading(true);
    try {
      const repos = ['kozhaki-vik/industrial-hub', 'kozhaki-vik/industrial-hub-releases'];
      for (const repo of repos) {
        try {
          const response = await fetch(`https://api.github.com/repos/${repo}/releases`);
          if (!response.ok) continue;
          const data = await response.json();
          if (!Array.isArray(data)) continue;

          // Find the release matching the version
          const release = data.find(r => r.tag_name === `v${currentVersion}` || r.tag_name === `v${currentVersion}-test` || r.tag_name.includes(currentVersion));
          
          if (release && release.body) {
            const bodyTxt = release.body.trim();
            // Check if there is actual meaningful text, ignore '????', default strings and very short text
            if (bodyTxt && !bodyTxt.startsWith('????') && !bodyTxt.includes('Тестовая сборка') && !bodyTxt.includes('Стабильный релиз') && bodyTxt.length > 5) {
              setReleaseNotes(bodyTxt);
              setIsTestBranch(release.prerelease || release.tag_name.includes('test'));
              return true;
            }
          }
        } catch {
          // try next repo
        }
      }
      return false;
    } catch (err) {
      console.error('Error fetching release notes:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-[820px] w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${isTestBranch ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {t('release_notes_title', 'Приложение обновлено!')}
                </h2>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isTestBranch ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'}`}>
                  v{version}
                </span>
                {isTestBranch && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-md text-xs font-bold">
                    TEST
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('release_notes_desc', 'Ознакомьтесь с новыми функциями и исправлениями.')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[320px] max-h-[62vh] p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3">
              <Activity className="w-8 h-8 animate-pulse text-orange-500" />
              <p className="text-sm font-medium">{t('release_notes_loading', 'Загрузка списка изменений...')}</p>
            </div>
          ) : (
            <MarkdownRenderer content={releaseNotes} />
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between shrink-0">
          <a 
            href="https://discord.gg/RtrMDH3KXQ" 
            target="_blank" 
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              const url = 'https://discord.gg/RtrMDH3KXQ';
              if (window.electronAPI?.shell?.openExternal) {
                window.electronAPI.shell.openExternal(url);
              } else if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(url);
              } else {
                window.open(url, '_blank');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold shadow-md shadow-[#5865F2]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 group"
          >
            <DiscordIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform shrink-0" />
            <span>Discord Server</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            {t('release_notes_close', 'Отлично, продолжить')}
          </button>
        </div>

      </div>
    </div>
  );
}
