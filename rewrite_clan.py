import sys

with open('src/views/ClanManager.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

index = content.find('  const tabs = [')
if index == -1:
    index = content.find('  return (\n    <div')

before = content[:index]

new_render = """  const tabs = [
    { id: 'roles', label: 'Роли' },
    { id: 'channels', label: 'Каналы' },
    { id: 'recruitment', label: 'Наборы' },
    { id: 'votes', label: 'Голосования' },
    { id: 'ads', label: 'Реклама' },
    { id: 'roster', label: 'Состав' },
    { id: 'stats', label: 'Статистика' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('clan_manager_title')}</h2>
        </div>
        <button onClick={handleUnlink} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {t('clan_unlink_btn')}
        </button>
      </div>
      
      {loadingConfig ? (
        <div className="text-slate-500 font-medium">{t('clan_loading')}</div>
      ) : config ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'roles' ? (
              <form onSubmit={saveConfig} className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {t('clan_general_settings')}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_name_label')}</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                    value={config.name || ''}
                    onChange={e => setConfig({...config, name: e.target.value})}
                    placeholder={t('clan_name_placeholder')}
                  />
                </div>
                
                <div className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <input 
                    type="checkbox" 
                    id="recruitmentOpen"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3"
                    checked={config.recruitmentOpen}
                    onChange={e => setConfig({...config, recruitmentOpen: e.target.checked})}
                  />
                  <label htmlFor="recruitmentOpen" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                    {t('clan_recruitment_open')}
                  </label>
                </div>
                
                <div className="pt-2">
                  <h4 className="font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 flex justify-between items-center">
                    {t('clan_roles_config')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('clan_roles_desc')}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      let roleNames = {};
                      try {
                        roleNames = config.roleNamesJson ? JSON.parse(config.roleNamesJson) : {};
                      } catch(e) {}
                      
                      const updateRoleName = (key, val) => {
                        const newNames = { ...roleNames, [key]: val };
                        setConfig({ ...config, roleNamesJson: JSON.stringify(newNames) });
                      };
                      
                      const handleIdChange = (key, val) => {
                        setConfig({ ...config, [key]: val.replace(/\D/g, '').slice(0, 20) });
                      };
                      
                      const roles = [
                        { key: 'leader', dbKey: 'leaderRoleId', defaultName: t('clan_role_leader') },
                        { key: 'main', dbKey: 'mainRosterRoleId', defaultName: t('clan_role_main') },
                        { key: 'farmer', dbKey: 'farmerRoleId', defaultName: t('clan_role_farmer') },
                        { key: 'builder', dbKey: 'builderRoleId', defaultName: t('clan_role_builder') },
                      ];
                      
                      return roles.map(r => (
                        <div key={r.key} className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
                          <div className="flex gap-2 mb-2 items-center">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            <input
                              type="text"
                              className="w-full bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 transition-colors px-1 pb-0.5"
                              value={roleNames[r.key] !== undefined ? roleNames[r.key] : r.defaultName}
                              onChange={e => updateRoleName(r.key, e.target.value)}
                              placeholder={r.defaultName}
                            />
                          </div>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800/80 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow font-mono text-center" 
                            value={config[r.dbKey] || ''} 
                            onChange={e => handleIdChange(r.dbKey, e.target.value)} 
                            placeholder="ID (только цифры)" 
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
                  <button 
                    type="submit" 
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center justify-center font-medium py-2.5 px-4 rounded-xl w-full transition-all shadow-sm focus:ring-4 ${
                      saveStatus === 'success' ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500/20' :
                      saveStatus === 'error' ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/20' :
                      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
                    } ${saveStatus === 'saving' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saveStatus === 'saving' ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> {t('clan_saving') || 'Синхронизация...'}</>
                    ) : saveStatus === 'success' ? (
                      <><svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {t('clan_saved_success') || 'Успешно'}</>
                    ) : saveStatus === 'error' ? (
                      <><svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> {t('clan_saved_error') || 'Ошибка'}</>
                    ) : (
                      t('clan_save_btn')
                    )}
                  </button>
                </div>
              </form>
            ) : activeTab === 'recruitment' ? (
              <form onSubmit={saveConfig} className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Настройки набора в клан
                </h3>
                
                {(() => {
                  let rConfig = {
                    link: 'https://discord.gg/vPEAxjCBRC',
                    banner: 'https://i.imgur.com/UaMfYMK.png',
                    title: `Набор в клан ${config.name || 'GODS'}`,
                    text: "Требования:\\n\\n**MAIN**\\nВозраст: 20+\\nЧасы: 5000+\\nТребования: 8+ часов онлайна\\nНавыки: Желательна универсальность\\n\\n**Билдер:**\\nВозраст: 18+\\nЧасы: 3000+\\nТребования: 6+ часов онлайна\\nНавыки: Умение быстро строить кастомные базы",
                  };
                  try {
                    if (config.recruitmentConfigJson) {
                      rConfig = { ...rConfig, ...JSON.parse(config.recruitmentConfigJson) };
                    }
                  } catch(e) {}
                  
                  const updateRConfig = (key, val) => {
                    const newConfig = { ...rConfig, [key]: val };
                    setConfig({ ...config, recruitmentConfigJson: JSON.stringify(newConfig) });
                  };
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на Discord сервер</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.link}
                          onChange={e => updateRConfig('link', e.target.value)}
                          placeholder="https://discord.gg/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на баннер (Изображение)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.banner}
                          onChange={e => updateRConfig('banner', e.target.value)}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Заголовок</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.title}
                          onChange={e => updateRConfig('title', e.target.value)}
                          placeholder="Набор в клан GODS"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Текст с требованиями</label>
                        <textarea 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[200px]"
                          value={rConfig.text}
                          onChange={e => updateRConfig('text', e.target.value)}
                          placeholder="Опишите требования..."
                        ></textarea>
                        <p className="text-xs text-slate-500 mt-2">Этот текст будет отображен в Discord боте при вызове панели набора.</p>
                      </div>
                    </>
                  );
                })()}
                
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
                  <button 
                    type="submit" 
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center justify-center font-medium py-2.5 px-4 rounded-xl w-full transition-all shadow-sm focus:ring-4 ${
                      saveStatus === 'success' ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500/20' :
                      saveStatus === 'error' ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/20' :
                      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
                    } ${saveStatus === 'saving' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saveStatus === 'saving' ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Сохранение...</>
                    ) : saveStatus === 'success' ? (
                      <><svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Успешно</>
                    ) : saveStatus === 'error' ? (
                      <><svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Ошибка</>
                    ) : (
                      "Сохранить настройки"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <svg className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">В разработке</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Раздел "{tabs.find(t => t.id === activeTab)?.label}" находится в стадии активной разработки. 
                  Следите за обновлениями!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium border border-red-100 dark:border-red-900/50">
          {t('clan_failed')}
        </div>
      )}
    </div>
  );
}
"""

with open('src/views/ClanManager.jsx', 'w', encoding='utf-8') as f:
    f.write(before + new_render)
print('Done!')
