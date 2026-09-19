import React, { useContext } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Sparkles, Unlink, Volume2, Mic, MicOff, VolumeX, Trash2, UserX, RefreshCw, Sliders, Radio,
  Settings, Users, Hash, ShieldCheck, UserPlus, Vote, Megaphone, UserCheck, BarChart3, Plus, Check,
  RotateCcw, AlertTriangle, ScrollText, ShieldAlert, Zap, CheckCheck, Ban, X, Bot, Clock, Filter,
  BookOpen, Star, Search, ExternalLink, Archive, ArrowUp, Eye, EyeOff, Copy, ChevronDown
} from 'lucide-react';
import RoleSelect from '../../components/RoleSelect';
import ChannelSelect from '../../components/ChannelSelect';
import { ToggleSwitch, SaveButton, isBotConfigured, fuzzyMatchScore, getBotSettingSearchScore, reportClanErrorToTelegram } from '../ClanManager';

export default function VotesTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  return (
    <>

              <form onSubmit={saveConfig} noValidate className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                    <Vote className="w-5 h-5 mr-2 text-blue-500" />
                    {t('clan_auto_52', 'Шаблоны серверов для голосований')}
                  </h3>
                  {isFullScreenWindow && (
                    <button
                      type="button"
                      onClick={() => setShowDiscordLivePreview(prev => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        showDiscordLivePreview
                          ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                      }`}
                      title={showDiscordLivePreview ? t('clan_auto_v2_1030', 'Скрыть живой предпросмотр Discord') : t('clan_auto_v2_1031', 'Показать живой предпросмотр Discord')}
                    >
                      {showDiscordLivePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showDiscordLivePreview ? t('clan_auto_v2_1032', 'Превью Discord') : t('clan_auto_v2_1033', 'Включить превью')}</span>
                    </button>
                  )}
                </div>

                {(() => {
                  let wTemplates = [];
                  try {
                    if (config.wipeTemplatesJson) {
                      wTemplates = JSON.parse(config.wipeTemplatesJson);
                    }
                  } catch(e) {}
                  
                  const updateTemplate = (index, key, val, immediate = false) => {
                    const newTemplates = [...wTemplates];
                    newTemplates[index] = { ...newTemplates[index], [key]: val };
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, immediate);
                  };

                  const addTemplate = () => {
                    const newTemplates = [...wTemplates, { name: 'Вайп на Растрории', description: 'Отметьтесь, пожалуйста, о вашем присутствии на вайпе!', isAnonymous: false, day: t('clan_auto_232', t('clan_thursday', 'Четверг')), time: '16:00', ip: '', banner: '' }];
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, true);
                  };

                  const removeTemplate = (index) => {
                    const newTemplates = wTemplates.filter((_, i) => i !== index);
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, true);
                  };

                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  const voteChannel = discordInfo?.channels?.find(c => c.id === cConfig.votes);
                  const channelName = voteChannel ? voteChannel.name : t('clan_default_vote_ch', 'голосования');

                  const safeIdx = Math.min(previewVoteIndex, Math.max(0, wTemplates.length - 1));
                  const activeTpl = wTemplates[safeIdx] || { 
                    name: 'Вайп на Растрории', 
                    day: t('clan_auto_233', t('clan_thursday', 'Четверг')), 
                    time: '16:00', 
                    ip: '', 
                    description: 'Отметьтесь, пожалуйста, о вашем присутствии на вайпе!',
                    banner: '',
                    isAnonymous: false
                  };
                  
                  return (
                    <div className="space-y-4">
                      {wTemplates.map((tpl, index) => (
                          <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30 relative">
                            <button type="button" onClick={() => removeTemplate(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_vote_title_label', 'Заголовок *')}</label>
                                <input 
                                  type="text" 
                                  required 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.name || ''} 
                                  onChange={e => updateTemplate(index, 'name', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'name', e.target.value, true)}
                                  placeholder="Вайп на Растрории" 
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_auto_54', 'День вайпа')}</label>
                                <select 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.day || t('clan_thursday', 'Четверг')} 
                                  onChange={e => updateTemplate(index, 'day', e.target.value, true)}
                                >
                                  <option value="Понедельник">{t('clan_auto_55', t('clan_monday', 'Понедельник'))}</option>
                                  <option value="Вторник">{t('clan_auto_56', t('clan_tuesday', 'Вторник'))}</option>
                                  <option value="Среда">{t('clan_auto_57', t('clan_wednesday', 'Среда'))}</option>
                                  <option value="Четверг">{t('clan_auto_58', t('clan_thursday', 'Четверг'))}</option>
                                  <option value="Пятница">{t('clan_auto_59', t('clan_friday', 'Пятница'))}</option>
                                  <option value="Суббота">{t('clan_auto_60', t('clan_saturday', 'Суббота'))}</option>
                                  <option value="Воскресенье">{t('clan_auto_61', t('clan_sunday', 'Воскресенье'))}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_auto_62', 'Время (МСК)')}</label>
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.time || ''} 
                                  onChange={e => updateTemplate(index, 'time', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'time', e.target.value, true)}
                                  placeholder="16:00" 
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_server_ip_label_opt', 'IP (connect ...) (опционально)')}</label>
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.ip || ''} 
                                  onChange={e => updateTemplate(index, 'ip', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'ip', e.target.value, true)}
                                  placeholder="connect 127.0.0.1:28015" 
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_auto_63', 'Ссылка на баннер')}</label>
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.banner || ''} 
                                  onChange={e => updateTemplate(index, 'banner', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'banner', e.target.value, true)}
                                  placeholder="https://i.imgur.com/..." 
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_vote_desc_label', 'Описание голосования')}</label>
                                <textarea
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                  rows="3"
                                  value={tpl.description || ''}
                                  onChange={e => updateTemplate(index, 'description', e.target.value, false)}
                                  onBlur={e => updateTemplate(index, 'description', e.target.value, true)}
                                  placeholder={t('clan_vote_desc_placeholder', 'Например: Подключаемся на мейн сервер после 16:00. Всем быть в дискорде!')}
                                />
                              </div>
                              <div className="md:col-span-2 flex items-center justify-between pt-2">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('clan_vote_anonymous_title', 'Анонимное голосование')}</label>
                                  <p className="text-xs text-slate-500">{t('clan_vote_anonymous_desc', 'Скрывает список проголосовавших, показывая только количество голосов.')}</p>
                                </div>
                                <ToggleSwitch 
                                  checked={tpl.isAnonymous === true} 
                                  onChange={() => updateTemplate(index, 'isAnonymous', tpl.isAnonymous !== true, true)} 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button type="button" onClick={addTemplate} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center font-medium">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          {t('clan_auto_64', 'Добавить шаблон сервера')}
                        </button>
                      </div>
                  );
                })()}
              </form>
            
    </>
  );
}
