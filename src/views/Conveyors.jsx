import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Trash2, Star, Plus, Settings, PlusCircle, Check, X, RefreshCw } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { getConfigKey, setConfigKey } from '../services/store';
import ConveyorEditorModal from '../components/ConveyorEditorModal';
import SupportTicketModal from '../components/SupportTicketModal';
import { itemsDB } from '../data/itemsDB';
import { defaultConveyors, defaultCategories } from '../data/defaultConveyors';

const defaultCatKeys = {
  auto_craft: 'convCatAutoCraft',
  auto_locker: 'convCatAutoLocker',
  auto_smelt: 'convCatAutoSmelt',
  resources: 'convCatResources',
  weapons: 'convCatWeapons',
  clothing: 'convCatClothing',
  ammo: 'convCatAmmo',
  components: 'convCatComponents',
  farming: 'convCatFarming',
  food: 'convCatFood',
  explosives: 'convCatExplosives',
  misc_category: 'convCatMisc'
};

function getSystemCategories(t) {
  return [
    { id: 'all', label: t('convCatAll') || 'All' },
    { id: 'favorites', label: t('convCatFavorites') || 'Favorites' },
    { id: 'popular', label: t('convCatPopular') || 'Popular' },
    { id: 'uncategorized', label: t('convCatUncategorized') || 'Uncategorized' }
  ];
}

export default function Conveyors() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || 'ru';

  const getCategoryLabel = useCallback((cat) => {
    if (cat && defaultCatKeys[cat.id]) {
      return t(defaultCatKeys[cat.id], cat.label);
    }
    return cat?.label || '';
  }, [t]);
  
  const [conveyors, setConveyors] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [highlightedCatId, setHighlightedCatId] = useState(null);
  const catListRef = React.useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedConveyor, setSelectedConveyor] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  const [copiedId, setCopiedId] = useState(null);

  const loadData = useCallback(() => {
    let savedConveyors = getConfigKey('conveyorTemplates');
    if (!savedConveyors || !Array.isArray(savedConveyors)) {
      savedConveyors = [];
    }
    
    // Merge default templates if they are completely missing from the user's saved list
    const hasDefaults = savedConveyors.some(c => defaultConveyors.some(def => def.id === c.id));
    if (!hasDefaults && defaultConveyors && defaultConveyors.length > 0) {
      savedConveyors = [...defaultConveyors, ...savedConveyors];
      setConfigKey('conveyorTemplates', savedConveyors);
    }
    
    setConveyors(savedConveyors);
    
    let savedCategories = getConfigKey('conveyorCategories');
    if (!savedCategories || !Array.isArray(savedCategories)) {
      savedCategories = [];
    }
    
    const defCats = defaultCategories;
    const hasDefCats = savedCategories.some(c => defCats.some(def => def.id === c.id));
    if (!hasDefCats && defCats.length > 0) {
      savedCategories = [...defCats, ...savedCategories];
      setConfigKey('conveyorCategories', savedCategories);
    }
    
    setCustomCategories(savedCategories);
  }, []);

  useEffect(() => { loadData() }, [loadData]);

  const saveCategories = (newCats) => {
    setCustomCategories(newCats);
    setConfigKey('conveyorCategories', newCats);
  };

  const handleSaveConveyor = (conveyorData) => {
    let updatedConveyors = [...conveyors];
    const idx = updatedConveyors.findIndex(c => c.id === conveyorData.id);
    
    if (idx >= 0) {
      updatedConveyors[idx] = conveyorData;
    } else {
      updatedConveyors.push(conveyorData);
    }
    
    setConveyors(updatedConveyors);
    setConfigKey('conveyorTemplates', updatedConveyors);
    setIsEditing(false);
  };

  const handleDeleteConveyor = (id) => {
    const updated = conveyors.filter(c => c.id !== id);
    setConveyors(updated);
    setConfigKey('conveyorTemplates', updated);
  };

  const handleToggleFavorite = (conveyor) => {
    const updatedConveyors = conveyors.map(c => 
      c.id === conveyor.id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    setConveyors(updatedConveyors);
    setConfigKey('conveyorTemplates', updatedConveyors);
  };

  const handleReorderTemplates = (dragIdx, dropIdx) => {
    const newTemplates = [...filteredConveyors];
    const [removed] = newTemplates.splice(dragIdx, 1);
    newTemplates.splice(dropIdx, 0, removed);

    // Save sortOrder to all affected items
    let updatedConveyors = [...conveyors];
    newTemplates.forEach((tpl, i) => {
      const idx = updatedConveyors.findIndex(c => c.id === tpl.id);
      if (idx >= 0) updatedConveyors[idx] = { ...updatedConveyors[idx], sortOrder: i };
    });

    setConveyors(updatedConveyors);
    setConfigKey('conveyorTemplates', updatedConveyors);
  };

  const handleCopy = async (conveyor) => {
    if (!Array.isArray(conveyor.items)) return;

    const rustJson = conveyor.items.map(i => ({
      TargetItemName: i.itemShortname,
      TargetCategory: null,
      MaxAmountInOutput: i.max || 0,
      BufferAmount: i.buffer || 0,
      MinAmountInInput: i.min || 0,
      IsBlueprint: false,
      BufferTransferRemaining: 0,
      Min: i.min || 0,
      Max: i.max || 0
    }));

    try {
      await navigator.clipboard.writeText(JSON.stringify(rustJson));
      setCopiedId(conveyor.id);
      setTimeout(() => setCopiedId(null), 2000);

      const updatedConveyors = conveyors.map(c => 
        c.id === conveyor.id ? { ...c, copyCount: (c.copyCount || 0) + 1 } : c
      );
      setConveyors(updatedConveyors);
      setConfigKey('conveyorTemplates', updatedConveyors);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleSuggestCorrection = () => {
    setIsTicketModalOpen(true);
  };

  const SYSTEM_CATEGORIES = getSystemCategories(t);

  const filteredConveyors = useMemo(() => {
    let filtered = conveyors.filter(c => {
      const titleStr = (lang === 'en' && c.titleEn) ? c.titleEn : (c.title || '');
      const matchesSearch = titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (c.titleEn && c.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase()));

      if (activeCategory === 'popular') {
        return matchesSearch && (c.copyCount > 0);
      }

      const categoryExists = customCategories.some(cat => cat.id === c.categoryId);
      const isUncategorizedOrphan = !categoryExists && c.categoryId !== 'all' && c.categoryId !== 'favorites' && c.categoryId !== 'popular';

      const matchesCategory = activeCategory === 'all'
        || (activeCategory === 'favorites' && c.isFavorite)
        || (activeCategory === 'uncategorized' && (!c.categoryId || c.categoryId === 'uncategorized' || c.categoryId === 'all' || isUncategorizedOrphan))
        || c.categoryId === activeCategory;

      return matchesSearch && matchesCategory;
    });

    if (activeCategory === 'popular') {
      return filtered.sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
    } else {
      return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
  }, [conveyors, searchQuery, activeCategory, customCategories, lang]);

  return (
    <div className="space-y-6 animate-main-fade-in h-full flex flex-col relative">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('convTemplates')}
          </h1>
          <div className="group relative">
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold cursor-default text-slate-600 dark:text-slate-300">?</div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-800 text-slate-100 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {t('convJsonHint')}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <button 
            onClick={() => setIsRestoreModalOpen(true)}
            title={t('conveyors_restore_title', 'Восстановить стандартные шаблоны')}
            className="flex items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsCatManagerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" /> {t('convCatSettings')}
          </button>
          <button 
            onClick={() => {
              const isValidCustomCategory = customCategories.some(c => c.id === activeCategory);
              setSelectedConveyor({ categoryId: isValidCustomCategory ? activeCategory : 'uncategorized' });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> {t('convCreateTemplate')}
          </button>
        </div>
      </div>
      
      <div className="flex gap-6 flex-1 min-h-[70vh] items-start">
        {/* Categories Sidebar */}
        <div className="w-56 sticky top-20 max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 flex-shrink-0">
          <input 
            type="text" 
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder={t('convSearch')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-col flex-1 min-h-0">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 px-2 flex items-center justify-between">
              {t('convCategories')}
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              {SYSTEM_CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    activeCategory === cat.id 
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2 flex-shrink-0" />
              
              {customCategories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Templates Grid */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-2">
            {filteredConveyors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{t('convNoTemplates')}</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={(result) => {
                if (!result.destination) return;
                handleReorderTemplates(result.source.index, result.destination.index);
              }}>
                <Droppable droppableId="templates">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-4 pb-6"
                    >
                      {filteredConveyors.map((tpl, idx) => (
                        <Draggable key={tpl.id} draggableId={tpl.id} index={idx}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 rounded-xl border transition-all group flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900/50 ${
                                snapshot.isDragging ? 'border-orange-500 shadow-xl scale-[1.02] z-50 relative' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                              style={provided.draggableProps.style}
                            >
                              {/* Left section: Title & Icons */}
                              <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate">
                                    {(lang === 'en' && tpl.titleEn) ? tpl.titleEn : tpl.title}
                                  </h3>
                                  {tpl.isFavorite && <Star className="w-5 h-5 text-orange-500 fill-orange-500 flex-shrink-0" />}
                                </div>
                                
                                <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full max-w-[560px]">
                                  {Array.isArray(tpl.items) && tpl.items.length > 0 ? (
                                    tpl.items.map((item, i) => {
                                      const dbItem = item ? itemsDB.find(db => db.shortname === item.itemShortname) : null;
                                      if (!dbItem) return null;
                                      return (
                                        <div 
                                          key={i} 
                                          className="w-full aspect-square rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-0.5 hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                                          title={((lang === 'en' ? dbItem.nameEn : dbItem.nameRu) || dbItem.shortname)}
                                        >
                                          <img src={dbItem.imageUrl || ''} alt="" className="max-w-full max-h-full object-contain drop-shadow-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-sm text-slate-400 italic py-2">{t('convEmpty')}</div>
                                  )}
                                </div>
                              </div>

                              {/* Right section: Count & Actions */}
                              <div className="flex flex-col sm:w-36 flex-shrink-0 gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-3">
                                <div className="flex items-center justify-between gap-3 sm:mb-auto">
                                  {tpl.copyCount > 0 && (
                                    <div className="px-2 py-0.5 rounded-full text-xs font-bold text-orange-600 bg-orange-100 dark:text-orange-500 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex-shrink-0">
                                      🔥 {tpl.copyCount}
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {(tpl.items || []).length}/30
                                  </span>
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-auto">
                                  <button 
                                    className={`w-full flex justify-center items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                                      copiedId === tpl.id 
                                        ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20'
                                    }`}
                                    onClick={() => handleCopy(tpl)}
                                  >
                                    {copiedId === tpl.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copiedId === tpl.id ? t('convCopied') : t('convCopy')}
                                  </button>
                                  <button 
                                    className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                                    onClick={() => { setSelectedConveyor(tpl); setIsEditing(true); }}
                                  >
                                    {t('convEdit')}
                                  </button>
                                  <div className="flex gap-2">
                                    <button 
                                      className="flex-1 py-2 flex justify-center items-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-orange-500" 
                                      onClick={() => handleToggleFavorite(tpl)}
                                      title={tpl.isFavorite ? t('convRemoveFav') : t('convAddFav')}
                                    >
                                      <Star className={`w-4 h-4 ${tpl.isFavorite ? 'fill-orange-500 text-orange-500' : ''}`} />
                                    </button>
                                    <button 
                                      className="flex-1 py-2 flex justify-center items-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-red-500"
                                      onClick={() => handleDeleteConveyor(tpl.id)}
                                      title={t('convDeleteBtn')}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl shrink-0">
            <p className="text-sm text-slate-500">{t('convSuggestText')}</p>
            <button 
              onClick={handleSuggestCorrection}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              {t('suggest_correction')}
            </button>
          </div>
        </div>
      </div>

      {/* Category Manager Modal */}
      {isCatManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsCatManagerOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t('convCatSettingsTitle')}</h3>
                <div className="group relative">
                  <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold cursor-default text-slate-600 dark:text-slate-300">?</div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-2 bg-slate-800 text-slate-100 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center">
                    {t('convCatSafeDelete')}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors" onClick={() => setIsCatManagerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <DragDropContext onDragEnd={(result) => {
              if (!result.destination) return;
              const newCats = Array.from(customCategories);
              const [removed] = newCats.splice(result.source.index, 1);
              newCats.splice(result.destination.index, 0, removed);
              saveCategories(newCats);
            }}>
              <Droppable droppableId="categories">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={(el) => {
                      provided.innerRef(el);
                      catListRef.current = el;
                    }}
                    className="p-6 overflow-y-auto max-h-[50vh] space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
                  >
                    {customCategories.length === 0 && (
                      <p className="text-center text-slate-500 py-4">{t('convNoCustCats')}</p>
                    )}
                    {customCategories.map((cat, idx) => (
                      <Draggable key={cat.id} draggableId={cat.id} index={idx}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-300 ${highlightedCatId === cat.id ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] bg-orange-50 dark:bg-orange-900/20' : (snapshot.isDragging ? 'border-orange-500 scale-[1.02] shadow-xl z-50 bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800')}`}
                            style={provided.draggableProps.style}
                          >
                            <div 
                              className="p-1 cursor-grab opacity-50 hover:opacity-100"
                              {...provided.dragHandleProps}
                            >
                              <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor"><path d="M1 3h10v2H1V3zm0 4h10v2H1V7zm0 4h10v2H1v-2z"/></svg>
                            </div>
                            <input 
                              type="text" 
                              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                              value={cat.label}
                              onChange={e => {
                                const newCats = [...customCategories];
                                newCats[idx] = { ...newCats[idx], label: e.target.value };
                                saveCategories(newCats);
                              }}
                            />
                            <button 
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded transition-colors"
                              title={t('convDeleteCat')}
                              onClick={() => {
                                const newCats = customCategories.filter(c => c.id !== cat.id);
                                saveCategories(newCats);
                                if (activeCategory === cat.id) setActiveCategory('all');
                                
                                let updatedConveyors = [...conveyors];
                                let modified = false;
                                updatedConveyors.forEach(c => {
                                  if (c.categoryId === cat.id) {
                                    c.categoryId = 'uncategorized';
                                    modified = true;
                                  }
                                });
                                if (modified) {
                                  setConveyors(updatedConveyors);
                                  setConfigKey('conveyorTemplates', updatedConveyors);
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <button 
                className="flex items-center gap-2 px-3 py-1.5 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:border-orange-500 hover:text-orange-500 transition-colors"
                onClick={() => {
                  const newId = 'cat_' + Date.now();
                  saveCategories([...customCategories, { id: newId, label: t('convNewCategory') }]);
                  setHighlightedCatId(newId);
                  setTimeout(() => {
                    if (catListRef.current) {
                      catListRef.current.scrollTo({ top: catListRef.current.scrollHeight, behavior: 'smooth' });
                    }
                  }, 50);
                  setTimeout(() => setHighlightedCatId(null), 3000);
                }}
              >
                <PlusCircle size={16} /> {t('convAddCategory')}
              </button>
              <button 
                className="px-5 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
                onClick={() => setIsCatManagerOpen(false)}
              >
                {t('convDone')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <ConveyorEditorModal
          t={t}
          lang={lang}
          initialData={selectedConveyor}
          categories={[{ id: 'uncategorized', label: t('convCatUncategorized') }, ...customCategories.map(cat => ({ ...cat, label: getCategoryLabel(cat) }))]}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveConveyor}
        />
      )}

      {/* Restore Defaults Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsRestoreModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{t('convRestoreTitle')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {t('convRestoreDesc')}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm"
                onClick={() => {
                  const current = [...conveyors];
                  const missing = defaultConveyors.filter(def => !current.some(c => c.id === def.id));
                  const updated = [...missing, ...current];
                  setConveyors(updated);
                  setConfigKey('conveyorTemplates', updated);
                  
                  const currentCats = [...customCategories];
                  const missingCats = defaultCategories.filter(def => !currentCats.some(c => c.id === def.id));
                  const updatedCats = [...missingCats, ...currentCats];
                  setCustomCategories(updatedCats);
                  setConfigKey('conveyorCategories', updatedCats);
                  
                  setIsRestoreModalOpen(false);
                }}
              >
                {t('convRestoreMerge')}
              </button>
              <button 
                className="w-full py-2 px-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                onClick={() => {
                  setConveyors(defaultConveyors);
                  setConfigKey('conveyorTemplates', defaultConveyors);
                  setCustomCategories(defaultCategories);
                  setConfigKey('conveyorCategories', defaultCategories);
                  setIsRestoreModalOpen(false);
                }}
              >
                {t('convRestoreReplace')}
              </button>
              <button 
                className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mt-2"
                onClick={() => setIsRestoreModalOpen(false)}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <SupportTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />
    </div>
  );
}
