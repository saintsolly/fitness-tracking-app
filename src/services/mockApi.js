import { supabase } from './supabaseClient';

const MACRO_TARGETS = {
  protein: 130,
  carbs: 260,
  fats: 70,
};
const CALORIE_TARGET = 2200;

const getUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated with Supabase');
  }
  return user.id;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

export const fetchDailySummary = async () => {
  const userId = await getUserId();
  const today = new Date();
  const [{ data: summaryRows }, { data: workouts }, { data: meals }, { data: hydration }, { data: hydrationGoal }] =
    await Promise.all([
      supabase
        .from('daily_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('summary_date', today.toISOString().slice(0, 10)),
      supabase
        .from('workout_sessions')
        .select('duration_minutes, calories, started_at')
        .eq('user_id', userId)
        .gte('started_at', startOfDay(today))
        .lte('started_at', endOfDay(today)),
      supabase
        .from('meal_logs')
        .select('calories, protein, carbs, fats, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', startOfDay(today))
        .lte('logged_at', endOfDay(today)),
      supabase
        .from('hydration_logs')
        .select('amount_oz, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', startOfDay(today))
        .lte('logged_at', endOfDay(today)),
      supabase
        .from('goals')
        .select('target, unit')
        .eq('user_id', userId)
        .eq('kind', 'hydration')
        .limit(1)
        .maybeSingle(),
    ]);

  const summary = summaryRows?.[0];
  const totalCaloriesBurned = workouts?.reduce((total, entry) => total + (entry.calories ?? 0), 0) ?? 0;
  const totalActiveMinutes = workouts?.reduce((total, entry) => total + (entry.duration_minutes ?? 0), 0) ?? 0;

  const macroTotals = ['protein', 'carbs', 'fats'].map((key) => ({
    id: key,
    label: key[0].toUpperCase() + key.slice(1),
    value: meals?.reduce((total, meal) => total + (meal[key] ?? 0), 0) ?? 0,
    target: MACRO_TARGETS[key],
    unit: key === 'protein' ? 'g' : 'g',
  }));

  const hydrationConsumed = hydration?.reduce((total, entry) => total + (entry.amount_oz ?? 0), 0) ?? 0;
  const hydrationTarget = hydrationGoal?.target ?? 90;

  const totalCalories = meals?.reduce((total, meal) => total + (meal.calories ?? 0), 0) ?? 0;

  return {
    date: today.toISOString().slice(0, 10),
    steps: summary?.steps ?? 0,
    calories: totalCalories,
    targetCalories: CALORIE_TARGET,
    activeMinutes: totalActiveMinutes,
    energyBurned: totalCaloriesBurned,
    hydration: {
      consumedOz: hydrationConsumed,
      targetOz: hydrationTarget,
    },
    macros: macroTotals,
  };
};

export const fetchWeeklySteps = async () => {
  const userId = await getUserId();
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 6);

  const { data } = await supabase
    .from('activity_sessions')
    .select('distance_km, recorded_at')
    .eq('user_id', userId)
    .gte('recorded_at', start.toISOString())
    .lte('recorded_at', today.toISOString())
    .order('recorded_at');

  const stepsPerDay = {};
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    stepsPerDay[day.toDateString()] = { day: day.toLocaleDateString('en-US', { weekday: 'short' }), steps: 0 };
  }

  (data ?? []).forEach((session) => {
    const recorded = new Date(session.recorded_at);
    const key = recorded.toDateString();
    const steps = Math.round((session.distance_km ?? 0) * 1312);
    if (!stepsPerDay[key]) {
      stepsPerDay[key] = {
        day: recorded.toLocaleDateString('en-US', { weekday: 'short' }),
        steps: 0,
      };
    }
    stepsPerDay[key].steps += steps;
  });

  return Object.values(stepsPerDay);
};

export const fetchWorkouts = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, name, type, intensity, duration_minutes, calories, started_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(12);
  if (error) throw error;
  return data.map((workout) => ({
    id: workout.id,
    name: workout.name,
    type: workout.type,
    intensity: workout.intensity,
    duration: workout.duration_minutes,
    calories: workout.calories,
    date: workout.started_at?.slice(0, 10),
  }));
};

export const fetchActivitySessions = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('activity_sessions')
    .select('id, title, distance_km, duration_minutes, pace, route_quality')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data.map((session) => ({
    id: session.id,
    title: session.title,
    distance: session.distance_km,
    duration: session.duration_minutes,
    pace: session.pace,
    routeQuality: session.route_quality,
  }));
};

export const fetchNutritionLogs = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('meal_logs')
    .select('id, label, calories, protein, carbs, fats, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
};

export const fetchHydrationLog = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('hydration_logs')
    .select('id, label, amount_oz, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(15);
  if (error) throw error;
  return data.map((entry) => ({
    id: entry.id,
    label: entry.label ?? 'Hydration',
    amount: entry.amount_oz,
    loggedAt: entry.logged_at,
  }));
};

export const addHydrationEntry = async (amount, label = 'Quick add') => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('hydration_logs')
    .insert({ user_id: userId, amount_oz: amount, label });
  if (error) throw error;
};

export const createHydrationEntry = async ({ amount, label }) =>
  addHydrationEntry(amount, label);

export const createMealLog = async ({ label, calories, protein, carbs, fats }) => {
  const userId = await getUserId();
  const { error } = await supabase.from('meal_logs').insert({
    user_id: userId,
    label,
    calories,
    protein,
    carbs,
    fats,
  });
  if (error) throw error;
};

export const createWorkoutSession = async (payload) => {
  const userId = await getUserId();
  const { error } = await supabase.from('workout_sessions').insert({
    user_id: userId,
    name: payload.name,
    type: payload.type,
    intensity: payload.intensity,
    duration_minutes: payload.duration,
    calories: payload.calories,
    started_at: payload.started_at ?? new Date().toISOString(),
  });
  if (error) throw error;
};

export const createActivitySession = async (payload) => {
  const userId = await getUserId();
  const { error } = await supabase.from('activity_sessions').insert({
    user_id: userId,
    title: payload.title,
    distance_km: payload.distance_km,
    duration_minutes: payload.duration_minutes,
    pace: payload.pace,
    route_quality: payload.route_quality,
    recorded_at: payload.recorded_at ?? new Date().toISOString(),
  });
  if (error) throw error;
};

export const createWeightEntry = async ({ weight, recorded_on }) => {
  const userId = await getUserId();
  const { error } = await supabase.from('weight_entries').insert({
    user_id: userId,
    weight,
    recorded_on: recorded_on ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
};

export const createGoal = async ({ title, kind, target, unit }) => {
  const userId = await getUserId();
  const { error } = await supabase.from('goals').insert({
    user_id: userId,
    title,
    kind,
    target,
    unit,
    progress: 0,
  });
  if (error) throw error;
  const { data } = await supabase
    .from('goals')
    .select('id, title, target, unit, progress')
    .eq('user_id', userId);
  return data;
};

export const deleteGoal = async (goalId) => {
  const userId = await getUserId();
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;
  const { data } = await supabase
    .from('goals')
    .select('id, title, target, unit, progress')
    .eq('user_id', userId);
  return data;
};

export const createReminder = async ({ title, schedule }) => {
  const userId = await getUserId();
  const { error } = await supabase.from('reminders').insert({
    user_id: userId,
    title,
    schedule,
  });
  if (error) throw error;
};

export const createNotification = async ({ title, message }) => {
  const userId = await getUserId();
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    status: 'new',
  });
  if (error) throw error;
};

export const completeLiveWorkout = async ({ template, elapsedSeconds, heartRate }) => {
  if (!template) return;
  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
  const payload = {
    name: template.name,
    type: template.type,
    intensity: template.intensity,
    duration: durationMinutes,
    calories: template.calories ?? Math.round(durationMinutes * 7),
  };
  await createWorkoutSession(payload);
  await createActivitySession({
    title: template.name,
    distance_km: template.type === 'Cardio' ? durationMinutes * 0.15 : null,
    duration_minutes: durationMinutes,
    pace: template.type === 'Cardio' ? '5:30/km' : undefined,
    route_quality: 'Simulated',
  });
  return heartRate;
};

export const fetchWeightHistory = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('weight_entries')
    .select('recorded_on, weight')
    .eq('user_id', userId)
    .order('recorded_on', { ascending: true })
    .limit(14);
  if (error) throw error;
  return data.map((entry) => ({
    day: entry.recorded_on,
    weight: entry.weight,
  }));
};

export const fetchGoals = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('goals')
    .select('id, title, target, unit, progress')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchNotifications = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data.map((notification) => ({
    ...notification,
    timestamp: new Date(notification.created_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  }));
};

export const fetchAchievements = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('achievements')
    .select('id, label, status')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchReminders = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('reminders')
    .select('id, title, schedule')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const updateGoalProgress = async (goalId, progress) => {
  const userId = await getUserId();
  const { error } = await supabase.from('goals').update({ progress }).eq('id', goalId);
  if (error) throw error;
  const { data, error: fetchError } = await supabase
    .from('goals')
    .select('id, title, target, unit, progress')
    .eq('user_id', userId);
  if (fetchError) throw fetchError;
  return data;
};

