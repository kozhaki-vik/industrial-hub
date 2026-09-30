const fs = require('fs');
const path = require('path');

const filePath = path.join('c:/Users/dimav/source/repos/Industrial Hub/src/views/ClanManagerTabs/StatsTab.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The goal is to move the SVG chart state and logic into ActivityChart component.
const chartJsxStart = '{/* 2. ОСНОВНОЙ ГРАФИК: ОБЩАЯ АКТИВНОСТЬ ЛЮДЕЙ В КЛАНЕ С ОТМЕТКОЙ В 30 МИНУТ (Большая часть экрана) */}';
const chartJsxEnd = '{/* 3. ВТОРИЧНЫЙ ГРАФИК: ДИНАМИКА УЧАСТНИКОВ (Входы и выходы по дням) */}';
const chartJsx = content.substring(content.indexOf(chartJsxStart), content.indexOf(chartJsxEnd)).trim();

// Code blocks to extract for ActivityChart
const codeToExtract = `
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

  // Build baseline fallback data if server data is still populating
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
`;

const activityChartComponent = `
const ActivityChart = React.memo(function ActivityChart({ act, t, TIME_SLOTS, buildSmoothPath }) {
${codeToExtract}

  return (
    ${chartJsx}
  );
});
`;

// Remove extracted code from StatsTab
// 1. Remove the first chunk of states
const remove1 = `
  // Selected day for main chart: e.g. "today" or date string "YYYY-MM-DD"
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey);

  // Comparison mode: 'none', 'week' (same day last week), 'month_avg' (average over month)
  const [compareMode, setCompareMode] = useState('week');

  // Metric for main chart: 'all' (activity score), 'voice' (voice online), 'messages' (message volume)
  const [activeMetric, setActiveMetric] = useState('all');
`;

const remove2 = `
  // Hover state for main chart tooltip
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartSvgRef = useRef(null);
`;

const remove3Start = `// Build baseline fallback data if server data is still populating`;
const remove3End = `// Member Dynamics (joins and leaves)`;

// To be safe, we will just split by string replacing exactly the parts we want.
content = content.replace(remove1, '');
content = content.replace(remove2, '');

const idxStart3 = content.indexOf(remove3Start);
const idxEnd3 = content.indexOf(remove3End);
content = content.substring(0, idxStart3) + content.substring(idxEnd3);

// Replace JSX
const idxJsxStart = content.indexOf(chartJsxStart);
const idxJsxEnd = content.indexOf(chartJsxEnd);
content = content.substring(0, idxJsxStart) + `      <ActivityChart act={act} t={t} TIME_SLOTS={TIME_SLOTS} buildSmoothPath={buildSmoothPath} />\n\n      ` + content.substring(idxJsxEnd);

// Add ActivityChart before StatsTab
const finalContent = content.substring(0, content.indexOf('export default function StatsTab() {')) + activityChartComponent + '\n\n' + content.substring(content.indexOf('export default function StatsTab() {'));

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Done refactoring StatsTab');
