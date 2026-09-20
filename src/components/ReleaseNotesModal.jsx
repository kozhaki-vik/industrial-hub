import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Gift, ExternalLink, Activity } from 'lucide-react';
import { getAppVersionInfo } from '../services/diagnostics';

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
            setIsOpen(true);
            await fetchReleaseNotes(currentVersion);
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
      const response = await fetch('https://api.github.com/repos/kozhaki-vik/industrial-hub-releases/releases');
      if (!response.ok) throw new Error('Failed to fetch releases');
      const data = await response.json();
      
      // Find the release matching the version
      const release = data.find(r => r.tag_name === `v${currentVersion}` || r.tag_name === `v${currentVersion}-test` || r.tag_name.includes(currentVersion));
      
      if (release) {
        setReleaseNotes(release.body || t('release_notes_empty', 'Описание релиза отсутствует.'));
        setIsTestBranch(release.prerelease || release.tag_name.includes('test'));
      } else {
        setReleaseNotes(t('release_notes_not_found', 'Не удалось найти информацию об этом обновлении на GitHub.'));
      }
    } catch (err) {
      console.error('Error fetching release notes:', err);
      setReleaseNotes(t('release_notes_error', 'Произошла ошибка при загрузке информации об обновлении.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[95vh] flex flex-col">
        
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
        <div className="flex-1 overflow-y-auto min-h-[300px] p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3">
              <Activity className="w-8 h-8 animate-pulse text-orange-500" />
              <p className="text-sm font-medium">{t('release_notes_loading', 'Загрузка списка изменений...')}</p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert prose-orange max-w-none prose-headings:font-bold prose-a:text-orange-500 hover:prose-a:text-orange-600 whitespace-pre-wrap">
              {releaseNotes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between shrink-0">
          <a 
            href="https://github.com/kozhaki-vik/industrial-hub-releases/releases" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-1 font-medium"
          >
            <span>GitHub Releases</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            {t('release_notes_close', 'Отлично, продолжить')}
          </button>
        </div>

      </div>
    </div>
  );
}
