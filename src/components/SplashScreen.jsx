import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { checkUpdates } from '../utils/SmartPatcher';

export default function SplashScreen({ onComplete }) {
  const { t } = useTranslation();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(0); // bytes per second
  const [lastTick, setLastTick] = useState({ bytes: 0, time: 0 });

  useEffect(() => {
    let isMounted = true;
    let fadeTimer, completeTimer;

    // IPC Listener for progress
    let cleanupIpc = null;
    if (window.electronAPI && window.electronAPI.ipcRenderer && window.electronAPI.ipcRenderer.onUpdateProgress) {
      cleanupIpc = window.electronAPI.ipcRenderer.onUpdateProgress((data) => {
        if (!isMounted) return;
        setProgressData(data);
        
        // Calculate speed roughly
        setLastTick(prev => {
          const now = Date.now();
          if (now - prev.time > 1000) {
            const bytesDiff = data.downloadedBytes - prev.bytes;
            const timeDiffSec = (now - prev.time) / 1000;
            setDownloadSpeed(bytesDiff / timeDiffSec);
            return { bytes: data.downloadedBytes, time: now };
          }
          return prev;
        });
      });
    }

    const runUpdates = async () => {
      setUpdateStatus('checking');
      const startTime = Date.now();
      
      const result = await checkUpdates();
      
      if (!isMounted) return;

      if (result && result.updated > 0) {
        setProgressData(prev => ({ ...prev, status: 'success' }));
        setUpdateStatus('done');
        
        setTimeout(() => {
          if (result.requiresRestart && window.require) {
             window.require('electron').ipcRenderer.invoke('app:relaunch');
          } else {
             window.location.reload();
          }
        }, 2000);
      } else {
        setUpdateStatus(null);
        setProgressData(null);
        
        const elapsed = Date.now() - startTime;
        let remainingToFade = 4100 - elapsed;
        if (remainingToFade < 0) remainingToFade = 0;
        
        fadeTimer = setTimeout(() => {
          if (isMounted) setIsFadingOut(true);
        }, remainingToFade);

        completeTimer = setTimeout(() => {
          if (isMounted) onComplete();
        }, remainingToFade + 500);
      }
    };

    runUpdates();

    return () => {
      isMounted = false;
      if (cleanupIpc) cleanupIpc();
      if (fadeTimer) clearTimeout(fadeTimer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F8F9FA] dark:bg-slate-950 transition-colors duration-300 ${isFadingOut ? 'animate-splash-fade-out' : ''}`}>
      <div className="flex flex-col items-center justify-center gap-6">
        
        <div className="relative animate-startup">
          {/* Glow layer: 1.2x spread */}
          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter absolute inset-0 text-blue-500 blur-[50px] animate-glow">
            {t('app_title')}
          </h1>
          
          {/* Text layer */}
          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter relative z-10">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 dark:to-indigo-400 text-transparent bg-clip-text pr-2">
              {t('app_title')}
            </span>
          </h1>
        </div>
        
        
        <div className="mt-8 flex flex-col gap-4 w-64 md:w-80 h-16 items-center justify-center">
          
          
          {progressData && progressData.status !== 'success' && progressData.status !== 'error' && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Загрузка обновления...</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {progressData.totalBytes ? Math.round((progressData.downloadedBytes / progressData.totalBytes) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ease-out ${downloadSpeed > 0 && downloadSpeed < 1024 * 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressData.totalBytes ? Math.max(5, (progressData.downloadedBytes / progressData.totalBytes) * 100) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{progressData.currentFile || ''}</span>
                <span>{(downloadSpeed / 1024 / 1024).toFixed(2)} MB/s</span>
              </div>
            </div>
          )}

          {progressData && progressData.status === 'error' && (
            <span className="text-sm font-medium text-red-500">
              Ошибка загрузки обновления.
            </span>
          )}

          {updateStatus === 'done' && (
            <span className="text-sm font-medium text-emerald-500">
              Обновление установлено. Перезапуск...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
