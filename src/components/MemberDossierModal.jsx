import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Star, Shield, ShieldAlert, AlertTriangle, Check, Copy, ExternalLink, 
  Search, Save, User, Clock, Calendar, FileText, Ban, Crosshair, Plane, 
  Hammer, Pickaxe, Award, CheckCircle2, RefreshCw, RotateCcw, Send, MessageSquare
} from 'lucide-react';

export default function MemberDossierModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onSearchGlobal,
  onSendCrossClanMessage,
  canEdit = true
}) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'history'
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLeaderId, setCopiedLeaderId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Form state
  const [status, setStatus] = useState('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  
  // Cheater state: 'NONE' | 'SUSPICION' | 'CONFIRMED'
  const [cheaterStatus, setCheaterStatus] = useState('NONE');
  const [cheaterReason, setCheaterReason] = useState('');
  const [cheaterProofUrl, setCheaterProofUrl] = useState('');

  // Ratings
  const [shootingRating, setShootingRating] = useState(0);
  const [flyingRating, setFlyingRating] = useState(0);
  const [buildingRating, setBuildingRating] = useState(0);
  const [farmingRating, setFarmingRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);

  // Global search state
  const [globalData, setGlobalData] = useState(null);
  const [searchingGlobal, setSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState(null);

  // Cross-clan chat state
  const [leaderMessageText, setLeaderMessageText] = useState('');
  const [selectedTargetGuildId, setSelectedTargetGuildId] = useState('');
  const [sendingLeaderMessage, setSendingLeaderMessage] = useState(false);
  const [leaderMessageSuccess, setLeaderMessageSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setStatus(profile.status || 'ACTIVE');
      setStatusReason(profile.statusReason || '');
      setNotes(profile.notes || '');
      setIsBlacklisted(Boolean(profile.isBlacklisted || profile.status === 'BLACKLISTED'));
      setBlacklistReason(profile.blacklistReason || '');
      
      const initialCheaterStatus = profile.cheaterStatus || (profile.cheaterReport ? 'CONFIRMED' : 'NONE');
      setCheaterStatus(initialCheaterStatus);
      setCheaterReason(profile.cheaterReason || '');
      setCheaterProofUrl(profile.cheaterProofUrl || '');

      setShootingRating(Number(profile.shootingRating) || 0);
      setFlyingRating(Number(profile.flyingRating) || 0);
      setBuildingRating(Number(profile.buildingRating) || 0);
      setFarmingRating(Number(profile.farmingRating) || 0);
      setOverallRating(Number(profile.overallRating) || 0);

      setGlobalData(null);
      setGlobalSearchError(null);
      setSaveSuccess(false);
      setSaveError(null);
      setLeaderMessageText('');
      setLeaderMessageSuccess(false);
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleCopyUserId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyText = (text, key) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedLeaderId(key);
      setTimeout(() => setCopiedLeaderId(null), 2000);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'BLACKLISTED') {
      setIsBlacklisted(true);
    } else if (newStatus === 'ACTIVE') {
      setIsBlacklisted(false);
    }
  };

  const isValidHttpUrl = (string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!canEdit || saving) return;

    if (cheaterStatus !== 'NONE') {
      if (!cheaterReason.trim()) {
        setSaveError('Укажите причину, почему считаете игрока читером / подозреваемым.');
        return;
      }
      if (cheaterProofUrl.trim() && !isValidHttpUrl(cheaterProofUrl.trim())) {
        setSaveError('Ссылка на доказательства должна быть корректным веб-адресом (начинаться с https:// или http://).');
        return;
      }
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updates = {
        status,
        statusReason,
        notes,
        isBlacklisted: status === 'BLACKLISTED' ? true : isBlacklisted,
        blacklistReason: status === 'BLACKLISTED' ? (blacklistReason || statusReason) : blacklistReason,
        cheaterReport: cheaterStatus !== 'NONE',
        cheaterStatus,
        cheaterReason: cheaterStatus !== 'NONE' ? cheaterReason.trim() : null,
        cheaterProofUrl: cheaterStatus !== 'NONE' ? cheaterProofUrl.trim() : null,
        shootingRating,
        flyingRating,
        buildingRating,
        farmingRating,
        overallRating
      };

      if (onSave) {
        await onSave(profile.userId, updates);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleRunGlobalSearch = async () => {
    if (!onSearchGlobal || searchingGlobal) return;
    setSearchingGlobal(true);
    setGlobalSearchError(null);
    try {
      const query = profile.steamId || profile.userId;
      const res = await onSearchGlobal(query);
      if (res && res.success) {
        setGlobalData(res);
        const otherGuildIds = (res.profiles || [])
          .map(p => p.guildId)
          .filter(gId => gId !== profile.guildId);
        if (otherGuildIds.length > 0) {
          setSelectedTargetGuildId(otherGuildIds[0]);
        }
      } else {
        setGlobalSearchError(res?.error || 'Ничего не найдено');
      }
    } catch (err) {
      setGlobalSearchError(err.message || 'Ошибка поиска по глобальной базе');
    } finally {
      setSearchingGlobal(false);
    }
  };

  const handleSendMessageToLeader = async (e) => {
    if (e) e.preventDefault();
    if (!onSendCrossClanMessage || !leaderMessageText.trim() || sendingLeaderMessage) return;

    setSendingLeaderMessage(true);
    setLeaderMessageSuccess(false);
    try {
      const targetUserId = profile.userId;
      const res = await onSendCrossClanMessage(targetUserId, selectedTargetGuildId, leaderMessageText.trim());
      if (res && res.success) {
        setLeaderMessageText('');
        setLeaderMessageSuccess(true);
        setTimeout(() => setLeaderMessageSuccess(false), 3000);
        if (globalData && res.message) {
          setGlobalData(prev => ({
            ...prev,
            crossClanMessages: [...(prev.crossClanMessages || []), res.message]
          }));
        }
      } else {
        alert(res?.error || 'Не удалось отправить сообщение');
      }
    } catch (err) {
      alert(err.message || 'Ошибка отправки сообщения лидеру');
    } finally {
      setSendingLeaderMessage(false);
    }
  };

  // Parse steam accounts
  let steamAccounts = [];
  if (profile.steamAccountsJson) {
    try {
      const parsed = JSON.parse(profile.steamAccountsJson);
      if (Array.isArray(parsed)) steamAccounts = parsed;
    } catch (e) {}
  }
  if (steamAccounts.length === 0 && profile.steamId) {
    steamAccounts.push({
      steamId: profile.steamId,
      name: profile.username || 'Steam Profile',
      rustHours: profile.verifiedHours ?? null,
      steamUrl: `https://steamcommunity.com/profiles/${profile.steamId}`,
      bmUrl: `https://www.battlemetrics.com/players?filter[search]=${profile.steamId}`
    });
  }

  // Helper for rendering rating stars with full reset capability
  const renderStarRating = (value, onChange, label, icon) => {
    const Icon = icon;
    return (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-orange-500 shrink-0" />}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={!canEdit}
              onClick={() => onChange(value === star ? 0 : star)}
              className={`p-1 transition-transform hover:scale-110 cursor-pointer disabled:cursor-default ${
                star <= value ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-200'
              }`}
              title={value === star ? 'Нажмите, чтобы снять оценку' : `${star}/5`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          ))}
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1.5 w-6 text-right">
            {value > 0 ? `${value}/5` : '0/5'}
          </span>
          {canEdit && value > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="ml-1 p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Убрать оценку (сбросить в 0)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">В клане</span>;
      case 'LEFT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60">Вышел (Архив)</span>;
      case 'KICKED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">Исключен</span>;
      case 'BLACKLISTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300/60 dark:border-red-700/60">Черный список</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{st}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={profile.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm shrink-0 object-cover"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {profile.username || 'Участник клана'}
                </h3>
                {getStatusBadge(status)}
                {cheaterStatus === 'CONFIRMED' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-sm flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> 100% Читер
                  </span>
                )}
                {cheaterStatus === 'SUSPICION' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Подозрение
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>ID: {profile.userId}</span>
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Скопировать ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {profile.joinedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(profile.joinedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 shrink-0 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'dossier'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📋 Личное дело и навыки
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            История в других кланах
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          {activeTab === 'dossier' && (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Profile Details (Steam / Age / Hours / Exp) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Steam Accounts Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    Steam Аккаунты кандидата
                  </h4>
                  {steamAccounts.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">Steam не привязан или не указан в анкете</div>
                  ) : (
                    <div className="space-y-2">
                      {steamAccounts.map((acc, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                              {acc.name || acc.steamId}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Часы Rust: <span className="font-semibold text-orange-600 dark:text-orange-400">{acc.rustHours !== null && acc.rustHours !== undefined ? `${acc.rustHours} ч.` : 'Скрыты'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {acc.steamUrl && (
                              <a
                                href={acc.steamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium flex items-center gap-1"
                              >
                                Steam <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {acc.bmUrl && (
                              <a
                                href={acc.bmUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded text-[11px] font-medium flex items-center gap-1"
                              >
                                BM <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Claimed vs Verified hours summary */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Заявлено в анкете:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.claimedHours ? `${profile.claimedHours} ч.` : 'Не указано'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Подтверждено Steam API:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {profile.verifiedHours !== null && profile.verifiedHours !== undefined ? `${profile.verifiedHours} ч.` : 'Профиль скрыт'}
                    </span>
                  </div>
                </div>

                {/* Age & Experience / Application Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 flex flex-col">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    Данные из анкеты
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Возраст:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.age ? `${profile.age} лет` : 'Не указан'}</span>
                  </div>
                  <div className="flex-1 flex flex-col text-xs space-y-1">
                    <span className="text-slate-500 font-medium">Опыт / Прайм-тайм / О себе:</span>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs leading-relaxed flex-1 overflow-y-auto max-h-[120px] whitespace-pre-line">
                      {profile.experience || 'Не заполнено'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Ratings (1-5 stars) */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Оценка навыков участника (1 – 5 звёзд)
                  </h4>
                  <span className="text-xs text-slate-400">Нажмите на звезду для изменения</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {renderStarRating(shootingRating, setShootingRating, 'Стрельба (PvP)', Crosshair)}
                  {renderStarRating(flyingRating, setFlyingRating, 'Пилотирование (Коптер/Scrap)', Plane)}
                  {renderStarRating(buildingRating, setBuildingRating, 'Строительство (Билдинг)', Hammer)}
                  {renderStarRating(farmingRating, setFarmingRating, 'Фарм (Ресурсы/Компоненты)', Pickaxe)}
                </div>

                <div className="pt-2">
                  {renderStarRating(overallRating, setOverallRating, '⭐ Общая оценка бойца', Star)}
                </div>
              </div>

              {/* Officer Notes / Comments */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Заметки офицеров / Личное дело
                </label>
                <textarea
                  disabled={!canEdit}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Опишите поведение игрока, пунктуальность, участие в рейдах, нарушения или достижения..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-orange-500/50 min-h-[90px]"
                />
              </div>

              {/* Status and Discipline */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  Статус участника и дисциплина
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ACTIVE', label: 'В клане', color: 'emerald' },
                    { id: 'LEFT', label: 'Вышел (Архив)', color: 'slate' },
                    { id: 'KICKED', label: 'Исключен', color: 'amber' },
                    { id: 'BLACKLISTED', label: 'Черный список', color: 'red' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleStatusChange(opt.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        status === opt.id
                          ? opt.color === 'emerald'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : opt.color === 'amber'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : opt.color === 'red'
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {status !== 'ACTIVE' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {status === 'BLACKLISTED' ? 'Причина занесения в Черный Список *' : 'Причина выхода / исключения'}
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={status === 'BLACKLISTED' ? blacklistReason : statusReason}
                      onChange={e => {
                        if (status === 'BLACKLISTED') {
                          setBlacklistReason(e.target.value);
                          setStatusReason(e.target.value);
                        } else {
                          setStatusReason(e.target.value);
                        }
                      }}
                      placeholder={status === 'BLACKLISTED' ? 'Например: Токсичность, оскорбление клана, слив баз...' : 'Причина...'}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                )}

                {/* Cheater Selection Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className={`w-4 h-4 shrink-0 ${cheaterStatus === 'CONFIRMED' ? 'text-red-500' : cheaterStatus === 'SUSPICION' ? 'text-amber-500' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Проверка на читы и софт</div>
                        <div className="text-[11px] text-slate-500">Подозрение или подтвержденный читер с фиксацией доказательств</div>
                      </div>
                    </div>
                    
                    {/* 3-State Selector */}
                    <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setCheaterStatus('NONE')}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                          cheaterStatus === 'NONE'
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                      >
                        Чист
                      </button>
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setCheaterStatus('SUSPICION')}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                          cheaterStatus === 'SUSPICION'
                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                            : 'text-slate-500 hover:text-amber-600 dark:hover:text-amber-400'
                        }`}
                      >
                        ⚠️ Подозрение
                      </button>
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setCheaterStatus('CONFIRMED')}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                          cheaterStatus === 'CONFIRMED'
                            ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                            : 'text-slate-500 hover:text-red-600 dark:hover:text-red-400'
                        }`}
                      >
                        🚨 100% Читер
                      </button>
                    </div>
                  </div>

                  {/* Detail fields when SUSPICION or CONFIRMED */}
                  {cheaterStatus !== 'NONE' && (
                    <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-semibold text-red-900 dark:text-red-300 mb-1">
                          Почему считаете читером *
                        </label>
                        <textarea
                          rows={2}
                          disabled={!canEdit}
                          value={cheaterReason}
                          onChange={e => setCheaterReason(e.target.value)}
                          placeholder="Опишите подозрительные моменты: неестественный трекинг, стрельба сквозь текстуры, префайры без инфы..."
                          className="w-full px-3 py-2 border border-red-200 dark:border-red-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-red-900 dark:text-red-300 mb-1">
                          Ссылка на доказательства (одна ссылка) *
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            disabled={!canEdit}
                            value={cheaterProofUrl}
                            onChange={e => {
                              setCheaterProofUrl(e.target.value);
                              setProofUrlError(null);
                            }}
                            placeholder="https://youtu.be/... или https://medal.tv/..."
                            className="flex-1 px-3 py-2 border border-red-200 dark:border-red-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500/50 font-mono"
                          />
                          {cheaterProofUrl && isValidHttpUrl(cheaterProofUrl) && (
                            <a
                              href={cheaterProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/60 text-red-700 dark:text-red-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                              title="Проверить ссылку"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Открыть</span>
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Разрешена строго одна проверенная веб-ссылка на видеозапись или скриншот на хостинге.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Досье успешно обновлено!</span>
                </div>
              )}
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Глобальная проверка по базе всех кланов Industrial Hub
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Поиск по Discord ID: <strong className="text-slate-800 dark:text-slate-200">{profile.userId}</strong> и Steam ID: <strong className="text-slate-800 dark:text-slate-200">{profile.steamId || 'Не указан'}</strong></span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={searchingGlobal}
                  onClick={handleRunGlobalSearch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {searchingGlobal ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Поиск...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Начать поиск</span>
                    </>
                  )}
                </button>
              </div>

              {globalSearchError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  {globalSearchError}
                </div>
              )}

              {globalData && (
                <div className="space-y-4">
                  {/* Multi-Clan Warning Banner */}
                  {globalData.isMultiClan && (
                    <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700/80 shadow-sm space-y-2.5 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-xs uppercase tracking-wide">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>⚠️ ОБНАРУЖЕН МУЛЬТИКЛАН / РАСХОЖДЕНИЯ В ДАННЫХ</span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Данный игрок одновременно числится на нескольких серверах кланов или указал противоречивую информацию о себе (часы, возраст). Рекомендуется связаться с лидерами других кланов.
                      </p>
                      {globalData.conflicts && globalData.conflicts.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-1">
                          {globalData.conflicts.map((c, i) => (
                            <div key={i} className="text-amber-900 dark:text-amber-200 font-medium flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Найдено записей на серверах: {globalData.profiles?.length || 0}</span>
                  </div>

                  {(!globalData.profiles || globalData.profiles.length === 0) ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      Записей в других кланах не найдено. Пользователь не состоял в других кланах или у него чистая история.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {globalData.profiles.map((rec, idx) => {
                        const guildLeader = globalData.leaders?.[rec.guildId];
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border text-xs space-y-3 ${
                              rec.isBlacklisted || rec.status === 'BLACKLISTED' || rec.cheaterReport
                                ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                                : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                <span className="text-sm">{rec.guild?.name || `Сервер ID: ${rec.guildId}`}</span>
                                {getStatusBadge(rec.status)}
                                {rec.cheaterStatus === 'CONFIRMED' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                                    🚨 ЧИТЕР
                                  </span>
                                )}
                                {rec.cheaterStatus === 'SUSPICION' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                                    ⚠️ ПОДОЗРЕНИЕ
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Обновлено: {new Date(rec.updatedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Stated Data in this Clan */}
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              {rec.age && (
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                                  Возраст: {rec.age} лет
                                </span>
                              )}
                              {(rec.claimedHours || rec.verifiedHours) && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                                  Часы Rust: {rec.verifiedHours ? `${rec.verifiedHours} ч. (проверено)` : `${rec.claimedHours} ч. (заявлено)`}
                                </span>
                              )}
                            </div>

                            {rec.cheaterReason && (
                              <div className="p-2 rounded bg-red-100/90 dark:bg-red-900/40 text-red-800 dark:text-red-200 text-[11px] space-y-1">
                                <div><strong>Причина отметки читера:</strong> {rec.cheaterReason}</div>
                                {rec.cheaterProofUrl && (
                                  <div>
                                    <a
                                      href={rec.cheaterProofUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-red-700 dark:text-red-300 underline font-semibold flex items-center gap-1"
                                    >
                                      <span>Доказательства: {rec.cheaterProofUrl}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {rec.blacklistReason && (
                              <div className="p-2 rounded bg-red-100/80 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[11px]">
                                <strong>Причина ЧС:</strong> {rec.blacklistReason}
                              </div>
                            )}

                            {rec.notes && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                                <strong>Заметки офицеров:</strong> {rec.notes}
                              </div>
                            )}

                            {/* Clan Leader Contact Card */}
                            {guildLeader && (
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <img
                                    src={guildLeader.leaderAvatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                    alt="Leader Avatar"
                                    className="w-7 h-7 rounded-full object-cover shrink-0 border"
                                  />
                                  <div className="overflow-hidden">
                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                      Лидер: {guildLeader.leaderDisplayName || guildLeader.leaderTag}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate">
                                      ID: {guildLeader.leaderId}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(guildLeader.leaderId, `leader_${rec.guildId}`)}
                                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Скопировать Discord ID лидера"
                                  >
                                    {copiedLeaderId === `leader_${rec.guildId}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    <span>Копировать ID</span>
                                  </button>
                                  {guildLeader.leaderId && (
                                    <a
                                      href={`https://discord.com/users/${guildLeader.leaderId}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Открыть профиль в Discord"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Discord</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Cross-Clan Leader Messaging Widget */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        Связь между лидерами кланов по этому игроку
                      </h4>
                      <span className="text-[10px] text-slate-400">Прямой чат в Industrial Hub</span>
                    </div>

                    {/* Messages Thread */}
                    {globalData.crossClanMessages && globalData.crossClanMessages.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 scrollbar-thin">
                        {globalData.crossClanMessages.map((msg, i) => (
                          <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-0.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic text-center py-2">
                        Сообщений между лидерами по этому игроку пока нет. Напишите, чтобы связаться.
                      </div>
                    )}

                    {/* Message input */}
                    <form onSubmit={handleSendMessageToLeader} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={leaderMessageText}
                          onChange={e => setLeaderMessageText(e.target.value)}
                          placeholder="Напишите сообщение лидеру другого клана..."
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                          type="submit"
                          disabled={!leaderMessageText.trim() || sendingLeaderMessage}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sendingLeaderMessage ? 'Отправка...' : 'Отправить'}</span>
                        </button>
                      </div>
                      {leaderMessageSuccess && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Сообщение успешно доставлено и сохранено!</span>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Закрыть
          </button>

          {canEdit && activeTab === 'dossier' && (
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Сохранить изменения</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
