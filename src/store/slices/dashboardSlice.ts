import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "../../services/api";
import { DashboardData,  } from "../../types/dashboard";

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats();
      if (!response.success) {
        return rejectWithValue(response.message || "Une erreur est survenue");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        "Erreur lors du chargement des données du tableau de bord"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
