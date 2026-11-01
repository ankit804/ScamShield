import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialHistory } from '../data/initialHistory';
import { translations } from '../data/translations';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/apiClient';

const AppContext = createContext();

function safeHistoryItem(type, value) {
  if (type === 'message') return 'Message scan (content redacted)';
  if (type === 'screenshot') return 'Payment screenshot (image not stored)';
  try { return `URL scan: ${new URL(value).hostname}`; } catch { return 'URL scan (host unavailable)'; }
}

function sanitizeHistoryEntry(entry) {
  const type = entry.type || 'message';
  const findings = (entry.findings || []).map(finding => ({
    ...finding,
    evidence: String(finding.evidence || '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
      .replace(/(?<!\w)\+?\d[\d\s().-]{6,}\d(?!\w)/g, '[number]')
      .slice(0, 240)
  }));
  return {
    ...entry,
    submittedItem: safeHistoryItem(type, entry.submittedItem || entry.submitted_item || ''),
    findings
  };
}

function fromApiScan(scan) {
  return sanitizeHistoryEntry({
    id: scan.id,
    type: scan.type,
    typeLabel: scan.typeLabel || scan.type_label,
    submittedItem: scan.submittedItem || scan.submitted_item,
    riskCategory: scan.riskCategory || scan.risk_category,
    riskLabel: scan.riskLabel || scan.risk_label,
    status: scan.status,
    evidenceFound: scan.evidenceFound ?? scan.evidence_found ?? 0,
    totalIndicators: scan.totalIndicators ?? scan.total_indicators ?? 0,
    summary: scan.summary,
    findings: scan.findings || [],
    nextSteps: scan.nextSteps || scan.next_steps || [],
    disclaimer: scan.disclaimer,
    created_at: scan.created_at,
    dateFormatted: scan.dateFormatted || scan.created_at || ''
  });
}

const validViews = [
  'overview', 
  'analyze', 
  'results', 
  'history', 
  'guide', 
  'settings',
  'login',
  'register',
  'admin',
  'admin-users',
  'admin-scans',
  'admin-audit',
  'unauthorized'
];

const pathToViewMap = {
  '': 'overview',
  'dashboard': 'overview',
  'overview': 'overview',
  'analyze': 'analyze',
  'results': 'results',
  'history': 'history',
  'dashboard/scans': 'history',
  'guide': 'guide',
  'settings': 'settings',
  'dashboard/settings': 'settings',
  'login': 'login',
  'register': 'register',
  'admin': 'admin',
  'admin/users': 'admin-users',
  'admin/scans': 'admin-scans',
  'admin/audit-logs': 'admin-audit',
  'unauthorized': 'unauthorized'
};

const viewToPathMap = {
  'overview': '/dashboard',
  'analyze': '/analyze',
  'results': '/results',
  'history': '/dashboard/scans',
  'guide': '/guide',
  'settings': '/dashboard/settings',
  'login': '/login',
  'register': '/register',
  'admin': '/admin',
  'admin-users': '/admin/users',
  'admin-scans': '/admin/scans',
  'admin-audit': '/admin/audit-logs',
  'unauthorized': '/unauthorized'
};

export function AppProvider({ children }) {
  const { token, apiBase, isAuthenticated, loading: authLoading } = useAuth();
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (pathToViewMap[path]) {
        return pathToViewMap[path];
      }
      if (validViews.includes(path)) {
        return path;
      }
    }
    return 'overview';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [analyzeMode, setAnalyzeMode] = useState('screenshot');

  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState(() => {
    if (isAuthenticated) return [];
    try {
      const saved = localStorage.getItem('scamshield_history');
      return saved ? JSON.parse(saved).map(sanitizeHistoryEntry) : initialHistory;
    } catch {
      return initialHistory;
    }
  });
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('scamshield_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataRetention, setDataRetention] = useState('30-days');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Authenticated histories belong to the server account, never shared local storage.
  useEffect(() => {
    if (authLoading) return;
    try {
      if (isAuthenticated) {
        localStorage.removeItem('scamshield_history');
        if (!token || !apiBase) {
          setHistory([]);
          return;
        }
        let active = true;
        apiFetch(`/users/me/scans?limit=100`, { token })
          .then(async response => {
            if (!response.ok) throw new Error('Could not load account scan history.');
            return response.json();
          })
          .then(items => { if (active && Array.isArray(items)) setHistory(items.map(fromApiScan)); })
          .catch(() => { if (active) setHistory([]); });
        return () => { active = false; };
      }
      setHistory(initialHistory);
      localStorage.removeItem('scamshield_history');
    } catch {
      // ignore
    }
  }, [authLoading, isAuthenticated, token, apiBase]);

  useEffect(() => {
    if (authLoading || isAuthenticated) return;
    try {
      localStorage.setItem('scamshield_history', JSON.stringify(history.map(sanitizeHistoryEntry)));
    } catch { /* local storage can be disabled */ }
  }, [history, isAuthenticated, authLoading]);

  // Sync language
  useEffect(() => {
    try {
      localStorage.setItem('scamshield_lang', language);
    } catch {
      // ignore
    }
    if (language === 'ne') {
      document.documentElement.classList.add('lang-ne');
    } else {
      document.documentElement.classList.remove('lang-ne');
    }
  }, [language]);

  const t = translations[language] || translations.en;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const addScanResult = (result) => {
    setHistory(prev => [sanitizeHistoryEntry(result), ...prev.filter(item => item.id !== result.id)]);
    setCurrentResult(result);
    navigateTo('results');
  };

  const deleteScan = async (id) => {
    if (isAuthenticated && token && apiBase) {
      try {
        const response = await apiFetch(`/users/me/scans/${encodeURIComponent(id)}`, {
          method: 'DELETE', token
        });
        if (!response.ok) throw new Error((await response.json()).detail || 'Could not delete scan record.');
      } catch (error) {
        showToast(error.message || 'Could not connect to the backend.', 'warning');
        return;
      }
    }
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast(language === 'ne' ? 'रेकर्ड सफलतापूर्वक हटाइयो' : 'Scan record removed', 'info');
  };

  const clearHistory = async () => {
    if (isAuthenticated && token && apiBase) {
      try {
        const response = await apiFetch(`/users/me/scans`, {
          method: 'DELETE', token
        });
        if (!response.ok) throw new Error((await response.json()).detail || 'Could not clear scan history.');
      } catch (error) {
        showToast(error.message || 'Could not connect to the backend.', 'warning');
        return;
      }
    }
    setHistory([]);
    showToast(language === 'ne' ? 'सबै स्क्यान इतिहास खाली गरियो' : 'All scan history cleared', 'info');
  };

  // Sync URL popstate (Back/Forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      const targetView = pathToViewMap[path] || (validViews.includes(path) ? path : 'overview');
      setCurrentView(targetView);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.history) {
      const targetPath = viewToPathMap[view] || (view === 'overview' ? '/' : `/${view}`);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView: navigateTo,
        analyzeMode,
        setAnalyzeMode,
        currentResult,
        setCurrentResult,
        history,
        addScanResult,
        deleteScan,
        clearHistory,
        language,
        setLanguage,
        t,
        notificationsEnabled,
        setNotificationsEnabled,
        dataRetention,
        setDataRetention,
        searchQuery,
        setSearchQuery,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
