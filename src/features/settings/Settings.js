import { useState } from 'react';
import Card from '../../components/ui/Card';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [units, setUnits] = useState(user?.units ?? 'imperial');
  const [wearableConnected, setWearableConnected] = useState(Boolean(user?.wearableConnected));
  const [status, setStatus] = useState({ message: '', type: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setStatus({ message: '', type: '' });
    try {
      await updateProfile({ units, wearable_connected: wearableConnected });
      setStatus({ message: 'Preferences saved', type: 'success' });
    } catch (error) {
      setStatus({ message: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view">
      <h2>Settings</h2>
      <Card>
        <header className="list-header">
          <h3>Preferences</h3>
        </header>
        <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>Units</span>
            <select value={units} onChange={(event) => setUnits(event.target.value)}>
              <option value="imperial">Imperial (lb, mi)</option>
              <option value="metric">Metric (kg, km)</option>
            </select>
          </label>
          <label className="toggle">
            <span>Wearable connected</span>
            <input
              type="checkbox"
              checked={wearableConnected}
              onChange={(event) => setWearableConnected(event.target.checked)}
            />
          </label>
          <label className="toggle">
            <span>Theme</span>
            <button type="button" className="btn secondary" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </button>
          </label>
          {status.message && (
            <p className={`settings-status ${status.type}`}>{status.message}</p>
          )}
          <div className="form-actions">
            <button type="button" className="btn primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save preferences'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

