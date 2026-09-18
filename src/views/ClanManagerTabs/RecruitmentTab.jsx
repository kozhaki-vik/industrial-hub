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

export default function RecruitmentTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  return (
    <>

              <form onSubmit={saveConfig} noValidate className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                    <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
                    {t('clan_auto_41', 'Настройки набора в клан')}
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
                      title={showDiscordLivePreview ? t('clan_auto_v2_1026', 'Скрыть живой предпросмотр Discord') : t('clan_auto_v2_1027', 'Показать живой предпросмотр Discord')}
                    >
                      {showDiscordLivePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showDiscordLivePreview ? t('clan_auto_v2_1028', 'Превью Discord') : t('clan_auto_v2_1029', 'Включить превью')}</span>
                    </button>
                  )}
                </div>
                
                {(() => {
                  const defaultRejectMsg = t('clan_recruitment_reject_msg_ph') || 'К сожалению, ваша анкета не соответствует минимальным требованиям клана...';
                  let rConfig = {
                    link: config?.discordLink || '',
                    banner: 'https://i.imgur.com/UaMfYMK.png',
                    title: config?.name ? `Набор в клан ${config.name}` : t('clan_rec_base', 'Набор в клан'),
                    text: t('clan_auto_v2_1023', 'Требования:\n\n**MAIN**\nВозраст: 20+\nЧасы: 5000+\nТребования: 8+ часов онлайна\nНавыки: Желательна универсальность\n\n**Билдер:**\nВозраст: 18+\nЧасы: 3000+\nТребования: 6+ часов онлайна\nНавыки: Умение быстро строить кастомные базы'),
                    customLeaderId: '',
                    autoRejectEnabled: false,
                    minAge: 0,
                    minHours: 0,
                    rejectBanned: true,
                    strictSteamCheck: false,
                    silentAutoReject: true,
                    autoRejectMessage: defaultRejectMsg
                  };
                  try {
                    if (config.recruitmentConfigJson) {
                      rConfig = { ...rConfig, ...JSON.parse(config.recruitmentConfigJson) };
                    }
                  } catch(e) {}

                  // If autoRejectMessage is empty or not set, pre-fill with defaultRejectMsg so it's ready to edit in the field
                  if (!rConfig.autoRejectMessage || !rConfig.autoRejectMessage.trim()) {
                    rConfig.autoRejectMessage = defaultRejectMsg;
                  }

                  // Keep title synchronized with actual clan name if title was old default / GODS
                  if (config?.name) {
                    if (!rConfig.title || rConfig.title === t('clan_rec_gods', 'Набор в клан GODS') || rConfig.title === t('clan_rec_base', 'Набор в клан')) {
                      rConfig.title = `${t('clan_recruit_title_prefix', 'Набор в клан')} ${config.name}`;
                    } else if (rConfig.title.includes('GODS')) {
                      rConfig.title = rConfig.title.replace(/\bGODS\b/g, config.name);
                    }
                  }
                  
                  const updateRConfig = (key, val, immediate = false) => {
                    const newConfig = { ...rConfig, [key]: val };
                    const updated = { ...config, recruitmentConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, immediate);
                  };

                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}

                  const updateChannelConfig = (key, val) => {
                    const newCConfig = { ...cConfig, [key]: val };
                    const updated = { ...config, channelsConfigJson: JSON.stringify(newCConfig) };
                    queueAutoSave(updated, true);
                  };
                  
                  const inviteLink = rConfig.link || config?.discordLink || 'https://discord.gg/clan';
                  const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                  const firstLeader = leaders[0];
                  const leaderDisplay = rConfig.customLeaderId 
                    ? `<@${rConfig.customLeaderId}>` 
                    : (firstLeader ? `@${firstLeader.displayName || firstLeader.username}` : `@${t('clan_role_leader', 'Лидер')}`);

                  const appChannel = discordInfo?.channels?.find(c => c.id === cConfig.applications);
                  const channelName = appChannel ? appChannel.name : t('clan_default_rec_ch', 'набор-в-клан');

                  return (
                    <div className="space-y-6">
                      {/* Основные параметры панели набора */}
                      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-orange-500" />
                          {t('clan_auto_42', 'Панель набора в Discord')}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                {t('clan_recruitment_server_link') || 'Ссылка на сервер для набора'}
                              </label>
                              <button
                                type="button"
                                onClick={handleCreateRecruitmentInvite}
                                disabled={creatingRecruitmentInvite}
                                title={t('clan_auto_101', 'Создать новую постоянную ссылку через бота и вставить в поле')}
                                className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <RefreshCw className={`w-3 h-3 ${creatingRecruitmentInvite ? 'animate-spin' : ''}`} />
                                <span>{t('clan_recruitment_link_refresh_btn') || 'Сгенерировать ссылку'}</span>
                              </button>
                            </div>
                            <div className="relative">
                              <input 
                                type="text" 
                                required
                                className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none transition-shadow text-sm ${
                                  recruitmentInviteStatus === 'invalid'
                                    ? 'border-red-400 dark:border-red-500/60 focus:ring-red-500/40'
                                    : recruitmentInviteStatus === 'valid'
                                    ? 'border-emerald-400 dark:border-emerald-500/60 focus:ring-emerald-500/40'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/50'
                                }`}
                                value={rConfig.link ?? (config?.discordLink ?? '')}
                                onChange={e => updateRConfig('link', e.target.value, false)}
                                onBlur={e => {
                                  const val = e.target.value;
                                  updateRConfig('link', val, true);
                                  if (val.trim()) {
                                    verifyRecruitmentInvite(val);
                                  } else {
                                    setRecruitmentInviteStatus(null);
                                  }
                                }}
                                placeholder="https://discord.gg/..."
                              />
                              {checkingRecruitmentInvite && (
                                <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>

                            {recruitmentInviteStatus === 'valid' && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>{t('clan_recruitment_link_valid') || 'Ссылка активна'}</span>
                              </div>
                            )}
                            {recruitmentInviteStatus === 'invalid' && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{t('clan_recruitment_link_invalid') || 'Ссылка недействительна или была удалена в Discord'}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('clan_auto_43', 'Ссылка на баннер (Изображение)')}</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
                              value={rConfig.banner}
                              onChange={e => updateRConfig('banner', e.target.value, false)}
                              onBlur={e => updateRConfig('banner', e.target.value, true)}
                              placeholder="https://i.imgur.com/..."
                            />
                          </div>
                        </div>

                        {/* Лидер клана в embed */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                              {t('clan_auto_44', 'Лидер клана (в embed-сообщении набора)')}
                            </label>
                            {rConfig.customLeaderId && (
                              <button
                                type="button"
                                onClick={() => updateRConfig('customLeaderId', '', true)}
                                className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                <span>{t('clan_auto_45', 'Стереть (вернуть авто-определение)')}</span>
                              </button>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {t('clan_leader_auto_desc', 'По умолчанию лидер определяется по назначенной роли Лидера в Discord:')}{' '}
                            {(() => {
                              const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                              if (leaders.length > 0) {
                                return (
                                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                                    {leaders.map((m, idx) => {
                                      const leaderId = m.userId || m.id;
                                      const leaderName = m.displayName || m.username;
                                      return (
                                        <span key={leaderId || idx} className="inline-flex items-center gap-1">
                                          <strong className="text-slate-800 dark:text-slate-200">{leaderName}</strong>
                                          {leaderId && (
                                            <button
                                              type="button"
                                              onClick={() => updateRConfig('customLeaderId', leaderId, true)}
                                              className="inline-flex items-center gap-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 hover:bg-orange-100 dark:bg-slate-700 dark:hover:bg-orange-950/60 text-slate-700 hover:text-orange-700 dark:text-slate-300 dark:hover:text-orange-300 transition-colors cursor-pointer"
                                              title={t('clan_auto_102', 'Нажмите, чтобы вставить этот ID в поле')}
                                            >
                                              <span>(ID: {leaderId})</span>
                                            </button>
                                          )}
                                          {idx < leaders.length - 1 ? ',' : ''}
                                        </span>
                                      );
                                    })}
                                  </span>
                                );
                              }
                              return <strong className="text-slate-700 dark:text-slate-300">{t('clan_auto_46', 'Роль не выдана ни одному участнику')}</strong>;
                            })()}
                            {t('clan_leader_manual_desc', '. Вы можете принудительно указать Discord ID пользователя:')}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-orange-500/50 font-mono"
                              placeholder={
                                (() => {
                                  const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                                  const firstId = leaders[0]?.userId || leaders[0]?.id;
                                  return firstId 
                                    ? `${t('clan_leader_id_ex', 'ID лидера (например: ')}${firstId})` 
                                    : t('clan_leader_id_placeholder', 'Укажите Discord ID пользователя (например: 718872288000000000)');
                                })()
                              }
                              value={rConfig.customLeaderId || ''}
                              onChange={e => updateRConfig('customLeaderId', e.target.value, false)}
                              onBlur={e => updateRConfig('customLeaderId', e.target.value, true)}
                            />
                            {(() => {
                              const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                              const firstId = leaders[0]?.userId || leaders[0]?.id;
                              if (firstId && (!rConfig.customLeaderId || rConfig.customLeaderId !== firstId)) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => updateRConfig('customLeaderId', firstId, true)}
                                    className="px-3 py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                    title={t('clan_auto_103', 'Вставить ID лидера по умолчанию')}
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>{t('clan_auto_47', 'Вставить ID')}</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            {rConfig.customLeaderId && (
                              <button
                                type="button"
                                onClick={() => updateRConfig('customLeaderId', '', true)}
                                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                title={t('clan_auto_104', 'Стереть')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('clan_auto_48', 'Заголовок Embed-сообщения *')}</label>
                          <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
                            value={rConfig.title}
                            onChange={e => updateRConfig('title', e.target.value, false)}
                            onBlur={e => updateRConfig('title', e.target.value, true)}
                            placeholder={config?.name ? `${t('clan_recruit_title_prefix', 'Набор в клан')} ${config.name}` : t('clan_recruit_default_title', "Набор в клан")}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('clan_auto_49', 'Текст с требованиями (Markdown поддерживается) *')}</label>
                          <textarea 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-xs min-h-[140px]"
                            value={rConfig.text}
                            onChange={e => updateRConfig('text', e.target.value, false)}
                            onBlur={e => updateRConfig('text', e.target.value, true)}
                            placeholder={t('clan_auto_110', 'Опишите требования...')}
                          ></textarea>
                        </div>
                      </div>

                      {/* Автоматическое отклонение заявок (Auto-Reject) */}
                      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
                              <Bot className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                                {t('clan_recruitment_auto_reject_title') || 'Автоматическое отклонение заявок'}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t('clan_recruitment_auto_reject_desc') || 'Бот автоматически проверяет анкеты кандидатов при подаче и отклоняет неподходящие заявки.'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Toggle Switch */}
                          <ToggleSwitch 
                            checked={!!rConfig.autoRejectEnabled}
                            onChange={val => updateRConfig('autoRejectEnabled', val, true)}
                            activeColor="orange"
                          />
                        </div>

                        {/* Settings Container */}
                        <div className={`space-y-4 pt-2 transition-opacity ${rConfig.autoRejectEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                                {t('clan_recruitment_min_age') || 'Минимальный возраст кандидата'}
                              </label>
                              <input 
                                type="number" 
                                min="0" 
                                max="99"
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
                                value={rConfig.minAge || ''}
                                onChange={e => updateRConfig('minAge', e.target.value ? parseInt(e.target.value, 10) : 0, false)}
                                onBlur={e => updateRConfig('minAge', e.target.value ? parseInt(e.target.value, 10) : 0, true)}
                                placeholder={t('clan_recruitment_min_age_ph') || 'Например: 18 (0 — без ограничений)'}
                              />
                              <p className="text-[11px] text-slate-400 mt-1">{t('clan_auto_50', 'Кандидаты младше этого возраста будут отклонены.')}</p>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                {t('clan_recruitment_min_hours') || 'Минимальное количество часов в игре'}
                              </label>
                              <input 
                                type="number" 
                                min="0" 
                                step="100"
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
                                value={rConfig.minHours || ''}
                                onChange={e => updateRConfig('minHours', e.target.value ? parseInt(e.target.value, 10) : 0, false)}
                                onBlur={e => updateRConfig('minHours', e.target.value ? parseInt(e.target.value, 10) : 0, true)}
                                placeholder={t('clan_recruitment_min_hours_ph') || 'Например: 2000 (0 — без ограничений)'}
                              />
                              <p className="text-[11px] text-slate-400 mt-1">{t('clan_recruitment_min_hours_hint') || 'Проверяется строго по анкете. В карточке суммируются реальные часы всех указанных Steam аккаунтов.'}</p>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
                                {t('clan_recruitment_reject_banned') || 'Автоматически отклонять игроков с VAC/Game блокировками'}
                              </span>
                              <ToggleSwitch
                                checked={rConfig.rejectBanned ?? true}
                                onChange={val => updateRConfig('rejectBanned', val, true)}
                                activeColor="orange"
                                size="sm"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
                                {t('clan_recruitment_strict_steam') || 'Строгая проверка Steam (профиль должен быть открыт для сверки часов)'}
                              </span>
                              <ToggleSwitch
                                checked={!!rConfig.strictSteamCheck}
                                onChange={val => updateRConfig('strictSteamCheck', val, true)}
                                activeColor="orange"
                                size="sm"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
                                {t('clan_recruitment_silent_reject') || 'Экономить лимит каналов (мгновенный отказ кандидату без создания тикета)'}
                              </span>
                              <ToggleSwitch
                                checked={rConfig.silentAutoReject !== false}
                                onChange={val => updateRConfig('silentAutoReject', val, true)}
                                activeColor="orange"
                                size="sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                              {t('clan_recruitment_reject_msg') || 'Сообщение кандидату при автоматическом отклонении'}
                            </label>
                            <textarea 
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-xs min-h-[60px]"
                              value={rConfig.autoRejectMessage ?? defaultRejectMsg}
                              onChange={e => updateRConfig('autoRejectMessage', e.target.value, false)}
                              onBlur={e => updateRConfig('autoRejectMessage', e.target.value, true)}
                              placeholder={defaultRejectMsg}
                            ></textarea>
                          </div>

                          {/* Выбор каналов для отправки отклоненных заявок */}
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                            <div>
                              <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5 text-orange-500" />
                                {t('clan_recruitment_channels_title') || 'Куда отсылать отклоненные заявки'}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {t('clan_recruitment_channels_desc') || 'Выберите каналы Discord, в которые бот будет отправлять карточки отклоненных анкет.'}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div>
                                <ChannelSelect
                                  label={t('clan_recruitment_channel_auto') || 'Отклоненные ботом заявки'}
                                  description={t('clan_auto_113', 'Канал для карточек авто-отказа (нехватка часов, возраст, VAC-баны)')}
                                  value={cConfig.autoRejectedApplications || ''}
                                  onChange={val => updateChannelConfig('autoRejectedApplications', val)}
                                  discordChannels={discordInfo?.channels || []}
                                  typeFilter={[0, 2]}
                                  isLoading={!discordInfo}
                                />
                              </div>
                              <div>
                                <ChannelSelect
                                  label={t('clan_recruitment_channel_admin') || 'Отклоненные админами заявки'}
                                  description={t('clan_auto_114', 'Канал для карточек заявок, отклоненных рекрутерами вручную')}
                                  value={cConfig.rejectedApplications || ''}
                                  onChange={val => updateChannelConfig('rejectedApplications', val)}
                                  discordChannels={discordInfo?.channels || []}
                                  typeFilter={[0, 2]}
                                  isLoading={!discordInfo}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Журнал и история заявок в клан */}
                      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                              <ScrollText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                {t('clan_recruitment_apps_title') || 'Журнал заявок в клан'}
                                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {applicationsData.length}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t('clan_recruitment_apps_desc') || 'История всех поступивших заявок: принятые, отклоненные руководством и отфильтрованные ботом.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={fetchApplications}
                              disabled={loadingApps}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${loadingApps ? 'animate-spin text-orange-500' : ''}`} />
                              <span>{t('clan_recruitment_apps_refresh') || 'Обновить'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleClearApplications}
                              disabled={loadingApps || applicationsData.length === 0}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              title={t('clan_recruitment_apps_clear') || 'Очистить журнал'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>{t('clan_recruitment_apps_clear') || 'Очистить журнал'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                          {/* Search input */}
                          <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={appSearch}
                              onChange={(e) => setAppSearch(e.target.value)}
                              placeholder={t('clan_recruitment_app_search_placeholder') || 'Поиск по нику, Discord ID, Steam...'}
                              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
                            />
                            {appSearch && (
                              <button
                                type="button"
                                onClick={() => setAppSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title={t('clan_auto_105', 'Очистить поиск')}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Filter Pills */}
                          <div className="flex flex-wrap items-center gap-2">
                            {[
                              { id: 'ALL', label: t('clan_recruitment_apps_filter_all') || 'Все', count: applicationsData.length },
                              { id: 'PENDING', label: t('clan_recruitment_apps_filter_pending') || 'Ожидают', count: applicationsData.filter(a => a.status === 'PENDING').length },
                              { id: 'ACCEPTED', label: t('clan_recruitment_apps_filter_accepted') || 'Приняты', count: applicationsData.filter(a => a.status === 'ACCEPTED').length },
                              { id: 'REJECTED', label: t('clan_recruitment_apps_filter_rejected') || 'Отклонены', count: applicationsData.filter(a => a.status === 'REJECTED').length },
                              { id: 'AUTO_REJECTED', label: t('clan_recruitment_apps_filter_auto_rejected') || 'Авто-отказ', count: applicationsData.filter(a => a.status === 'AUTO_REJECTED').length }
                            ].map(f => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setAppFilter(f.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                                  appFilter === f.id
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <span>{f.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                  appFilter === f.id ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                  {f.count}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Table or Empty state */}
                        {(() => {
                          const query = (appSearch || '').trim().toLowerCase();
                          const filtered = applicationsData.filter(a => {
                            const matchesStatus = appFilter === 'ALL' || a.status === appFilter;
                            if (!matchesStatus) return false;
                            if (!query) return true;
                            const username = (a.username || '').toLowerCase();
                            const userId = (a.userId || '').toLowerCase();
                            const steamId = (a.steamId || '').toLowerCase();
                            const reviewedBy = (a.reviewedBy || '').toLowerCase();
                            const rejectReason = (a.rejectReason || '').toLowerCase();
                            const experience = (a.experience || '').toLowerCase();
                            return username.includes(query) ||
                                   userId.includes(query) ||
                                   steamId.includes(query) ||
                                   reviewedBy.includes(query) ||
                                   rejectReason.includes(query) ||
                                   experience.includes(query);
                          });

                          if (loadingApps && (!applicationsData || applicationsData.length === 0)) {
                            return <ApplicationsTableSkeleton rows={5} />;
                          }

                          if (filtered.length === 0) {
                            return (
                              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {query 
                                    ? `${t('clan_apps_search_empty', 'По запросу «')}${appSearch}${t('clan_apps_search_empty2', '» заявок не найдено.')}` 
                                    : (t('clan_recruitment_apps_empty') || 'Заявок в выбранной категории пока нет.')
                                  }
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/70 uppercase font-semibold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                  <tr>
                                    <th className="px-4 py-3">{t('clan_recruitment_app_col_candidate') || t('clan_candidate', 'Кандидат')}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_steam') || 'Steam'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_age') || 'Возраст'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_hours') || 'Часы'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_status') || 'Статус'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_details') || 'Детали'}</th>
                                    <th className="px-3 py-3 text-center">{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</th>
                                    <th className="px-4 py-3 text-right">{t('clan_recruitment_app_col_date') || 'Дата'}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {filtered.map(app => (
                                    <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                      <td className="px-4 py-3">
                                        <div className="flex items-center space-x-2.5">
                                          {app.avatar ? (
                                            <img src={app.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                          ) : (
                                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                                              {(app.username || app.userId).slice(0, 2).toUpperCase()}
                                            </div>
                                          )}
                                          <div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{app.username || t('clan_candidate', 'Кандидат')}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{app.userId}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-3 py-3">
                                        {(() => {
                                          const steamUrl = getSteamProfileUrl(app.steamId);
                                          if (!steamUrl) return <span className="text-slate-400">—</span>;
                                          const displayId = String(app.steamId).replace(/^https?:\/\/steamcommunity\.com\/(profiles|id)\//i, '').replace(/\/+$/, '');
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => openExternalUrl(steamUrl)}
                                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-[11px] font-medium group max-w-[120px]"
                                              title={steamUrl}
                                            >
                                              <svg className="w-3 h-3 fill-current shrink-0 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24">
                                                <path d="M12 0a12 12 0 0 0-12 12c0 5.6 3.86 10.3 9.08 11.63l2.84-4.14a4.42 4.42 0 0 1-.39-.14l-3.9 1.63a7.48 7.48 0 0 1-.84-3.77c0-2.3 1.05-4.36 2.7-5.74L8.7 7.7a7.52 7.52 0 0 1 7.02-1.74l2.45-3.57A12 12 0 0 0 12 0zm3.83 5.96a5.53 5.53 0 0 0-3.32 1.15l3.22 1.34a2.22 2.22 0 1 1-1.35 3.23l-3.26-1.36a5.53 5.53 0 1 0 4.71-4.36zm-6.2 8.65l2.67 1.11a3.02 3.02 0 0 0 1.25-.26l-1.92 2.8a3.03 3.03 0 0 1-2-3.65z"/>
                                              </svg>
                                              <span className="truncate">{displayId}</span>
                                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60 group-hover:opacity-100" />
                                            </button>
                                          );
                                        })()}
                                      </td>
                                      <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                                        {app.age ? `${app.age} ${t('clan_years', 'лет')}` : '—'}
                                      </td>
                                      <td className="px-3 py-3">
                                        <div className="flex items-center space-x-1">
                                          <span className="font-medium text-slate-800 dark:text-slate-200">{app.hours || 0} {t('clan_hours_short', 'ч.')}</span>
                                          {app.verifiedHours !== null && app.verifiedHours !== undefined && (
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold" title={t('clan_auto_106', 'Верифицировано в Steam')}>
                                              ✓
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-3 py-3">
                                        {app.status === 'PENDING' && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                                            ⏳ {t('clan_recruitment_app_status_pending') || 'Ожидает'}
                                          </span>
                                        )}
                                        {app.status === 'ACCEPTED' && (
                                          <span 
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs" 
                                            title={t('clan_recruitment_app_status_accepted') || 'Принята'}
                                          >
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                          </span>
                                        )}
                                        {app.status === 'REJECTED' && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                                            ❌ {t('clan_recruitment_app_status_rejected') || 'Отклонена'}
                                          </span>
                                        )}
                                        {app.status === 'AUTO_REJECTED' && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
                                            🤖 {t('clan_recruitment_app_status_auto_rejected') || 'Авто-отказ'}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-3 max-w-[180px] truncate text-[11px]">
                                        {app.rejectReason ? (
                                          <span className="text-rose-600 dark:text-rose-400" title={app.rejectReason}>
                                            {app.rejectReason}
                                          </span>
                                        ) : app.reviewedBy ? (
                                          <span className="text-slate-500">
                                            {t('clan_auto_51', 'Рассмотрел:')} <span className="font-medium text-slate-700 dark:text-slate-300">{app.reviewedBy}</span>
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleViewTranscript(app)}
                                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all text-[11px] font-medium shadow-2xs group"
                                          title={t('clan_recruitment_app_view_transcript') || 'Просмотр транскрипта'}
                                        >
                                          <ScrollText className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                                          <span>{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</span>
                                        </button>
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}
              
                    <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z"/></svg>
                            Steam Приписки
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Проверка наличия кланового тега в Steam нике участников
                          </p>
                        </div>
                        <ToggleSwitch
                          enabled={rConfig.steamPrefixCheck || false}
                          onChange={(val) => updateRConfig('steamPrefixCheck', val)}
                        />
                      </div>
                      
                      <div className={`transition-opacity ${!rConfig.steamPrefixCheck ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Требуемая приписка</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                              placeholder="Например: [GODS]"
                              value={rConfig.steamPrefix || ''}
                              onChange={e => updateRConfig('steamPrefix', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Участники без приписки</h4>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  setCheckingPrefix(true);
                                  const res = await sendProxyAction('get_missing_steam_prefix');
                                  setCheckingPrefix(false);
                                  if (res && res.success) {
                                    setMissingPrefixes(res.missing || []);
                                  }
                                }}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                              >
                                Обновить список
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const res = await sendProxyAction('remind_steam_prefix', { userIds: missingPrefixes?.map(m => m.userId) || [] });
                                  if (res && res.success) addLog(`Отправлено ${res.sentCount} напоминаний в ЛС!`);
                                }}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                Напомнить всем
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-100/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase sticky top-0">
                                <tr>
                                  <th className="px-4 py-2">Discord</th>
                                  <th className="px-4 py-2">Steam</th>
                                  <th className="px-4 py-2 text-right">Действие</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                                {(missingPrefixes || []).length > 0 ? (
                                  (missingPrefixes || []).map(m => (
                                    <tr key={m.userId} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors">
                                      <td className="px-4 py-2 font-medium">{m.username}</td>
                                      <td className="px-4 py-2 text-slate-500"><a href={m.steamUrl} target="_blank" rel="noreferrer" className="hover:text-blue-500 underline">{m.steamName}</a></td>
                                      <td className="px-4 py-2 text-right">
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            const res = await sendProxyAction('remind_steam_prefix', { userId: m.userId });
                                            if (res && res.success) addLog(`Напоминание отправлено ${m.username} в ЛС!`);
                                          }}
                                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-[11px] font-medium transition-colors"
                                        >
                                          Напомнить
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="3" className="px-4 py-6 text-center text-slate-500">
                                      Нажмите "Обновить список" для проверки
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

              </form>
            
    </>
  );
}
