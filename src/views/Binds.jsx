import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Keyboard, BookOpen, History, RefreshCcw, Save, Clock, Shield, AlertTriangle, Settings,
  Zap, Pickaxe, ArrowDown, Waves, Eye, Crosshair, Map, MousePointer, Ban, Skull, RotateCcw, LogOut,
  Trash2, ShieldAlert, Activity, VolumeX, Volume2, MicOff, EyeOff, Maximize2, Droplets, HeartPulse,
  Syringe, Search, X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getConfigKey, setConfigKey } from '../services/store';
import { autoDetectRustPath } from '../services/rustPath';
import { saveBind, getBinds, ensureOriginalBackup, getBackups, createBackup, restoreBackup } from '../services/configManager';
import { bindSignatures } from '../services/bindAnalyzer';
import SuggestBindModal from '../components/SuggestBindModal';
import FullKeyboard from '../components/FullKeyboard';
import { showConfirm } from '../components/ConfirmModal';
import { useNotification } from '../contexts/NotificationContext';

const getColorClasses = (color) => {
  const map = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-500',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
    sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-500',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-500',
    stone: 'bg-stone-100 dark:bg-stone-800 text-stone-500',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500',
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-500',
  };
  return map[color] || 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500';
};

const getBindIcon = (icon) => {
  switch (icon) {
    case 'run': return <Zap className="w-5 h-5" />;
    case 'pickaxe': return <Pickaxe className="w-5 h-5" />;
    case 'crouch':
    case 'arrow-down': return <ArrowDown className="w-5 h-5" />;
    case 'waves': return <Waves className="w-5 h-5" />;
    case 'zoom':
    case 'eye': return <Eye className="w-5 h-5" />;
    case 'crosshair': return <Crosshair className="w-5 h-5" />;
    case 'map': return <Map className="w-5 h-5" />;
    case 'cursor': return <MousePointer className="w-5 h-5" />;
    case 'cancel': return <Ban className="w-5 h-5" />;
    case 'skull': return <Skull className="w-5 h-5" />;
    case 'respawn': return <RotateCcw className="w-5 h-5" />;
    case 'log-out': return <LogOut className="w-5 h-5" />;
    case 'trash': return <Trash2 className="w-5 h-5" />;
    case 'shield': return <ShieldAlert className="w-5 h-5" />;
    case 'activity': return <Activity className="w-5 h-5" />;
    case 'volume-x': return <VolumeX className="w-5 h-5" />;
    case 'volume-low': return <Volume2 className="w-5 h-5" />;
    case 'mic-off': return <MicOff className="w-5 h-5" />;
    case 'refresh-ccw': return <RefreshCcw className="w-5 h-5" />;
    case 'monitor-off': return <EyeOff className="w-5 h-5" />;
    case 'lookatradius': return <Maximize2 className="w-5 h-5" />;
    case 'water': return <Droplets className="w-5 h-5" />;
    case 'bandage': return <HeartPulse className="w-5 h-5" />;
    case 'syringe': return <Syringe className="w-5 h-5" />;
    default: return <BookOpen className="w-5 h-5" />;
  }
};

export default function Binds() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [rustPath, setRustPath] = React.useState(getConfigKey('rustPath') || '');
  const [binds, setBinds] = React.useState({});
  const [gammaBind, setGammaBind] = React.useState(getConfigKey('gammaBind') || 'END');
  
  const [activeTab, setActiveTab] = React.useState('keyboard'); // keyboard, catalog, backups
  const [backups, setBackups] = React.useState([]);
  
  const [bindingCommand, setBindingCommand] = React.useState(null); // The command we are trying to bind from catalog
  const [isSuggestModalOpen, setIsSuggestModalOpen] = React.useState(false);
  const [highlightEmpty, setHighlightEmpty] = React.useState(false);
  const [manualBindKey, setManualBindKey] = React.useState(null);
  const [manualBindCommand, setManualBindCommand] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadBinds = React.useCallback(async () => {
    if (rustPath) {
      await ensureOriginalBackup();
      const currentBinds = await getBinds();
      setBinds(currentBinds || {});
      setBackups(await getBackups());
      setGammaBind(getConfigKey('gammaBind') || 'END');
    }
  }, [rustPath]);

  React.useEffect(() => {
    let mounted = true;
    if (!rustPath) {
      autoDetectRustPath().then((detected) => {
        if (mounted && detected) {
          setRustPath(detected);
          setConfigKey('rustPath', detected);
        }
      });
    } else {
      loadBinds();
    }
    return () => { mounted = false; };
  }, [rustPath, loadBinds]);

  const handleKeyClick = async (key) => {
    if (!rustPath) {
      addNotification(t('error_rust_path_desc'), 'error');
      return;
    }

    let commandToSave = bindingCommand;
    
    // If not in catalog-bind mode, show inline editor
    if (!commandToSave) {
      setManualBindKey(key);
      setManualBindCommand(binds[key] || '');
      return;
    }

    // Warnings
    if (key === gammaBind) {
      const confirmed = await showConfirm({
        title: t('binds_warn_title', 'Предупреждение о бинде'),
        message: t('binds_warn_gamma'),
        danger: false
      });
      if (!confirmed) {
        setHighlightEmpty(false);
        setBindingCommand(null);
        return;
      }
    } else if (binds[key]) {
      const confirmed = await showConfirm({
        title: t('binds_warn_title', 'Конфликт бинда'),
        message: `${t('binds_warn_conflict')}\n${binds[key]}`,
        danger: false
      });
      if (!confirmed) {
        setHighlightEmpty(false);
        setBindingCommand(null);
        return;
      }
    }

    // Auto-backup before applying catalog bind if we are in highlight mode
    if (bindingCommand) {
      createBackup(t('binds_auto_backup'));
    }

    const result = await saveBind(key, commandToSave);
    if (result.success) {
      loadBinds();
      addNotification(t('binds_saved_success', 'Бинд успешно сохранен'), 'success');
    } else if (result.error === 'rust_running') {
      addNotification(t('rust_running_error'), 'error');
    } else {
      addNotification(t('binds_error'), 'error');
    }

    // Reset modes
    setHighlightEmpty(false);
    setBindingCommand(null);
  };

  const handleCreateBackup = async () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const name = `${t('binds_manual_backup')} (${timeStr})`;
    await createBackup(name);
    await loadBinds();
    addNotification(t('binds_backup_created'), 'success');
  };

  const handleRestoreBackup = async (filename) => {
    if (!rustPath) return;
    const confirmed = await showConfirm({
      title: t('binds_backup_restore_title', 'Восстановление биндов'),
      message: t('binds_backup_restore_confirm'),
      confirmText: t('confirm_btn', 'Восстановить'),
      danger: false
    });
    if (confirmed) {
      const result = await restoreBackup(filename);
      if (result.success) {
        loadBinds();
        addNotification(t('binds_backup_restored'), 'success');
      } else if (result.error === 'rust_running') {
        addNotification(t('rust_running_error'), 'error');
      } else {
        addNotification(t('binds_error_restore', 'Ошибка при восстановлении бэкапа.'), 'error');
      }
    }
  };

  const handleUseCatalogItem = (command) => {
    setBindingCommand(command);
    setHighlightEmpty(true);
    setActiveTab('keyboard');
  };

  const cancelBinding = () => {
    setBindingCommand(null);
    setHighlightEmpty(false);
  };

  const handleSaveManualBind = async () => {
    if (!manualBindKey) return;
    if (manualBindCommand.trim() === '') {
      // If empty, they probably want to unbind, which we could support, or just skip
      // For now, if empty, we can just save it as empty or delete it. Let's just save empty.
    }
    const result = await saveBind(manualBindKey, manualBindCommand);
    if (result.success) {
      loadBinds();
      setManualBindKey(null);
      addNotification(t('binds_saved_success', 'Бинд успешно сохранен'), 'success');
    } else if (result.error === 'rust_running') {
      addNotification(t('rust_running_error'), 'error');
    } else {
      addNotification(t('binds_error'), 'error');
    }
  };

  const renderContent = () => {
    if (activeTab === 'keyboard') {
      return (
        <div className="flex flex-col mb-2">
          {highlightEmpty && (
            <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between gap-3 animate-pulse shadow-md mb-3">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                {t('binds_select_key_hint')}
              </span>
              <button onClick={cancelBinding} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-xs font-semibold transition-colors">
                {t('cancel')}
              </button>
            </div>
          )}

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 overflow-x-auto">
            <FullKeyboard 
              binds={binds} 
              onKeyClick={handleKeyClick} 
              gammaBind={gammaBind}
              highlightEmpty={highlightEmpty}
            />

            <div className="flex gap-4 mt-3 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div> {t('binds_legend_gamma')}</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500"></div> {t('binds_legend_rust')}</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"></div> {t('binds_legend_free')}</div>
            </div>
            
            {manualBindKey && !highlightEmpty && (
              <div className="w-full mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-500/30 shadow-sm animate-main-fade-in flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                    {t('binds_prompt')} <span className="text-indigo-500">{manualBindKey}</span>
                  </label>
                  <input
                    type="text"
                    value={manualBindCommand}
                    onChange={(e) => setManualBindCommand(e.target.value)}
                    placeholder="forward;sprint"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setManualBindKey(null)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleSaveManualBind}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm shadow-indigo-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {t('save')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'catalog') {
      const filteredBinds = bindSignatures.filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const title = (t('bind_sig_' + item.id, item.name) || '').toLowerCase();
        const desc = (t('bind_desc_' + item.id, item.desc) || '').toLowerCase();
        const cmd = (item.command || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || cmd.includes(q);
      });

      const shortBinds = filteredBinds.filter(item => !item.isLong);
      const longBinds = filteredBinds.filter(item => item.isLong);

      const renderBindCard = (item, i) => (
        <div key={item.id || i} className="flex flex-col bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors group shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorClasses(item.color)} shrink-0`}>
              {getBindIcon(item.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate" title={t('bind_sig_' + item.id, item.name)}>
                {t('bind_sig_' + item.id, item.name)}
              </h4>
              {item.desc && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={t('bind_desc_' + item.id, item.desc)}>
                  {t('bind_desc_' + item.id, item.desc)}
                </p>
              )}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap border border-slate-100 dark:border-slate-800/60">
            bind [key] "{item.command}"
          </div>
          <button 
            onClick={() => handleUseCatalogItem(item.command)}
            className="mt-auto w-full py-2 bg-slate-100 hover:bg-indigo-500 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors cursor-pointer"
          >
            {t('binds_use')}
          </button>
        </div>
      );

      return (
        <div className="mb-6 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl gap-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('binds_search_ph', 'Поиск бинда...')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-9 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsSuggestModalOpen(true)}
              className="px-5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-sm font-bold transition-all shadow-sm w-full sm:w-auto shrink-0 cursor-pointer text-center"
            >
              {t('suggest_bind_title', 'Предложить свой бинд')}
            </button>
          </div>

          {filteredBinds.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">{t('binds_not_found', 'Ничего не найдено по вашему запросу')}</p>
            </div>
          ) : (
            <>
              {/* Короткие бинды (3 колонки) */}
              {shortBinds.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {t('binds_cat_short', 'Короткие бинды')}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {shortBinds.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shortBinds.map(renderBindCard)}
                  </div>
                </div>
              )}

              {/* Длинные бинды (2 колонки) */}
              {longBinds.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {t('binds_cat_long', 'Длинные бинды')}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {longBinds.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {longBinds.map(renderBindCard)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'backups') {
      return (
        <div className="mb-6">
          <div className="flex justify-end mb-4">
            <button 
              onClick={handleCreateBackup}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              {t('binds_backup_create')}
            </button>
          </div>
          
          <div className="space-y-3">
            {backups.map((bkp) => (
              <div key={bkp.id} className={`flex items-center justify-between p-4 rounded-xl border ${bkp.isOriginal ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bkp.isOriginal ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {bkp.isOriginal ? <Shield className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`font-bold ${bkp.isOriginal ? 'text-orange-700 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {bkp.isOriginal ? t('graphics_original_backup') : (bkp.name === 'Ручной бэкап' ? t('binds_backup_manual') : bkp.name)}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(bkp.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRestoreBackup(bkp.filename)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {t('binds_backup_restore')}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4 animate-main-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('binds_title')}
        </h1>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold dark:text-slate-100">{t('binds_subtitle')}</h2>
            <p className="text-sm text-slate-500">{t('bind_key_hint')}</p>
          </div>
        </div>

        {!rustPath ? (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-6 flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">{t('error_rust_path')}</h3>
            <p className="text-sm text-red-600 dark:text-red-300 mb-6">{t('error_rust_path_desc')}</p>
            <Link to="/settings" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('go_to_settings')}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
              <button 
                onClick={() => { setActiveTab('keyboard'); cancelBinding(); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'keyboard' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <Keyboard className="w-4 h-4" />
                {t('binds_tab_keyboard')}
              </button>
              <button 
                onClick={() => { setActiveTab('catalog'); cancelBinding(); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'catalog' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <BookOpen className="w-4 h-4" />
                {t('binds_tab_catalog')}
              </button>
              <button 
                onClick={() => { setActiveTab('backups'); cancelBinding(); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'backups' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <History className="w-4 h-4" />
                {t('binds_tab_backups')}
              </button>
            </div>

            {renderContent()}
          </>
        )}
      </div>
      <SuggestBindModal 
        isOpen={isSuggestModalOpen} 
        onClose={() => setIsSuggestModalOpen(false)} 
      />
    </div>
  );
}
