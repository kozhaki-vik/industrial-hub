import React, { useContext, useState, useMemo, useCallback, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  BarChart3, RefreshCw, AlertTriangle, Check, Search, X,
  ChevronLeft, ChevronRight, MessageSquare, Volume2, Users,
  Clock, TrendingUp, TrendingDown, UserPlus, UserMinus,
  Calendar, Layers, Filter, Activity, Sparkles, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { StatsTableSkeleton } from '../../components/Skeleton';

// Generate 48 time slot labels (00:00, 00:30, 01:00 ... 23:30)
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
});

// Helper to calculate smooth bezier curves for SVG
function buildSmoothPath(values, width, height, padding, maxY) {
  if (!values || values.length === 0) return { linePath: '', areaPath: '', coords: [] };

  const effectiveMax = Math.max(1, maxY);
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const count = values.length;

  const coords = values.map((val, i) => {
    const x = padding.left + (i / Math.max(1, count - 1)) * plotW;
    const y = padding.top + plotH - (val / effectiveMax) * plotH;
    return { x, y, val };
  });

  if (coords.length === 1) {
    const pt = coords[0];
    return { linePath: `M ${pt.x} ${pt.y}`, areaPath: '', coords };
  }

  // Smooth cubic bezier spline
  let linePath = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    linePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const baselineY = padding.top + plotH;
  const areaPath = `${linePath} L ${coords[coords.length - 1].x},${baselineY} L ${coords[0].x},${baselineY} Z`;

  return { linePath, areaPath, coords };
}

// Memoized single member stat row
const StatRow = React.memo(function StatRow({ stat, t, onOpenWarns, getCachedMemberMeta }) {
  const voiceHours = Math.floor((stat.voiceTime || 0) / 3600);
  const voiceMinutes = Math.floor(((stat.voiceTime || 0) % 3600) / 60);
  const warnCount = stat.warnCount || 0;

  const cached = getCachedMemberMeta ? getCachedMemberMeta(stat.userId) : null;
  const displayName = stat.displayName || cached?.displayName || stat.username || cached?.username || '—';
  const username = stat.username || cached?.username || 'unknown';
  const initials = (displayName).slice(0, 2).toUpperCase();
  const hasAvatar = Boolean(stat.avatarUrl);

  return (
    <tr className="bg-white border-b dark:bg-slate-900/50 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors group">
      <th scope="row" className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap dark:text-white flex items-center">
        <div className="relative mr-3 shrink-0">
          {hasAvatar ? (
            <img
              src={stat.avatarUrl}
              alt=""
              loading="lazy"
              className="w-8 h-8 rounded-full object-cover bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-200/50 dark:ring-slate-700/50"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className={`w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-300/40 dark:ring-slate-700/40 shadow-xs ${hasAvatar ? 'hidden' : 'flex'}`}
          >
            {initials}
          </div>
        </div>
        <div className="min-w-0 max-w-[200px]">
          <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-500 transition-colors">
            {displayName}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            @{username}
          </div>
        </div>
      </th>
      <td className="px-6 py-3.5 text-center font-mono text-xs whitespace-nowrap text-slate-700 dark:text-slate-300">
        <span className={voiceHours > 0 ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
          {voiceHours}{t('clan_h_short', 'ч')} {voiceMinutes}{t('clan_m_short', 'м')}
        </span>
      </td>
      <td className="px-6 py-3.5 text-center font-mono text-xs text-slate-700 dark:text-slate-300">
        <span className={stat.messageCount > 0 ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
          {stat.messageCount || 0}
        </span>
      </td>
      <td className="px-6 py-3.5 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
        {stat.wipesPlayed || 0}
      </td>
      <td className="px-6 py-3.5 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
        {stat.votesCast || 0}
      </td>
      <td className="px-6 py-3.5 text-center">
        <button
          type="button"
          onClick={() => onOpenWarns && onOpenWarns({ userId: stat.userId, displayName, username, avatarUrl: stat.avatarUrl, warnCount })}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border shadow-2xs ${
            warnCount > 0
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 border-slate-200 dark:border-slate-700/60'
          }`}
          title={t('clan_stats_warns_tooltip', 'Нажмите для управления предупреждениями')}
        >
          {warnCount > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{warnCount}</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>0</span>
            </>
          )}
        </button>
      </td>
    </tr>
  );
});

const ITEMS_PER_PAGE = 20;


const ActivityChart = React.memo(function ActivityChart({ act, t, TIME_SLOTS, buildSmoothPath }) {
  // Selected day for main chart: e.g. "today" or date string "YYYY-MM-DD"
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey);

  // Comparison mode: 'none', 'week' (same day last week), 'month_avg' (average over month)
  const [compareMode, setCompareMode] = useState('week');

  // Metric for main chart: 'all' (activity score), 'voice' (voice online), 'messages' (message volume)
  const [activeMetric, setActiveMetric] = useState('all');

  // Hover state for main chart tooltip
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartSvgRef = useRef(null);
  const daysData = act.days || {};
  const currentDayData = daysData[selectedDayKey] || {
    buckets30m: new Array(48).fill(0),
    voiceBuckets: new Array(48).fill(0),
    messageBuckets: new Array(48).fill(0),
    messagesTotal: 0,
    peakVoice: 0
  };

  // Resolve comparison data
  const compareDayKey = useMemo(() => {
    if (compareMode === 'week') {
      const d = new Date(selectedDayKey);
      d.setDate(d.getDate() - 7);
      return d.toISOString().split('T')[0];
    }
    return null;
  }, [compareMode, selectedDayKey]);

  const compareDayData = useMemo(() => {
    if (compareMode === 'week' && compareDayKey) {
      return daysData[compareDayKey] || null;
    }
    return null;
  }, [compareMode, compareDayKey, daysData]);

  // Primary values array according to activeMetric
  const primaryValues = useMemo(() => {
    if (activeMetric === 'voice') return currentDayData.voiceBuckets || new Array(48).fill(0);
    if (activeMetric === 'messages') return currentDayData.messageBuckets || new Array(48).fill(0);
    return currentDayData.buckets30m || new Array(48).fill(0);
  }, [activeMetric, currentDayData]);

  // Comparison values array
  const compareValues = useMemo(() => {
    if (compareMode === 'none') return null;
    if (compareMode === 'month_avg') {
      return act.avg30mBuckets || new Array(48).fill(0);
    }
    if (compareMode === 'week' && compareDayData) {
      if (activeMetric === 'voice') return compareDayData.voiceBuckets || new Array(48).fill(0);
      if (activeMetric === 'messages') return compareDayData.messageBuckets || new Array(48).fill(0);
      return compareDayData.buckets30m || new Array(48).fill(0);
    }
    return null;
  }, [compareMode, compareDayData, act.avg30mBuckets, activeMetric]);

  // Calculate maxY for scaling
  const maxPrimary = Math.max(...primaryValues, 1);
  const maxCompare = compareValues ? Math.max(...compareValues, 1) : 1;
  const chartMaxY = Math.max(maxPrimary, maxCompare, 5);

  // SVG Chart Dimensions
  const svgWidth = 1000;
  const svgHeight = 280;
  const svgPadding = { top: 25, right: 30, bottom: 40, left: 45 };

  const primaryPath = useMemo(() => {
    return buildSmoothPath(primaryValues, svgWidth, svgHeight, svgPadding, chartMaxY);
  }, [primaryValues, chartMaxY]);

  const comparePath = useMemo(() => {
    if (!compareValues) return null;
    return buildSmoothPath(compareValues, svgWidth, svgHeight, svgPadding, chartMaxY);
  }, [compareValues, chartMaxY]);

  // Handle Chart Mouse Move for Hover Tooltip
  const handleChartMouseMove = useCallback((e) => {
    if (!chartSvgRef.current) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = (mouseX / rect.width) * svgWidth;

    const plotW = svgWidth - svgPadding.left - svgPadding.right;
    const clampedX = Math.max(0, Math.min(plotW, relX - svgPadding.left));
    const idx = Math.round((clampedX / plotW) * 47);
    const newIdx = Math.min(47, Math.max(0, idx));
    setHoverIndex(prev => prev === newIdx ? prev : newIdx);
  }, [svgWidth, svgPadding]);

  const handleChartMouseLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);


  return (
    <>
      {/* 2. ОСНОВНОЙ ГРАФИК: ОБЩАЯ АКТИВНОСТЬ ЛЮДЕЙ В КЛАНЕ С ОТМЕТКОЙ В 30 МИНУТ (Большая часть экрана) */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Controls Toolbar for Main Chart */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>{t('clan_activity_chart_title', 'Общая активность людей в клане по времени суток')}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('clan_activity_chart_desc', 'Просмотр графика с интервалом в 30 минут и возможностью сравнения')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Selector Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveMetric('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMetric === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('clan_metric_all', 'Вся активность')}
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('voice')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMetric === 'voice'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('clan_metric_voice', 'Голос')}
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('messages')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMetric === 'messages'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('clan_metric_messages', 'Сообщения')}
              </button>
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDayKey}
                onChange={(e) => setSelectedDayKey(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
              >
                <option value={todayKey} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_day_today', 'Сегодня')} ({todayKey})</option>
                {(act.availableDays || []).filter(d => d !== todayKey).slice(0, 14).map(d => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {new Date(d).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })} ({d})
                  </option>
                ))}
              </select>
            </div>

            {/* Comparison Mode Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <select
                value={compareMode}
                onChange={(e) => setCompareMode(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
              >
                <option value="none" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_compare_none', 'Без сравнения')}</option>
                <option value="week" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_compare_week', 'С прошлой неделей')}</option>
                <option value="month_avg" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_compare_month_avg', 'Со средним за месяц')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {selectedDayKey === todayKey ? t('clan_legend_today', 'Выбранный день (Сегодня)') : selectedDayKey}
            </span>
          </div>

          {compareMode !== 'none' && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-purple-500 inline-block" />
              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                {compareMode === 'week' ? `${t('clan_legend_week_ago', 'Неделю назад')} (${compareDayKey})` : t('clan_legend_month_avg', 'Среднее за 30 дней')}
              </span>
            </div>
          )}

          {hoverIndex !== null && (
            <div className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-800 dark:text-slate-200 font-bold">
              🕒 {TIME_SLOTS[hoverIndex]} – {TIME_SLOTS[Math.min(47, hoverIndex + 1)]}
            </div>
          )}
        </div>

        {/* Main Interactive SVG Chart */}
        <div className="relative w-full overflow-hidden select-none">
          <svg
            ref={chartSvgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-64 md:h-72 lg:h-80 cursor-crosshair overflow-visible"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <defs>
              {/* Primary Line Gradient */}
              <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>

              {/* Comparison Line Gradient */}
              <linearGradient id="compareAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>

              {/* Filter glow for hovered dot */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Gridlines and Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = svgPadding.top + (svgHeight - svgPadding.top - svgPadding.bottom) * (1 - ratio);
              const val = Math.round(chartMaxY * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={svgPadding.left}
                    y1={y}
                    x2={svgWidth - svgPadding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800/80"
                    strokeDasharray={ratio === 0 ? 'none' : '4 4'}
                    strokeWidth={ratio === 0 ? '1.5' : '1'}
                  />
                  <text
                    x={svgPadding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels at 2-hour intervals */}
            {Array.from({ length: 13 }).map((_, i) => {
              const slotIdx = Math.min(47, i * 4);
              const pt = primaryPath.coords[slotIdx];
              if (!pt) return null;
              const label = `${(i * 2).toString().padStart(2, '0')}:00`;
              return (
                <g key={i}>
                  <line
                    x1={pt.x}
                    y1={svgHeight - svgPadding.bottom}
                    x2={pt.x}
                    y2={svgHeight - svgPadding.bottom + 5}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - svgPadding.bottom + 18}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Comparison Area & Line (if enabled) */}
            {comparePath && (
              <>
                {comparePath.areaPath && (
                  <path d={comparePath.areaPath} fill="url(#compareAreaGrad)" />
                )}
                <path
                  d={comparePath.linePath}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Primary Filled Area */}
            {primaryPath.areaPath && (
              <path d={primaryPath.areaPath} fill="url(#primaryAreaGrad)" />
            )}

            {/* Primary Curve Line */}
            {primaryPath.linePath && (
              <path
                d={primaryPath.linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Crosshair and hover point */}
            {hoverIndex !== null && primaryPath.coords[hoverIndex] && (
              <g>
                {/* Vertical crosshair line */}
                <line
                  x1={primaryPath.coords[hoverIndex].x}
                  y1={svgPadding.top}
                  x2={primaryPath.coords[hoverIndex].x}
                  y2={svgHeight - svgPadding.bottom}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Comparison Point */}
                {comparePath && comparePath.coords[hoverIndex] && (
                  <circle
                    cx={comparePath.coords[hoverIndex].x}
                    cy={comparePath.coords[hoverIndex].y}
                    r="5"
                    fill="#a855f7"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}

                {/* Primary Hover Glow Point */}
                <circle
                  cx={primaryPath.coords[hoverIndex].x}
                  cy={primaryPath.coords[hoverIndex].y}
                  r="6"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />
              </g>
            )}
          </svg>

          {/* Floating Tooltip HTML Overlay */}
          {hoverIndex !== null && primaryPath.coords[hoverIndex] && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-transform duration-75"
              style={{
                left: `${(primaryPath.coords[hoverIndex].x / svgWidth) * 100}%`,
                top: `${(primaryPath.coords[hoverIndex].y / svgHeight) * 100}%`,
                marginTop: '-12px'
              }}
            >
              <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md space-y-1.5 min-w-[170px]">
                <div className="font-mono text-[11px] text-blue-400 font-bold border-b border-slate-800 pb-1">
                  ⏱️ {TIME_SLOTS[hoverIndex]} – {TIME_SLOTS[Math.min(47, hoverIndex + 1)]}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">
                    {selectedDayKey === todayKey ? 'Сегодня' : selectedDayKey}:
                  </span>
                  <span className="font-bold text-white font-mono">
                    {primaryValues[hoverIndex] || 0}
                  </span>
                </div>
                {compareValues && (
                  <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-1">
                    <span className="text-purple-400">
                      {compareMode === 'week' ? 'Неделю назад' : 'В среднем'}:
                    </span>
                    <span className="font-bold text-purple-300 font-mono">
                      {compareValues[hoverIndex] || 0}
                    </span>
                  </div>
                )}
                {compareValues && (
                  <div className="text-[10px] pt-0.5 font-mono text-right font-bold">
                    {primaryValues[hoverIndex] >= compareValues[hoverIndex] ? (
                      <span className="text-emerald-400">
                        +{primaryValues[hoverIndex] - compareValues[hoverIndex]} (
                        {compareValues[hoverIndex] > 0
                          ? `+${Math.round(((primaryValues[hoverIndex] - compareValues[hoverIndex]) / compareValues[hoverIndex]) * 100)}%`
                          : '+100%'}
                        )
                      </span>
                    ) : (
                      <span className="text-rose-400">
                        {primaryValues[hoverIndex] - compareValues[hoverIndex]} (
                        {compareValues[hoverIndex] > 0
                          ? `${Math.round(((primaryValues[hoverIndex] - compareValues[hoverIndex]) / compareValues[hoverIndex]) * 100)}%`
                          : '-100%'}
                        )
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});


export default function StatsTab() {
  const {
    t,
    statsData,
    setStatsData,
    statsSortField,
    setStatsSortField,
    statsSortOrder,
    setStatsSortOrder,
    openUserWarningsModal,
    activityStatsData,
    fetchActivityStats,
    getCachedMemberMeta
  } = useContext(ClanManagerContext);


  // Members dynamics timeframe: 7 (week) or 30 (month)
  const [membersPeriod, setMembersPeriod] = useState(7);

  // Table search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  // Safe reference to activity stats
  const act = activityStatsData || {};
  const todayMetrics = act.today || {
    messagesCount: 0,
    peakVoice: 0,
    activeMembersCount: 0,
    totalVoiceHours: 0
  };

  // Member Dynamics (joins and leaves)
  const fullDynamics = act.memberDynamics || [];
  const displayedDynamics = useMemo(() => {
    return fullDynamics.slice(-membersPeriod);
  }, [fullDynamics, membersPeriod]);

  const dynamicsMaxVal = useMemo(() => {
    let m = 3;
    displayedDynamics.forEach(d => {
      m = Math.max(m, d.joins || 0, d.leaves || 0);
    });
    return m;
  }, [displayedDynamics]);

  const totalJoinsPeriod = displayedDynamics.reduce((s, d) => s + (d.joins || 0), 0);
  const totalLeavesPeriod = displayedDynamics.reduce((s, d) => s + (d.leaves || 0), 0);
  const netDynamicsPeriod = totalJoinsPeriod - totalLeavesPeriod;

  // Sorting and filtering member table
  const handleStatsSort = useCallback((field) => {
    if (statsSortField === field) {
      setStatsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setStatsSortField(field);
      setStatsSortOrder(field === 'displayName' ? 'asc' : 'desc');
    }
  }, [statsSortField, setStatsSortField, setStatsSortOrder]);

  const sortedStats = useMemo(() => {
    if (!statsData || !Array.isArray(statsData)) return [];
    return [...statsData].sort((a, b) => {
      let cmp = 0;
      if (statsSortField === 'displayName') {
        const nameA = (a.displayName || a.username || '').toLowerCase();
        const nameB = (b.displayName || b.username || '').toLowerCase();
        cmp = nameA.localeCompare(nameB);
      } else {
        const valA = Number(a[statsSortField]) || 0;
        const valB = Number(b[statsSortField]) || 0;
        cmp = valA - valB;
      }
      return statsSortOrder === 'asc' ? cmp : -cmp;
    });
  }, [statsData, statsSortField, statsSortOrder]);

  const filteredStats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedStats;
    return sortedStats.filter(stat => {
      const dName = (stat.displayName || '').toLowerCase();
      const uName = (stat.username || '').toLowerCase();
      return dName.includes(q) || uName.includes(q);
    });
  }, [sortedStats, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStats.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedStats = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredStats.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStats, validPage]);

  const handleRefresh = useCallback(() => {
    setStatsData(null);
    if (fetchActivityStats) fetchActivityStats();
  }, [setStatsData, fetchActivityStats]);

  return (
    <div className="w-full space-y-6 animate-main-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>{t('clan_stats_title') || 'Статистика и активность клана'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('clan_stats_realtime_desc', 'Мониторинг активности участников по времени суток, динамика онлайна в войсе и учет сообщений.')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          <span>{t('common_refresh') || 'Обновить'}</span>
        </button>
      </div>

      {/* 1. СЧЕТЧИКИ АКТИВНОСТИ ЗА СЕГОДНЯ (4 карточки с метриками) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Карточка 1: Сообщения за сегодня (людей, кроме ботов) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="space-y-1 z-10">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('clan_stats_messages_today', 'Сообщения сегодня')}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
              <span>{todayMetrics.messagesCount || 0}</span>
              <span className="text-[11px] font-normal text-slate-400">сообщ.</span>
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              {t('clan_stats_human_only', 'Исключая ботов и интеграции')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/40 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Карточка 2: Пик в голосовом канале сегодня */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="space-y-1 z-10">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('clan_stats_peak_voice_today', 'Пик в голосовых')}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
              <span>{todayMetrics.peakVoice || 0}</span>
              <span className="text-[11px] font-normal text-slate-400">чел. пик</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('clan_stats_peak_today_desc', 'Максимум одновременно')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/40 group-hover:scale-105 transition-transform">
            <Volume2 className="w-6 h-6" />
          </div>
        </div>

        {/* Карточка 3: Активных соклановцев сегодня */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="space-y-1 z-10">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('clan_stats_active_today', 'Активных бойцов')}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
              <span>{todayMetrics.activeMembersCount || 0}</span>
              <span className="text-[11px] font-normal text-slate-400">участников</span>
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
              {t('clan_stats_active_desc', 'Были в войсе или чатах')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/40 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Карточка 4: Всего времени в войсе за сегодня */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="space-y-1 z-10">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('clan_stats_voice_hours_today', 'Время в войсе сегодня')}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
              <span>{todayMetrics.totalVoiceHours || 0}</span>
              <span className="text-[11px] font-normal text-slate-400">часов</span>
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              {t('clan_stats_total_clan_online', 'Суммарный онлайн клана')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

            <ActivityChart act={act} t={t} TIME_SLOTS={TIME_SLOTS} buildSmoothPath={buildSmoothPath} />

      {/* 3. ВТОРИЧНЫЙ ГРАФИК: ДИНАМИКА УЧАСТНИКОВ (Входы и выходы по дням) */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>{t('clan_member_dynamics_title', 'Динамика участников: входы и выходы')}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('clan_member_dynamics_desc', 'Сколько людей зашло и вышло с Discord сервера по дням')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Week / Month Period Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMembersPeriod(7)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  membersPeriod === 7
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('clan_period_week', 'Неделя (7 дн.)')}
              </button>
              <button
                type="button"
                onClick={() => setMembersPeriod(30)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  membersPeriod === 30
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('clan_period_month', 'Месяц (30 дн.)')}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Period Summary Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {t('clan_total_joins', 'Присоединилось')}
              </div>
              <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                +{totalJoinsPeriod}
              </div>
            </div>
            <UserPlus className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                {t('clan_total_leaves', 'Покинуло сервер')}
              </div>
              <div className="text-xl font-bold text-rose-800 dark:text-rose-300 font-mono">
                -{totalLeavesPeriod}
              </div>
            </div>
            <UserMinus className="w-5 h-5 text-rose-500" />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('clan_net_balance', 'Чистый баланс')}
              </div>
              <div className={`text-xl font-bold font-mono ${netDynamicsPeriod >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {netDynamicsPeriod >= 0 ? `+${netDynamicsPeriod}` : netDynamicsPeriod}
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Bar Chart of Member Events */}
        <div className="overflow-x-auto pt-2">
          <div className="min-w-[600px] h-48 flex items-end justify-between gap-2 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {displayedDynamics.map((item, idx) => {
              const joinHeight = Math.max(6, (item.joins / dynamicsMaxVal) * 120);
              const leaveHeight = Math.max(6, (item.leaves / dynamicsMaxVal) * 120);
              return (
                <div key={item.date || idx} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                  {/* Tooltip on bar hover */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 z-30 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                    <span className="font-bold">{item.date}</span>: +{item.joins} / -{item.leaves}
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-1">
                    {/* Joins Bar (Green) */}
                    <div
                      style={{ height: `${joinHeight}px` }}
                      className="w-1/2 max-w-[14px] bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-all shadow-xs"
                      title={`+${item.joins} ${t('clan_joins', 'входов')}`}
                    />
                    {/* Leaves Bar (Red) */}
                    <div
                      style={{ height: `${leaveHeight}px` }}
                      className="w-1/2 max-w-[14px] bg-rose-500 hover:bg-rose-400 rounded-t-md transition-all shadow-xs"
                      title={`-${item.leaves} ${t('clan_leaves', 'выходов')}`}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-2 truncate w-full text-center">
                    {item.dayName || item.date?.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ТАБЛИЦА УЧАСТНИКОВ КЛАНА */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{t('clan_members_table_title', 'Индивидуальная статистика бойцов')}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('clan_stats_sort_tip', 'Нажмите на заголовок колонки для сортировки')}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('clan_search_member', 'Поиск по нику...')}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-400 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {!statsData ? (
          <StatsTableSkeleton rows={8} />
        ) : (
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/60 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 select-none">
                  <tr>
                    <th
                      scope="col"
                      onClick={() => handleStatsSort('displayName')}
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t('clan_stats_col_member') || 'Участник'}</span>
                        {statsSortField === 'displayName' ? (
                          <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-slate-400/60 text-[10px]">↕</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleStatsSort('voiceTime')}
                      className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{t('clan_stats_col_voice') || 'Время в Voice'}</span>
                        {statsSortField === 'voiceTime' ? (
                          <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-slate-400/60 text-[10px]">↕</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleStatsSort('messageCount')}
                      className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{t('clan_stats_col_messages') || 'Сообщения'}</span>
                        {statsSortField === 'messageCount' ? (
                          <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-slate-400/60 text-[10px]">↕</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleStatsSort('wipesPlayed')}
                      className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{t('clan_stats_col_wipes') || 'Вайпы'}</span>
                        {statsSortField === 'wipesPlayed' ? (
                          <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-slate-400/60 text-[10px]">↕</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleStatsSort('votesCast')}
                      className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{t('clan_stats_col_votes') || 'Голосования'}</span>
                        {statsSortField === 'votesCast' ? (
                          <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-slate-400/60 text-[10px]">↕</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleStatsSort('warnCount')}
                      className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{t('clan_stats_col_warns') || 'Варны'}</span>
                        {statsSortField === 'warnCount' ? (
                          <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-slate-400/60 text-[10px]">↕</span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedStats.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        {searchQuery
                          ? (t('clan_no_search_results', 'По вашему запросу ничего не найдено.'))
                          : (t('clan_auto_74', 'Нет данных для отображения.'))}
                      </td>
                    </tr>
                  ) : (
                    paginatedStats.map(stat => (
                      <StatRow
                        key={stat.userId}
                        stat={stat}
                        t={t}
                        onOpenWarns={openUserWarningsModal}
                        getCachedMemberMeta={getCachedMemberMeta}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredStats.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  {t('clan_pagination_showing', 'Показано')} {(validPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(validPage * ITEMS_PER_PAGE, filteredStats.length)} {t('clan_pagination_of', 'из')} {filteredStats.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={validPage <= 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-medium"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{t('clan_pagination_prev', 'Назад')}</span>
                  </button>
                  <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                    {validPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={validPage >= totalPages}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-medium"
                  >
                    <span>{t('clan_pagination_next', 'Вперед')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
