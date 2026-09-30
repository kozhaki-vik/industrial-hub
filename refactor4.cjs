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

// Convert file to \n to make replacing easier, then back if needed, but modern tools handle \n just fine.
content = content.replace(/\r\n/g, '\n');

let newContent = content.replace(target1, '');
newContent = newContent.replace(target2, '');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Success with regex replace");
