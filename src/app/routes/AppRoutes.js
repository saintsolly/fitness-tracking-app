import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Dashboard from '../../features/dashboard/Dashboard';
import Workouts from '../../features/workouts/Workouts';
import Activity from '../../features/activity/Activity';
import Nutrition from '../../features/nutrition/Nutrition';
import Progress from '../../features/progress/Progress';
import Goals from '../../features/goals/Goals';
import Notifications from '../../features/notifications/Notifications';
import Settings from '../../features/settings/Settings';
import Login from '../../features/auth/Login';
import Register from '../../features/auth/Register';
import Onboarding from '../../features/auth/Onboarding';

function AuthGuard() {
  const { isAuthenticated, onboardingComplete, loading } = useAuth();

  if (loading) {
    return <p>Loading your profile…</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

