import api from "../api";

const baseEndPoints = "/dashboard/referals";
export const REFERRAL_SERVICE = {
  /**
   * @route   GET /api/student/dashboard/referals/stats
   * @desc    Obtenir les statistiques de parrainage
   * @access  Private (Student only)
   */
  getReferralStats: async () => {
    const response = await api.get(`${baseEndPoints}/stats`);
    //console.log("Stats: ", response.data);
    return response.data;
  },

  /**
   * @route   POST /api/student/dashboard/referals/invite
   * @desc    Inviter des amis par email
   * @access  Private (Student only)
   */
  inviteFriends: async (emails: string[]) => {
    const response = await api.post(`${baseEndPoints}/invite`, { emails });
    return response.data;
  },

  /**
   * @route   GET /api/student/dashboard/referals/history
   * @desc    Obtenir l'historique des parrainages
   * @access  Private (Student only)
   */
  getRefHistory: async () => {
    const response = await api.get(`${baseEndPoints}/history`);
    //console.log("Stats history: ", response.data);

    return response.data;
  },
  /**
   * @route   GET /api/student/dashboard/referals/rewards
   * @desc    Obtenir les récompenses disponibles et débloquées
   * @access  Private (Student only)
   */
  getRefRewards: async () => {
    const response = await api.get(`${baseEndPoints}/rewards`);
    return response.data;
  },

  /**
   * @route   POST /api/student/dashboard/referals/rewards/:rewardId/claim
   * @desc    Réclamer une récompense
   * @access  Private (Student only)
   */
  claimReward: async (rewardId: string) => {
    const response = await api.post(
      `${baseEndPoints}/rewards/${rewardId}/claim`
    );
    return response.data;
  },
};
