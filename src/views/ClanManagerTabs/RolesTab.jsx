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

export default function RolesTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  let roleNames = {};
              try {
                if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
              } catch (e) {}

              let customRoles = [];
              try {
                if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
              } catch (e) {}

              let deletedRoles = [];
              try {
                if (config.deletedRolesJson) deletedRoles = typeof config.deletedRolesJson === 'string' ? JSON.parse(config.deletedRolesJson) : config.deletedRolesJson;
              } catch (e) {}

              const visibleStandardRoles = standardRoles.filter(r => !deletedRoles.includes(r.key));
  return (
    <>

                <div className="space-y-6 max-w-5xl">
                  {/* Roles Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        {t('clan_roles_config') || 'Настройки ролей'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('clan_roles_desc') || 'Привязывайте роли из Discord к боту или создавайте их в один клик. Изменения синхронизируются мгновенно.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Restore Standard Roles Button if any deleted */}
                      {deletedRoles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRestoreStandardRoles}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                          title={t('clan_roles_restore_std') || 'Восстановить удаленные стандартные роли'}
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('clan_roles_restore_std') || `Восстановить роли (${deletedRoles.length})`}</span>
                        </button>
                      )}

                      {/* Sync Discord Roles into Custom Roles */}
                      <button
                        type="button"
                        onClick={handleSyncDiscordRoles}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                        title={t('clan_auto_96', 'Подтянуть все роли из Discord и привязать их как кастомные, сохраняя текущие настройки')}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t('clan_auto_2', 'Синхронизировать с Discord')}</span>
                      </button>

                      {/* Move Roles Up in Discord Hierarchy */}
                      <button
                        type="button"
                        onClick={handleMoveRolesUp}
                        disabled={movingRoles}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                        title={t('clan_auto_97', 'Переместить созданные и клановые роли вверх в иерархии Discord (под роль бота)')}
                      >
                        <ArrowUp className={`w-3.5 h-3.5 ${movingRoles ? 'animate-bounce' : ''}`} />
                        <span>{movingRoles ? t('clan_auto_v2_1024', 'Перемещение...') : t('clan_auto_v2_1025', 'Переместить роли вверх')}</span>
                      </button>

                      {/* Add Custom Role */}
                      <button
                        type="button"
                        onClick={handleAddCustomRole}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('clan_roles_add_custom') || 'Добавить роль'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Standard Roles Section */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      {t('clan_standard_roles_count', 'Стандартные роли')} ({visibleStandardRoles.length})
                    </div>
                    {visibleStandardRoles.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-950/20">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                          {t('clan_auto_3', 'Все стандартные роли были скрыты или удалены')}
                        </p>
                        <button
                          type="button"
                          onClick={handleRestoreStandardRoles}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('clan_roles_restore_std') || 'Восстановить роли'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {visibleStandardRoles.map(r => {
                          const rawName = roleNames[r.key];
                          const currentName = (rawName !== undefined && !rawName.toLowerCase().includes('clan manager')) ? rawName : (r.defaultName || r.defaultRu);
                          const boundRoleId = config[r.dbKey] || '';
                          const isCreatingThis = creatingRoleKey === r.key;

                          return (
                            <div 
                              key={r.key} 
                              className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              {/* Role name in bot */}
                              <div className="w-full md:w-60 lg:w-72 shrink-0">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  {t('clan_auto_4', 'Название роли (в боте)')}
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                  value={currentName}
                                  onChange={e => handleRoleNameChange(r.key, e.target.value, false)}
                                  onBlur={e => handleRoleNameBlur(r.key, r.dbKey, e.target.value, false)}
                                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                                  placeholder={r.defaultName || r.defaultRu}
                                />
                              </div>

                              {/* Role in Discord (dropdown + create button) */}
                              <div className="flex-1 min-w-[220px]">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  {t('clan_auto_5', 'Роль в Discord')}
                                </label>
                                <div className="flex items-center gap-2">
                                  {!discordInfo ? (
                                    <div className="flex-1 h-9.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse border border-slate-200 dark:border-slate-700" />
                                  ) : (
                                    <select
                                      value={boundRoleId}
                                      onChange={e => handleSelectDiscordRole(r.key, r.dbKey, e.target.value, false)}
                                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer truncate"
                                    >
                                      <option value="">{t('clan_auto_6', '-- Выберите роль --')}</option>
                                      {(discordInfo?.roles || []).map(dRole => (
                                        <option key={dRole.id} value={dRole.id}>
                                          {dRole.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCreateRoleInDiscord(r, false, currentName)}
                                    disabled={isCreatingThis || creatingRoleKey !== null}
                                    className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-300 dark:border-slate-700 hover:border-blue-400 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    title={t('clan_roles_create_in_discord') || 'Создать роль на Discord сервере и привязать'}
                                  >
                                    {isCreatingThis ? (
                                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Plus className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden sm:inline">{t('clan_auto_7', 'Создать')}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Status & Unlink/Delete button */}
                              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-5 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="w-28 flex justify-center">
                                  {boundRoleId ? (
                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {t('clan_auto_8', 'Привязано')}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                                      {t('clan_auto_9', 'Не привязано')}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStandardRole(r.key, r.dbKey)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors cursor-pointer"
                                  title={t('clan_roles_delete_std') || 'Удалить стандартную роль'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  )}
                </div>

                  {/* Custom Roles Section */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                        {t('clan_custom_roles_count', 'Кастомные роли')} ({customRoles.length})
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomRole}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('clan_roles_add_custom') || 'Добавить роль'}</span>
                      </button>
                    </div>

                    {customRoles.length === 0 ? (
                      <div 
                        onClick={handleAddCustomRole}
                        className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/20 group"
                      >
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t('clan_auto_10', 'Нет дополнительных ролей')}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {t('clan_auto_11', 'Нажмите сюда, чтобы добавить кастомную роль (например: Медик, Снайпер, Гость)')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customRoles.map(cr => {
                          const isCreatingThis = creatingRoleKey === cr.id;
                          return (
                            <div 
                              key={cr.id} 
                              className="bg-amber-50/20 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-200/50 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              {/* Role name in bot */}
                              <div className="w-full md:w-60 lg:w-72 shrink-0">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                                  {cr.color && (
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: cr.color }}></span>
                                  )}
                                  <span>{t('clan_auto_12', 'Название роли (в боте)')}</span>
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                                  value={cr.name || ''}
                                  onChange={e => handleRoleNameChange(cr.key, e.target.value, true, cr.id)}
                                  onBlur={e => handleRoleNameBlur(cr.key, null, e.target.value, true, cr.id)}
                                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                                  placeholder={t('clan_auto_108', 'Новая роль')}
                                />
                              </div>

                              {/* Role in Discord (dropdown + create button) */}
                              <div className="flex-1 min-w-[220px]">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  {t('clan_auto_13', 'Роль в Discord')}
                                </label>
                                <div className="flex items-center gap-2">
                                  {!discordInfo ? (
                                    <div className="flex-1 h-9.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse border border-slate-200 dark:border-slate-700" />
                                  ) : (
                                    <select
                                      value={cr.roleId || ''}
                                      onChange={e => handleSelectDiscordRole(cr.key, null, e.target.value, true, cr.id)}
                                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer truncate"
                                    >
                                      <option value="">{t('clan_auto_14', '-- Выберите роль --')}</option>
                                      {(discordInfo?.roles || []).map(dRole => (
                                        <option key={dRole.id} value={dRole.id}>
                                          {dRole.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCreateRoleInDiscord(cr, true, cr.name)}
                                    disabled={isCreatingThis || creatingRoleKey !== null}
                                    className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-slate-300 dark:border-slate-700 hover:border-amber-400 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    title={t('clan_roles_create_in_discord') || 'Создать роль на Discord сервере и привязать'}
                                  >
                                    {isCreatingThis ? (
                                      <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Plus className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden sm:inline">{t('clan_auto_15', 'Создать')}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Status & Delete button */}
                              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-5 border-t md:border-t-0 border-amber-200/50 dark:border-amber-800/40 shrink-0">
                                <div className="w-28 flex justify-center">
                                  {cr.roleId ? (
                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {t('clan_auto_16', 'Привязано')}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                                      {t('clan_auto_17', 'Не привязано')}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomRole(cr.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
                                  title={t('clan_roles_delete_template') || 'Удалить шаблон роли'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              
    </>
  );
}
