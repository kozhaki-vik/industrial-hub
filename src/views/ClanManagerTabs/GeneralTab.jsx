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

export default function GeneralTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  return (
    <>

              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-4xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {t('clan_auto_1', 'Основные настройки')}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('clan_name_label') || 'Название клана'} *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800/50 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                      value={config?.name ?? ''}
                      onChange={e => handleClanNameChange(e.target.value, false)}
                      onBlur={e => handleClanNameChange(e.target.value, true)}
                      placeholder={t('clan_name_placeholder') || 'Например: TITAN'}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 h-[42px]">
                    <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                      {t('clan_recruitment_open_title') || 'Набор в клан открыт'}
                    </span>
                    <ToggleSwitch
                      checked={!!config.recruitmentOpen}
                      onChange={val => {
                        const updated = { ...config, recruitmentOpen: val };
                        queueAutoSave(updated, true);
                      }}
                      activeColor="blue"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('clan_discord_link_title') || 'Основная ссылка на Discord'}
                    </label>
                    <button
                      type="button"
                      onClick={handleCreatePermanentInvite}
                      disabled={creatingInvite}
                      className="text-xs font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
                    >
                      {creatingInvite ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('clan_discord_link_generating') || 'Создание ссылки...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t('clan_discord_link_generate') || 'Создать вечную ссылку'}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 outline-none transition-shadow ${
                        inviteStatus === 'invalid' 
                          ? 'border-red-400 dark:border-red-500/60 focus:ring-red-500/40' 
                          : inviteStatus === 'valid'
                          ? 'border-emerald-400 dark:border-emerald-500/60 focus:ring-emerald-500/40'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/50'
                      }`}
                      value={config?.discordLink ?? ''}
                      onChange={e => {
                        const updated = { ...config, discordLink: e.target.value };
                        queueAutoSave(updated, false);
                      }}
                      onBlur={e => {
                        const val = e.target.value;
                        if (val !== (config?.discordLink ?? '')) {
                          const updated = { ...config, discordLink: val };
                          queueAutoSave(updated, true);
                        }
                        if (val.trim() && val.trim() !== lastVerifiedLinkRef.current) {
                          verifyInvite(val);
                        } else if (!val.trim()) {
                          setInviteStatus(null);
                          setInviteDetails(null);
                        }
                      }}
                      placeholder="https://discord.gg/..."
                    />

                    {checkingInvite && (
                      <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Verification Status Badge / Alert */}
                  {inviteStatus === 'valid' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {t('clan_discord_link_valid') || 'Ссылка активна'}
                        {inviteDetails?.serverName ? ` (${inviteDetails.serverName}${inviteDetails.memberCount ? ` • ${inviteDetails.memberCount} ${t('clan_members_short', 'уч.')}` : ''})` : ''}
                      </span>
                    </div>
                  )}

                  {inviteStatus === 'invalid' && (
                    <div className="mt-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('clan_discord_link_invalid') || 'Ссылка недействительна или была удалена'}</span>
                      </div>
                      <p className="text-[11px] opacity-90">
                        {t('clan_discord_link_invalid_hint') || 'Приглашение устарело или было удалено в Discord. Сгенерируйте новую ссылку кнопкой выше.'}
                      </p>
                    </div>
                  )}
                </div>



                {/* Actions: Setup Wizard, Unlink Server, & Factory Reset in 3 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Master / Wizard Setup Card */}
                  <div className="p-4 border border-blue-200 dark:border-blue-800/60 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{t('clan_wizard_btn') || 'Мастер настройки'}</span>
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-1 leading-relaxed">
                        {t('clan_wizard_card_desc') || 'Пошаговый мастер автоматической инициализации ролей, каналов и базовых правил бота.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSetupWizard(true)}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('clan_wizard_btn') || 'Мастер настройки'}</span>
                    </button>
                  </div>

                  {/* Unlink Server Card */}
                  <div className="p-4 border border-red-200 dark:border-red-800/60 rounded-xl bg-red-50/40 dark:bg-red-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                        <Unlink className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{t('clan_unlink_btn') || 'Отвязать сервер'}</span>
                      </h4>
                      <p className="text-xs text-red-700 dark:text-red-300/80 mt-1 leading-relaxed">
                        {t('clan_unlink_card_desc') || 'Отвязать бота от текущего Discord сервера и сбросить привязку.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUnlink}
                      className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Unlink className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('clan_unlink_btn') || 'Отвязать...'}</span>
                    </button>
                  </div>

                  {/* Factory Reset Card */}
                  <div className="p-4 border border-amber-200 dark:border-amber-800/60 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{t('clan_reset_btn') || 'Сброс настроек'}</span>
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                        {t('clan_reset_general_card_desc') || 'Выборочно вернуть роли, каналы, права или весь бот к исходному заводскому состоянию.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('clan_reset_btn') || 'Сбросить...'}</span>
                    </button>
                  </div>
                </div>
              </form>
            
    </>
  );
}
