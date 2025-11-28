import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeLiveWorkout, createWorkoutSession, fetchWorkouts } from '../../services/mockApi';
import Card from '../../components/ui/Card';
import useLiveWorkoutStore from '../../hooks/useLiveWorkoutStore';

export default function Workouts() {
  const { data: workoutHistory = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
  });
  const queryClient = useQueryClient();
  const activeSession = useLiveWorkoutStore((state) => state.activeSession);
  const elapsedSeconds = useLiveWorkoutStore((state) => state.elapsedSeconds);
  const heartRate = useLiveWorkoutStore((state) => state.heartRate);
  const startSession = useLiveWorkoutStore((state) => state.startSession);
  const stopSession = useLiveWorkoutStore((state) => state.stopSession);
  const tick = useLiveWorkoutStore((state) => state.tick);
  const [manualWorkout, setManualWorkout] = useState({
    name: '',
    type: 'Cardio',
    intensity: 'Medium',
    duration: 30,
    calories: 300,
  });

  const manualWorkoutMutation = useMutation({
    mutationFn: (payload) => createWorkoutSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setManualWorkout({
        name: '',
        type: 'Cardio',
        intensity: 'Medium',
        duration: 30,
        calories: 300,
      });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: (payload) => completeLiveWorkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['activitySessions'] });
      queryClient.invalidateQueries({ queryKey: ['weeklySteps'] });
    },
  });

  useEffect(() => {
    if (!activeSession) return undefined;
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, tick]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleStopSession = () => {
    if (activeSession) {
      completeSessionMutation.mutate({
        template: activeSession,
        elapsedSeconds,
        heartRate,
      });
    }
    stopSession();
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    if (!manualWorkout.name) return;
    manualWorkoutMutation.mutate({
      ...manualWorkout,
      duration: Number(manualWorkout.duration),
      calories: Number(manualWorkout.calories),
    });
  };

  return (
    <div className="view">
      <h2>Workouts</h2>
      <div className="grid two-column">
        <Card>
          <header className="list-header">
            <h3>Live session</h3>
            {activeSession ? (
              <div className="quick-actions">
                <button type="button" className="btn danger" onClick={handleStopSession} disabled={completeSessionMutation.isPending}>
                  {completeSessionMutation.isPending ? 'Saving…' : 'Stop'}
                </button>
              </div>
            ) : null}
          </header>
          {activeSession ? (
            <div className="live-session">
              <h4>{activeSession.name}</h4>
              <p>{activeSession.type}</p>
              <div className="live-session__metrics">
                <div>
                  <p>Elapsed</p>
                  <strong>{formatDuration(elapsedSeconds)}</strong>
                </div>
                <div>
                  <p>Heart rate</p>
                  <strong>{heartRate} bpm</strong>
                </div>
                <div>
                  <p>Intensity</p>
                  <strong>{activeSession.intensity}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="live-session__empty">
              <p>Select a workout template to begin tracking.</p>
            </div>
          )}
        </Card>
        <Card>
          <header className="list-header">
            <h3>Templates</h3>
          </header>
          <div className="quick-actions">
            {workoutHistory.map((workout) => (
              <button
                key={workout.id}
                type='button'
                className='btn secondary'
                onClick={() => startSession(workout)}
              >
                {workout.name}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <header className="list-header">
          <h3>Log workout</h3>
        </header>
        <form className="inline-form" onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Workout name"
            value={manualWorkout.name}
            onChange={(event) => setManualWorkout((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <div className="macro-inputs">
            <label>
              <span>Type</span>
              <select
                value={manualWorkout.type}
                onChange={(event) => setManualWorkout((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="Cardio">Cardio</option>
                <option value="Strength">Strength</option>
                <option value="Mobility">Mobility</option>
                <option value="Recovery">Recovery</option>
              </select>
            </label>
            <label>
              <span>Intensity</span>
              <select
                value={manualWorkout.intensity}
                onChange={(event) => setManualWorkout((prev) => ({ ...prev, intensity: event.target.value }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label>
              <span>Duration (min)</span>
              <input
                type="number"
                min="1"
                value={manualWorkout.duration}
                onChange={(event) => setManualWorkout((prev) => ({ ...prev, duration: event.target.value }))}
              />
            </label>
            <label>
              <span>Calories</span>
              <input
                type="number"
                min="0"
                value={manualWorkout.calories}
                onChange={(event) => setManualWorkout((prev) => ({ ...prev, calories: event.target.value }))}
              />
            </label>
          </div>
          <button type="submit" className="btn primary" disabled={manualWorkoutMutation.isPending}>
            {manualWorkoutMutation.isPending ? 'Logging…' : 'Save workout'}
          </button>
        </form>
      </Card>

      <Card>
        <header className="list-header">
          <h3>Recent sessions</h3>
        </header>
        <ul className="session-list">
          {workoutHistory.map((workout) => (
            <li key={workout.id}>
              <div>
                <p>{workout.name}</p>
                <small>{workout.type}</small>
              </div>
              <div className="session-meta">
                <strong>{workout.duration} min</strong>
                <span>{workout.calories} kcal</span>
                <span>{workout.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

