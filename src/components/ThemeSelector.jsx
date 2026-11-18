import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, MessageSquare, Check, Palette, SlidersHorizontal, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import CustomThemeModal from './CustomThemeModal';

export default function ThemeSelector({ value, onChange, className = '' }) {
  const { t } = useTranslation();
  const { customTheme, hasCustomTheme } = useTheme();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const standardThemes = [
    {
      id: 'light',
      name: t('theme_light', 'Светлая'),
      desc: t('theme_light_desc', 'Классический светлый стиль'),
      icon: Sun,
      surfaceColor: '#FFFFFF',
      bgColor: '#F1F5F9',
      lineColor: '#CBD5E1',
      accentColor: '#F97316',
      accentLabel: 'Orange'
    },
    {
      id: 'dark',
      name: t('theme_dark', 'Тёмная'),
      desc: t('theme_dark_desc', 'Тёмный графит'),
      icon: Moon,
      surfaceColor: '#1B2024',
      bgColor: '#14191D',
      lineColor: '#3B4045',
      accentColor: '#3154E1',
      accentLabel: 'Blue'
    },
    {
      id: 'discord',
      name: t('theme_discord', 'Discord'),
      desc: t('theme_discord_desc', 'Оригинальный Discord с красным'),
      icon: MessageSquare,
      surfaceColor: '#323339',
      bgColor: '#2C2D32',
      lineColor: '#3F4147',
      accentColor: '#F45142',
      accentLabel: 'Red'
    }
  ];

  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 ${className}`}>
        {/* The 3 Standard Themes */}
        {standardThemes.map((item) => {
          const isSelected = value === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              {/* Visual Preview Box with 2 background colors split by diagonal */}
              <div className="relative w-full h-16 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-inner mb-3 transition-transform duration-200 group-hover:scale-[1.02]">
                <svg className="w-full h-full block" viewBox="0 0 100 60" preserveAspectRatio="none">
                  {/* Surface color triangle */}
                  <polygon points="0,0 100,0 0,60" fill={item.surfaceColor} />
                  {/* Background color triangle */}
                  <polygon points="100,0 100,60 0,60" fill={item.bgColor} />
                  {/* Divider line */}
                  <line
                    x1="0"
                    y1="60"
                    x2="100"
                    y2="0"
                    stroke={item.lineColor}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Accent Color Badge */}
                <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs border border-white/10 shadow-xs">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.accentColor }}
                  />
                  <span className="text-[10px] font-medium text-white/90 leading-none">
                    {item.accentLabel}
                  </span>
                </div>
              </div>

              {/* Title, Icon & Description */}
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* 4th Option: Custom Theme Card */}
        {hasCustomTheme && customTheme ? (
          // Saved Custom Theme Card
          <div
            onClick={() => onChange('custom')}
            className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
              value === 'custom'
                ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            {/* Visual Preview Box */}
            <div className="relative w-full h-16 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-inner mb-3 transition-transform duration-200 group-hover:scale-[1.02]">
              <svg className="w-full h-full block" viewBox="0 0 100 60" preserveAspectRatio="none">
                <polygon points="0,0 100,0 0,60" fill={customTheme.surface} />
                <polygon points="100,0 100,60 0,60" fill={customTheme.bg} />
                <line
                  x1="0"
                  y1="60"
                  x2="100"
                  y2="0"
                  stroke={customTheme.border}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Accent Color Badge */}
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs border border-white/10 shadow-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: customTheme.accent }}
                />
                <span className="text-[10px] font-medium text-white/90 leading-none">
                  Custom
                </span>
              </div>
            </div>

            {/* Title, Icon & Description + Edit Button */}
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    value === 'custom'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{t('theme_custom', 'Своя тема')}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {t('theme_custom_desc', 'Пользовательская')}
                  </div>
                </div>
              </div>

              {/* Actions: Edit button + Selection Checkmark */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCustomModalOpen(true);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t('theme_custom_edit', 'Настроить цвета')}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                {value === 'custom' && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Not configured yet: Create Custom Theme Button Card
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="group relative text-left p-3.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-orange-500 dark:hover:border-orange-500/80 bg-slate-50/40 dark:bg-slate-900/30 hover:bg-orange-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Visual Placeholder Box */}
            <div className="relative w-full h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1.5 mb-3 bg-slate-100/50 dark:bg-slate-950/40 group-hover:bg-orange-500/10 group-hover:border-orange-500/40 transition-colors">
              <Plus className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-orange-500 group-hover:scale-110 transition-all" />
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors">
                {t('theme_custom_create_label', 'Создать палитру')}
              </span>
            </div>

            {/* Title, Icon & Description */}
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors">
                    {t('theme_custom', 'Своя тема')}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {t('theme_custom_create_desc', 'Настроить цвета')}
                  </div>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Modal Overlay */}
      <CustomThemeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </>
  );
}
