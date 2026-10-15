import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialHistory } from '../data/initialHistory';
import { translations } from '../data/translations';

const AppContext = createContext();

const validViews = ['overview', 'analyze', 'results', 'history', 'guide', 'settings'];

export function AppProvider({ children }) {
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (validViews.includes(path)) {
        return path;
      }
    }
    return 'overview';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [currentResult, setCurrentResult] = useState(initialHistory[0]);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('scamshield_history');
      return saved ? JSON.parse(saved) : initialHistory;
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

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scamshield_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

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
    setHistory(prev => [result, ...prev]);
    setCurrentResult(result);
    setCurrentView('results');
  };

  const deleteScan = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast(language === 'ne' ? 'रेकर्ड सफलतापूर्वक हटाइयो' : 'Scan record removed', 'info');
  };

  const clearHistory = () => {
    setHistory([]);
    showToast(language === 'ne' ? 'सबै स्क्यान इतिहास खाली गरियो' : 'All scan history cleared', 'info');
  };

  // Sync URL popstate (Back/Forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      const targetView = validViews.includes(path) ? path : 'overview';
      setCurrentView(targetView);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.history) {
      const targetPath = view === 'overview' ? '/' : `/${view}`;
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
