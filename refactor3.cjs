const fs = require('fs');
const filePath = 'c:/Users/dimav/source/repos/Industrial Hub/src/views/ClanManagerTabs/StatsTab.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `  // Selected day for main chart: e.g. "today" or date string "YYYY-MM-DD"
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey);

  // Comparison mode: 'none', 'week' (same day last week), 'month_avg' (average over month)
  const [compareMode, setCompareMode] = useState('week');

  // Metric for main chart: 'all' (activity score), 'voice' (voice online), 'messages' (message volume)
  const [activeMetric, setActiveMetric] = useState('all');

  // Members dynamics timeframe: 7 (week) or 30 (month)
  const [membersPeriod, setMembersPeriod] = useState(7);

  // Table search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Hover state for main chart tooltip
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartSvgRef = useRef(null);`;

const replacement = `  // Members dynamics timeframe: 7 (week) or 30 (month)
  const [membersPeriod, setMembersPeriod] = useState(7);

  // Table search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);`;

const parts = content.split(targetStr);
if (parts.length === 2) {
    fs.writeFileSync(filePath, parts[0] + replacement + parts[1]);
    console.log("Success");
} else {
    console.log("Failed to split. Length: " + parts.length);
}
