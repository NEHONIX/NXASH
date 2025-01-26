/**
 * Définit les niveaux de cours disponibles
 * Format: [Spécialité]-[Niveau]
 * Spécialité: FrontEnd, BackEnd, FullStack
 * Niveau: N0 (Débutant), N1 (Intermédiaire), N2 (Avancé)
 */

export interface CreateCourseDto {
  title: string;
  description: string;
  level: string;
  duration: number;
  category: string;
  prerequisites: string[];
  objectives: string[];
}

export type CourseLevel =
  | "FrontEnd-N0"
  | "BackEnd-N0"
  | "FullStack-F0"
  | "FrontEnd-N1"
  | "BackEnd-N1"
  | "FullStack-F1"
  | "FrontEnd-N2"
  | "BackEnd-N2"
  | "FullStack-F2";

/**
 * Définit les statuts possibles d'un cours
 */
export type CourseStatus = "draft" | "published" | "archived";

/**
 * Interface principale représentant un cours complet
 * Contient toutes les informations nécessaires pour afficher et gérer un cours
 */
export interface Course {
  id: string; // Identifiant unique du cours
  title: string; // Titre du cours
  description: string; // Description détaillée du cours
  level: CourseLevel; // Niveau du cours (voir type CourseLevel)
  duration: number; // Durée totale en minutes
  category: string; // Catégorie du cours (ex: "Développement Web")
  status: CourseStatus; // Statut du cours (brouillon, publié, archivé)
  prerequisites?: string[]; // Liste des prérequis (optionnel)
  objectives: string[]; // Liste des objectifs d'apprentissage
  content: CourseContent[]; // Contenu du cours (sections)
  resources?: CourseResource[]; // Ressources supplémentaires (optionnel)
  quizzes?: CourseQuiz[]; // Quiz associés au cours (optionnel)
  createdAt: Date; // Date de création
  updatedAt: Date; // Date de dernière modification
  publishedAt?: Date; // Date de publication (optionnel)
  instructorId: string; // ID de l'instructeur
  chapters: IChapter[]; // Chapitres du cours
  courseUrl: string; // URL du contenu principal
  courseUrlType: CourseUrlType; // Type de contenu (vidéo/document)
  thumbnail: string; // URL de l'image de couverture
}

/**
 * Représente une section de contenu dans un cours
 * Peut être une vidéo, du texte, un exercice ou un quiz
 */
export interface CourseContent {
  id: string;
  title: string;
  type: "video" | "text" | "exercise" | "quiz"; // Type de contenu
  content: string; // Contenu ou URL selon le type
  duration?: number; // Durée en minutes (optionnel)
  order: number; // Ordre d'affichage
}

/**
 * Définit une ressource supplémentaire associée au cours
 * Peut être un PDF, un lien ou un fichier
 */
export interface CourseResource {
  id: string;
  title: string;
  type: "pdf" | "link" | "file"; // Type de ressource
  url: string; // URL de la ressource
  description?: string; // Description (optionnel)
}

/**
 * Structure d'un quiz complet
 * Contient les questions et les paramètres du quiz
 */
export interface CourseQuiz {
  id: string;
  title: string;
  description?: string; // Description (optionnel)
  questions: QuizQuestion[]; // Liste des questions
  duration?: number; // Durée limite en minutes (optionnel)
  passingScore: number; // Score minimum pour réussir
}

/**
 * Définit la structure d'une question de quiz
 * Supporte différents types de questions
 */
export interface QuizQuestion {
  id: string;
  question: string; // Texte de la question
  type: "multiple-choice" | "true-false" | "open-ended"; // Type de question
  options?: string[]; // Options pour QCM (optionnel)
  correctAnswer: string | string[]; // Réponse(s) correcte(s)
  points: number; // Points attribués
}

/**
 * Types de contenus principaux acceptés pour un cours
 */
export type CourseUrlType = "video" | "document";

/**
 * Structure d'une leçon dans un chapitre
 * Peut contenir une vidéo, du texte ou un quiz
 */
export interface ILesson {
  id: string;
  title: string;
  description: string;
  content: string; // Contenu principal
  videoUrl?: string; // URL de la vidéo (optionnel)
  resources: IResource[]; // Ressources de la leçon
  duration: number; // Durée en minutes
  order: number; // Ordre dans le chapitre
  type: "video" | "text" | "quiz"; // Type de leçon
}

/**
 * Définit une ressource associée à une leçon
 * Similar à CourseResource mais avec taille optionnelle
 */
export interface IResource {
  id: string;
  title: string;
  type: "pdf" | "link" | "file"; // Type de ressource
  url: string; // URL de la ressource
  size?: number; // Taille en bytes (optionnel)
}

/**
 * Structure d'un chapitre de cours
 * Contient une liste de leçons
 */
export interface IChapter {
  id: string;
  title: string;
  description: string;
  order: number; // Ordre dans le cours
  duration: number; // Durée totale en minutes
  lessons: ILesson[]; // Liste des leçons
}
