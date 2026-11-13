const fs = require('fs');
const filePath = 'c:/Users/dimav/source/repos/Industrial Hub/src/views/ClanManagerTabs/StatsTab.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `  // Selected day for main chart: e.g. "today" or date string "YYYY-MM-DD"
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey);

  // Comparison mode: 'none', 'week' (same day last week), 'month_avg' (average over month)
  const [compareMode, setCompareMode] = useState('week');

  // Metric for main chart: 'all' (activity score), 'voice' (voice online), 'messages' (message volume)
  const [activeMetric, setActiveMetric] = useState('all');
`.replace(/\r/g, '');

const target2 = `  // Hover state for main chart tooltip
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartSvgRef = useRef(null);
`.replace(/\r/g, '');

content = content.replace(/\r\n/g, '\n');

// They appear inside StatsTab. They shouldn't be there.
// We can just find the index of "export default function StatsTab()"
const idxStats = content.indexOf('export default function StatsTab()');
if (idxStats !== -1) {
    let secondPart = content.substring(idxStats);
    secondPart = secondPart.replace(target1, '');
    secondPart = secondPart.replace(target2, '');
    content = content.substring(0, idxStats) + secondPart;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Cleaned up StatsTab");
} else {
    console.log("Could not find StatsTab");
}
