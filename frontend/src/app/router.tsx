import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AlarmsPage } from '@/pages/Alarms';
import { AnalyticsPage } from '@/pages/Analytics';
import { ControllersPage } from '@/pages/Controllers';
import { DashboardPage } from '@/pages/Dashboard';
import { DeviceDetailPage } from '@/pages/DeviceDetail';
import { DevicesPage } from '@/pages/Devices';
import { LocationsPage } from '@/pages/Locations';
import { LoginPage } from '@/pages/Login';
import { SettingsPage } from '@/pages/Settings';
import { useAuth } from '@/store/auth';

function Protected({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
        <Route path="controllers" element={<ControllersPage />} />
        <Route path="alarms" element={<AlarmsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}
