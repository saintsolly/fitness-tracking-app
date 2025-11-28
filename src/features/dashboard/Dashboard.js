import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  fetchDailySummary,
  fetchGoals,
  fetchNotifications,
  fetchWeeklySteps,
  addHydrationEntry,
} from '../../services/mockApi';
import Card from '../../components/ui/Card';
import MetricTile from '../../components/ui/MetricTile';
import ProgressRing from '../../components/ui/ProgressRing';
import Sparkline from '../../components/ui/Sparkline';

const quickActions = [
  { id: 'qa-log-workout', label: 'Log workout', route: '/workouts' },
  { id: 'qa-log-meal', label: 'Log meal', route: '/nutrition' },
  { id: 'qa-start-session', label: 'Start live session', route: '/workouts?live=1' },
  { id: 'qa-add-water', label: 'Add 12 oz water', type: 'hydration', amount: 12 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: summary } = useQuery({ queryKey: ['summary'], queryFn: fetchDailySummary });
  const { data: steps } = useQuery({ queryKey: ['weeklySteps'], queryFn: fetchWeeklySteps });
  const { data: goals } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });
  const { data: alerts } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });
  const quickHydrationMutation = useMutation({
    mutationFn: (amount) => addHydrationEntry(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const hydrationProgress = useMemo(() => {
    if (!summary) return 0;
    return summary.hydration.consumedOz / summary.hydration.targetOz;
  }, [summary]);

  const handleQuickAction = (action) => {
    if (action.route) {
      navigate(action.route);
      return;
    }
    if (action.type === 'hydration') {
      quickHydrationMutation.mutate(action.amount ?? 8);
    }
  };

  if (!summary || !steps || !goals || !alerts) {
    return <p>Syncing your metrics…</p>;
  }

  return (
    <div className="view dashboard-view">
      <div className="grid hero-grid">
        <MetricTile
          label="Steps"
          value={summary.steps.toLocaleString()}
          trendLabel="Daily target 12k"
          accent="primary"
        />
        <MetricTile
          label="Calories burned"
          value={summary.energyBurned}
          unit="kcal"
          delta={6}
          accent="secondary"
        />
        <MetricTile label="Active minutes" value={summary.activeMinutes} unit="min" accent="tertiary" />
        <MetricTile label="Hydration" value={summary.hydration.consumedOz} unit="oz" accent="quaternary" />
      </div>

      <div className="grid two-column">
        <Card>
          <header className="list-header">
            <h3>Quick actions</h3>
          </header>
          <div className="quick-actions">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="btn secondary"
                onClick={() => handleQuickAction(action)}
                disabled={action.type === 'hydration' && quickHydrationMutation.isPending}
              >
                {action.label}
              </button>
            ))}
          </div>
        </Card>
        <Card className="hydration-card">
          <header className="list-header">
            <h3>Hydration</h3>
            <span>
              {summary.hydration.consumedOz}/{summary.hydration.targetOz} oz
            </span>
          </header>
          <ProgressRing progress={hydrationProgress} label="Goal completion" />
        </Card>
      </div>

      <Sparkline title="Weekly steps" data={steps.map((day) => ({ ...day, value: day.steps }))} dataKey="steps" />

      <div className="grid two-column">
        <Card>
          <header className="list-header">
            <h3>Macros</h3>
            <span>{summary.calories}/{summary.targetCalories} kcal</span>
          </header>
          <ul className="macro-list">
            {summary.macros.map((macro) => (
              <li key={macro.id}>
                <div>
                  <p>{macro.label}</p>
                  <small>{macro.target} {macro.unit} target</small>
                </div>
                <strong>
                  {macro.value} {macro.unit}
                </strong>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <header className="list-header">
            <h3>Goals in focus</h3>
          </header>
          <ul className="goal-list">
            {goals.map((goal) => (
              <li key={goal.id}>
                <div>
                  <p>{goal.title}</p>
                  <small>{goal.target} {goal.unit}</small>
                </div>
                <div className="goal-progress">
                  <span style={{ width: `${goal.progress * 100}%` }} />
                  <small>{Math.round(goal.progress * 100)}%</small>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <header className="list-header">
          <h3>Latest alerts</h3>
          <span>{alerts.filter((a) => a.status === 'new').length} new</span>
        </header>
        <ul className="notification-list">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <div>
                <p>{alert.title}</p>
                <small>{alert.message}</small>
              </div>
              <time>{alert.timestamp}</time>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

