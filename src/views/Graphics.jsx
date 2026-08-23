import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MonitorPlay, CheckCircle, Save, Shield, Clock, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getConfigKey, setConfigKey } from '../services/store';
import { applyGraphicsPreset, getGraphicsBackups, createGraphicsBackup, restoreGraphicsBackup, ensureOriginalGraphicsBackup } from '../services/configManager';
import SupportTicketModal from '../components/SupportTicketModal';

export default function Graphics() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rustPath = getConfigKey('rustPath');
  const [activePreset, setActivePreset] = React.useState(getConfigKey('activeGraphicsPreset') || 'Custom');
  const [activeTab, setActiveTab] = React.useState('presets'); // presets, backups
  const [backups, setBackups] = React.useState([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);

  const loadBackups = React.useCallback(async () => {
    if (rustPath) {
      await ensureOriginalGraphicsBackup();
      setBackups(await getGraphicsBackups());
    }
  }, [rustPath]);

  React.useEffect(() => {
    if (rustPath) {
      loadBackups();
    }
  }, [rustPath, loadBackups]);

  const handleApplyPreset = async (preset) => {
    if (!rustPath) {
      alert(t('error_rust_path_desc'));
      return;
    }
    
    // Create auto-backup with preset name
    const presetLabel = preset === 'Custom' ? 'Свои настройки' : preset;
    await createGraphicsBackup(`${t('graphics_auto_backup')} (${presetLabel})`);
    
    let result;
    if (preset === 'Custom') {
      result = await restoreGraphicsBackup('client_original_backup.cfg');
    } else {
      result = await applyGraphicsPreset(preset);
    }
    
    if (result.success) {
      loadBackups();
      setActivePreset(preset);
      setConfigKey('activeGraphicsPreset', preset);
    } else if (result.error === 'rust_running') {
      alert(t('rust_running_error'));
    } else {
      alert(t('graphics_error'));
    }
  };

  const handleCreateBackup = async () => {
    if (!rustPath) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const name = `${t('graphics_manual_backup')} (${timeStr})`;
    await createGraphicsBackup(name);
    await loadBackups();
    alert(t('graphics_backup_created'));
  };

  const handleRestoreBackup = async (filename) => {
    if (!rustPath) return;
    if (window.confirm(t('graphics_backup_restore_confirm'))) {
      const result = await restoreGraphicsBackup(filename);
      if (result.success) {
        loadBackups();
        alert(t('graphics_backup_restored'));
      } else if (result.error === 'rust_running') {
        alert(t('rust_running_error'));
      } else {
        alert("Ошибка при восстановлении бэкапа.");
      }
    }
  };

  const renderContent = () => {
    if (activeTab === 'presets') {
      const presetsList = [
        { id: 'Custom', title: t('graphics_preset_custom'), desc: t('graphics_preset_custom_desc') },
        { id: 'Potato', title: t('graphics_preset_potato'), desc: t('graphics_preset_potato_desc') },
        { id: 'Medium', title: t('graphics_preset_medium'), desc: t('graphics_preset_medium_desc') },
        { id: 'Ultra', title: t('graphics_preset_ultra'), desc: t('graphics_preset_ultra_desc') }
      ];

      return (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          {presetsList.map((preset) => (
            <div 
              key={preset.id} 
              onClick={() => handleApplyPreset(preset.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors flex flex-col group ${
                activePreset === preset.id 
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' 
                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{preset.title}</h3>
                {activePreset === preset.id ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 animate-in fade-in zoom-in" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-emerald-500 transition-colors"></div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{preset.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl shrink-0">
          <p className="text-sm text-slate-500">{t('graphics_suggest_error_text', 'Заметили ошибку в настройках или хотите предложить свои?')}</p>
          <button 
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            {t('graphics_suggest_edit_btn', 'Предложить правку')}
          </button>
        </div>
        </>
      );
    }

    if (activeTab === 'backups') {
      return (
        <div className="mb-2">
          <div className="flex justify-end mb-4">
            <button 
              onClick={handleCreateBackup}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              {t('graphics_backup_create')}
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
                      {bkp.isOriginal ? t('graphics_original_backup') : bkp.name}
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
          {t('graphics_title')}
        </h1>
      </div>
      
      {!rustPath ? (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">{t('error_rust_path')}</h4>
          <p className="text-xs text-red-500 dark:text-red-300">{t('error_rust_path_desc')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold dark:text-slate-100">{t('graphics_title')}</h2>
              <p className="text-sm text-slate-500">{t('graphics_desc')}</p>
            </div>
          </div>

          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'presets'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t('graphics_tab_presets')}
            </button>
            <button
              onClick={() => setActiveTab('backups')}
              className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'backups'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t('graphics_tab_backups')}
            </button>
          </div>

          {renderContent()}
        </div>
      )}
      <SupportTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />
    </div>
  );
}
