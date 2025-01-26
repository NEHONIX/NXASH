import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { DASHBOARD_SERVICES as dashboardService } from "@/services/util/dashboard.service";

interface DashboardState {
  stats: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  };
  upcomingLessons: any[];
  recentActivities: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    completionRate: 0,
  },
  upcomingLessons: [],
  recentActivities: [],
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      //console.log("Fetching dashboard stats...");
      const stats = await dashboardService.getStats();
      //console.log("Received stats:", stats);

      //console.log("Fetching upcoming lessons...");
      const upcomingLessons = await dashboardService.getUpcomingLessons();
      //console.log("Received upcoming lessons:", upcomingLessons);

      //console.log("Fetching recent activities...");
      const recentActivities = await dashboardService.getRecentActivities();
      //console.log("Received recent activities:", recentActivities);

      const payload = {
        stats,
        upcomingLessons,
        recentActivities,
      };

      //console.log("Final payload:", payload);
      return payload;
    } catch (error: any) {
      //console.error("Error in fetchDashboardStats:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        //console.log("fetchDashboardStats.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        //console.log("fetchDashboardStats.fulfilled with payload:", action.payload);
        state.loading = false;
        state.stats = action.payload.stats;
        state.upcomingLessons = action.payload.upcomingLessons;
        state.recentActivities = action.payload.recentActivities;
        //console.log("New state after update:", state);
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        //console.log("fetchDashboardStats.rejected with error:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
