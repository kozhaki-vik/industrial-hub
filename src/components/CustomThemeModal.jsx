import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Palette, 
  Pipette, 
  RotateCcw, 
  Trash2, 
  Check, 
  ArrowLeft, 
  X, 
  Sparkles,
  Layout,
  SlidersHorizontal,
  AlertTriangle
} from 'lucide-react';
import { 
  DEFAULT_CUSTOM_THEME, 
  THEME_TEMPLATES, 
  BRAND_PALETTE, 
  isValidHex, 
  normalizeHex 
} from '../utils/themeUtils';

export default function CustomThemeModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { customTheme, hasCustomTheme, saveCustomTheme, deleteCustomTheme, applyLivePreview, restoreActiveTheme } = useTheme();
  const { addNotification } = useNotification();

  // Local state for the colors being edited
  const [colors, setColors] = useState(() => customTheme || DEFAULT_CUSTOM_THEME);
  const [activePreset, setActivePreset] = useState(null);
  const [activeFieldKey, setActiveFieldKey] = useState('accent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mockToggle, setMockToggle] = useState(true);

  // Hidden native color inputs refs
  const colorInputRefs = useRef({});

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = customTheme || DEFAULT_CUSTOM_THEME;
      setColors(initial);
      setShowDeleteConfirm(false);
      setActivePreset(null);
      // Apply live preview to the app while editing
      applyLivePreview(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle ESC key to exit
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, colors]);

  if (!isOpen) return null;

  const handleColorChange = (key, val) => {
    const formatted = normalizeHex(val);
    const updated = { ...colors, [key]: formatted };
    setColors(updated);
    setActivePreset(null);
    // Instantly update live preview
    applyLivePreview(updated);
  };

  const handleApplyPreset = (template) => {
    setActivePreset(template.id);
    const updated = { ...template.theme };
    setColors(updated);
    applyLivePreview(updated);
  };

  // EyeDropper API (Chromium / Electron)
  const handlePipette = async (key) => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const res = await eyeDropper.open();
        if (res && res.sRGBHex) {
          handleColorChange(key, res.sRGBHex);
        }
      } catch {
        // User cancelled with Escape
      }
    } else {
      // Fallback: trigger native color picker which has an OS eyedropper
      colorInputRefs.current[key]?.click();
    }
  };

  // 1. Выйти назад
  const handleCancel = () => {
    restoreActiveTheme();
    onClose();
  };

  // 2. Сбросить
  const handleReset = () => {
    setColors(DEFAULT_CUSTOM_THEME);
    setActivePreset('graphite');
    applyLivePreview(DEFAULT_CUSTOM_THEME);
    addNotification(t('custom_theme_reset_done', 'Цвета сброшены к стандартным'), 'info');
  };

  // 3. Удалить
  const handleDelete = () => {
    deleteCustomTheme();
    addNotification(t('custom_theme_deleted', 'Кастомная тема удалена'), 'success');
    onClose();
  };

  // 4. Сохранить
  const handleSave = () => {
    saveCustomTheme(colors);
    addNotification(t('custom_theme_saved', 'Кастомная тема успешно сохранена'), 'success');
    onClose();
  };

  // The 6 configurable roles
  const colorFields = [
    {
      key: 'bg',
      label: t('custom_theme_bg', 'Фон программы'),
      desc: t('custom_theme_bg_desc', 'Основной фон окон, страниц и программы'),
      swatches: ['#14191D', '#2C2D32', '#121316', '#0F1715', '#111019', '#0B1319', '#0F172A', '#F1F5F9']
    },
    {
      key: 'surface',
      label: t('custom_theme_surface', 'Фон карточек и панелей'),
      desc: t('custom_theme_surface_desc', 'Блоки меню, карточки и модальные окна'),
      swatches: ['#1B2024', '#323339', '#1C1E24', '#152420', '#1B1728', '#121F29', '#1E293B', '#FFFFFF']
    },
    {
      key: 'secondary',
      label: t('custom_theme_secondary', 'Поля ввода и списки'),
      desc: t('custom_theme_secondary_desc', 'Внутренние инпуты и вложенные плашки'),
      swatches: ['#272C31', '#282A2E', '#282B33', '#1C332D', '#27213B', '#1C2E3C', '#334155', '#E2E8F0']
    },
    {
      key: 'accent',
      label: t('custom_theme_accent', 'Кнопки и акценты'),
      desc: t('custom_theme_accent_desc', 'Основные кнопки, активные табы, переключатели'),
      swatches: ['#3154E1', '#F97316', '#F45142', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899']
    },
    {
      key: 'text',
      label: t('custom_theme_text', 'Цвет текста'),
      desc: t('custom_theme_text_desc', 'Заголовки и основной читаемый текст'),
      swatches: ['#F1F5F9', '#F8FAFC', '#FFFFFF', '#E2E8F0', '#CBD5E1', '#94A3B8', '#0F172A']
    },
    {
      key: 'border',
      label: t('custom_theme_border', 'Рамки и границы'),
      desc: t('custom_theme_border_desc', 'Обводка карточек, разделительные линии'),
      swatches: ['#3B4045', '#3F4147', '#373A45', '#27473E', '#3B335A', '#264257', '#475569', '#CBD5E1']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-main-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {t('custom_theme_modal_title', 'Настройка своей темы')}
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  Custom
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('custom_theme_modal_desc', 'Настройте основные цвета интерфейса или выберите готовый шаблон')}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleCancel}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
            title={t('custom_theme_btn_back', 'Выйти назад')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
          {/* Quick Templates Bar */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                {t('custom_theme_templates', 'Быстрые шаблоны')}
              </div>
              <span className="text-[11px] text-slate-400">
                {t('custom_theme_templates_hint', 'Нажмите на шаблон для быстрой основы')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {THEME_TEMPLATES.map((tmpl) => {
                const isCurrent = activePreset === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyPreset(tmpl)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left ${
                      isCurrent
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-white/20" 
                      style={{ backgroundColor: tmpl.theme.accent }}
                    />
                    <span className="truncate">{tmpl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Preview Mockup ("проверять, менять") */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Layout className="w-3.5 h-3.5 text-orange-500" />
                {t('custom_theme_preview', 'Интерактивный предпросмотр')}
              </div>
              <span className="text-[11px] text-slate-400">
                {t('custom_theme_preview_hint', 'Цвета обновляются в реальном времени')}
              </span>
            </div>

            <div 
              className="rounded-2xl border p-4 sm:p-5 transition-colors duration-200 shadow-inner overflow-hidden"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border
              }}
            >
              {/* Mock Window Top Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-xs font-bold ml-2 opacity-90" style={{ color: colors.text }}>
                    Industrial Hub
                  </span>
                </div>
                
                {/* Mock Nav Links */}
                <div className="flex items-center gap-2 text-xs">
                  <span 
                    className="px-2.5 py-1 rounded-lg font-bold shadow-xs text-white"
                    style={{ backgroundColor: colors.accent }}
                  >
                    Настройки
                  </span>
                  <span 
                    className="px-2.5 py-1 rounded-lg font-medium opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: colors.text }}
                  >
                    Серверы
                  </span>
                  <span 
                    className="px-2.5 py-1 rounded-lg font-medium opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: colors.text }}
                  >
                    Бинды
                  </span>
                </div>
              </div>

              {/* Mock Content Layout: Card + Inputs + Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Mock Main Card */}
                <div 
                  className="md:col-span-2 rounded-xl border p-4 transition-colors shadow-sm"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold" style={{ color: colors.text }}>
                      Пример интерфейса программы
                    </h4>
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                      style={{ backgroundColor: colors.accent }}
                    >
                      Active
                    </span>
                  </div>
                  <p 
                    className="text-xs mb-3.5 opacity-70 leading-relaxed"
                    style={{ color: colors.text }}
                  >
                    Здесь видно сочетание фонов, карточек, границ и текста. Все кнопки и элементы управления реагируют на изменения.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button 
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: colors.accent }}
                    >
                      Основная кнопка
                    </button>
                    <button 
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-opacity hover:opacity-80 active:scale-95 cursor-pointer"
                      style={{ 
                        backgroundColor: colors.secondary, 
                        borderColor: colors.border,
                        color: colors.text 
                      }}
                    >
                      Вторичная кнопка
                    </button>
                  </div>
                </div>

                {/* Mock Controls Card */}
                <div 
                  className="rounded-xl border p-4 transition-colors shadow-sm flex flex-col justify-between gap-3"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}
                >
                  <div>
                    <label 
                      className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide opacity-80"
                      style={{ color: colors.text }}
                    >
                      Поле ввода
                    </label>
                    <div 
                      className="w-full rounded-lg border px-3 py-1.5 text-xs font-mono select-none"
                      style={{ 
                        backgroundColor: colors.secondary, 
                        borderColor: colors.border,
                        color: colors.text 
                      }}
                    >
                      bind f1 "kill"
                    </div>
                  </div>

                  {/* Mock Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: colors.border }}>
                    <span className="text-xs font-medium opacity-80" style={{ color: colors.text }}>
                      Переключатель
                    </span>
                    <button
                      type="button"
                      onClick={() => setMockToggle(!mockToggle)}
                      className="w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer relative"
                      style={{ 
                        backgroundColor: mockToggle ? colors.accent : colors.secondary,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <div 
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          mockToggle ? 'translate-x-4.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Settings Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
                {t('custom_theme_fields_title', 'Основные цвета программы')}
              </div>
              <span className="text-[11px] text-slate-400">
                {t('custom_theme_fields_hint', 'Используйте палитру, пипетку или ввод HEX кода')}
              </span>
            </div>

            {/* Brand Palette Bar */}
            <div className="mb-4 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Palette className="w-3.5 h-3.5 text-orange-500" />
                  <span>{t('custom_theme_brand_palette', 'Фирменная палитра:')}</span>
                  <span className="text-[11px] font-semibold text-orange-500">
                    {colorFields.find(f => f.key === activeFieldKey)?.label || ''}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {t('custom_theme_palette_click_hint', 'Кликните цвет, чтобы применить к выбранному параметру')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {BRAND_PALETTE.map((swatch) => (
                  <button
                    key={swatch.hex + swatch.label}
                    type="button"
                    onClick={() => handleColorChange(activeFieldKey, swatch.hex)}
                    className="group relative w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-700/80 shadow-xs hover:scale-125 transition-transform cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: swatch.hex }}
                    title={`${swatch.label} (${swatch.hex})`}
                  >
                    <span className="sr-only">{swatch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorFields.map((field) => {
                const currentColor = colors[field.key] || '#000000';
                const isActiveField = activeFieldKey === field.key;

                return (
                  <div 
                    key={field.key}
                    onClick={() => setActiveFieldKey(field.key)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      isActiveField
                        ? 'border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Field Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {field.label}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {field.desc}
                        </p>
                      </div>

                      {/* Main Color Swatch & Native Picker Trigger */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => colorInputRefs.current[field.key]?.click()}
                          className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-600 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: currentColor }}
                          title={t('custom_theme_open_picker', 'Открыть цветовую палитру')}
                        >
                          <span className="sr-only">Choose color</span>
                        </button>
                        {/* Hidden Native Color Input */}
                        <input
                          ref={(el) => (colorInputRefs.current[field.key] = el)}
                          type="color"
                          value={currentColor}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="absolute inset-0 opacity-0 pointer-events-none w-px h-px"
                        />
                      </div>
                    </div>

                    {/* Inputs & Pipette Controls */}
                    <div className="flex items-center gap-2">
                      {/* Hex input */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={currentColor}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.length <= 7) {
                              setColors({ ...colors, [field.key]: val });
                              if (isValidHex(val)) {
                                applyLivePreview({ ...colors, [field.key]: normalizeHex(val) });
                              }
                            }
                          }}
                          onBlur={(e) => {
                            if (isValidHex(e.target.value)) {
                              handleColorChange(field.key, e.target.value);
                            } else {
                              // Reset to valid color
                              setColors({ ...colors, [field.key]: currentColor });
                            }
                          }}
                          className="w-full font-mono text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 shadow-xs"
                          placeholder="#000000"
                        />
                      </div>

                      {/* Pipette Button */}
                      <button
                        type="button"
                        onClick={() => handlePipette(field.key)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
                        title={t('custom_theme_pipette', 'Пипетка: выбрать цвет с экрана')}
                      >
                        <Pipette className="w-3.5 h-3.5 text-orange-500" />
                        <span className="hidden sm:inline">{t('custom_theme_pipette', 'Пипетка')}</span>
                      </button>
                    </div>

                    {/* Recommended Swatches from our brand palette */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-medium mb-1.5">
                        {t('custom_theme_our_colors', 'Из нашей палитры:')}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {field.swatches.map((hex) => {
                          const isSelected = currentColor.toUpperCase() === hex.toUpperCase();
                          return (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => handleColorChange(field.key, hex)}
                              className={`w-5 h-5 rounded-md border transition-transform hover:scale-125 cursor-pointer shadow-xs relative flex items-center justify-center ${
                                isSelected 
                                  ? 'border-orange-500 ring-2 ring-orange-500/30 scale-110 z-10' 
                                  : 'border-slate-300 dark:border-slate-700/80'
                              }`}
                              style={{ backgroundColor: hex }}
                              title={hex}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white drop-shadow stroke-[3]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">
                  {t('custom_theme_delete_confirm', 'Вы действительно хотите удалить кастомную тему? Будет возвращена стандартная тёмная тема.')}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {t('cancel', 'Отмена')}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-xs"
                >
                  {t('delete', 'Удалить')}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with the 4 required buttons */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/80">
          
          {/* Left Buttons: Выйти назад & Сбросить */}
          <div className="flex items-center gap-2.5">
            {/* Кнопка 1: Выйти назад */}
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('custom_theme_btn_back', 'Выйти назад')}</span>
            </button>

            {/* Кнопка 2: Сбросить */}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors cursor-pointer"
              title={t('custom_theme_btn_reset_desc', 'Сбросить к значениям по умолчанию')}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('custom_theme_btn_reset', 'Сбросить')}</span>
            </button>
          </div>

          {/* Right Buttons: Удалить & Сохранить */}
          <div className="flex items-center gap-2.5">
            {/* Кнопка 3: Удалить */}
            {hasCustomTheme && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold transition-colors cursor-pointer"
                title={t('custom_theme_btn_delete', 'Удалить кастомную тему')}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('custom_theme_btn_delete', 'Удалить')}</span>
              </button>
            )}

            {/* Кнопка 4: Сохранить */}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('custom_theme_btn_save', 'Сохранить')}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
