import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Save, Trash2, Search, Download } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { itemsDB } from '../data/itemsDB';
import { scrollToAndHighlight } from '../utils/formValidation';

// --- Lightweight Virtual Scroll ---
function VirtualList({ items, itemHeight, renderItem }) {
  const [listHeight, setListHeight] = useState(500);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setListHeight(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + listHeight) / itemHeight) + 2);
  
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (items[i]) {
      visibleItems.push(
        <div key={items[i].shortname} style={{ position: 'absolute', top: i * itemHeight, width: '100%', height: itemHeight }}>
          {renderItem(items[i], i)}
        </div>
      );
    }
  }

  return (
    <div 
      ref={containerRef}
      className="overflow-y-auto relative h-full w-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700" 
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + indicator
      );
    }
  }
  return matrix[a.length][b.length];
}

function getMatchScore(query, item, lang) {
  const q = query.toLowerCase();
  let bestScore = 0;

  const checkText = (text, weight) => {
    if (!text) return;
    const t = text.toLowerCase();
    if (t === q) { bestScore = Math.max(bestScore, 100 * weight); return; }
    if (t.includes(q)) { bestScore = Math.max(bestScore, (80 + (q.length / t.length) * 10) * weight); return; }
    
    const words = t.split(/[\s.\-_]+/);
    for (const word of words) {
      if (word === q) { bestScore = Math.max(bestScore, 90 * weight); continue; }
      if (word.includes(q)) { bestScore = Math.max(bestScore, (70 + (q.length / word.length) * 10) * weight); continue; }
      
      if (q.length > 3 && Math.abs(word.length - q.length) <= 2) {
        const dist = levenshteinDistance(q, word);
        if (dist <= 2) {
          bestScore = Math.max(bestScore, (50 - dist * 10) * weight);
        }
      }
    }
  };

  const name = lang === 'en' ? item.nameEn : item.nameRu;
  checkText(name, 1.0);
  checkText(item.shortname, 0.8);
  if (item.aliases) {
    item.aliases.forEach((alias) => checkText(alias, 0.9));
  }
  return bestScore;
}

export default function ConveyorEditorModal({ t, lang, initialData, onClose, onSave, categories }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || 'uncategorized');
  
  const getInitialItems = () => {
    if (!initialData?.items) return [];
    if (Array.isArray(initialData.items)) {
      return initialData.items.map((i) => ({
        ...i,
        min: (i.min === 0 || i.min === '0') ? '' : i.min,
        max: (i.max === 0 || i.max === '0') ? '' : i.max,
        buffer: (i.buffer === 0 || i.buffer === '0') ? '' : i.buffer
      }));
    }
    if (typeof initialData.items === 'string') {
      return initialData.items.split(',').map((s) => ({ itemShortname: s.trim(), min: '', max: '', buffer: '' })).filter((i) => i.itemShortname !== '');
    }
    return [];
  };

  const [selectedItems, setSelectedItems] = useState(getInitialItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [highlightTitleError, setHighlightTitleError] = useState(false);
  const titleInputRef = useRef(null);
  const editorDropRef = useRef(null);
  
  const maxLimit = 30;
  
  const filteredItems = useMemo(() => {
    if (!searchQuery) return itemsDB;
    const lowerQ = searchQuery.toLowerCase();
    
    const scored = itemsDB.map(item => ({
      item,
      score: getMatchScore(lowerQ, item, lang)
    })).filter(x => x.score > 0);
    
    return scored.sort((a, b) => b.score - a.score).map(x => x.item);
  }, [searchQuery, lang]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (selectedItems.length >= maxLimit) return;
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const item = JSON.parse(data);
        if (!selectedItems.some(i => i.itemShortname === item.shortname)) {
          setSelectedItems(prev => [...prev, { itemShortname: item.shortname, min: '', max: '', buffer: '' }]);
        }
      }
    } catch(err) {
      console.error("Drop parsing error", err);
    }
  }, [selectedItems, maxLimit]);

  useEffect(() => {
    const handlePaste = (e) => {
      const pasteData = e.clipboardData?.getData('text');
      if (!pasteData) return;
      
      try {
        const parsed = JSON.parse(pasteData);
        if (Array.isArray(parsed)) {
          const mappedItems = parsed.map(i => {
            let minVal = i.min !== undefined ? i.min : i.Min;
            let maxVal = i.max !== undefined ? i.max : i.Max;
            let bufferVal = i.buffer !== undefined ? i.buffer : (i.BufferAmount !== undefined ? i.BufferAmount : i.Buffer);
            if (minVal === 0 || minVal === '0') minVal = '';
            if (maxVal === 0 || maxVal === '0') maxVal = '';
            if (bufferVal === 0 || bufferVal === '0') bufferVal = '';
            return {
              itemShortname: i.itemShortname || i.TargetItemName,
              min: minVal,
              max: maxVal,
              buffer: bufferVal
            };
          });
          
          const validItems = mappedItems.filter(i => i.itemShortname && itemsDB.some(db => db.shortname === i.itemShortname));
          
          if (validItems.length > 0) {
            setSelectedItems(prev => {
              const newItems = [...prev];
              validItems.forEach(vi => {
                if (!newItems.some(existing => existing.itemShortname === vi.itemShortname) && newItems.length < maxLimit) {
                  newItems.push({
                    itemShortname: vi.itemShortname,
                    min: vi.min ?? '',
                    max: vi.max ?? '',
                    buffer: vi.buffer ?? ''
                  });
                }
              });
              return newItems;
            });
          }
        }
      } catch (err) {
        console.error("Paste parsing error", err);
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg(t('convNameEmpty') || "Name cannot be empty");
      setHighlightTitleError(true);
      if (titleInputRef.current) {
        scrollToAndHighlight(titleInputRef.current);
      }
      setTimeout(() => setHighlightTitleError(false), 3000);
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMsg(t('convNoItems') || "Add at least one item to the template");
      if (editorDropRef.current) {
        scrollToAndHighlight(editorDropRef.current);
      }
      return;
    }
    setErrorMsg('');
    
    const cleanedItems = selectedItems.map(i => ({
      itemShortname: i.itemShortname,
      min: i.min === '' ? 0 : Number(i.min),
      max: i.max === '' ? 0 : Number(i.max),
      buffer: i.buffer === '' || i.buffer === undefined ? 0 : Number(i.buffer)
    }));

    let newCopyCount = initialData?.copyCount || 0;
    if (initialData && Array.isArray(initialData.items) && initialData.items.length > 0) {
      const oldNames = initialData.items.map((i) => i.itemShortname);
      const newNames = cleanedItems.map(i => i.itemShortname);
      const commonCount = newNames.filter(name => oldNames.includes(name)).length;
      const similarity = commonCount / Math.max(oldNames.length, newNames.length);
      if (similarity < 0.5) newCopyCount = 0;
    }

    onSave({
      id: initialData?.id || `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      categoryId: categoryId,
      items: cleanedItems,
      isFavorite: initialData?.isFavorite || false,
      sortOrder: initialData?.sortOrder || 0,
      copyCount: newCopyCount
    });
  };

  const removeItem = (shortname) => {
    setSelectedItems(prev => prev.filter(i => i.itemShortname !== shortname));
  };

  const updateItemLimit = (shortname, field, value) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    if (/^0+$/.test(value)) value = '';
    setSelectedItems(prev => prev.map(i => {
      if (i.itemShortname === shortname) return { ...i, [field]: value };
      return i;
    }));
  };

  const handleDragEnd = (result) => {
    setIsReordering(false);
    const { source, destination } = result;
    if (!destination) return;
    
    if (destination.droppableId === 'trash') {
      setSelectedItems(prev => prev.filter((_, i) => i !== source.index));
      return;
    }
    
    if (source.droppableId === 'editorGrid' && destination.droppableId === 'editorGrid') {
      if (source.index === destination.index) return;
      
      setSelectedItems(prev => {
        const newArr = [...prev];
        const [rem] = newArr.splice(source.index, 1);
        newArr.splice(destination.index, 0, rem);
        return newArr;
      });
    }
  };

  const handleDragStart = () => {
    setIsReordering(true);
  };

  const renderDirItem = useCallback((item) => {
    const onDragStart = (e) => {
      e.dataTransfer.setData('application/json', JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'copy';
    };

    const onDoubleClick = () => {
      if (selectedItems.length >= maxLimit) return;
      if (!selectedItems.some(i => i.itemShortname === item.shortname)) {
        setSelectedItems(prev => [...prev, { itemShortname: item.shortname, min: '', max: '', buffer: '' }]);
      }
    };

    const itemName = lang === 'en' ? item.nameEn : item.nameRu;
    return (
      <div 
        className="flex items-center gap-3 p-2 mx-2 cursor-grab hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
        draggable
        onDragStart={onDragStart}
        onDoubleClick={onDoubleClick}
      >
        <div className="w-10 h-10 flex-shrink-0 bg-slate-100 dark:bg-slate-900 rounded-md p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <img src={item.imageUrl || ''} alt="" className="max-w-full max-h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={itemName}>{itemName}</span>
          <span className="text-xs text-slate-500 truncate">{item.shortname}</span>
        </div>
      </div>
    );
  }, [selectedItems, maxLimit, lang]);

  const limitReached = selectedItems.length >= maxLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-16 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="flex flex-col bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-2xl max-w-6xl w-full h-full max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('convEditorTitle')}</h2>
              <div className="group relative">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold cursor-default text-slate-600 dark:text-slate-300">?</div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-800 text-slate-100 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal">
                  {t('convEditorHintText')}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            </div>
            <input 
              ref={titleInputRef}
              type="text" 
              className={`px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none w-64 transition-all duration-300 ${highlightTitleError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'}`}
              placeholder={t('convTitlePlaceholder')} 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
            <select 
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 w-48"
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${limitReached ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' : 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
              {selectedItems.length} / {maxLimit}
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Directory */}
            <div className="w-1/3 min-w-[300px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 relative">
              <Droppable droppableId="trash">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`absolute inset-0 flex items-center justify-center bg-slate-900/40 dark:bg-slate-100/10 backdrop-blur-sm transition-opacity duration-200 ${
                      isReordering 
                        ? 'opacity-100 z-10 pointer-events-auto ' + (snapshot.isDraggingOver ? 'bg-red-900/30 dark:bg-red-900/30' : '') 
                        : 'opacity-0 -z-10 pointer-events-none'
                    }`}
                  >
                    <Trash2 className={`text-red-500 transition-all ${snapshot.isDraggingOver ? 'w-24 h-24 drop-shadow-xl' : 'w-16 h-16 opacity-50'}`} />
                    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>{provided.placeholder}</div>
                  </div>
                )}
              </Droppable>
              
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 relative">
                <Search className="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder={t('convSearchItem') || "Search items..."} 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-1 overflow-hidden py-2">
                <VirtualList 
                  items={filteredItems} 
                  itemHeight={58} 
                  renderItem={renderDirItem} 
                />
              </div>
            </div>

            {/* Right: Dropzone */}
            <div className="flex-1 p-6 flex flex-col bg-slate-50 dark:bg-slate-950">
              <div 
                ref={editorDropRef}
                className={`flex-1 border-2 border-dashed rounded-2xl overflow-y-auto p-4 transition-colors ${
                  isDragOver 
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); e.dataTransfer.dropEffect = 'copy'; }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                tabIndex={0}
              >
                {selectedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <Download className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{t('convEditorDropHint') || "Drag items from the list on the left"}</p>
                    <span className="text-sm mt-2">{t('convEditorDropSub') || "or press Ctrl+V to paste a template from in-game conveyor"}</span>
                  </div>
                ) : (
                  <Droppable droppableId="editorGrid" direction="horizontal">
                    {(provided) => (
                      <div 
                        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {selectedItems.map((selItem, idx) => {
                          const dbItem = itemsDB.find(i => i.shortname === selItem.itemShortname);
                          return (
                            <Draggable key={`${selItem.itemShortname}-${idx}`} draggableId={`${selItem.itemShortname}-${idx}`} index={idx}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative group bg-slate-50 dark:bg-slate-950 border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${snapshot.isDragging ? 'border-orange-500 scale-[1.05] shadow-xl shadow-orange-500/20 z-50' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'}`}
                                  style={provided.draggableProps.style}
                                >
                                  <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white dark:bg-slate-800 dark:hover:bg-red-500 dark:text-red-400 dark:hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-red-200 dark:border-slate-700" onClick={() => removeItem(selItem.itemShortname)}>
                                    <X size={12} strokeWidth={3} />
                                  </button>
                                  <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-lg p-0.5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                    <img src={dbItem?.imageUrl || ''} alt="" className="max-w-full max-h-full object-contain drop-shadow-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                  </div>
                                  <div className="text-xs font-semibold text-center text-slate-700 dark:text-slate-300 line-clamp-2 min-h-[32px] w-full px-1" title={(lang === 'en' ? dbItem?.nameEn : dbItem?.nameRu) || selItem.itemShortname}>
                                    {(lang === 'en' ? dbItem?.nameEn : dbItem?.nameRu) || selItem.itemShortname}
                                  </div>
                                  <div className="flex w-full gap-1 mt-auto">
                                    {['buffer', 'min', 'max'].map(field => {
                                      const label = field === 'buffer' ? 'Buf' : field === 'min' ? 'Min' : 'Max';
                                      const value = selItem[field] ?? '';
                                      const hasValue = String(value).length > 0;
                                      return (
                                        <div key={field} className="relative w-1/3 flex">
                                          <input 
                                            type="text" 
                                            className="w-full text-center text-xs py-1 px-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-300 dark:placeholder-slate-600"
                                            placeholder={label}
                                            title={label}
                                            value={value}
                                            onChange={(e) => updateItemLimit(selItem.itemShortname, field, e.target.value)}
                                          />
                                          {hasValue && (
                                            <span className="absolute left-1/2 -translate-x-1/2 top-0 text-[8px] text-slate-400 font-medium pointer-events-none bg-white dark:bg-slate-900 leading-tight px-0.5 rounded-sm" style={{marginTop: '-5px'}}>
                                              {label}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            </div>
          </div>
        </DragDropContext>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className={`text-sm ${errorMsg ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
            {errorMsg || t('convJsonHint') || 'Drag an item here, or press Ctrl+V to paste JSON.'}
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={onClose}>
              {t('cancel') || 'Cancel'}
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20" onClick={handleSave}>
              <Save className="w-4 h-4" /> {t('convSave') || 'Save'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
