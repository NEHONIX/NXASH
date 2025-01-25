export interface ReferalReward {
  id: string;
  type: "discount" | "bonus_days" | "special_access";
  description: string;
  value: number; // Pourcentage de réduction ou nombre de jours bonus
  minReferals: number; // Nombre minimum de parrainages requis
  claimed: boolean;
}

export const REFERAL_REWARDS: ReferalReward[] = [
  {
    id: "reward_1",
    type: "discount",
    description: "15% de réduction sur votre prochain mois",
    value: 15,
    minReferals: 1,
    claimed: false
  },
  {
    id: "reward_2",
    type: "bonus_days",
    description: "7 jours gratuits ajoutés à votre abonnement",
    value: 7,
    minReferals: 3,
    claimed: false
  },
  {
    id: "reward_3",
    type: "discount",
    description: "30% de réduction sur votre prochain mois",
    value: 30,
    minReferals: 5,
    claimed: false
  },
  {
    id: "reward_4",
    type: "bonus_days",
    description: "15 jours gratuits ajoutés à votre abonnement",
    value: 15,
    minReferals: 10,
    claimed: false
  },
  {
    id: "reward_5",
    type: "special_access",
    description: "Accès premium à tous les cours pendant 1 mois",
    value: 30,
    minReferals: 15,
    claimed: false
  }
];
