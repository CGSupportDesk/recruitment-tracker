import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { checkApiHealth, getCurrentProfile, getStoredToken, type AuthProfile } from './lib/apiClient';
import { useRecruitmentData } from './lib/useRecruitmentData';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ReportsPage } from './pages/ReportsPage';
import { RolesPage } from './pages/RolesPage';
import { SettingsPage } from './pages/SettingsPage';
import { SetupRequired } from './pages/SetupRequired';

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas">
      <div className="rounded-lg bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-soft">Loading Closing Gap...</div>
    </div>
  );
}

function DataBoundary({ children, loading, error }: { children: ReactNode; loading: boolean; error: string | null }) {
  if (loading) {
    return <div className="glass-panel p-8 text-center text-sm font-semibold text-slate-500">Loading live recruitment data...</div>;
  }
  if (error) {
    return <div className="glass-panel p-8 text-center text-sm font-semibold text-brand-700">{error}</div>;
  }
  return children;
}

export default function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getStoredToken()));
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const data = useRecruitmentData(isAuthenticated);

  useEffect(() => {
    checkApiHealth()
      .then((health) => {
        setIsConfigured(health.configured);
        if (health.configured && getStoredToken()) {
          return getCurrentProfile().then(({ profile: currentProfile }) => {
            setProfile(currentProfile);
            setIsAuthenticated(true);
          });
        }
        return undefined;
      })
      .catch(() => {
        setIsAuthenticated(false);
        setProfile(null);
      })
      .finally(() => setBooting(false));
  }, []);

  if (!booting && !isConfigured) return <SetupRequired />;
  if (booting) return <LoadingScreen />;
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={(nextProfile) => {
          setProfile(nextProfile);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          index
          element={
            <DataBoundary loading={data.loading} error={data.error}>
              <DashboardPage clients={data.clients} roles={data.roles} candidates={data.candidates} />
            </DataBoundary>
          }
        />
        <Route
          path="/clients"
          element={
            <DataBoundary loading={data.loading} error={data.error}>
              <ClientsPage clients={data.clients} roles={data.roles} candidates={data.candidates} actions={data.actions} />
            </DataBoundary>
          }
        />
        <Route
          path="/roles"
          element={
            <DataBoundary loading={data.loading} error={data.error}>
              <RolesPage clients={data.clients} roles={data.roles} candidates={data.candidates} actions={data.actions} />
            </DataBoundary>
          }
        />
        <Route
          path="/reports"
          element={
            <DataBoundary loading={data.loading} error={data.error}>
              <ReportsPage clients={data.clients} roles={data.roles} candidates={data.candidates} />
            </DataBoundary>
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              email={profile?.email}
              profile={profile}
              onLogout={() => {
                setIsAuthenticated(false);
                setProfile(null);
              }}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
