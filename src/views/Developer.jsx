import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Cpu, HardDrive, Wifi, ShieldCheck, PlayCircle, BarChart3, Clock, AlertTriangle, ArrowLeft, RefreshCw, FolderOpen, Flame, Check, Copy, Key, Eye, EyeOff, Server, Lock, Trash2, DownloadCloud, Wrench, Terminal, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pingUrl, getHardwareInfo, checkAppIntegrity, getAppPath, getAppVersionInfo, checkRustIntegrity, getAppDataPath, openLogFolder, getRecentLogs } from '../services/diagnostics';
import { getButtonStats } from '../services/analytics';
import { getConfigKey, setConfigKey, factoryReset } from '../services/store';
import { defaultConveyors } from '../data/defaultConveyors';
import SplashScreen from '../components/SplashScreen';
import { IntegrityCheckSkeleton } from '../components/Skeleton';
import { showConfirm } from '../components/ConfirmModal';
import BotUptimeMonitor from '../components/BotUptimeMonitor';

import { useNetwork } from '../contexts/NetworkContext';
import { compareSemver } from '../utils/semver';

export default function Developer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serverVersion, updateProgress, triggerUpdateCheck, triggerForceUpdate, updateLogs } = useNetwork();
  const [isForceDownloading, setIsForceDownloading] = useState(false);

  const [hwInfo, setHwInfo] = useState(null);
  const [pings, setPings] = useState({ server: null, ws: null, github: null, discord: null, internet1: null, internet2: null });
  const [integrity, setIntegrity] = useState(null);
  const [rustIntegrity, setRustIntegrity] = useState(null);
  const [stats, setStats] = useState({});
  const [firstLaunch, setFirstLaunch] = useState('');
  const [rustPath, setRustPath] = useState('');
  const [appPath, setAppPath] = useState('');
  const [appDataPath, setAppDataPath] = useState('');
  const [appVersionInfo, setAppVersionInfo] = useState({ version: '1.0.0', lastUpdated: '' });
  
  const [isTestingSplash, setIsTestingSplash] = useState(false);
  const [shouldCrash, setShouldCrash] = useState(false);
  const [flamesResetSuccess, setFlamesResetSuccess] = useState(false);
  const [updateChannel, setUpdateChannel] = useState(getConfigKey('updateChannel') || 'main');
  const [logCopied, setLogCopied] = useState(false);
  const [showLogsConsole, setShowLogsConsole] = useState(false);

  // Developer Discord Bot Management States
  const [devKeyInput, setDevKeyInput] = useState('');
  const [showDevKey, setShowDevKey] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(getConfigKey('devAdminModeEnabled') ?? false);
  const [keyStatusMsg, setKeyStatusMsg] = useState({ text: '', type: 'info' });

  useEffect(() => {
    if (window.electronAPI?.dev) {
      window.electronAPI.dev.hasKey().then(has => {
        setHasSavedKey(has);
        if (has) {
          window.electronAPI.dev.getKey().then(k => {
            if (k) setDevKeyInput(k);
          });
        }
      });
    } else {
      const saved = localStorage.getItem('hub_dev_key');
      if (saved) {
        setHasSavedKey(true);
        setDevKeyInput(saved);
      }
    }
  }, []);

  const handleSaveDevKey = async () => {
    const trimmed = devKeyInput.trim();
    if (!trimmed || !/^([a-fA-F0-9]{32}|[a-fA-F0-9]{64})$/.test(trimmed)) {
      setKeyStatusMsg({ text: 'Ключ должен содержать 32 или 64 hex-символа!', type: 'error' });
      setTimeout(() => setKeyStatusMsg({ text: '', type: 'info' }), 4000);
      return;
    }
    if (window.electronAPI?.dev) {
      const res = await window.electronAPI.dev.saveKey(trimmed);
      if (res && res.success) {
        setHasSavedKey(true);
        setKeyStatusMsg({ text: 'Ключ успешно сохранен!', type: 'success' });
      } else {
        setKeyStatusMsg({ text: 'Ошибка сохранения: ' + (res?.error || 'Неизвестная ошибка'), type: 'error' });
      }
    } else {
      localStorage.setItem('hub_dev_key', trimmed);
      setHasSavedKey(true);
      setKeyStatusMsg({ text: 'Сохранено локально', type: 'success' });
    }
    setTimeout(() => setKeyStatusMsg({ text: '', type: 'info' }), 4000);
  };

  const handleRemoveDevKey = async () => {
    if (window.electronAPI?.dev) {
      await window.electronAPI.dev.removeKey();
    }
    localStorage.removeItem('hub_dev_key');
    setDevKeyInput('');
    setHasSavedKey(false);
    setKeyStatusMsg({ text: 'Ключ удален', type: 'info' });
    setTimeout(() => setKeyStatusMsg({ text: '', type: 'info' }), 3000);
  };

  const handleToggleAdminMode = (enabled) => {
    setAdminModeEnabled(enabled);
    setConfigKey('devAdminModeEnabled', enabled);
  };

  const handleCopyLogs = async () => {
    try {
      const text = await getRecentLogs();
      await navigator.clipboard.writeText(text);
      setLogCopied(true);
      setTimeout(() => setLogCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy logs:', e);
    }
  };



  const handleChannelChange = async (channel) => {
    setUpdateChannel(channel);
    setConfigKey('updateChannel', channel);
    await triggerUpdateCheck();
  };

  const compareVersions = (v1, v2) => compareSemver(v1, v2);
  const isTestBuild = serverVersion && compareVersions(appVersionInfo.version, serverVersion) > 0;


  if (shouldCrash) {
    throw new Error('Test crash for ErrorBoundary');
  }

  useEffect(() => {
    getHardwareInfo().then(setHwInfo);
    setFirstLaunch(getConfigKey('firstLaunchDate') || 'Unknown');
    setRustPath(getConfigKey('rustPath') || 'Not Set');
    getAppPath().then(setAppPath);
    getAppDataPath().then(setAppDataPath);
    getAppVersionInfo().then(setAppVersionInfo);
    setStats(getButtonStats());
  }, []);

  const pingWebSocket = (url) => {
    return new Promise((resolve) => {
      const start = Date.now();
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => {
        ws.close();
        resolve({ status: 'error', msg: 'Timeout' });
      }, 3000);
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({ status: 'ok', time: Date.now() - start, msg: 'Connected' });
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({ status: 'error', msg: 'Failed' });
      };
    });
  };

  const runPings = async () => {
    setPings({ server: { status: 'loading' }, ws: { status: 'loading' }, github: { status: 'loading' }, discord: { status: 'loading' }, internet1: { status: 'loading' }, internet2: { status: 'loading' } });
    
    // Ping our HTTPS domain server
    const resServer = await pingUrl('https://industrial-hub.duckdns.org');
    setPings(p => ({ ...p, server: resServer }));

    // Ping WS Server
    const resWs = await pingWebSocket('wss://industrial-hub.duckdns.org');
    setPings(p => ({ ...p, ws: resWs }));
    
    const resGithub = await pingUrl('https://api.github.com');
    setPings(p => ({ ...p, github: resGithub }));
    
    const resDiscord = await pingUrl('https://discord.com');
    setPings(p => ({ ...p, discord: resDiscord }));
    
    const resInt1 = await pingUrl('https://one.one.one.one');
    setPings(p => ({ ...p, internet1: resInt1 }));
    
    const resInt2 = await pingUrl('https://ya.ru');
    setPings(p => ({ ...p, internet2: resInt2 }));
  };

  const handleOpenPath = (targetPath) => {
    if (!targetPath || targetPath === 'Not Set' || targetPath === 'Unknown') return;
    window.electronAPI?.shell?.openPath(targetPath);
  };

  const runIntegrity = async () => {
    setIntegrity({ status: 'loading' });
    setRustIntegrity({ status: 'loading' });
    const [resApp, resRust] = await Promise.all([
      checkAppIntegrity(),
      checkRustIntegrity(rustPath)
    ]);
    setIntegrity(resApp);
    setRustIntegrity(resRust);
  };
 
  const handleResetFlames = async () => {
    if (!await showConfirm({
      title: t('dev_reset_flames', 'Сброс популярности конвейеров'),
      message: t('dev_reset_flames_confirm'),
      danger: true
    })) return;
    let savedConveyors = getConfigKey('conveyorTemplates');
    if (!savedConveyors || !Array.isArray(savedConveyors) || savedConveyors.length === 0) {
      savedConveyors = defaultConveyors || [];
    }
    const updated = savedConveyors.map(c => ({ ...c, copyCount: 0 }));
    setConfigKey('conveyorTemplates', updated);
    setFlamesResetSuccess(true);
    setTimeout(() => setFlamesResetSuccess(false), 3000);
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}${t('time_hours')} ${m}${t('time_mins')} ${s}${t('time_secs')}`;
  };

  const formatOS = (info) => {
    if (!info) return '';
    let name = info.osName;
    if (!name) {
      if (info.platform === 'win32') {
        const build = parseInt((info.release || '').split('.')[2], 10);
        if (!isNaN(build)) {
          if (build >= 22000) name = 'Windows 11';
          else if (build >= 10240) name = 'Windows 10';
          else if (build >= 9600) name = 'Windows 8.1';
          else if (build >= 9200) name = 'Windows 8';
          else if (build >= 7600) name = 'Windows 7';
          else name = 'Windows';
        } else {
          name = 'Windows';
        }
      } else if (info.platform === 'darwin') {
        name = 'macOS';
      } else if (info.platform === 'linux') {
        name = 'Linux';
      } else {
        name = info.platform || 'Unknown';
      }
    }
    return `${name} (${info.release} ${info.arch})`;
  };

  const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mb-8 max-w-5xl 2xl:max-w-6xl mx-auto pb-12 animate-main-fade-in px-2 sm:px-4">
      {isTestingSplash && <SplashScreen onComplete={() => setIsTestingSplash(false)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button 
          type="button"
          onClick={() => navigate('/settings')} 
          className="group p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-orange-400/60 dark:hover:border-orange-500/50 shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
          title={t('back', 'Назад')}
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:-translate-x-1 transition-all duration-200" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('developer_title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('developer_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Network & APIs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dev_ping_title')}</h3>
          </div>
          <button onClick={runPings} className="mb-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
            {t('dev_ping_run')}
          </button>
          <div className="space-y-3">
            <PingResult label="Industrial Hub Server" res={pings.server} />
            <PingResult label="Industrial Hub WebSockets" res={pings.ws} />
            <PingResult label={t('dev_ping_update')} res={pings.github} />
            <PingResult label={t('dev_ping_support')} res={pings.discord} />
            <PingResult label={t('dev_ping_internet')} res={pings.internet1} />
            <PingResult label={t('dev_ping_yandex')} res={pings.internet2} />
          </div>
        </div>

        {/* Hardware & OS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dev_system_title')}</h3>
          </div>
          {hwInfo ? (
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">{t('dev_sys_pc')}</span> {hwInfo.pcName}</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">{t('dev_sys_os')}</span> {formatOS(hwInfo)}</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">{t('dev_sys_cpu')}</span> {hwInfo.cpu} ({hwInfo.cores} {t('dev_sys_cores')})</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">{t('dev_sys_gpu')}</span> {hwInfo.gpu}</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">{t('dev_sys_ram')}</span> {hwInfo.ramTotal} {t('dev_sys_total')} / {hwInfo.ramFree} {t('dev_sys_free')}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Clock className="w-4 h-4 text-purple-500" />
                <span><span className="font-semibold text-slate-800 dark:text-slate-200">{t('dev_sys_uptime')}</span> {formatUptime(hwInfo?.systemUptime)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">{t('dev_sys_error')}</p>
          )}
        </div>

        {/* Integrity & Paths */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dev_path_title')}</h3>
          </div>
          <div className="space-y-2.5 mb-4">
            {/* Rust Path */}
            <button
              type="button"
              onClick={() => handleOpenPath(rustPath)}
              disabled={!rustPath || rustPath === 'Not Set'}
              className="w-full group flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 dark:bg-slate-800/40 dark:hover:bg-orange-950/20 border border-slate-200/60 hover:border-orange-300 dark:border-slate-800 dark:hover:border-orange-800/50 transition-all text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs"
              title={t('dev_open_in_explorer', 'Нажмите, чтобы открыть в проводнике')}
            >
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {t('dev_path_rust')}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 break-all transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 group-hover:decoration-orange-500">
                  {rustPath || t('dev_not_set', 'Не задан')}
                </span>
              </div>
            </button>

            {/* App Path */}
            <button
              type="button"
              onClick={() => handleOpenPath(appPath)}
              disabled={!appPath}
              className="w-full group flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 dark:bg-slate-800/40 dark:hover:bg-orange-950/20 border border-slate-200/60 hover:border-orange-300 dark:border-slate-800 dark:hover:border-orange-800/50 transition-all text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs"
              title={t('dev_open_in_explorer', 'Нажмите, чтобы открыть в проводнике')}
            >
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {t('dev_path_app')}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 break-all transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 group-hover:decoration-orange-500">
                  {appPath || t('dev_not_set', 'Не задан')}
                </span>
              </div>
            </button>

            {/* App Data Path */}
            <button
              type="button"
              onClick={() => handleOpenPath(appDataPath)}
              disabled={!appDataPath}
              className="w-full group flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 dark:bg-slate-800/40 dark:hover:bg-orange-950/20 border border-slate-200/60 hover:border-orange-300 dark:border-slate-800 dark:hover:border-orange-800/50 transition-all text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs"
              title={t('dev_open_in_explorer', 'Нажмите, чтобы открыть в проводнике')}
            >
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {t('dev_app_data', 'Данные приложения (Настройки, Аналитика):')}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 break-all transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 group-hover:decoration-orange-500">
                  {appDataPath || t('dev_not_set', 'Не задан')}
                </span>
              </div>
            </button>
          </div>
          <button onClick={runIntegrity} className="mb-4 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            {t('dev_path_check_btn2')}
          </button>
          
          {integrity && (
            <div className="space-y-4 mt-4">
              {/* App Integrity */}
              <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">{t('dev_app_integrity')}</h4>
                {integrity.status === 'loading' ? (
                  <IntegrityCheckSkeleton rows={4} />
                ) : (
                  <>
                    <div className={`font-bold ${integrity.status === 'ok' ? 'text-green-500' : 'text-red-500'}`}>
                      {t('dev_path_overall')} {integrity.status === 'ok' ? t('dev_path_status_ok') : t('dev_path_status_fail')}
                    </div>
                    {integrity.details?.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => d.fullPath && handleOpenPath(d.fullPath)}
                        disabled={!d.exists}
                        className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${
                          d.exists 
                            ? 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer group' 
                            : 'opacity-70 cursor-not-allowed'
                        }`}
                        title={d.fullPath ? `${t('dev_open_in_explorer', 'Открыть в проводнике')}: ${d.fullPath}` : ''}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-xs font-mono transition-colors ${
                            d.exists 
                              ? 'text-slate-700 dark:text-slate-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:underline' 
                              : 'text-slate-400'
                          }`}>
                            {d.name}
                          </span>
                          {d.exists && (
                            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                        {d.exists ? (
                          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Rust Integrity */}
              <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">{t('dev_rust_integrity')}</h4>
                {rustIntegrity?.status === 'loading' ? (
                  <IntegrityCheckSkeleton rows={4} />
                ) : rustIntegrity ? (
                  <>
                    <div className={`font-bold ${rustIntegrity.status === 'ok' ? 'text-green-500' : 'text-red-500'}`}>
                      {t('dev_status_word', 'Статус: ')}{rustIntegrity.status === 'ok' ? t('dev_status_ok_all') : t('dev_status_fail_missing')}
                    </div>
                    {rustIntegrity.details?.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => d.fullPath && handleOpenPath(d.fullPath)}
                        disabled={!d.exists}
                        className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${
                          d.exists 
                            ? 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer group' 
                            : 'opacity-70 cursor-not-allowed'
                        }`}
                        title={d.fullPath ? `${t('dev_open_in_explorer', 'Открыть в проводнике')}: ${d.fullPath}` : ''}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-xs font-mono transition-colors ${
                            d.exists 
                              ? 'text-slate-700 dark:text-slate-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:underline' 
                              : 'text-slate-400'
                          }`}>
                            {d.name}
                          </span>
                          {d.exists && (
                            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                        {d.exists ? (
                          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Update Management & Versions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('dev_update_center_title', 'Центр обновлений')}
                </h3>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                updateChannel === 'test' 
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {updateChannel === 'test' ? 'TEST BRANCH' : 'MAIN BRANCH'}
              </span>
            </div>

            {/* Version Meta */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[11px]">{t('dev_local_version', 'Версия приложения')}:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  v{appVersionInfo.version}
                  {isTestBuild && <span className="text-orange-500 font-bold ml-1.5">(Тест)</span>}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t('dev_server_version', 'Ветка на сервере')}:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {serverVersion ? `v${serverVersion}` : t('dev_loading', 'Загрузка...')}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>{t('dev_last_updated', 'Дата сборки')}:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {appVersionInfo.lastUpdated ? new Date(appVersionInfo.lastUpdated).toLocaleString() : t('dev_not_updated', 'Не обновлялось')}
                </span>
              </div>
            </div>

            {/* Update Channel Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('settings_update_channel', 'Канал обновлений')}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleChannelChange('main')}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    updateChannel === 'main'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-100 ring-2 ring-orange-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{t('settings_update_main', 'Стабильная')}</span>
                    {updateChannel === 'main' && <Check className="w-3.5 h-3.5 text-orange-500 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Только стабильные проверенные релизы
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelChange('test')}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    updateChannel === 'test'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{t('settings_update_test', 'Тестовая')}</span>
                    {updateChannel === 'test' && <Check className="w-3.5 h-3.5 text-purple-500 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Тестовые предрелизы и стабильные
                  </p>
                </button>
              </div>
            </div>

            {/* Update Status / Progress */}
            <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">{t('dev_status_label', 'Статус:')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {updateProgress?.status === 'downloading'
                    ? 'Скачивание обновления...'
                    : updateProgress?.status === 'extracting'
                    ? 'Применение и распаковка...'
                    : updateProgress?.status === 'deferred'
                    ? 'Готово к установке'
                    : updateProgress?.status === 'error'
                    ? 'Ошибка обновления'
                    : t('dev_auto_update_active', 'Автоматическое обновление активно')}
                </span>
              </div>

              {(updateProgress?.status === 'downloading' || updateProgress?.status === 'extracting') && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${updateProgress.totalBytes ? Math.round((updateProgress.downloadedBytes / updateProgress.totalBytes) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px]">{updateProgress.currentFile}</span>
                    <span>{updateProgress.totalBytes ? Math.round((updateProgress.downloadedBytes / updateProgress.totalBytes) * 100) : 0}%</span>
                  </div>
                </div>
              )}

              {updateProgress?.status === 'error' && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {updateProgress.error || updateProgress.currentFile || t('dev_unknown_error')}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button 
              onClick={async () => {
                const btn = document.getElementById('forceCheckBtnIcon');
                const txt = document.getElementById('forceCheckBtnText');
                if (btn) btn.classList.add('animate-spin');
                if (txt) txt.innerText = t('dev_check_update_progress', 'Проверка...');
                await triggerUpdateCheck();
                if (btn) btn.classList.remove('animate-spin');
                if (txt) txt.innerText = t('dev_check_update_btn', 'Проверить обновления');
              }} 
              className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw id="forceCheckBtnIcon" className="w-3.5 h-3.5" /> 
              <span id="forceCheckBtnText">{t('dev_check_update_btn', 'Проверить обновления')}</span>
            </button>

            <button 
              type="button"
              disabled={isForceDownloading || updateProgress?.status === 'downloading' || updateProgress?.status === 'extracting'}
              onClick={async () => {
                setIsForceDownloading(true);
                try {
                  await triggerForceUpdate();
                } finally {
                  setIsForceDownloading(false);
                }
              }} 
              className="flex items-center justify-center gap-2 py-2 px-3 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
              title={t('dev_force_download_update_tooltip', 'Принудительно скачать и переустановить последний релиз из выбранной ветки')}
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${isForceDownloading || updateProgress?.status === 'downloading' ? 'animate-bounce' : ''}`} /> 
              <span>
                {isForceDownloading || updateProgress?.status === 'downloading'
                  ? t('dev_force_downloading_progress', 'Скачивание...')
                  : updateProgress?.status === 'extracting'
                  ? t('dev_force_extracting_progress', 'Установка...')
                  : t('dev_force_download_update_btn', 'Скачать принудительно')}
              </span>
            </button>
          </div>
        </div>

        {/* Debug Tools & Diagnostics (Full width card) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 col-span-1 md:col-span-2 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('dev_debug_tools_title', 'Инструменты отладки и диагностика')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('dev_debug_tools_desc', 'Тестирование экранов, экспорт логов, сброс кэша и аварийные инструменты')}
                </p>
              </div>
            </div>
            {updateLogs && updateLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLogsConsole(!showLogsConsole)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Консоль логов ({updateLogs.length})</span>
                {showLogsConsole ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button 
              type="button"
              onClick={() => setIsTestingSplash(true)} 
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-blue-500" />
              <span>{t('dev_app_test_splash', 'Тест Splash Screen')}</span>
            </button>

            <button 
              type="button"
              onClick={() => openLogFolder()} 
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold transition-colors border border-emerald-200/80 dark:border-emerald-800/50 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-emerald-500" />
              <span>{t('dev_open_log_folder', 'Открыть папку с логами')}</span>
            </button>

            <button 
              type="button"
              onClick={handleCopyLogs} 
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                logCopied 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
              }`}
            >
              {logCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-indigo-500" />}
              <span>{logCopied ? t('dev_copy_log_success', 'Лог скопирован!') : t('dev_copy_log_btn', 'Скопировать логи')}</span>
            </button>

            <button 
              type="button"
              onClick={handleResetFlames}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                flamesResetSuccess 
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                  : 'bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-500/20'
              }`}
            >
              {flamesResetSuccess ? <Check className="w-4 h-4" /> : <Flame className="w-4 h-4 text-orange-500" />}
              <span>{flamesResetSuccess ? t('dev_reset_flames_success', 'Огни сброшены!') : t('dev_reset_flames', 'Сбросить анимацию огней')}</span>
            </button>

            <button 
              type="button"
              onClick={() => setShouldCrash(true)} 
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition-colors hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200/60 dark:border-red-900/40 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>{t('dev_trigger_error', 'Вызвать CrashBoundary')}</span>
            </button>

            <button 
              type="button"
              onClick={async () => { 
                const confirmed = await showConfirm({
                  title: t('dev_factory_reset_btn', 'Сброс настроек (Factory Reset)'),
                  message: t('dev_factory_reset_confirm', 'Сбросить данные до заводских настроек? Программа будет перезапущена.'),
                  confirmText: t('confirm_btn', 'Сбросить'),
                  danger: true
                });
                if (confirmed) factoryReset(); 
              }} 
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-red-600/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('dev_factory_reset_btn', 'Сброс настроек (Reset)')}</span>
            </button>
          </div>

          {showLogsConsole && updateLogs && updateLogs.length > 0 && (
            <div className="mt-4 bg-slate-950 rounded-xl p-3.5 text-xs font-mono text-emerald-400 max-h-48 overflow-y-auto custom-scrollbar border border-slate-800 space-y-1">
              {updateLogs.map((log, i) => (
                <div key={i} className="leading-relaxed opacity-90">{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dev_stats_title')}</h3>
          </div>
          <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {sortedStats.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-2 rounded-l-lg">{t('dev_stats_btn')}</th>
                    <th className="px-4 py-2 rounded-r-lg w-24 text-right">{t('dev_stats_clicks')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map(([name, count]) => (
                    <tr key={name} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300 break-all" title={name}>{name}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900 dark:text-slate-100">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">{t('dev_stats_empty')}</p>
            )}
          </div>
        </div>

        {/* Discord Bot 24h Uptime Monitor (288 5-min intervals) */}
        <BotUptimeMonitor />

        {/* Discord Bot Admin & Guild Management Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 col-span-1 md:col-span-2 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('dev_discord_mgmt_title', 'Управление Discord-серверами (Режим разработчика)')}
                </h3>
              </div>
            </div>

            {/* Admin Mode Toggle */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {adminModeEnabled ? t('dev_admin_mode_active', 'Админ-мод активен') : t('dev_normal_mode', 'Обычный режим')}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {adminModeEnabled ? t('dev_admin_mode_hint', 'Выбор любого сервера в Clan Manager') : t('dev_normal_mode_hint', 'Только привязанный сервер')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAdminMode(!adminModeEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  adminModeEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    adminModeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  {t('dev_master_key_label', 'Ключ разработчика (DEV_MASTER_KEY)')}
                </span>
                <span className={`text-[11px] font-mono ${(devKeyInput.trim().length === 32 || devKeyInput.trim().length === 64) ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                  {devKeyInput.trim().length} / 64 {t('symbols', 'символов')}
                </span>
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showDevKey ? 'text' : 'password'}
                    value={devKeyInput}
                    onChange={(e) => setDevKeyInput(e.target.value)}
                    placeholder={t('dev_key_input_placeholder', 'Введите или вставьте 32- или 64-значный ключ...')}
                    maxLength={64}
                    className="w-full px-3.5 py-2 pr-10 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDevKey(!showDevKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showDevKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveDevKey}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {t('dev_save_key', 'Сохранить ключ')}
                </button>

                {hasSavedKey && (
                  <button
                    type="button"
                    onClick={handleRemoveDevKey}
                    title={t('dev_delete_key', 'Удалить ключ')}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {keyStatusMsg.text && (
              <div
                className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  keyStatusMsg.type === 'error'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {keyStatusMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                <span>{keyStatusMsg.text}</span>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {t('status', 'Статус')}: {hasSavedKey ? <strong className="text-emerald-500">{t('dev_key_active', 'Ключ активен на этом ПК')}</strong> : <strong className="text-amber-500">{t('dev_key_not_configured', 'Ключ не настроен')}</strong>}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {t('dev_transfer_protocol_hint', 'Передача: HMAC-SHA256 Challenge-Response (защита от перехвата)')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PingResult = ({ label, res }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <div className="text-sm font-medium">
        {!res ? (
          <span className="text-slate-400">{t('dev_ping_wait')}</span>
        ) : res.status === 'loading' ? (
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 animate-pulse text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>{t('dev_ping_check') || 'Проверка...'}</span>
          </div>
        ) : res.status === 'ok' ? (
          <span className="text-green-500">{res.time}ms ({res.msg})</span>
        ) : res.status === 'warning' ? (
          <span className="text-orange-500">{res.time}ms ({res.msg})</span>
        ) : (
          <span className="text-red-500">{t('dev_ping_err')} {res.msg}</span>
        )}
      </div>
    </div>
  );
};

