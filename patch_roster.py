import re

fpath = 'src/views/ClanManagerTabs/RosterTab.jsx'
with open(fpath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add bot filter to rosterList.map
content = content.replace('return rosterList.map(member => {',
                          'return rosterList.filter(m => !m.bot && (!m.user || !m.user.bot)).map(member => {')

# 2. Add cursor-pointer and onClick to tr
tr_old = '<tr className="border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors group">'
tr_new = '<tr onClick={() => onOpenDossier(mId, member)} className="cursor-pointer border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors group">'
content = content.replace(tr_old, tr_new)

# 3. Modify Warns onClick to have e.stopPropagation()
warns_onclick_old = 'onClick={() => onOpenWarns({ userId: mId, displayName: member.displayName || member.username, username: member.username, avatarUrl: member.avatarUrl, warnCount })}'
warns_onclick_new = 'onClick={(e) => { e.stopPropagation(); onOpenWarns({ userId: mId, displayName: member.displayName || member.username, username: member.username, avatarUrl: member.avatarUrl, warnCount }); }}'
content = content.replace(warns_onclick_old, warns_onclick_new)

# 4. Remove Dossier column header
dossier_th_pattern = r'\{\/\*\ 7\.\ Досье.*?\*\/\}\s*<th scope="col" className="px-4 py-3\.5 text-center">\s*<span>\{t\(\'clan_roster_col_dossier\',\ \'Досье\'\)\}<\/span>\s*<\/th>'
content = re.sub(dossier_th_pattern, '', content, flags=re.DOTALL)

# 5. Remove Dossier column body
dossier_td_pattern = r'\{\/\*\ 7\.\ Досье\ \(Отдельная\ колонка\)\ \*\/\}.*?\{\/\*\ 8\.\ Варны\ \(Отдельная\ колонка\)\ \*\/\}'
content = re.sub(dossier_td_pattern, '{/* 8. Варны (Отдельная колонка) */}', content, flags=re.DOTALL)

# 6. Change colSpan=8 to 7
content = content.replace('colSpan={8}', 'colSpan={7}')

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Patched RosterTab')
