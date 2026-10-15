import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import DashboardPage from './components/dashboard/DashboardPage';
import AnalyzePage from './components/analyze/AnalyzePage';
import ResultsPage from './components/results/ResultsPage';
import HistoryPage from './components/history/HistoryPage';
import SafetyGuidePage from './components/guide/SafetyGuidePage';
import SettingsPage from './components/settings/SettingsPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import UnauthorizedPage from './components/auth/UnauthorizedPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './components/admin/AdminOverview';
import AdminUsersPage from './components/admin/AdminUsersPage';
import AdminScansPage from './components/admin/AdminScansPage';
import AdminAuditLogsPage from './components/admin/AdminAuditLogsPage';

function MainRouter() {
  const { currentView, setCurrentView } = useApp();
  const { isAuthenticated, isAdmin } = useAuth();

  // Admin Views with dedicated AdminLayout
  if (currentView.startsWith('admin')) {
    if (!isAuthenticated) {
      return (
        <Layout>
          <LoginPage />
        </Layout>
      );
    }

    if (!isAdmin) {
      return (
        <Layout>
          <UnauthorizedPage />
        </Layout>
      );
    }

    const adminSubTab = currentView === 'admin' ? 'admin-overview' : currentView;

    return (
      <AdminLayout activeTab={adminSubTab} onSelectTab={(tab) => setCurrentView(tab)}>
        {adminSubTab === 'admin-overview' && (
          <AdminOverview onNavigate={(tab) => setCurrentView(tab)} />
        )}
        {adminSubTab === 'admin-users' && <AdminUsersPage />}
        {adminSubTab === 'admin-scans' && <AdminScansPage />}
        {adminSubTab === 'admin-audit' && <AdminAuditLogsPage />}
      </AdminLayout>
    );
  }

  // Standalone Auth Views
  if (currentView === 'login') {
    return (
      <Layout>
        <LoginPage onSwitchToRegister={() => setCurrentView('register')} />
      </Layout>
    );
  }

  if (currentView === 'register') {
    return (
      <Layout>
        <RegisterPage onSwitchToLogin={() => setCurrentView('login')} />
      </Layout>
    );
  }

  if (currentView === 'unauthorized') {
    return (
      <Layout>
        <UnauthorizedPage />
      </Layout>
    );
  }

  // Regular Merchant Views wrapped in Standard Layout
  return (
    <Layout>
      {currentView === 'overview' && <DashboardPage />}
      {currentView === 'analyze' && <AnalyzePage />}
      {currentView === 'results' && <ResultsPage />}
      {currentView === 'history' && <HistoryPage />}
      {currentView === 'guide' && <SafetyGuidePage />}
      {currentView === 'settings' && <SettingsPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainRouter />
      </AppProvider>
    </AuthProvider>
  );
}
