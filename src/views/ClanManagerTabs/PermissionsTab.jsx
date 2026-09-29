import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import { Check, X, Slash, Shield, Lock } from 'lucide-react';

const PERMISSIONS_LIST = [
  { id: 'ViewChannel', label: 'Просматривать канал', bit: 1024n },
  { id: 'ManageChannels', label: 'Управлять каналом', bit: 16n },
  { id: 'ManageRoles', label: 'Управлять правами', bit: 268435456n },
  { id: 'ManageWebhooks', label: 'Управлять вебхуками', bit: 536870912n },
  { id: 'CreateInstantInvite', label: 'Создавать приглашения', bit: 1n },
  { id: 'SendMessages', label: 'Отправлять сообщения', bit: 2048n },
  { id: 'SendMessagesInThreads', label: 'Отправлять сообщения в ветки', bit: 274877906944n },
  { id: 'CreatePublicThreads', label: 'Создавать публичные ветки', bit: 34359738368n },
  { id: 'CreatePrivateThreads', label: 'Создавать приватные ветки', bit: 68719476736n },
  { id: 'EmbedLinks', label: 'Встраивать ссылки', bit: 16384n },
  { id: 'AttachFiles', label: 'Прикреплять файлы', bit: 32768n },
  { id: 'AddReactions', label: 'Добавлять реакции', bit: 64n },
  { id: 'UseExternalEmojis', label: 'Использовать внешние эмодзи', bit: 262144n },
  { id: 'UseExternalStickers', label: 'Использовать внешние стикеры', bit: 137438953472n },
  { id: 'MentionEveryone', label: 'Упоминание @everyone, @here', bit: 131072n },
  { id: 'ManageMessages', label: 'Управлять сообщениями', bit: 8192n },
  { id: 'ManageThreads', label: 'Управлять ветками', bit: 17179869184n },
  { id: 'ReadMessageHistory', label: 'Читать историю сообщений', bit: 65536n },
  { id: 'SendTTSMessages', label: 'Отправлять TTS-сообщения', bit: 4096n },
  { id: 'UseApplicationCommands', label: 'Использовать команды приложения', bit: 2147483648n },
  { id: 'Connect', label: 'Подключаться (Голосовой)', bit: 1048576n },
  { id: 'Speak', label: 'Говорить (Голосовой)', bit: 2097152n },
  { id: 'Video', label: 'Видео (Голосовой)', bit: 512n },
  { id: 'UseVAD', label: 'Активация по голосу', bit: 33554432n },
  { id: 'PrioritySpeaker', label: 'Приоритетный режим', bit: 256n },
  { id: 'MuteMembers', label: 'Отключать участникам микрофон', bit: 4194304n },
  { id: 'DeafenMembers', label: 'Отключать участникам звук', bit: 8388608n },
  { id: 'MoveMembers', label: 'Перемещать участников', bit: 16777216n },
];

const PermissionRow = React.memo(function PermissionRow({
  perm,
  state,
  onToggle
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{perm.label}</span>
      
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
        <button
          type="button"
          onClick={() => onToggle(perm.id, 'allow')}
          className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${state === 'allow' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-emerald-500'}`}
          title="Разрешить"
        >
          <Check className="w-4 h-4" strokeWidth={state === 'allow' ? 3 : 2} />
        </button>
        
        <button
          type="button"
          onClick={() => onToggle(perm.id, 'inherit')}
          className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${state === 'inherit' ? 'bg-slate-300 dark:bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:text-slate-300'}`}
          title="Наследовать"
        >
          <Slash className="w-4 h-4" strokeWidth={state === 'inherit' ? 3 : 2} />
        </button>

        <button
          type="button"
          onClick={() => onToggle(perm.id, 'deny')}
          className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${state === 'deny' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-500'}`}
          title="Запретить"
        >
          <X className="w-4 h-4" strokeWidth={state === 'deny' ? 3 : 2} />
        </button>
      </div>
    </div>
  );
});

export default function PermissionsTab() {
  const { config, discordInfo, fetchDiscordInfo, sendProxyAction, t } = useContext(ClanManagerContext);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch latest overwrites on mount
  useEffect(() => {
    if (typeof fetchDiscordInfo === 'function') fetchDiscordInfo();
  }, [fetchDiscordInfo]);

  const roles = useMemo(() => discordInfo?.roles || [], [discordInfo?.roles]);
  
  // Collect all configured roles
  const availableRoles = useMemo(() => {
    const roleKeys = [
      'leaderRoleId', 'deputyLeaderRoleId', 'callerRoleId', 'recruiterRoleId', 'mainRosterRoleId',
      'trialRoleId', 'farmerRoleId', 'plantFarmerRoleId', 'electricianRoleId',
      'builderRoleId', 'pilotRoleId'
    ];
    const configuredRoleIds = roleKeys.map(k => config?.[k]).filter(Boolean);
    return [...new Set(configuredRoleIds)]
      .map(id => roles.find(r => r.id === id))
      .filter(Boolean)
      .sort((a, b) => b.position - a.position);
  }, [config, roles]);

  // Select first role by default
  useEffect(() => {
    if (!selectedRole && availableRoles.length > 0) {
      setSelectedRole(availableRoles[0].id);
    }
  }, [availableRoles, selectedRole]);

  // Collect all configured channels
  const availableChannels = useMemo(() => {
    let channelsConfig = {};
    if (config?.channelsConfigJson) {
      try {
        channelsConfig = typeof config.channelsConfigJson === 'string'
          ? JSON.parse(config.channelsConfigJson)
          : config.channelsConfigJson;
      } catch {}
    }
    let logCfg = {};
    if (config?.loggingConfigJson) {
      try {
        logCfg = typeof config.loggingConfigJson === 'string'
          ? JSON.parse(config.loggingConfigJson)
          : config.loggingConfigJson;
      } catch {}
    }

    const channelKeys = ['ticketsCategory', 'applications', 'autoRejectedApplications', 'rejectedApplications', 'leaderboard', 'news', 'votes', 'ads', 'roster'];
    const configuredChannelIds = channelKeys.map(k => channelsConfig[k]).filter(Boolean);
    if (logCfg.defaultChannelId) configuredChannelIds.push(logCfg.defaultChannelId);
    
    return [...new Set(configuredChannelIds)]
      .map(id => discordInfo?.channels?.find(c => c.id === id))
      .filter(Boolean);
  }, [config?.channelsConfigJson, config?.loggingConfigJson, discordInfo?.channels]);

  // Select first channel by default
  useEffect(() => {
    if (!selectedChannel && availableChannels.length > 0) {
      setSelectedChannel(availableChannels[0].id);
    }
  }, [availableChannels, selectedChannel]);

  const handleTogglePermission = useCallback(async (permId, targetState) => {
    if (!selectedRole || !selectedChannel) return;

    const updatePayload = {
      [permId]: targetState === 'inherit' ? null : (targetState === 'allow')
    };

    setLoading(true);
    const res = await sendProxyAction('update_channel_permission', {
      channelId: selectedChannel,
      roleId: selectedRole,
      permissions: updatePayload
    });
    
    if (res && res.success && typeof fetchDiscordInfo === 'function') {
      await fetchDiscordInfo();
    }
    setLoading(false);
  }, [selectedRole, selectedChannel, sendProxyAction, fetchDiscordInfo]);

  const currentChannelData = useMemo(() => {
    return availableChannels.find(c => c.id === selectedChannel);
  }, [availableChannels, selectedChannel]);

  const getPermissionState = useCallback((bit) => {
    if (!currentChannelData || !currentChannelData.overwrites || !selectedRole) return 'inherit';
    const ow = currentChannelData.overwrites[selectedRole];
    if (!ow) return 'inherit';
    
    try {
      const allowMask = BigInt(ow.allow);
      const denyMask = BigInt(ow.deny);
      
      if ((allowMask & bit) === bit) return 'allow';
      if ((denyMask & bit) === bit) return 'deny';
    } catch {}
    return 'inherit';
  }, [currentChannelData, selectedRole]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-500" />
            {t('clan_auto_21', 'Настройка прав доступа')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
            Точная настройка прав ролей в каналах Discord. Изменения применяются моментально.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Selectors */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">1. Выберите роль</h4>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {availableRoles.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between cursor-pointer ${selectedRole === r.id ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : '#999' }}></div>
                    <span className="truncate">{r.name}</span>
                  </span>
                </button>
              ))}
              {availableRoles.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">Роли не настроены. Сначала выберите роли во вкладке "Роли".</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">2. Выберите канал</h4>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {availableChannels.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChannel(c.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between cursor-pointer ${selectedChannel === c.id ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-slate-400">#</span>
                    <span className="truncate">{c.name}</span>
                  </span>
                </button>
              ))}
              {availableChannels.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">Каналы не настроены. Сначала привяжите их во вкладке "Каналы".</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Permissions */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 rounded-2xl z-10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Права канала</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedRole && selectedChannel 
                    ? `Настройка прав для роли ${availableRoles.find(r => r.id === selectedRole)?.name} в канале #${availableChannels.find(c => c.id === selectedChannel)?.name}`
                    : 'Выберите роль и канал для настройки'}
                </p>
              </div>
            </div>

            {(!selectedRole || !selectedChannel) ? (
              <div className="text-center py-12 text-slate-500">
                <Lock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                Выберите роль и канал слева
              </div>
            ) : (
              <div className="space-y-1">
                {PERMISSIONS_LIST.map((perm) => (
                  <PermissionRow
                    key={perm.id}
                    perm={perm}
                    state={getPermissionState(perm.bit)}
                    onToggle={handleTogglePermission}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
