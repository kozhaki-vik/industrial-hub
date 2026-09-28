import React, { useContext, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import { Archive } from 'lucide-react';
import { RosterSkeleton } from '../../components/Skeleton';

const ROLE_KEYS = [
  'leaderRoleId', 'deputyLeaderRoleId', 'callerRoleId', 'recruiterRoleId',
  'mainRosterRoleId', 'trialRoleId', 'farmerRoleId', 'plantFarmerRoleId',
  'electricianRoleId', 'builderRoleId', 'pilotRoleId', 'sponsorRoleId', 'vipRoleId'
];

// --- Memoized member card to prevent re-renders when other members change ---
const RosterMemberCard = React.memo(function RosterMemberCard({
  member, roleNamesMap, roleIdToKey, dossierInfo, onOpenDossier, t
}) {
  const mId = member.userId || member.id;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 gap-3">
      <div className="flex items-center overflow-hidden flex-1">
        <img src={member.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="avatar" loading="lazy" decoding="async" className="w-12 h-12 rounded-full mr-4 shadow-sm shrink-0 object-cover" />
        <div className="flex-1 overflow-hidden">
          <div className="font-medium text-slate-900 dark:text-white truncate">{member.displayName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{member.username}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(member.roles || []).map(rId => {
              const shortKey = roleIdToKey.get(rId);
              if (!shortKey) return null;
              const roleName = roleNamesMap[shortKey] || shortKey;
              return <span key={rId} className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-md">{roleName}</span>;
            })}
            {dossierInfo && (dossierInfo.cheaterStatus === 'CONFIRMED' || (dossierInfo.cheaterReport && !dossierInfo.cheaterStatus)) && (
              <span key="cheater" className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
                🚨 {t('clan_dossier_badge_cheater_confirmed') || 'Читер'}
              </span>
            )}
            {dossierInfo && dossierInfo.cheaterStatus === 'SUSPICION' && (
              <span key="suspicion" className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
                ⚠️ {t('clan_dossier_badge_cheater_suspicion') || 'Подозрение'}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenDossier(mId, member)}
        className="p-2 text-slate-400 hover:text-orange-500 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
        title={t('clan_auto_107', 'Открыть личное дело / Архив')}
      >
        <Archive className="w-4 h-4" />
      </button>
    </div>
  );
});

export default function RosterTab() {
  const {
    config, rosterData, setRosterData, dossiersData,
    setSelectedProfileForDossier, t
  } = useContext(ClanManagerContext);

  const rosterList = Array.isArray(rosterData?.roster) ? rosterData.roster : [];

  // --- Precompute roleNamesMap once instead of JSON.parse inside every .map() iteration ---
  const roleNamesMap = useMemo(() => {
    try {
      if (!rosterData?.roleNamesJson) return {};
      return typeof rosterData.roleNamesJson === 'string'
        ? JSON.parse(rosterData.roleNamesJson)
        : rosterData.roleNamesJson;
    } catch { return {}; }
  }, [rosterData?.roleNamesJson]);

  // --- Precompute roleId → shortKey Map for O(1) lookup instead of .find() over 13 keys ---
  const roleIdToKey = useMemo(() => {
    const map = new Map();
    if (config) {
      for (const k of ROLE_KEYS) {
        if (config[k]) map.set(config[k], k.replace('RoleId', ''));
      }
    }
    return map;
  }, [config]);

  // --- Precompute dossier lookup Map for O(1) instead of O(N) .find() per member ---
  const dossierMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(dossiersData)) {
      for (const d of dossiersData) map.set(d.userId, d);
    }
    return map;
  }, [dossiersData]);

  // --- Stable callback for opening dossier modal ---
  const handleOpenDossier = useCallback((mId, member) => {
    const existing = dossierMap.get(mId);
    const profileToOpen = existing || {
      userId: mId,
      username: member.displayName || member.username,
      avatar: member.avatarUrl,
      status: 'ACTIVE'
    };
    setSelectedProfileForDossier(profileToOpen);
  }, [dossierMap, setSelectedProfileForDossier]);

  return (
    <>
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            {t('clan_auto_70', 'Состав клана')}
          </h3>
          <button onClick={() => setRosterData(null)} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            {t('clan_auto_71', 'Обновить')}
          </button>
        </div>
        
        {!rosterData ? (
          <RosterSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rosterList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                {t('clan_auto_72', 'Участники не найдены. Убедитесь, что роли настроены правильно.')}
              </div>
            ) : (
              rosterList.map(member => {
                const mId = member.userId || member.id;
                return (
                  <RosterMemberCard
                    key={mId}
                    member={member}
                    roleNamesMap={roleNamesMap}
                    roleIdToKey={roleIdToKey}
                    dossierInfo={dossierMap.get(mId) || null}
                    onOpenDossier={handleOpenDossier}
                    t={t}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
