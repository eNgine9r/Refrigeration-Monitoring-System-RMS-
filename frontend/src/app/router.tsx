import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AlarmsPage } from '@/pages/Alarms';
import { DashboardPage } from '@/pages/Dashboard';
import { DeviceDetailPage } from '@/pages/DeviceDetail';
import { DevicesPage } from '@/pages/Devices';
import { LoginPage } from '@/pages/Login';
import { SettingsPage } from '@/pages/Settings';
import { useAuth } from '@/store/auth';

function Protected({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="devices/:id" element={<DeviceDetailPage />} />
        <Route path="alarms" element={<AlarmsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}
