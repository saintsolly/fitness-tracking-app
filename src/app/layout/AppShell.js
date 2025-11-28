import { NavLink, useLocation } from 'react-router-dom';
import {
  FiActivity,
  FiBell,
  FiCompass,
  FiHome,
  FiMap,
  FiSettings,
  FiTarget,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/activity', label: 'Activity', icon: FiMap },
  { path: '/workouts', label: 'Workouts', icon: FiActivity },
  { path: '/nutrition', label: 'Nutrition', icon: FiCompass },
  { path: '/goals', label: 'Goals', icon: FiTarget },
  { path: '/notifications', label: 'Alerts', icon: FiBell },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

const greetingByHour = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function AppShell({ children }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const authView = ['/login', '/register', '/onboarding', '/forgot'].some((path) =>
    location.pathname.startsWith(path)
  );

  if (authView) {
    return (
      <div className={`auth-shell theme-${theme}`}>
        <main className="auth-shell__main">{children}</main>
      </div>
    );
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="app-header">
        <div>
          <p className="app-header__greeting">{greetingByHour()}</p>
          <h1>{user?.name ?? 'Athlete'}</h1>
          <p className="app-header__sub">
            {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
          </p>
        </div>
        <div className="app-header__actions">
          <button
            type="button"
            className="btn ghost"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☾' : '☀'}
          </button>
          {user?.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="app-header__avatar"
            />
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

