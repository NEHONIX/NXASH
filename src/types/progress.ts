import { Course } from ".";

export interface CourseProgress {
  courseId: string;
  progress: number;
  completedChapters: string[];
  completedLessons: string[];
  lastAccessedAt: Date;
}

export interface CourseWithProgress extends Course {
  progress: number;
  completedChapters: string[];
}
