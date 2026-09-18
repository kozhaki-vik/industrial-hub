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
import { VoiceRoomsSkeleton } from '../../components/Skeleton';

export default function VoiceTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  const voiceConfig = dynamicVoiceData?.config || { enabled: false, categoryId: '', generatorChannelId: '', template: `🔊 ${t('clan_voice_party_tpl', 'Пати')} {user}`, defaultLimit: 0 };
              const activeRooms = dynamicVoiceData?.activeRooms || [];
              const voiceChannels = dynamicVoiceData?.channels || discordInfo?.channels || [];
  return (
    <>

                <div className="space-y-6 max-w-5xl">
                  {loadingVoice && !dynamicVoiceData ? (
                    <VoiceRoomsSkeleton />
                  ) : (
                    <>
                      {/* Section 1: Settings Form (Join-to-Create) */}
                      <form onSubmit={saveDynamicVoiceConfig} noValidate className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                                {t('clan_auto_30', 'Настройки системы Join-to-Create')}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t('clan_auto_31', 'Настройте категорию и канал для автоматического создания пати')}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={fetchDynamicVoice}
                              disabled={loadingVoice}
                              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${loadingVoice ? 'animate-spin' : ''}`} />
                              <span>{t('clan_auto_71', 'Обновить')}</span>
                            </button>
                          </div>
                          <ToggleSwitch
                            checked={!!voiceConfig.enabled}
                            onChange={val => {
                              const updated = { ...voiceConfig, enabled: val };
                              queueAutoSaveVoice(updated, true);
                            }}
                            activeColor="orange"
                          />
                        </div>

                        <div className={`space-y-6 transition-opacity duration-200 ${!voiceConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChannelSelect
                              label={t('clan_voice_category_label')}
                              description={t('clan_voice_category_desc')}
                              value={voiceConfig.categoryId || ''}
                              onChange={(val) => {
                                const updated = { ...voiceConfig, categoryId: val };
                                queueAutoSaveVoice(updated, true);
                              }}
                              discordChannels={voiceChannels}
                              typeFilter={4}
                            />

                            <ChannelSelect
                              label={t('clan_voice_generator_label')}
                              description={t('clan_voice_generator_desc')}
                              value={voiceConfig.generatorChannelId || ''}
                              onChange={(val) => {
                                const updated = { ...voiceConfig, generatorChannelId: val };
                                queueAutoSaveVoice(updated, true);
                              }}
                              discordChannels={voiceChannels}
                              typeFilter={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {t('clan_voice_template_label')}
                              </label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                {t('clan_voice_template_desc')}
                              </p>
                              <input
                                type="text"
                                value={voiceConfig.template || ''}
                                onChange={(e) => {
                                  const updated = { ...voiceConfig, template: e.target.value };
                                  queueAutoSaveVoice(updated, false);
                                }}
                                onBlur={(e) => {
                                  const updated = { ...voiceConfig, template: e.target.value };
                                  queueAutoSaveVoice(updated, true);
                                }}
                                placeholder={t('clan_auto_109', '🔊 Пати {user}')}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-shadow"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {t('clan_voice_limit_label')}
                              </label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                {t('clan_voice_limit_desc')}
                              </p>
                              <select
                                value={voiceConfig.defaultLimit ?? 0}
                                onChange={(e) => {
                                  const updated = { ...voiceConfig, defaultLimit: parseInt(e.target.value, 10) || 0 };
                                  queueAutoSaveVoice(updated, true);
                                }}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-shadow"
                              >
                                <option value={0}>0 — {t('clan_voice_unlimited')}</option>
                                <option value={2}>{t('clan_auto_32', '2 места (Дуо)')}</option>
                                <option value={3}>{t('clan_auto_33', '3 места (Трио)')}</option>
                                <option value={4}>{t('clan_auto_34', '4 места (Квадро)')}</option>
                                <option value={5}>{t('clan_auto_35', '5 мест (Пятерка)')}</option>
                                <option value={6}>{t('clan_auto_36', '6 мест')}</option>
                                <option value={8}>{t('clan_auto_37', '8 мест')}</option>
                                <option value={10}>{t('clan_auto_38', '10 мест')}</option>
                                <option value={12}>{t('clan_auto_39', '12 мест')}</option>
                                <option value={16}>{t('clan_auto_40', '16 мест')}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </form>

                      {/* Section 2: Banner with Auto-setup & Title with ? tooltip */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200 dark:border-orange-900/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20 shrink-0">
                            <Volume2 className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {t('clan_voice_title')}
                            </h3>
                            <div className="group relative inline-flex">
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold cursor-default text-slate-600 dark:text-slate-300 select-none">
                                ?
                              </div>
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-slate-800 text-slate-100 text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none leading-relaxed">
                                {t('clan_voice_desc')}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoSetupDynamicVoice}
                          disabled={voiceActionLoading}
                          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:border-orange-300 dark:hover:border-orange-700 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>{voiceActionLoading ? 'Создание...' : t('clan_voice_auto_setup_btn')}</span>
                        </button>
                      </div>

                      {/* Section 2: Active Temporary Rooms Monitoring */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                              {t('clan_voice_active_title')}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60">
                              {activeRooms.length}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={fetchDynamicVoice}
                            disabled={loadingVoice || voiceActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${loadingVoice ? 'animate-spin' : ''}`} />
                            <span>{t('clan_voice_refresh_btn')}</span>
                          </button>
                        </div>

                        {activeRooms.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Radio className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                              {t('clan_voice_no_rooms')}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeRooms.map(room => (
                              <div
                                key={room.channelId}
                                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Volume2 className="w-4 h-4 text-orange-500 shrink-0" />
                                      <h5 className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[220px]" title={room.name}>
                                        {room.name}
                                      </h5>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      {t('clan_voice_owner')} <span className="font-medium text-slate-700 dark:text-slate-300">{room.ownerName || 'Unknown'}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRoomLimit({
                                          channelId: room.channelId,
                                          name: room.name,
                                          limit: room.userLimit || 0
                                        });
                                      }}
                                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                                      title={t('clan_voice_change_limit_title') || 'Изменить лимит мест'}
                                    >
                                      <Sliders className="w-3 h-3" />
                                      <span>{room.userLimit > 0 ? room.userLimit : '∞'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const confirmed = await showConfirm({
                                          title: t('clan_voice_delete_room_btn', 'Удалить комнату'),
                                          message: `${t('clan_voice_delete_confirm', 'Удалить комнату')} "${room.name}"? ${t('clan_voice_delete_confirm2', 'Все участники будут отключены.')}`,
                                          confirmText: t('confirm_btn', 'Удалить'),
                                          danger: true
                                        });
                                        if (confirmed) {
                                          handleManageDynamicRoom('delete_room', room.channelId);
                                        }
                                      }}
                                      className="p-1.5 text-xs font-medium rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                      title={t('clan_voice_delete_room_btn')}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Members list */}
                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex justify-between">
                                    <span>{t('clan_room_members', 'Участники')} ({room.members?.length || 0}{room.userLimit > 0 ? ` / ${room.userLimit}` : ''}):</span>
                                  </div>
                                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                    {room.members?.map(m => (
                                      <div
                                        key={m.id}
                                        className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <img
                                            src={m.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                            alt=""
                                            className="w-5 h-5 rounded-full shrink-0"
                                          />
                                          <span className="truncate text-slate-800 dark:text-slate-200 font-medium max-w-[130px]" title={m.displayName}>
                                            {m.displayName}
                                          </span>
                                          {m.isMuted && (
                                            <MicOff className="w-3 h-3 text-red-500 shrink-0" title={t('clan_voice_muted')} />
                                          )}
                                          {m.isDeaf && (
                                            <VolumeX className="w-3 h-3 text-red-500 shrink-0" title={t('clan_voice_deafened')} />
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleManageDynamicRoom('kick_member', room.channelId, { userId: m.id })}
                                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                                          title={t('clan_auto_100', 'Отключить из голосового канала')}
                                        >
                                          <UserX className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              
    </>
  );
}
