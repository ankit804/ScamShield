import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import DashboardPage from './components/dashboard/DashboardPage';
import AnalyzePage from './components/analyze/AnalyzePage';
import ResultsPage from './components/results/ResultsPage';
import HistoryPage from './components/history/HistoryPage';
import SafetyGuidePage from './components/guide/SafetyGuidePage';
import SettingsPage from './components/settings/SettingsPage';

function MainRouter() {
  const { currentView } = useApp();

  switch (currentView) {
    case 'overview':
      return <DashboardPage />;
    case 'analyze':
      return <AnalyzePage />;
    case 'results':
      return <ResultsPage />;
    case 'history':
      return <HistoryPage />;
    case 'guide':
      return <SafetyGuidePage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <MainRouter />
      </Layout>
    </AppProvider>
  );
}
