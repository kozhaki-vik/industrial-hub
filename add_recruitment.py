import sys

with open('src/views/ClanManager.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the block where activeTab is handled
marker = "            {activeTab === 'roles' ? ("
end_marker = "                <p className=\"text-slate-500 dark:text-slate-400 max-w-sm mx-auto\">\n                  Раздел \"{tabs.find(t => t.id === activeTab)?.label}\" находится в стадии активной разработки. \n                  Следите за обновлениями!\n                </p>\n              </div>\n            )}"

start_idx = content.find(marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Not found')
    sys.exit(1)

before = content[:start_idx]
after = content[end_idx:]

roles_block = content[start_idx:end_idx]
roles_block = roles_block.replace("            )}", "")
roles_block = roles_block.strip()

# Now we construct the new block

new_block = roles_block + """
            : activeTab === 'recruitment' ? (
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Текст с требованиями (Markdown)</label>
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
"""

with open('src/views/ClanManager.jsx', 'w', encoding='utf-8') as f:
    f.write(before + new_block + after)
print('Done!')
