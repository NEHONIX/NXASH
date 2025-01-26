import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import dashboardReducer from './slices/dashboardSlice';
import studentsReducer from './slices/studentsSlice';
import scheduleReducer from './slices/scheduleSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    courses: courseReducer,
    dashboard: dashboardReducer,
    students: studentsReducer,
    schedule: scheduleReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
