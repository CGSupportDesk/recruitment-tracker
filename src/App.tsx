import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { AppShell } from './components/AppShell';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { fetchProfile, getSession } from './lib/recruitmentApi';
import { useRecruitmentData } from './lib/useRecruitmentData';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ReportsPage } from './pages/ReportsPage';
import { RolesPage } from './pages/RolesPage';
import { SettingsPage } from './pages/SettingsPage';
import { SetupRequired } from './pages/SetupRequired';
import type { Profile } from './types/recruitment';

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
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [booting, setBooting] = useState(isSupabaseConfigured);
  const data = useRecruitmentData(Boolean(session));

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    getSession()
      .then((currentSession) => {
        setSession(currentSession);
        if (currentSession?.user.id) {
          return fetchProfile(currentSession.user.id).then(setProfile);
        }
        return undefined;
      })
      .finally(() => setBooting(false));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.id) {
        void fetchProfile(nextSession.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (booting) return <LoadingScreen />;
  if (!session) return <LoginPage />;

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
        <Route path="/settings" element={<SettingsPage email={session.user.email} profile={profile} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
