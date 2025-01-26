import { SpecialtyLevel, VALID_STUDENT_LEVELS } from "../../types/auth";

export const GROUPED_SPECIALTIES = {
  "Frontend Development": {
    description:
      "Spécialisez-vous dans le développement d'interfaces utilisateur",
    levels: [
      VALID_STUDENT_LEVELS.FRONTEND_N0,
      VALID_STUDENT_LEVELS.FRONTEND_N1,
      VALID_STUDENT_LEVELS.FRONTEND_N2,
    ],
  },
  "Backend Development": {
    description: "Maîtrisez le développement côté serveur",
    levels: [
      VALID_STUDENT_LEVELS.BACKEND_N0,
      VALID_STUDENT_LEVELS.BACKEND_N1,
      VALID_STUDENT_LEVELS.BACKEND_N2,
    ],
  },
  "Full Stack Development": {
    description: "Devenez un développeur complet",
    levels: [
      VALID_STUDENT_LEVELS.FULLSTACK_F0,
      VALID_STUDENT_LEVELS.FULLSTACK_F1,
      VALID_STUDENT_LEVELS.FULLSTACK_F2,
    ],
  },
} as const;


export const SPECIALTY_PRICES = {
  "FrontEnd-N0": 3000,
  "BackEnd-N0": 3000,
  "FullStack-F0": 10000,
  "FrontEnd-N1": 5000,
  "BackEnd-N1": 5000,
  "FullStack-F1": 15000,
  "FrontEnd-N2": 35000,
  "BackEnd-N2": 10000,
  "FullStack-F2": 80000,
} as const;

export const SPECIALTY_DESCRIPTIONS: Record<SpecialtyLevel, string> = {
  N0: "Niveau débutant - Apprenez les bases du développement",
  N1: "Niveau intermédiaire - Perfectionnez vos compétences",
  N2: "Niveau avancé - Devenez un expert",
  F0: "Formation complète débutant - Full Stack",
  F1: "Formation complète intermédiaire - Full Stack",
  F2: "Formation complète avancée - Full Stack",
};

