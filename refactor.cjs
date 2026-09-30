const fs = require('fs');
const path = require('path');

const filePath = path.join('c:/Users/dimav/source/repos/Industrial Hub/src/views/ClanManagerTabs/StatsTab.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const jsxStartMarker = '{/* 2. ОСНОВНОЙ ГРАФИК: ОБЩАЯ АКТИВНОСТЬ ЛЮДЕЙ В КЛАНЕ С ОТМЕТКОЙ В 30 МИНУТ (Большая часть экрана) */}';
const jsxEndMarker = '{/* 3. ВТОРИЧНЫЙ ГРАФИК: ДИНАМИКА УЧАСТНИКОВ (Входы и выходы по дням) */}';

const jsxStartIdx = content.indexOf(jsxStartMarker);
const jsxEndIdx = content.indexOf(jsxEndMarker);

const chartJsx = content.substring(jsxStartIdx, jsxEndIdx).trim();

const hookStartPattern = '// Selected day for main chart: e.g. "today" or date string "YYYY-MM-DD"';
const hookEndPattern = '// Member Dynamics (joins and leaves)';

const hookStartIdx = content.indexOf(hookStartPattern);
const hookEndIdx = content.indexOf(hookEndPattern);

const chartHooks = content.substring(hookStartIdx, hookEndIdx).trim();

let fixedHooks = chartHooks.replace(
  'setHoverIndex(Math.min(47, Math.max(0, idx)));',
  'const nextIdx = Math.min(47, Math.max(0, idx));\n    setHoverIndex(prev => prev === nextIdx ? prev : nextIdx);'
);

const activityChartComponent = `
const ActivityChart = React.memo(function ActivityChart({ act, t, TIME_SLOTS }) {
  ${fixedHooks}

  return (
    ${chartJsx}
  );
});
`;

const newStatsTabBody = content.substring(content.indexOf('export default function StatsTab() {'), hookStartIdx) + 
                        content.substring(hookEndIdx, jsxStartIdx) + 
                        '      <ActivityChart act={act} t={t} TIME_SLOTS={TIME_SLOTS} />\n\n      ' + 
                        content.substring(jsxEndIdx);

const newContent = content.substring(0, content.indexOf('export default function StatsTab() {')) + activityChartComponent + '\n\n' + newStatsTabBody;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully refactored StatsTab.jsx');
