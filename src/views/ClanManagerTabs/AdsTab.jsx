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

export default function AdsTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  return (
    <>

              <form onSubmit={saveConfig} noValidate className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                    <Megaphone className="w-5 h-5 mr-2 text-blue-500" />
                    {t('clan_auto_65', 'Настройки панели рекламы')}
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
                      title={showDiscordLivePreview ? t('clan_auto_v2_1034', 'Скрыть живой предпросмотр Discord') : t('clan_auto_v2_1035', 'Показать живой предпросмотр Discord')}
                    >
                      {showDiscordLivePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showDiscordLivePreview ? t('clan_auto_v2_1036', 'Превью Discord') : t('clan_auto_v2_1037', 'Включить превью')}</span>
                    </button>
                  )}
                </div>
                
                {(() => {
                  let aConfig = {
                    title: t('clan_auto_169', t('clan_ads_buy', 'Покупка рекламы')),
                    text: t('clan_auto_230', 'Здесь вы можете приобрести рекламу или обсудить партнерство.'),
                    banner: 'https://i.imgur.com/example.png',
                    priceLink: 'https://telegra.ph/price',
                  };
                  try {
                    if (config.adConfigJson) {
                      aConfig = { ...aConfig, ...JSON.parse(config.adConfigJson) };
                    }
                  } catch(e) {}
                  
                  const updateAConfig = (key, val, immediate = false) => {
                    const newConfig = { ...aConfig, [key]: val };
                    const updated = { ...config, adConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, immediate);
                  };

                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  const adsChannel = discordInfo?.channels?.find(c => c.id === cConfig.ads);
                  const channelName = adsChannel ? adsChannel.name : t('clan_default_ads_ch', 'реклама');
                  
                  return (
                    <div className="space-y-5 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_66', 'Заголовок Embed-сообщения *')}</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.title}
                          onChange={e => updateAConfig('title', e.target.value, false)}
                          onBlur={e => updateAConfig('title', e.target.value, true)}
                          placeholder={t('clan_auto_111', t('clan_ads_buy', 'Покупка рекламы'))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_67', 'Текст *')}</label>
                        <textarea 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[100px]"
                          value={aConfig.text}
                          onChange={e => updateAConfig('text', e.target.value, false)}
                          onBlur={e => updateAConfig('text', e.target.value, true)}
                          placeholder={t('clan_auto_112', 'Информация о рекламе...')}
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_68', 'Ссылка на Прайс-лист (Telegraph / Сайт)')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.priceLink}
                          onChange={e => updateAConfig('priceLink', e.target.value, false)}
                          onBlur={e => updateAConfig('priceLink', e.target.value, true)}
                          placeholder="https://telegra.ph/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_69', 'Ссылка на баннер (Изображение)')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.banner}
                          onChange={e => updateAConfig('banner', e.target.value, false)}
                          onBlur={e => updateAConfig('banner', e.target.value, true)}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>
                    </div>
                  );
                })()}
              </form>
            
    </>
  );
}
