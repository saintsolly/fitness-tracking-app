import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGoal, deleteGoal, fetchGoals, updateGoalProgress } from '../../services/mockApi';
import Card from '../../components/ui/Card';

export default function Goals() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });
  const [goalForm, setGoalForm] = useState({
    title: '',
    kind: 'steps',
    target: 10000,
    unit: 'steps',
  });

  const { mutate } = useMutation({
    mutationFn: ({ id, progress }) => updateGoalProgress(id, progress),
    onSuccess: (next) => {
      queryClient.setQueryData(['goals'], next);
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (payload) => createGoal(payload),
    onSuccess: (next) => {
      queryClient.setQueryData(['goals'], next);
      setGoalForm({
        title: '',
        kind: 'steps',
        target: 10000,
        unit: 'steps',
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => deleteGoal(id),
    onSuccess: (next) => {
      queryClient.setQueryData(['goals'], next);
    },
  });

  const handleGoalSubmit = (event) => {
    event.preventDefault();
    if (!goalForm.title) return;
    createGoalMutation.mutate({
      title: goalForm.title,
      kind: goalForm.kind,
      target: Number(goalForm.target),
      unit: goalForm.unit,
    });
  };

  return (
    <div className="view">
      <h2>Goals</h2>
      <Card>
        <header className="list-header">
          <h3>Active goals</h3>
        </header>
        <form className="inline-form" onSubmit={handleGoalSubmit}>
          <input
            type="text"
            placeholder="Goal title"
            value={goalForm.title}
            onChange={(event) => setGoalForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <div className="macro-inputs">
            <label>
              <span>Type</span>
              <select
                value={goalForm.kind}
                onChange={(event) => {
                  const kind = event.target.value;
                  setGoalForm((prev) => ({
                    ...prev,
                    kind,
                    unit: kind === 'weight' ? 'lbs' : kind === 'hydration' ? 'oz' : kind === 'calories' ? 'kcal' : kind === 'workouts' ? 'sessions' : 'steps',
                  }));
                }}
              >
                <option value="steps">Steps</option>
                <option value="workouts">Workouts</option>
                <option value="weight">Weight</option>
                <option value="hydration">Hydration</option>
                <option value="calories">Calories</option>
              </select>
            </label>
            <label>
              <span>Target</span>
              <input
                type="number"
                min="1"
                value={goalForm.target}
                onChange={(event) => setGoalForm((prev) => ({ ...prev, target: event.target.value }))}
              />
            </label>
            <label>
              <span>Unit</span>
              <input
                type="text"
                value={goalForm.unit}
                onChange={(event) => setGoalForm((prev) => ({ ...prev, unit: event.target.value }))}
              />
            </label>
          </div>
          <button type="submit" className="btn primary" disabled={createGoalMutation.isPending}>
            {createGoalMutation.isPending ? 'Creating…' : 'Create goal'}
          </button>
        </form>
        <ul className="goal-list detailed">
          {items.map((goal) => (
            <li key={goal.id}>
              <div>
                <p>{goal.title}</p>
                <small>Target {goal.target} {goal.unit}</small>
              </div>
              <div className="goal-progress interactive">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(goal.progress * 100)}
                  onChange={(event) => mutate({ id: goal.id, progress: Number(event.target.value) / 100 })}
                />
                <span>{Math.round(goal.progress * 100)}%</span>
              </div>
              <button
                type="button"
                className="btn ghost"
                onClick={() => deleteGoalMutation.mutate(goal.id)}
                disabled={deleteGoalMutation.isPending}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

