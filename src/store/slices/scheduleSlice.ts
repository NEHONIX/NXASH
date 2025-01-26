import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { scheduleService } from "@/services/api";

interface ScheduledCourse {
  id: string;
  courseId: string;
  instructorId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleState {
  scheduledCourses: ScheduledCourse[];
  loading: boolean;
  error: string | null;
  currentWeek: {
    startDate: string;
    endDate: string;
  };
}

const initialState: ScheduleState = {
  scheduledCourses: [],
  loading: false,
  error: null,
  currentWeek: {
    startDate: "",
    endDate: "",
  },
};

export const fetchWeekSchedule = createAsyncThunk(
  "schedule/fetchWeekSchedule",
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await scheduleService.getWeekSchedule(startDate, endDate);
    return response;
  }
);

export const createScheduledCourse = createAsyncThunk(
  "schedule/createScheduledCourse",
  async (courseData: {
    courseId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
  }) => {
    const response = await scheduleService.createScheduledCourse(courseData);
    return response;
  }
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setCurrentWeek: (state, action) => {
      state.currentWeek = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeekSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeekSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledCourses = action.payload;
      })
      .addCase(fetchWeekSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      .addCase(createScheduledCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createScheduledCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledCourses.push(action.payload);
      })
      .addCase(createScheduledCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur lors de la création du cours";
      });
  },
});

export const { setCurrentWeek } = scheduleSlice.actions;
export default scheduleSlice.reducer;
