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

export default function StatsTab() {
  const { BOT_INVITE_URL, ClanManager, aConfig, activeDevGuildIdRef, activeGid, activeTab, activeTpl, activeVotes, addLog, adsChannel, afkTimer, appChannel, appFilter, appSearch, applicationsData, autoSaveConfig, autoSetupModalData, botSearchIndex, botSearchQuery, boundStandardIds, cConfig, cfgToSend, channelName, channelsConfig, checkDevMode, checkIsFullScreen, checkingInvite, checkingRecruitmentInvite, clanName, clanWarnings, cleanup, config, configError, confirmed, copiedCommand, copy, creatingInvite, creatingLogChannel, creatingRecruitmentInvite, creatingRoleKey, curCfg, currentG, currentRConfig, currentRecLink, customRoleByRoleId, data, defKeys, defMod, defaultLogChannelId, defaultRoleChannelKeys, delay, details, devAdminMode, devGuilds, devShowServerGrid, discordInfo, discordRole, dossierFilter, dossierSearch, dossiersData, dynamicVoiceData, editingRoomLimit, elapsed, enabled, err, error, fallbackConfig, fetchApplications, fetchClanWarnings, fetchConfig, fetchDiscordInfo, fetchDossiers, fetchDynamicVoice, fetchUserWarnings, fetchedConfig, filtered, filteredBotSettings, filteredDevGuilds, firstLeader, flushSave, flushVoiceSave, foundDiscordRole, fromConfig, getChannelId, getDefaultModeratorName, getLivePreviewData, getSteamProfileUrl, guildId, guildIdRef, guildSearchQuery, handleAddCustomRole, handleAddWarn, handleAutoSetupDynamicVoice, handleBotSearchChange, handleBotSearchClear, handleClanNameChange, handleClearApplications, handleClearUserWarns, handleCopyCommand, handleCreateDiscordLogChannel, handleCreatePermanentInvite, handleCreateRecruitmentInvite, handleCreateRoleInDiscord, handleDeleteCustomRole, handleDeleteStandardRole, handleExecuteFactoryReset, handleGlobalSearchDossier, handleLink, handleManageDynamicRoom, handleMessage, handleMoveRolesUp, handleRefreshDevGuilds, handleRemoveWarn, handleResize, handleRestoreStandardRoles, handleRoleNameBlur, handleRoleNameChange, handleSaveDossier, handleSelectDevGuild, handleSelectDiscordRole, handleSendCrossClanMessage, handleSyncDiscordRoles, handleUnlink, handleViewTranscript, hasPromptedRef, hwid, idx, inputEl, interval, inviteDetails, inviteLink, inviteStatus, isCompanionWindowVisible, isDevAdminActive, isDevAuthenticated, isDocFs, isFullScreenWindow, isGuildDropdownOpen, isMaximized, isResetting, isSelected, isValid, l, lastActivityRef, lastLinkAttempt, lastSaveTimeRef, lastSavedConfigRef, lastVerifiedLinkRef, lastVerifiedRecruitmentLinkRef, lastVoiceSaveTimeRef, latestConfigRef, latestVoiceConfigRef, leader, leaderDisplay, leaders, linkCode, linkToCheck, loadingApps, loadingClanWarnings, loadingConfig, loadingDevGuilds, loadingDossiers, loadingUserWarnings, loadingVoice, loggingEventGroups, logs, mainLink, matchByNameIdx, modMember, modTag, movingRoles, msg, navigate, newBadWordInput, newChannelId, newDiscordName, newId, newRConfig, newRole, newRolesCount, newUrl, newWarnReason, nextStep, now, oldName, onMsg, onlyGuild, openExternalUrl, openUserWarningsModal, parsed, pendingConfigRef, pendingVoiceConfigRef, permissions, prevTabBeforeSearch, previewData, previewVoteIndex, queueAutoSave, queueAutoSaveVoice, r, rConfig, raw, rc, rcLink, recruitmentInviteDetails, recruitmentInviteStatus, reqId, res, resetSecs, resetSections, roleColor, roleColors, roleId, roleIdentifier, roleMap, roleName, rosterData, safeIdx, sanitized, saveConfig, saveDynamicVoiceConfig, saveStatus, saveTimerRef, saved, savedGuildId, selectedProfileForDossier, selectedUserForWarns, sendProxyAction, setActiveTab, setActiveVotes, setAppFilter, setAppSearch, setApplicationsData, setAutoSetupModalData, setBotSearchQuery, setCheckingInvite, setCheckingRecruitmentInvite, setClanWarnings, setConfig, setCopiedCommand, setCreatingInvite, setCreatingLogChannel, setCreatingRecruitmentInvite, setCreatingRoleKey, setDevAdminMode, setDevGuilds, setDevShowServerGrid, setDiscordInfo, setDossierFilter, setDossierSearch, setDossiersData, setDynamicVoiceData, setEditingRoomLimit, setError, setGuildId, setGuildSearchQuery, setInviteDetails, setInviteStatus, setIsDevAuthenticated, setIsFullScreenWindow, setIsGuildDropdownOpen, setIsResetting, setLastLinkAttempt, setLinkCode, setLoadingApps, setLoadingClanWarnings, setLoadingConfig, setLoadingDevGuilds, setLoadingDossiers, setLoadingUserWarnings, setLoadingVoice, setLogs, setMovingRoles, setNewBadWordInput, setNewWarnReason, setPreviewVoteIndex, setRecruitmentInviteDetails, setRecruitmentInviteStatus, setResetSections, setRosterData, setSaveStatus, setSelectedProfileForDossier, setSelectedUserForWarns, setShowDiscordLivePreview, setShowResetModal, setShowSetupWizard, setStatsData, setStatsSortField, setStatsSortOrder, setStatus, setSyncModalData, setTranscriptModal, setUserWarningsList, setVoiceActionLoading, setWarnActionLoading, setWarnModerator, showDiscordLivePreview, showResetModal, showSetupWizard, signRes, standardRoleKeys, standardRoles, startAutoSetup, statsData, statsSortField, statsSortOrder, status, syncModalData, syncPermissions, t, tabs, target, targetGid, timeSinceLastSave, timeout, trackedEvents, transcriptModal, trimmed, updateActivity, updated, updatedConfig, updatedCount, updatedRecruitment, userWarningsList, val, verifyInvite, verifyRecruitmentInvite, voiceActionLoading, voiceSaveTimerRef, voteChannel, wTemplates, warnActionLoading, warnModerator, ws } = useContext(ClanManagerContext);
  const handleStatsSort = (field) => {
                if (statsSortField === field) {
                  setStatsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setStatsSortField(field);
                  setStatsSortOrder(field === 'displayName' ? 'asc' : 'desc');
                }
              };

              const sortedStats = !statsData || !Array.isArray(statsData) ? [] : [...statsData].sort((a, b) => {
                let cmp = 0;
                if (statsSortField === 'displayName') {
                  const nameA = (a.displayName || a.username || '').toLowerCase();
                  const nameB = (b.displayName || b.username || '').toLowerCase();
                  cmp = nameA.localeCompare(nameB);
                } else {
                  const valA = Number(a[statsSortField]) || 0;
                  const valB = Number(b[statsSortField]) || 0;
                  cmp = valA - valB;
                }
                return statsSortOrder === 'asc' ? cmp : -cmp;
              });
  return (
    <>

                <div className="space-y-6 max-w-5xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                        {t('clan_stats_title') || 'Статистика участников'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('clan_stats_sort_tip')}
                      </p>
                    </div>
                    <button onClick={() => setStatsData(null)} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center self-start sm:self-auto cursor-pointer">
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      {t('clan_auto_73', 'Обновить')}
                    </button>
                  </div>
                  
                  {!statsData ? (
                    <StatsTableSkeleton rows={8} />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/60 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 select-none">
                          <tr>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('displayName')} 
                              className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{t('clan_stats_col_member') || 'Участник'}</span>
                                {statsSortField === 'displayName' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('voiceTime')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_voice') || 'Время в Voice'}</span>
                                {statsSortField === 'voiceTime' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('messageCount')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_messages') || 'Сообщения'}</span>
                                {statsSortField === 'messageCount' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('wipesPlayed')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_wipes') || 'Вайпы'}</span>
                                {statsSortField === 'wipesPlayed' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('votesCast')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_votes') || 'Голосования'}</span>
                                {statsSortField === 'votesCast' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('warnCount')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_warns') || 'Варны'}</span>
                                {statsSortField === 'warnCount' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStats.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-8 text-center">{t('clan_auto_74', 'Нет данных для отображения.')}</td>
                            </tr>
                          ) : (
                            sortedStats.map(stat => (
                              <tr key={stat.userId} className="bg-white border-b dark:bg-slate-900/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white flex items-center">
                                  <img src={stat.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="avatar" className="w-8 h-8 rounded-full mr-3" />
                                  <div>
                                    <div className={!stat.isMember ? "text-slate-400 line-through" : ""}>{stat.displayName}</div>
                                    <div className="text-[10px] text-slate-500">@{stat.username}</div>
                                  </div>
                                </th>
                                <td className="px-6 py-4 text-center font-mono">
                                  {Math.floor(stat.voiceTime / 3600)}{t('clan_h_short', 'ч')} {Math.floor((stat.voiceTime % 3600) / 60)}{t('clan_m_short', 'м')}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                  {stat.messageCount}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                  {stat.wipesPlayed}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                  {stat.votesCast}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => openUserWarningsModal(stat)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                      (stat.warnCount || 0) > 0
                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 border border-transparent'
                                    }`}
                                    title={t('clan_stats_warns_tooltip') || 'Нажмите для управления предупреждениями'}
                                  >
                                    {(stat.warnCount || 0) > 0 ? (
                                      <>
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span>{stat.warnCount}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                        <span>0</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              
    </>
  );
}
