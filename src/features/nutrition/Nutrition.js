import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addHydrationEntry,
  createMealLog,
  createHydrationEntry,
  fetchDailySummary,
  fetchHydrationLog,
  fetchNutritionLogs,
} from '../../services/mockApi';
import Card from '../../components/ui/Card';

export default function Nutrition() {
  const { data: summary } = useQuery({ queryKey: ['summary'], queryFn: fetchDailySummary });
  const { data: meals = [] } = useQuery({ queryKey: ['meals'], queryFn: fetchNutritionLogs });
  const { data: hydration = [] } = useQuery({ queryKey: ['hydration'], queryFn: fetchHydrationLog });
  const queryClient = useQueryClient();
  const [hydrationForm, setHydrationForm] = useState({ label: 'Manual entry', amount: 12 });
  const [mealForm, setMealForm] = useState({ label: '', calories: '', protein: '', carbs: '', fats: '' });

  const hydrationMutation = useMutation({
    mutationFn: (amount) => addHydrationEntry(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const hydrationFormMutation = useMutation({
    mutationFn: (payload) => createHydrationEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setHydrationForm((prev) => ({ ...prev, amount: 12, label: 'Manual entry' }));
    },
  });

  const mealMutation = useMutation({
    mutationFn: (payload) => createMealLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setMealForm({ label: '', calories: '', protein: '', carbs: '', fats: '' });
    },
  });

  const totalHydration = useMemo(() => {
    return hydration.reduce((total, entry) => total + entry.amount, 0);
  }, [hydration]);

  const handleHydrationFormSubmit = (event) => {
    event.preventDefault();
    if (!hydrationForm.amount) return;
    hydrationFormMutation.mutate({
      amount: Number(hydrationForm.amount),
      label: hydrationForm.label,
    });
  };

  const handleMealSubmit = (event) => {
    event.preventDefault();
    if (!mealForm.label) return;
    mealMutation.mutate({
      label: mealForm.label,
      calories: Number(mealForm.calories || 0),
      protein: Number(mealForm.protein || 0),
      carbs: Number(mealForm.carbs || 0),
      fats: Number(mealForm.fats || 0),
    });
  };

  if (!summary) {
    return <p>Preparing nutrition insights…</p>;
  }

  return (
    <div className="view">
      <h2>Nutrition</h2>
      <div className="grid two-column">
        <Card>
          <header className="list-header">
            <h3>Macros</h3>
          </header>
          <ul className="macro-list">
            {summary.macros.map((macro) => (
              <li key={macro.id}>
                <div>
                  <p>{macro.label}</p>
                  <small>Target {macro.target} {macro.unit}</small>
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
            <h3>Hydration</h3>
            <span>{totalHydration} / {summary.hydration.targetOz} oz</span>
          </header>
          <div className="hydration-actions">
            {[8, 12, 16].map((amount) => (
              <button
                key={amount}
                type="button"
                className="btn secondary"
                onClick={() => hydrationMutation.mutate(amount)}
                disabled={hydrationMutation.isPending}
              >
                +{amount} oz
              </button>
            ))}
          </div>
          <ul className="stat-list">
            {hydration.map((entry) => (
              <li key={entry.id}>
                <p>{entry.label}</p>
                <strong>{entry.amount} oz</strong>
              </li>
            ))}
            {hydrationMutation.isPending && (
              <li>
                <p>Syncing…</p>
                <strong>...</strong>
              </li>
            )}
          </ul>
          <form className="inline-form" onSubmit={handleHydrationFormSubmit}>
            <input
              type="text"
              placeholder="Label"
              value={hydrationForm.label}
              onChange={(event) => setHydrationForm((prev) => ({ ...prev, label: event.target.value }))}
            />
            <input
              type="number"
              placeholder="oz"
              min="1"
              value={hydrationForm.amount}
              onChange={(event) => setHydrationForm((prev) => ({ ...prev, amount: event.target.value }))}
            />
            <button type="submit" className="btn primary" disabled={hydrationFormMutation.isPending}>
              {hydrationFormMutation.isPending ? 'Saving…' : 'Add water'}
            </button>
          </form>
        </Card>
      </div>

      <Card>
        <header className="list-header">
          <h3>Meals</h3>
        </header>
        <form className="meal-form" onSubmit={handleMealSubmit}>
          <input
            type="text"
            placeholder="Meal name"
            value={mealForm.label}
            onChange={(event) => setMealForm((prev) => ({ ...prev, label: event.target.value }))}
            required
          />
          <div className="macro-inputs">
            <label>
              <span>Calories</span>
              <input
                type="number"
                min="0"
                value={mealForm.calories}
                onChange={(event) => setMealForm((prev) => ({ ...prev, calories: event.target.value }))}
              />
            </label>
            <label>
              <span>Protein</span>
              <input
                type="number"
                min="0"
                value={mealForm.protein}
                onChange={(event) => setMealForm((prev) => ({ ...prev, protein: event.target.value }))}
              />
            </label>
            <label>
              <span>Carbs</span>
              <input
                type="number"
                min="0"
                value={mealForm.carbs}
                onChange={(event) => setMealForm((prev) => ({ ...prev, carbs: event.target.value }))}
              />
            </label>
            <label>
              <span>Fats</span>
              <input
                type="number"
                min="0"
                value={mealForm.fats}
                onChange={(event) => setMealForm((prev) => ({ ...prev, fats: event.target.value }))}
              />
            </label>
          </div>
          <button type="submit" className="btn primary" disabled={mealMutation.isPending}>
            {mealMutation.isPending ? 'Logging…' : 'Log meal'}
          </button>
        </form>
        <ul className="meal-list">
          {meals.map((meal) => (
            <li key={meal.id}>
              <div>
                <p>{meal.label}</p>
                <small>
                  {meal.protein}P / {meal.carbs}C / {meal.fats}F
                </small>
              </div>
              <strong>{meal.calories} kcal</strong>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

