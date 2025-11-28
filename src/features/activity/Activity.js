import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createActivitySession, fetchActivitySessions, fetchWeeklySteps } from '../../services/mockApi';
import Card from '../../components/ui/Card';
import Sparkline from '../../components/ui/Sparkline';

export default function Activity() {
  const { data: sessions = [] } = useQuery({
    queryKey: ['activitySessions'],
    queryFn: fetchActivitySessions,
  });
  const { data: steps = [] } = useQuery({
    queryKey: ['weeklySteps'],
    queryFn: fetchWeeklySteps,
  });
  const queryClient = useQueryClient();
  const [activityForm, setActivityForm] = useState({
    title: '',
    distance_km: '',
    duration_minutes: '',
    pace: '',
    route_quality: 'Stable',
  });

  const activityMutation = useMutation({
    mutationFn: (payload) => createActivitySession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitySessions'] });
      queryClient.invalidateQueries({ queryKey: ['weeklySteps'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setActivityForm({
        title: '',
        distance_km: '',
        duration_minutes: '',
        pace: '',
        route_quality: 'Stable',
      });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!activityForm.title) return;
    activityMutation.mutate({
      ...activityForm,
      distance_km: Number(activityForm.distance_km || 0),
      duration_minutes: Number(activityForm.duration_minutes || 0),
    });
  };

  return (
    <div className="view">
      <h2>Activity tracking</h2>
      <Sparkline title="Steps this week" data={steps.map((s) => ({ ...s, value: s.steps }))} dataKey="steps" />
      <Card>
        <header className="list-header">
          <h3>Recent GPS sessions</h3>
        </header>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Session title"
            value={activityForm.title}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <div className="macro-inputs">
            <label>
              <span>Distance (km)</span>
              <input
                type="number"
                min="0"
                value={activityForm.distance_km}
                onChange={(event) => setActivityForm((prev) => ({ ...prev, distance_km: event.target.value }))}
              />
            </label>
            <label>
              <span>Duration (min)</span>
              <input
                type="number"
                min="0"
                value={activityForm.duration_minutes}
                onChange={(event) => setActivityForm((prev) => ({ ...prev, duration_minutes: event.target.value }))}
              />
            </label>
            <label>
              <span>Pace</span>
              <input
                type="text"
                placeholder="e.g. 5:30/km"
                value={activityForm.pace}
                onChange={(event) => setActivityForm((prev) => ({ ...prev, pace: event.target.value }))}
              />
            </label>
            <label>
              <span>Surface</span>
              <select
                value={activityForm.route_quality}
                onChange={(event) => setActivityForm((prev) => ({ ...prev, route_quality: event.target.value }))}
              >
                <option value="Stable">Stable</option>
                <option value="Hilly">Hilly</option>
                <option value="Trail">Trail</option>
                <option value="Easy">Easy</option>
              </select>
            </label>
          </div>
          <button type="submit" className="btn primary" disabled={activityMutation.isPending}>
            {activityMutation.isPending ? 'Saving…' : 'Log session'}
          </button>
        </form>
        <ul className="session-list">
          {sessions.map((session) => (
            <li key={session.id}>
              <div>
                <p>{session.title}</p>
                <small>{session.routeQuality}</small>
              </div>
              <div className="session-meta">
                <strong>{session.distance} km</strong>
                <span>{session.duration} min</span>
                <span>{session.pace}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

