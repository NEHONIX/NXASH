import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { referalServices } from "../../services/api";
import type {
  ReferalStatsResponse,
  ReferalHistoryResponse,
  ReferalRewardsResponse,
  InviteFriendsRequest,
  InviteFriendsResponse,
  ClaimRewardResponse,
} from "../../utils/referal-api";

interface ReferalState {
  stats: ReferalStatsResponse["data"] | null;
  history: ReferalHistoryResponse["data"] | null;
  rewards: ReferalRewardsResponse["data"] | null;
  loading: {
    stats: boolean;
    history: boolean;
    rewards: boolean;
    invite: boolean;
    claim: boolean;
  };
  error: {
    stats: string | null;
    history: string | null;
    rewards: string | null;
    invite: string | null;
    claim: string | null;
  };
  successMessage: string | null;
}

const initialState: ReferalState = {
  stats: null,
  history: null,
  rewards: null,
  loading: {
    stats: false,
    history: false,
    rewards: false,
    invite: false,
    claim: false,
  },
  error: {
    stats: null,
    history: null,
    rewards: null,
    invite: null,
    claim: null,
  },
  successMessage: null,
};

// Thunks
export const fetchReferalStats = createAsyncThunk(
  "referal/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await referalServices.getReferralStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la récupération des statistiques"
      );
    }
  }
);

export const fetchReferalHistory = createAsyncThunk(
  "referal/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await referalServices.getRefHistory();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la récupération de l'historique"
      );
    }
  }
);

export const fetchReferalRewards = createAsyncThunk(
  "referal/fetchRewards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await referalServices.getRefRewards();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la récupération des récompenses"
      );
    }
  }
);

export const inviteFriends = createAsyncThunk(
  "referal/invite",
  async (emails: string[], { rejectWithValue }) => {
    try {
      const response = await referalServices.inviteFriends(emails);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de l'envoi des invitations"
      );
    }
  }
);

export const claimReward = createAsyncThunk(
  "referal/claimReward",
  async (rewardId: string, { rejectWithValue }) => {
    try {
      const response = await referalServices.claimReward(rewardId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la réclamation de la récompense"
      );
    }
  }
);

const referalSlice = createSlice({
  name: "referal",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearErrors: (state) => {
      state.error = {
        stats: null,
        history: null,
        rewards: null,
        invite: null,
        claim: null,
      };
    },
  },
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(fetchReferalStats.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchReferalStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchReferalStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload as string;
      })

    // History
      .addCase(fetchReferalHistory.pending, (state) => {
        state.loading.history = true;
        state.error.history = null;
      })
      .addCase(fetchReferalHistory.fulfilled, (state, action) => {
        state.loading.history = false;
        state.history = action.payload;
      })
      .addCase(fetchReferalHistory.rejected, (state, action) => {
        state.loading.history = false;
        state.error.history = action.payload as string;
      })

    // Rewards
      .addCase(fetchReferalRewards.pending, (state) => {
        state.loading.rewards = true;
        state.error.rewards = null;
      })
      .addCase(fetchReferalRewards.fulfilled, (state, action) => {
        state.loading.rewards = false;
        state.rewards = action.payload;
      })
      .addCase(fetchReferalRewards.rejected, (state, action) => {
        state.loading.rewards = false;
        state.error.rewards = action.payload as string;
      })

    // Invite
      .addCase(inviteFriends.pending, (state) => {
        state.loading.invite = true;
        state.error.invite = null;
      })
      .addCase(inviteFriends.fulfilled, (state, action) => {
        state.loading.invite = false;
        state.successMessage = "Invitations envoyées avec succès !";
      })
      .addCase(inviteFriends.rejected, (state, action) => {
        state.loading.invite = false;
        state.error.invite = action.payload as string;
      })

    // Claim Reward
      .addCase(claimReward.pending, (state) => {
        state.loading.claim = true;
        state.error.claim = null;
      })
      .addCase(claimReward.fulfilled, (state, action) => {
        state.loading.claim = false;
        state.successMessage = "Récompense réclamée avec succès !";
      })
      .addCase(claimReward.rejected, (state, action) => {
        state.loading.claim = false;
        state.error.claim = action.payload as string;
      });
  },
});

export const { clearSuccessMessage, clearErrors } = referalSlice.actions;
export default referalSlice.reducer;
