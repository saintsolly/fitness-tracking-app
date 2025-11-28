import { create } from 'zustand';

const initialState = {
  activeSession: null,
  elapsedSeconds: 0,
  heartRate: 0,
};

const useLiveWorkoutStore = create((set) => ({
  ...initialState,
  startSession: (template) =>
    set({
      activeSession: template,
      elapsedSeconds: 0,
      heartRate: 90,
    }),
  stopSession: () => set(initialState),
  tick: () =>
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
      heartRate: 90 + Math.round(Math.random() * 30),
    })),
}));

export default useLiveWorkoutStore;

