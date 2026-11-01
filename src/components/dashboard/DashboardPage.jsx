import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AlertOctagon, AudioLines, ChevronDown, ChevronRight, Clock3, FileWarning, Globe2, Link2, MessageSquareText, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

const fallbackWeek = [24, 53, 38, 78, 45, 54, 88];
const fallbackFeed = [
  { id: 'demo-link', source: 'Phishing Link', detail: 'Suspicious redirect pattern', risk: 'high', time: '2 hours ago', type: 'url' },
  { id: 'demo-sms', source: 'SMSishing', detail: 'Payment claim requires review', risk: 'review', time: '4 hours ago', type: 'message' },
  { id: 'demo-url', source: 'Malicious URL', detail: 'Unverified payment domain', risk: 'safe', time: 'Yesterday', type: 'url' },
];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function AnimatedNumber({ value }) {
  const numericValue = Number(value) || 0;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShown(numericValue); return undefined; }
    let frame;
    const start = performance.now();
    const duration = 850;
    const animate = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setShown(Math.round(numericValue * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [numericValue]);
  return shown.toLocaleString();
}

function formatAge(item) {
  const date = new Date(item.timestamp || item.created_at || item.dateFormatted || 0);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return 'Recently';
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getWeekValues(history) {
  const dayCounts = Array(7).fill(0);
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  history.forEach(item => {
    const parsed = new Date(item.timestamp || item.created_at || item.dateFormatted || '');
    if (!Number.isNaN(parsed.getTime()) && parsed >= start && parsed <= today) {
      const dayIndex = Math.floor((new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) - start) / 86400000);
      if (dayIndex >= 0 && dayIndex < 7) dayCounts[dayIndex] += 1;
    }
  });
  if (!dayCounts.some(Boolean)) return fallbackWeek;
  return dayCounts.map(count => count * 14);
}

function makeChart(values) {
  const points = values.map((value, index) => ({ x: 39 + index * 75, y: 145 - Math.min(120, value) / 120 * 112, value }));
  const path = points.reduce((d, point, index) => {
    if (!index) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midpoint = (previous.x + point.x) / 2;
    return `${d} Q ${midpoint} ${previous.y} ${midpoint} ${(previous.y + point.y) / 2} T ${point.x} ${point.y}`;
  }, '');
  return { points, path, area: `${path} L 489 145 L 39 145 Z` };
}

function ThreatPill({ risk }) {
  const severity = risk === 'high' ? 'high' : risk === 'review' ? 'review' : 'safe';
  const label = severity === 'high' ? 'Threat' : severity === 'review' ? 'Warning' : 'Safe';
  return <span className={`status-pill status-pill-${severity}`}>{label}</span>;
}

function ThreatIcon({ type, risk }) {
  const Icon = risk === 'high' ? AlertOctagon : type === 'url' ? Link2 : MessageSquareText;
  return <span className="threat-icon"><Icon aria-hidden="true" /></span>;
}

function WorldMap() {
  return <svg className="world-map" viewBox="0 0 620 270" role="img" aria-label="Illustrative map showing recent threat activity locations">
    <path className="world-land" d="M52 62 83 44 120 43 139 57 160 55 176 72 163 91 147 98 136 118 115 124 103 146 83 143 73 123 56 115 49 92Z M126 145 150 151 162 173 155 198 142 227 127 239 118 215 114 190 105 173Z M249 70 265 54 294 52 310 62 328 57 343 68 367 62 383 73 402 70 414 83 435 78 452 91 473 88 490 104 483 119 466 121 448 111 430 122 418 140 402 144 396 164 378 171 370 153 354 148 338 135 322 137 306 124 294 129 282 115 263 115 250 99 235 94Z M302 136 323 137 341 150 352 174 346 196 334 221 320 226 306 207 298 186 287 170Z M453 157 468 150 484 157 487 169 475 178 461 173Z M488 198 502 194 515 201 517 210 506 216 494 211Z" />
    <path className="world-land" d="M220 38 228 33 235 39 232 48 224 49Z M389 183 397 180 405 185 402 192 393 192Z M541 124 552 120 562 126 559 135 547 137Z" />
    {[[90,91],[119,109],[141,167],[277,102],[311,104],[351,116],[372,102],[399,110],[425,105],[442,132],[462,155],[492,194],[509,211],[345,176]].map(([cx,cy], index) => <circle key={`${cx}-${cy}`} className="map-dot" cx={cx} cy={cy} r={index % 4 === 0 ? 3.6 : 2.6} />)}
  </svg>;
}

export default function DashboardPage() {
  const { setCurrentView, setCurrentResult, setAnalyzeMode, history = [] } = useApp();
  const { user, isAuthenticated, token, apiBase } = useAuth();
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) { setUserStats(null); return; }
    let active = true;
    apiFetch('/users/me/stats', { token })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (active && data) setUserStats(data); })
      .catch(() => { /* The local scan history remains the dashboard fallback. */ });
    return () => { active = false; };
  }, [isAuthenticated, token, apiBase]);

  const getRisk = item => item.riskCategory || item.risk_category || 'safe';
  const getType = item => item.type || 'message';
  const totalScans = userStats?.total_scans ?? history.length;
  const blocked = userStats?.high_concern_count ?? history.filter(item => getRisk(item) === 'high').length;
  const urlsScanned = history.filter(item => getType(item) === 'url').length;
  const scamsFallback = history.length ? blocked : 103780;
  const linksFallback = urlsScanned || (history.length ? totalScans : 34500);
  const riskLevel = totalScans > 0 && blocked / totalScans >= .25 ? 'Elevated' : 'Low';
  const feed = useMemo(() => history.length ? history.slice(0, 4).map(item => ({
    id: item.id,
    source: item.typeLabel || item.type_label || (item.type === 'url' ? 'Website check' : item.type === 'screenshot' ? 'Payment screenshot' : 'Message scan'),
    detail: item.submittedItem || item.submitted_item || item.summary || 'Scan completed',
    risk: getRisk(item),
    time: formatAge(item),
    type: getType(item),
    raw: item
  })) : fallbackFeed, [history]);
  const week = useMemo(() => getWeekValues(history), [history]);
  const chart = useMemo(() => makeChart(week), [week]);
  const navigate = (view, mode) => {
    if (mode) setAnalyzeMode(mode);
    setCurrentView(view);
  };
  const firstName = user?.full_name?.split(' ')[0];

  return <div className="dashboard-page">
    <header className="dashboard-greeting">
      <div><p className="dashboard-eyebrow"><Sparkles className="h-3 w-3" />Your safety overview</p><h1>{firstName ? `Welcome back, ${firstName}` : 'Your protection dashboard'}</h1><p>Monitor your scans and stay one step ahead of suspicious activity.</p></div>
      <p className="dashboard-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
    </header>

    <section className="dashboard-row-top" aria-label="Protection score and weekly activity">
      <article className="dashboard-card protection-card">
        <div className="protection-ring" role="img" aria-label="Protection score 92 percent">
          <svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffdf8a"/><stop offset="53%" stopColor="#ffb830"/><stop offset="100%" stopColor="#d97706"/></linearGradient></defs><circle className="protection-track" cx="60" cy="60" r="52"/><circle className="protection-progress" cx="60" cy="60" r="52" /></svg>
          <span className="pulse-ring"/><span className="pulse-ring"/><span className="pulse-ring"/>
          <div className="protection-center"><div className="protection-shield"><ShieldCheck aria-hidden="true" /></div><strong className="protection-score"><AnimatedNumber value={92} />%</strong><span className="protection-label">You’re Protected</span></div>
        </div>
      </article>

      <article className="dashboard-card dashboard-chart">
        <div className="dashboard-card-head"><div><h2>Threats Blocked This Week</h2><p>{userStats ? `${blocked.toLocaleString()} high concern scans in your account` : 'Activity pattern across the last seven days'}</p></div><span className="dashboard-select">All Data <ChevronDown className="h-3 w-3" /></span></div>
        <div className="chart-wrap"><svg className="chart-svg" viewBox="0 0 520 180" role="img" aria-label="Threat activity across the last seven days">
          <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ffb830" stopOpacity=".28"/><stop offset="100%" stopColor="#ffb830" stopOpacity="0"/></linearGradient><linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#f59e0b"/><stop offset="55%" stopColor="#ffd071"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient></defs>
          {[33,61,89,117,145].map((y,index) => <g key={y}><line className="chart-grid" x1="36" x2="498" y1={y} y2={y}/><text className="chart-label" x="3" y={y+3}>{120-index*30}</text></g>)}
          <path className="chart-area" d={chart.area}/><path className="chart-line" d={chart.path}/>
          {chart.points.map((point,index) => <g key={index}><circle className="chart-point chart-hit" cx={point.x} cy={point.y} r="5" tabIndex="0" aria-label={`${weekdays[index]}: ${point.value} scans`}><title>{`${weekdays[index]}: ${point.value}`}</title></circle><g className="chart-tooltip" transform={`translate(${point.x-24} ${point.y-27})`}><rect width="48" height="18" rx="5"/><text x="24" y="12">{point.value}</text></g><text className="chart-label" textAnchor="middle" x={point.x} y="165">{weekdays[(new Date().getDay() - 6 + index + 7) % 7]}</text></g>)}
        </svg></div>
      </article>
    </section>

    <section className="dashboard-stats" aria-label="Scan statistics">
      <article className="dashboard-card stat-card"><div className="stat-top"><span className="stat-title">Scams Blocked</span><span className="stat-icon"><ShieldCheck /></span></div><p className="stat-value"><AnimatedNumber value={scamsFallback} /></p><p className="stat-foot">{history.length || userStats ? 'Based on your scan history' : 'Demo data until you run your first scan'}</p></article>
      <article className="dashboard-card stat-card"><div className="stat-top"><span className="stat-title">Links Scanned</span><span className="stat-icon"><Globe2 /></span></div><p className="stat-value"><AnimatedNumber value={linksFallback} /></p><p className="stat-foot">{urlsScanned ? 'Website checks in your history' : 'Illustrative sample total'}</p></article>
      <article className="dashboard-card stat-card stat-card-risk"><div className="stat-top"><span className="stat-title">Risk Level</span><span className="status-pill status-pill-review">{riskLevel}</span></div><div className="risk-value-line"><p className="stat-value">{riskLevel}</p><span className="stat-icon"><Shield /></span></div><p className="stat-foot">{totalScans ? `${blocked} high concern of ${totalScans} scans` : 'No scan activity yet'}</p></article>
    </section>

    <section className="mobile-features" aria-label="Quick security tools">
      {[[PhoneIcon, 'Call Scanner', 'analyze', 'screenshot'], [MessageSquareText, 'SMS & Link Checker', 'analyze', 'message'], [Globe2, 'Fake Website Detector', 'analyze', 'url'], [FileWarning, 'Report a Scam', 'history', null]].map(([Icon,label,view,mode],index) => <button key={label} type="button" onClick={() => navigate(view,mode)} className={`mobile-feature ${index===3?'mobile-feature-danger':''}`}><span className="mobile-feature-icon"><Icon aria-hidden="true" /></span><span>{label}</span></button>)}
    </section>

    <section className="dashboard-bottom">
      <article className="dashboard-card threat-card">
        <div className="dashboard-section-head"><div><h2>Live Threat Feed</h2><p>Recent activity from scans and reports</p></div><button type="button" className="dashboard-more" onClick={() => setCurrentView('history')}>More <ChevronRight className="h-3.5 w-3.5" /></button></div>
        <div className="threat-table-head"><span>Source</span><span>Status</span><span className="text-right">Time</span></div>
        <div>{feed.map((item,index) => <button type="button" key={item.id} className="threat-row w-full bg-transparent px-0 text-left" style={{ animationDelay: `${index*55}ms` }} onClick={() => { if (item.raw) { setCurrentResult(item.raw); setCurrentView('results'); } else setCurrentView('history'); }}>
          <span className="threat-source"><ThreatIcon type={item.type} risk={item.risk}/><span className="min-w-0"><strong>{item.source}</strong><small>{item.detail}</small></span></span><ThreatPill risk={item.risk}/><span className="threat-time"><Clock3 className="mr-1 inline h-3 w-3"/>{item.time}</span>
        </button>)}</div>
      </article>
      <article className="dashboard-card map-card"><div className="dashboard-section-head"><div><h2>Threat Activity Map</h2><p>Illustrative activity locations</p></div><span className="status-pill status-pill-review">Global</span></div><WorldMap /></article>
    </section>
  </div>;
}

function PhoneIcon(props) { return <AudioLines {...props} />; }
