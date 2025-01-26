export type StudentLevel =
  | "FrontEnd-N0" //Prix de la formation: 3000FCFA
  | "BackEnd-N0" // Prix de la formation: 3000FCFA
  | "FullStack-F0" //Prix de la formation: 10000FCFA
  | "FrontEnd-N1" //Prix de la formation: 5000FCFA
  | "BackEnd-N1" // Prix de la formation: 5000FCFA
  | "FullStack-F1" //Prix de la formation: 15000FCFA
  | "FrontEnd-N2" //Prix de la formation: 35000FCFA
  | "BackEnd-N2" //Prix de la formation: 10000FCFA
  | "FullStack-F2"; //Prix de la formation: 80000FCFA

export const VALID_STUDENT_LEVELS = {
  FRONTEND_N0: "FrontEnd-N0" as StudentLevel,
  BACKEND_N0: "BackEnd-N0" as StudentLevel,
  FULLSTACK_F0: "FullStack-F0" as StudentLevel,
  FRONTEND_N1: "FrontEnd-N1" as StudentLevel,
  BACKEND_N1: "BackEnd-N1" as StudentLevel,
  FULLSTACK_F1: "FullStack-F1" as StudentLevel,
  FRONTEND_N2: "FrontEnd-N2" as StudentLevel,
  BACKEND_N2: "BackEnd-N2" as StudentLevel,
  FULLSTACK_F2: "FullStack-F2" as StudentLevel,
} as const;

export type SpecialtyLevel = "N0" | "N1" | "N2" | "F0" | "F1" | "F2";

export interface IRegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialty: StudentLevel;
  referralCode?: string; // Code de parrainage optionnel
}
