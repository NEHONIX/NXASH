import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { settingsService } from "@/services/api";

interface ProfileState {
  profile: {
    name: string;
    email: string;
    phone: string;
  };
  preferences: any;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ProfileState = {
  profile: {
    name: "",
    email: "",
    phone: "",
  },
  preferences: {},
  loading: false,
  error: null,
  successMessage: null,
};

export const updateProfile = createAsyncThunk(
  "settings/updateProfile",
  async (profileData: { name?: string; email?: string; phone?: string }) => {
    const response = await settingsService.updateProfile(profileData);
    return response;
  }
);

export const changePassword = createAsyncThunk(
  "settings/changePassword",
  async (passwordData: { currentPassword: string; newPassword: string }) => {
    const response = await settingsService.changePassword(passwordData);
    return response;
  }
);

export const fetchPreferences = createAsyncThunk(
  "settings/fetchPreferences",
  async () => {
    const response = await settingsService.getPreferences();
    return response;
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.successMessage = "Profil mis à jour avec succès";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.successMessage = "Mot de passe modifié avec succès";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.error.message || "Erreur lors du changement de mot de passe";
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const { clearMessages } = settingsSlice.actions;
export default settingsSlice.reducer;
