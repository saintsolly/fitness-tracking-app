export const dailySummary = {
  date: '2025-11-28',
  steps: 9435,
  calories: 1980,
  targetCalories: 2200,
  activeMinutes: 68,
  floors: 11,
  heartRate: 74,
  hydration: { consumedOz: 72, targetOz: 90 },
  energyBurned: 680,
  readinessScore: 86,
  recovery: 'Primed',
  macros: [
    { id: 'protein', label: 'Protein', value: 118, target: 130, unit: 'g' },
    { id: 'carbs', label: 'Carbs', value: 242, target: 260, unit: 'g' },
    { id: 'fats', label: 'Fats', value: 58, target: 70, unit: 'g' },
  ],
  streaks: { moveDays: 12, workouts: 7 },
  nextReminder: {
    title: 'Mobility reset',
    time: '2:00 PM',
  },
};

export const weeklySteps = [
  { day: 'Mon', steps: 10540 },
  { day: 'Tue', steps: 9620 },
  { day: 'Wed', steps: 11230 },
  { day: 'Thu', steps: 9875 },
  { day: 'Fri', steps: 12010 },
  { day: 'Sat', steps: 13450 },
  { day: 'Sun', steps: 8450 },
];

export const workouts = [
  {
    id: 'w1',
    name: 'Interval Run',
    duration: 32,
    calories: 340,
    intensity: 'High',
    type: 'Cardio',
    date: '2025-11-27',
  },
  {
    id: 'w2',
    name: 'Strength Circuit',
    duration: 48,
    calories: 420,
    intensity: 'Medium',
    type: 'Strength',
    date: '2025-11-26',
  },
  {
    id: 'w3',
    name: 'Mobility Flow',
    duration: 24,
    calories: 180,
    intensity: 'Low',
    type: 'Recovery',
    date: '2025-11-25',
  },
];

export const activitySessions = [
  {
    id: 'a1',
    title: 'Neighborhood 5K',
    distance: 5.1,
    duration: 29,
    pace: '5:45/km',
    routeQuality: 'Stable',
  },
  {
    id: 'a2',
    title: 'Lunch Walk',
    distance: 2.4,
    duration: 24,
    pace: '10:00/km',
    routeQuality: 'Easy',
  },
  {
    id: 'a3',
    title: 'Evening Ride',
    distance: 14.3,
    duration: 38,
    pace: '2:39/km',
    routeQuality: 'Fast',
  },
];

export const nutritionLogs = [
  {
    id: 'meal-1',
    label: 'Breakfast smoothie',
    calories: 420,
    protein: 32,
    carbs: 46,
    fats: 12,
  },
  {
    id: 'meal-2',
    label: 'Power bowl',
    calories: 610,
    protein: 42,
    carbs: 68,
    fats: 18,
  },
  {
    id: 'meal-3',
    label: 'Recovery dinner',
    calories: 780,
    protein: 36,
    carbs: 84,
    fats: 22,
  },
];

export const hydrationLog = [
  { id: 'hyd-1', label: 'Morning water', amount: 16 },
  { id: 'hyd-2', label: 'Green tea', amount: 12 },
  { id: 'hyd-3', label: 'Gym bottle', amount: 24 },
  { id: 'hyd-4', label: 'Electrolytes', amount: 20 },
];

export const weightHistory = [
  { day: 'Mon', weight: 162.4 },
  { day: 'Tue', weight: 161.8 },
  { day: 'Wed', weight: 161.5 },
  { day: 'Thu', weight: 161.1 },
  { day: 'Fri', weight: 160.7 },
  { day: 'Sat', weight: 160.2 },
  { day: 'Sun', weight: 159.9 },
];

export const goals = [
  {
    id: 'goal-steps',
    title: '12k steps daily',
    progress: 0.78,
    target: 12000,
    unit: 'steps',
  },
  {
    id: 'goal-hydration',
    title: '90oz hydration',
    progress: 0.8,
    target: 90,
    unit: 'oz',
  },
  {
    id: 'goal-strength',
    title: '4 strength sessions',
    progress: 0.5,
    target: 4,
    unit: 'sessions',
  },
];

export const notifications = [
  {
    id: 'n1',
    title: 'Workout streak unlocked',
    message: 'You completed 7 strength sessions in a row.',
    status: 'new',
    timestamp: '09:12 AM',
  },
  {
    id: 'n2',
    title: 'Hydration reminder',
    message: 'Add 10 oz to stay on track for today.',
    status: 'new',
    timestamp: '11:30 AM',
  },
  {
    id: 'n3',
    title: 'Goal trending',
    message: 'Weight goal projected to finish 2 weeks early.',
    status: 'read',
    timestamp: 'Yesterday',
  },
];

export const achievements = [
  { id: 'achv-1', label: 'Consistency Champ', status: 'earned' },
  { id: 'achv-2', label: 'Hydration Hero', status: 'earned' },
  { id: 'achv-3', label: 'Route Explorer', status: 'locked' },
  { id: 'achv-4', label: 'Calorie Ninja', status: 'earned' },
];

export const reminderTemplates = [
  { id: 'rem-1', title: 'Stand reset', schedule: 'Every hour' },
  { id: 'rem-2', title: 'Breathing break', schedule: 'Daily 3:00 PM' },
  { id: 'rem-3', title: 'Meal prep', schedule: 'Sun 5:00 PM' },
];

