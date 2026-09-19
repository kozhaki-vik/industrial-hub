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
import { ToggleSwitch, SaveButton, isBotConfigured, fuzzyMatchScore, getBotSettingSearchScore, reportClanErrorToTelegram, DEFAULT_BAD_WORDS } from '../ClanManager';

export default function ModerationTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  const [modSubTab, setModSubTab] = React.useState('antiMention');
  let modCfg = {
                logChannelId: '',
                antiMention: {
                  enabled: false,
                  maxMentions: 5,
                  timeWindowSeconds: 10,
                  countUsers: true,
                  countRoles: true,
                  countEveryone: true,
                  action: 'timeout',
                  durationMinutes: 10,
                  autoDelete: true,
                  warnMessage: t('clan_auto_234', 'Массовые упоминания запрещены на этом сервере!'),
                  ignoreRoles: [],
                  ignoreChannels: []
                },
                badWords: {
                  enabled: false,
                  words: [...DEFAULT_BAD_WORDS],
                  action: 'timeout',
                  durationMinutes: 10,
                  autoDelete: true,
                  warnMessage: t('clan_auto_235', 'Использование запретных выражений недопустимо на нашем сервере!'),
                  ignoreRoles: [],
                  ignoreChannels: []
                },
                warnings: {
                  enabled: true,
                  threshold: 3,
                  action: 'timeout',
                  durationMinutes: 60,
                  ignoreRoles: []
                }
              };
              try {
                if (config?.moderationConfigJson) {
                  const parsed = typeof config.moderationConfigJson === 'string' ? JSON.parse(config.moderationConfigJson) : config.moderationConfigJson;
                  modCfg = {
                    ...modCfg,
                    ...parsed,
                    antiMention: {
                      ...modCfg.antiMention,
                      ...(parsed.antiMention || {})
                    },
                    badWords: {
                      ...modCfg.badWords,
                      ...(parsed.badWords || {})
                    },
                    warnings: {
                      ...modCfg.warnings,
                      ...(parsed.warnings || {})
                    }
                  };
                }
              } catch (e) {}

              const am = modCfg.antiMention;
              const bw = modCfg.badWords;
              const warns = modCfg.warnings;
              const textChannels = (discordInfo?.channels || []).filter(c => c.type === 0);
              const allRoles = discordInfo?.roles || [];

              const isLeadershipRole = (roleId) => {
                return Boolean(
                  roleId && (
                    roleId === config?.leaderRoleId ||
                    roleId === config?.deputyLeaderRoleId
                  )
                );
              };

              const handleUpdateAM = (field, val, immediate = true) => {
                const updated = {
                  ...modCfg,
                  antiMention: {
                    ...am,
                    [field]: val
                  }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleUpdateBW = (field, val, immediate = true) => {
                const updated = {
                  ...modCfg,
                  badWords: {
                    ...bw,
                    [field]: val
                  }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleUpdateWarn = (field, val, immediate = true) => {
                const updated = {
                  ...modCfg,
                  warnings: {
                    ...warns,
                    [field]: val
                  }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleAddBadWord = (word) => {
                const clean = (word || '').trim().toLowerCase();
                if (!clean) return;
                const currentWords = Array.isArray(bw.words) ? [...bw.words] : [];
                if (!currentWords.includes(clean)) {
                  currentWords.push(clean);
                  handleUpdateBW('words', currentWords, true);
                }
                setNewBadWordInput('');
              };

              const handleRemoveBadWord = (wordToRemove) => {
                const currentWords = Array.isArray(bw.words) ? [...bw.words] : [];
                const filtered = currentWords.filter(w => w !== wordToRemove);
                handleUpdateBW('words', filtered, true);
              };

              const handleResetBadWords = () => {
                handleUpdateBW('words', [...DEFAULT_BAD_WORDS], true);
              };

              const handleClearBadWords = () => {
                handleUpdateBW('words', [], true);
              };

              const handleUpdateModRoot = (field, val, immediate = true) => {
                const updated = { ...modCfg, [field]: val };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleToggleRoleWhitelist = (roleId) => {
                const current = Array.isArray(am.ignoreRoles) ? [...am.ignoreRoles] : [];
                const idx = current.indexOf(roleId);
                if (idx === -1) current.push(roleId);
                else current.splice(idx, 1);
                const updated = {
                  ...modCfg,
                  antiMention: { ...am, ignoreRoles: current },
                  badWords: { ...bw, ignoreRoles: current }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, true);
              };

              const handleToggleChannelWhitelist = (chId) => {
                const current = Array.isArray(am.ignoreChannels) ? [...am.ignoreChannels] : [];
                const idx = current.indexOf(chId);
                if (idx === -1) current.push(chId);
                else current.splice(idx, 1);
                const updated = {
                  ...modCfg,
                  antiMention: { ...am, ignoreChannels: current },
                  badWords: { ...bw, ignoreChannels: current }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, true);
              };
  return (
    <>

                <form onSubmit={saveConfig} noValidate className="space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      <span>{t('clan_mod_title')}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('clan_mod_desc')}
                    </p>
                  </div>

                  <div className="space-y-4">

                  {/* Anti-Mass-Mention Main Card */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setModSubTab(modSubTab === 'antiMention' ? null : 'antiMention')}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('clan_mod_anti_mention_title') || 'Подозрительные действия'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Контроль массовых упоминаний
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${modSubTab === 'antiMention' ? 'rotate-180' : ''}`} />
                    </button>
                    {modSubTab === 'antiMention' && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{t('clan_mod_anti_mention_title')}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('clan_mod_anti_mention_desc')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                        <ToggleSwitch
                          checked={Boolean(am.enabled)}
                          onChange={val => handleUpdateAM('enabled', val)}
                          activeColor="blue"
                        />
                      </div>
                    </div>

                    <div className={`space-y-5 transition-opacity duration-200 ${!am.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      {/* Parameters Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_max_mentions')}
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                          {t('clan_mod_max_mentions_hint')}
                        </p>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={am.maxMentions || 5}
                          onChange={e => handleUpdateAM('maxMentions', parseInt(e.target.value, 10) || 5, false)}
                          onBlur={e => {
                            const val = parseInt(e.target.value, 10) || 5;
                            if (val !== am.maxMentions) handleUpdateAM('maxMentions', val, true);
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_time_window')}
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                          {t('clan_mod_time_window_hint')}
                        </p>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={am.timeWindowSeconds || 10}
                          onChange={e => handleUpdateAM('timeWindowSeconds', parseInt(e.target.value, 10) || 10, false)}
                          onBlur={e => {
                            const val = parseInt(e.target.value, 10) || 10;
                            if (val !== am.timeWindowSeconds) handleUpdateAM('timeWindowSeconds', val, true);
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* What to count checkboxes */}
                    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('clan_auto_75', 'Что учитывать при подсчете:')}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countUsers !== false}
                            onChange={e => handleUpdateAM('countUsers', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_users')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countRoles !== false}
                            onChange={e => handleUpdateAM('countRoles', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_roles')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countEveryone !== false}
                            onChange={e => handleUpdateAM('countEveryone', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_everyone')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Action & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_action')}
                        </label>
                        <select
                          value={am.action || 'timeout'}
                          onChange={e => handleUpdateAM('action', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="warn">⚠️ {t('clan_mod_action_warn')}</option>
                          <option value="timeout">🔇 {t('clan_mod_action_timeout')}</option>
                          <option value="kick">👢 {t('clan_mod_action_kick')}</option>
                          <option value="ban">🔨 {t('clan_mod_action_ban')}</option>
                        </select>
                      </div>

                      {am.action === 'timeout' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_mod_timeout_duration')}
                          </label>
                          <select
                            value={am.durationMinutes || 10}
                            onChange={e => handleUpdateAM('durationMinutes', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value={1}>{t('clan_mod_timeout_1m')}</option>
                            <option value={5}>{t('clan_mod_timeout_5m')}</option>
                            <option value={10}>{t('clan_mod_timeout_10m')}</option>
                            <option value={30}>{t('clan_mod_timeout_30m')}</option>
                            <option value={60}>{t('clan_mod_timeout_1h')}</option>
                            <option value={360}>{t('clan_mod_timeout_6h')}</option>
                            <option value={1440}>{t('clan_mod_timeout_1d')}</option>
                            <option value={10080}>{t('clan_mod_timeout_1w')}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Auto-delete toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 select-none">
                        {t('clan_mod_auto_delete')}
                      </span>
                      <ToggleSwitch
                        checked={am.autoDelete !== false}
                        onChange={val => handleUpdateAM('autoDelete', val)}
                        activeColor="blue"
                        size="sm"
                      />
                    </div>

                    {/* Warning text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('clan_mod_warn_msg')}
                      </label>
                      <input
                        type="text"
                        value={am.warnMessage || ''}
                        placeholder={t('clan_mod_warn_msg_default')}
                        onChange={e => handleUpdateAM('warnMessage', e.target.value, false)}
                        onBlur={e => {
                          if (e.target.value !== (am.warnMessage || '')) {
                            handleUpdateAM('warnMessage', e.target.value, true);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    </div>
                    </div>
                    )}
                  </div>

                  {/* Bad Words Filter Main Card */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setModSubTab(modSubTab === 'badWords' ? null : 'badWords')}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                          <Ban className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('clan_mod_badwords_title') || 'Фильтр слов'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Управление списком запрещенных слов
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${modSubTab === 'badWords' ? 'rotate-180' : ''}`} />
                    </button>
                    {modSubTab === 'badWords' && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-500" />
                          <span>{t('clan_mod_badwords_title')}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('clan_mod_badwords_desc')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                        <ToggleSwitch
                          checked={Boolean(bw.enabled)}
                          onChange={val => handleUpdateBW('enabled', val)}
                          activeColor="blue"
                        />
                      </div>
                    </div>

                    <div className={`space-y-5 transition-opacity duration-200 ${!bw.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      {/* Action & Duration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_action')}
                        </label>
                        <select
                          value={bw.action || 'timeout'}
                          onChange={e => handleUpdateBW('action', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="delete_only">🗑️ {t('clan_mod_action_delete_only')}</option>
                          <option value="warn">⚠️ {t('clan_mod_action_warn')}</option>
                          <option value="timeout">🔇 {t('clan_mod_action_timeout')}</option>
                          <option value="kick">👢 {t('clan_mod_action_kick')}</option>
                          <option value="ban">🔨 {t('clan_mod_action_ban')}</option>
                        </select>
                      </div>

                      {bw.action === 'timeout' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_mod_timeout_duration')}
                          </label>
                          <select
                            value={bw.durationMinutes || 10}
                            onChange={e => handleUpdateBW('durationMinutes', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value={1}>{t('clan_mod_timeout_1m')}</option>
                            <option value={5}>{t('clan_mod_timeout_5m')}</option>
                            <option value={10}>{t('clan_mod_timeout_10m')}</option>
                            <option value={30}>{t('clan_mod_timeout_30m')}</option>
                            <option value={60}>{t('clan_mod_timeout_1h')}</option>
                            <option value={360}>{t('clan_mod_timeout_6h')}</option>
                            <option value={1440}>{t('clan_mod_timeout_1d')}</option>
                            <option value={10080}>{t('clan_mod_timeout_1w')}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Auto-delete toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 select-none">
                        {t('clan_mod_auto_delete')}
                      </span>
                      <ToggleSwitch
                        checked={bw.autoDelete !== false}
                        onChange={val => handleUpdateBW('autoDelete', val)}
                        activeColor="blue"
                        size="sm"
                      />
                    </div>

                    {/* Warning text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('clan_mod_warn_msg')}
                      </label>
                      <input
                        type="text"
                        value={bw.warnMessage || ''}
                        placeholder={t('clan_mod_badwords_warn_default')}
                        onChange={e => handleUpdateBW('warnMessage', e.target.value, false)}
                        onBlur={e => {
                          if (e.target.value !== (bw.warnMessage || '')) {
                            handleUpdateBW('warnMessage', e.target.value, true);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Words List Header and Controls */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t('clan_mod_badwords_list_title')}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            {(bw.words || []).length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleResetBadWords}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{t('clan_mod_badwords_reset_btn')}</span>
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <button
                            type="button"
                            onClick={handleClearBadWords}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t('clan_mod_badwords_clear_btn')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Add Word Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBadWordInput}
                          onChange={e => setNewBadWordInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBadWord(newBadWordInput);
                            }
                          }}
                          placeholder={t('clan_mod_badwords_add_ph')}
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddBadWord(newBadWordInput)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('clan_mod_badwords_add_btn')}</span>
                        </button>
                      </div>

                      {/* Word Pills */}
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2.5 bg-slate-50/60 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        {(!bw.words || bw.words.length === 0) ? (
                          <span className="text-xs text-slate-400 italic py-2 px-1">{t('clan_auto_76', 'Список пуст')}</span>
                        ) : (
                          bw.words.map((word, idx) => (
                            <span
                              key={`${word}-${idx}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs group"
                            >
                              <span>{word}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBadWord(word)}
                                className="text-slate-400 hover:text-red-500 rounded p-0.5 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                  )}
                  </div>

                  {/* Moderation Log Channel Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('clan_mod_log_channel')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('clan_mod_log_channel_hint')}
                    </p>
                    <div className="max-w-md">
                      <select
                        value={modCfg.logChannelId || ''}
                        onChange={e => handleUpdateModRoot('logChannelId', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t('clan_auto_77', '(По умолчанию: основной канал логов)')}</option>
                        {textChannels.map(ch => (
                          <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Whitelists Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('clan_auto_78', 'Исключения (Белый список)')}
                    </h4>

                    {/* Roles Whitelist */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('clan_mod_whitelist_roles')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('clan_mod_whitelist_roles_desc')}
                        <span className="block mt-0.5 text-amber-600 dark:text-amber-400 font-medium">
                          • {t('clan_mod_auto_exempt_hint')}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {allRoles.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">{t('clan_auto_79', 'Роли не загружены')}</span>
                        ) : (
                          allRoles.map(r => {
                            const isAuto = isLeadershipRole(r.id);
                            const isIgnored = isAuto || (Array.isArray(am.ignoreRoles) && am.ignoreRoles.includes(r.id));
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  if (isAuto) return;
                                  handleToggleRoleWhitelist(r.id);
                                }}
                                title={isAuto ? t('clan_mod_auto_exempt_hint') : undefined}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                  isAuto
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 cursor-default'
                                    : isIgnored
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm cursor-pointer'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full inline-block shrink-0"
                                  style={{ backgroundColor: r.color && r.color !== '#000000' ? r.color : '#94a3b8' }}
                                ></span>
                                <span>{r.name}</span>
                                {isAuto ? (
                                  <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                                    {t('clan_mod_auto_exempt_badge') || 'Авто'}
                                  </span>
                                ) : isIgnored ? (
                                  <Check className="w-3 h-3" />
                                ) : null}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Channels Whitelist */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('clan_mod_whitelist_channels')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('clan_mod_whitelist_channels_desc')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {textChannels.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">{t('clan_auto_80', 'Каналы не загружены')}</span>
                        ) : (
                          textChannels.map(ch => {
                            const isIgnored = Array.isArray(am.ignoreChannels) && am.ignoreChannels.includes(ch.id);
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => handleToggleChannelWhitelist(ch.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isIgnored
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <span>#️⃣ {ch.name}</span>
                                {isIgnored && <Check className="w-3 h-3" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning System (Warns) Settings Card */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setModSubTab(modSubTab === 'warnings' ? null : 'warnings')}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('clan_warn_settings_title') || 'Система варнов'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Настройка предупреждений и наказаний
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${modSubTab === 'warnings' ? 'rotate-180' : ''}`} />
                    </button>
                    {modSubTab === 'warnings' && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-5">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('clan_warn_settings_title') || 'Система предупреждений (Варны)'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {t('clan_warn_settings_desc') || 'Автоматический учет нарушений и применение санкций при превышении лимита.'}
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={warns?.enabled !== false}
                        onChange={val => handleUpdateWarn('enabled', val, true)}
                        activeColor="orange"
                      />
                    </div>

                    <div className={`space-y-6 transition-opacity duration-200 ${warns?.enabled === false ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              {t('clan_warn_threshold') || 'Порог срабатывания (варнов)'}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={warns?.threshold || 3}
                              onChange={e => handleUpdateWarn('threshold', Math.max(1, parseInt(e.target.value, 10) || 1), false)}
                              onBlur={e => handleUpdateWarn('threshold', Math.max(1, parseInt(e.target.value, 10) || 1), true)}
                              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/50 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/50 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              {t('clan_warn_action') || 'Наказание при превышении'}
                            </label>
                            <select
                              value={
                                warns?.action === 'kick' ? 'kick' :
                                warns?.action === 'ban' ? 'ban' :
                                warns?.durationMinutes === 1440 ? 'timeout_1440' :
                                warns?.durationMinutes === 10080 ? 'timeout_10080' :
                                'timeout_60'
                              }
                              onChange={e => {
                                const val = e.target.value;
                                if (val === 'kick') {
                                  handleUpdateWarn('action', 'kick', true);
                                } else if (val === 'ban') {
                                  handleUpdateWarn('action', 'ban', true);
                                } else if (val === 'timeout_1440') {
                                  handleUpdateWarn('action', 'timeout', false);
                                  handleUpdateWarn('durationMinutes', 1440, true);
                                } else if (val === 'timeout_10080') {
                                  handleUpdateWarn('action', 'timeout', false);
                                  handleUpdateWarn('durationMinutes', 10080, true);
                                } else {
                                  handleUpdateWarn('action', 'timeout', false);
                                  handleUpdateWarn('durationMinutes', 60, true);
                                }
                              }}
                              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/50 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/50 outline-none cursor-pointer"
                            >
                              <option value="timeout_60">{t('clan_warn_action_timeout_60') || 'Таймаут (Мут) на 1 час'}</option>
                              <option value="timeout_1440">{t('clan_warn_action_timeout_1440') || 'Таймаут (Мут) на 1 день'}</option>
                              <option value="timeout_10080">{t('clan_warn_action_timeout_10080') || 'Таймаут (Мут) на 1 неделю'}</option>
                              <option value="kick">{t('clan_warn_action_kick') || 'Кик с сервера'}</option>
                              <option value="ban">{t('clan_warn_action_ban') || 'Бан на сервере'}</option>
                            </select>
                          </div>
                        </div>

                        {/* Clan Warnings Log */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {t('clan_warn_log_title') || 'Журнал предупреждений клана'}
                            </h5>
                            <button
                              type="button"
                              onClick={fetchClanWarnings}
                              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className={`w-3 h-3 ${loadingClanWarnings ? 'animate-spin' : ''}`} />
                              <span>{t('clan_auto_81', 'Обновить')}</span>
                            </button>
                          </div>

                          {clanWarnings.length === 0 ? (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-center text-xs text-slate-400">
                              {t('clan_auto_82', 'Предупреждений нет или они не загружены.')}
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                              <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase select-none border-b border-slate-200 dark:border-slate-700">
                                  <tr>
                                    <th className="px-4 py-2.5">{t('clan_auto_83', 'Участник')}</th>
                                    <th className="px-4 py-2.5">{t('clan_auto_84', 'Причина')}</th>
                                    <th className="px-4 py-2.5">{t('clan_auto_85', 'Модератор')}</th>
                                    <th className="px-4 py-2.5">{t('clan_auto_86', 'Дата')}</th>
                                    <th className="px-4 py-2.5 text-center">{t('clan_auto_87', 'Статус')}</th>
                                    <th className="px-4 py-2.5 text-right">{t('clan_auto_88', 'Действие')}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {clanWarnings.map(w => (
                                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                                        {w.userName || w.userId}
                                      </td>
                                      <td className="px-4 py-2.5 font-mono text-[11px] max-w-xs truncate" title={w.reason}>
                                        {w.reason}
                                      </td>
                                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                                        {w.moderatorTag || t('clan_system', 'Система')}
                                      </td>
                                      <td className="px-4 py-2.5 text-slate-400">
                                        {new Date(w.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        {w.active ? (
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                            {t('clan_auto_89', t('clan_warn_active', 'Активен'))}
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            {t('clan_auto_90', t('clan_warn_removed', 'Снят'))}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        {w.active && (
                                          <button
                                            type="button"
                                            disabled={warnActionLoading}
                                            onClick={() => handleRemoveWarn(w.id)}
                                            className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium disabled:opacity-50"
                                          >
                                            {t('clan_auto_v2_1040', t('clan_warn_remove', 'Снять'))}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                  </div>
                </form>
              
    </>
  );
}
