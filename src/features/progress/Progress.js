import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { createWeightEntry, fetchAchievements, fetchWeightHistory } from '../../services/mockApi';
import Card from '../../components/ui/Card';

export default function Progress() {
  const { data: weightTrend = [] } = useQuery({
    queryKey: ['weightHistory'],
    queryFn: fetchWeightHistory,
  });
  const { data: badges = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: fetchAchievements,
  });
  const queryClient = useQueryClient();
  const [weightForm, setWeightForm] = useState({ weight: '', recorded_on: new Date().toISOString().slice(0, 10) });

  const weightMutation = useMutation({
    mutationFn: (payload) => createWeightEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
      setWeightForm((prev) => ({ ...prev, weight: '' }));
    },
  });

  const handleWeightSubmit = (event) => {
    event.preventDefault();
    if (!weightForm.weight) return;
    weightMutation.mutate({
      weight: Number(weightForm.weight),
      recorded_on: weightForm.recorded_on,
    });
  };

  return (
    <div className="view">
      <h2>Progress & achievements</h2>
      <Card>
        <header className="list-header">
          <h3>Weight trend</h3>
        </header>
        <form className="inline-form" onSubmit={handleWeightSubmit}>
          <div className="macro-inputs">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={weightForm.recorded_on}
                onChange={(event) => setWeightForm((prev) => ({ ...prev, recorded_on: event.target.value }))}
              />
            </label>
            <label>
              <span>Weight</span>
              <input
                type="number"
                min="1"
                step="0.1"
                value={weightForm.weight}
                onChange={(event) => setWeightForm((prev) => ({ ...prev, weight: event.target.value }))}
                required
              />
            </label>
          </div>
          <button type="submit" className="btn primary" disabled={weightMutation.isPending}>
            {weightMutation.isPending ? 'Saving…' : 'Add entry'}
          </button>
        </form>
        <div className="chart-panel">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} width={50} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <header className="list-header">
          <h3>Achievements</h3>
        </header>
        <div className="achievement-grid">
          {badges.map((badge) => (
            <article key={badge.id} className={`achievement ${badge.status}`}>
              <strong>{badge.label}</strong>
              <span>{badge.status === 'earned' ? 'Unlocked' : 'Locked'}</span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

