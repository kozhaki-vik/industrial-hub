import React, { useContext, useState } from 'react';
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

export default function ChannelsTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshChannels = () => {
    setIsRefreshing(true);
    if (typeof fetchDiscordInfo === 'function') fetchDiscordInfo();
    if (typeof fetchDynamicVoice === 'function') fetchDynamicVoice();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <>

              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-500" />
                      {t('clan_auto_18', 'Настройки каналов')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('clan_auto_19', 'Привяжите каналы Discord сервера для автоматической работы функций бота')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRefreshChannels}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                      title={t('clan_refresh_channels_tooltip') || 'Обновить список каналов, категорий и голосовых комнат из Discord'}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? (t('clan_auto_v2_1027', 'Обновление...')) : (t('common_refresh', 'Обновить'))}</span>
                    </button>
                  </div>
                </div>
                
                {(() => {
                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  
                  const updateCConfig = (key, val) => {
                    const newConfig = { ...cConfig, [key]: val };
                    const updated = { ...config, channelsConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, true);
                  };
                  
                  const channelsList = [
                    { key: 'ticketsCategory', label: t('clan_auto_v2_1012', 'Категория для тикетов'), desc: t('clan_auto_222', 'Здесь бот будет создавать приватные каналы тикетов заявок.'), typeFilter: 4, badge: 'Категория' },
                    { key: 'applications', label: t('clan_auto_v2_1013', 'Одобренные заявки'), desc: t('clan_auto_223', 'Сюда будут пересылаться одобренные заявки из тикетов.'), typeFilter: [0, 2] },
                    { key: 'autoRejectedApplications', label: t('clan_channel_auto_rejected_app') || 'Отклоненные ботом заявки', desc: t('clan_channel_auto_rejected_app_desc') || 'Канал для автоматических отказов кандидатам (нехватка часов, возраст, блокировки VAC/Game).', typeFilter: [0, 2] },
                    { key: 'rejectedApplications', label: t('clan_channel_rejected_app') || 'Отклоненные админами заявки', desc: t('clan_channel_rejected_app_desc') || 'Канал для заявок, отклоненных вручную модераторами/рекрутерами с указанием причины.', typeFilter: [0, 2] },
                    { key: 'leaderboard', label: t('clan_auto_v2_1014', 'Leaderboard (Статистика)'), desc: t('clan_auto_224', 'Канал, где публикуется статистика по вайпам и топам.'), typeFilter: [0, 2] },
                    { key: 'news', label: t('clan_auto_v2_1015', 'Новости клана'), desc: t('clan_auto_225', 'Канал для публикации объявлений и новостей бота.'), typeFilter: [0, 2] },
                    { key: 'votes', label: t('clan_tab_votes', 'Голосования'), desc: t('clan_auto_226', 'Канал для создания голосований. Может быть тем же, что и новости.'), typeFilter: [0, 2] },
                    { key: 'ads', label: t('clan_auto_v2_1016', 'Реклама и альянсы'), desc: t('clan_auto_227', 'Сюда бот отправляет информацию об оплаченной рекламе.'), typeFilter: [0, 2] },
                    { key: 'roster', label: t('clan_auto_v2_1017', 'Состав клана'), desc: t('clan_auto_228', 'Здесь выводится динамический список всех участников.'), typeFilter: [0, 2] }
                  ];

                  return (
                    <div className="space-y-3">
                      {channelsList.map(c => (
                         <div key={c.key} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all">
                           <div className="flex-1 min-w-0 pr-2">
                             <div className="flex items-center gap-2">
                               <span className="font-semibold text-sm text-slate-900 dark:text-white">{c.label}</span>
                               {c.badge && (
                                 <span className="text-[10px] px-2 py-0.5 font-medium rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                                   {c.badge}
                                 </span>
                               )}
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                               {c.desc}
                             </p>
                           </div>
                           <div className="w-full md:w-80 shrink-0">
                             {!discordInfo ? (
                               <div className="w-full h-10 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse border border-slate-200 dark:border-slate-700" />
                             ) : (
                               <select
                                 value={cConfig[c.key] || ''}
                                 onChange={e => updateCConfig(c.key, e.target.value)}
                                 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer"
                               >
                                 <option value="">{t('clan_auto_20', '-- Не выбрано --')}</option>
                                 {(discordInfo?.channels || [])
                                   .filter(ch => c.typeFilter === null || ch.type === c.typeFilter || (Array.isArray(c.typeFilter) && c.typeFilter.includes(ch.type)))
                                   .map(ch => {
                                     let prefix = ch.type === 4 ? '📁 ' : ch.type === 2 ? '🔊 ' : '#️⃣ ';
                                     return <option key={ch.id} value={ch.id}>{prefix}{ch.name}</option>;
                                   })}
                               </select>
                             )}
                           </div>
                         </div>
                      ))}
                    </div>
                  );
                })()}
              </form>
            
    </>
  );
}
