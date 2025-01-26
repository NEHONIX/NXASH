import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import { authService } from "../../services/api";
// import { BASE_URL_API } from "../../api/baseUrl.api";
import { FirestoreTimestamp } from "../../utils/dateUtils";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "completed" | "failed";

interface User {
  id: string;
  uid: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  matricule: string;
  role: "student";
  createdAt: FirestoreTimestamp;
  approvalStatus: ApprovalStatus;
  paymentStatus: PaymentStatus;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}
export type AuthUserT = User;

interface PaymentSession {
  paymentRef: string;
  amount: number;
  studentEmail: string;
  formationLevel: string;
}

// interface AuthResponse {
//   success: boolean;
//   message: string;
//   data: {
//     token: string;
//     user: User;
//     requiresPayment?: boolean;
//     paymentSession?: PaymentSession;
//   };
// }

interface AuthState {
  user: AuthUserT | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  checkAuthCompleted: boolean;
  paymentSession: PaymentSession | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  checkAuthCompleted: false,
  paymentSession: null,
};

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const response = await authService.checkAuth();
  //console.log(response);
  return response.data;
});

export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { matricule: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur de connexion"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      name: string;
      email: string;
      phone: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur d'inscription"
      );
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la déconnexion"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.paymentSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload?.user;
        state.user = action.payload?.user || null;
        state.error = null;
        state.checkAuthCompleted = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.checkAuthCompleted = true;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.paymentSession = action.payload.data.paymentSession;
        state.error = null;
        state.checkAuthCompleted = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
        state.checkAuthCompleted = false;
        state.paymentSession = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
