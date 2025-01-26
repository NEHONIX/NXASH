import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Chapter, Lesson } from "@/types/api";
import { coursesService as api } from "@/services/api";
import { Course } from "@/types/course";

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

// Thunks pour les cours
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async () => {
    const response = await api.getMyCourses();
    return response.data.courses;
  }
);

export const fetchCourse = createAsyncThunk(
  "courses/fetchCourse",
  async (courseId: string) => {
    const response = await api.getCourseById(courseId);
    return response;
  }
);

export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (data: Course) => {
    const response = await api.createCourse(data);
    return response;
  }
);

export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async ({ courseId, data }: { courseId: string; data: any }) => {
    //A faire: Remplacez 'any' par le type approprié
    const response = await api.updateCourse(courseId, data);
    return response;
  }
);

export const fetchCourseById = createAsyncThunk(
  "courses/fetchCourseById",
  async ({ id }: { id: string }) => {
    const response = await api.getCourseById(id);
    return response;
  }
);

export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (courseId: string) => {
    await api.deleteCourse(courseId);
    return courseId;
  }
);

export const publishCourse = createAsyncThunk(
  "courses/publishCourse",
  async (courseId: string) => {
    const response = await api.publishCourse(courseId);
    return response;
  }
);

// Thunks pour les chapitres
export const createChapter = createAsyncThunk(
  "courses/createChapter",
  async ({ courseId, data }: { courseId: string; data: Chapter }) => {
    const response = await api.createChapter({ courseId, data });
    return { courseId, chapter: response };
  }
);

// Thunks pour les leçons
export const createLesson = createAsyncThunk(
  "courses/createLesson",
  async ({
    courseId,
    chapterId,
    data,
  }: {
    courseId: string;
    chapterId: string;
    data: Lesson;
  }) => {
    const response = await api.createLesson({ courseId, chapterId, data });
    return { courseId, chapterId, lesson: response };
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      // Fetch single course
      .addCase(fetchCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?.id === action.payload.id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter((c) => c.id !== action.payload);
        if (state.currentCourse?.id === action.payload) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      // Publish course
      .addCase(publishCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?.id === action.payload.id) {
          state.currentCourse = action.payload;
        }
      })
      // Create chapter
      .addCase(createChapter.fulfilled, (state, action) => {
        const course = state.courses.find(
          (c) => c.id === action.payload.courseId
        );
        if (course) {
          course.chapters.push(action.payload.chapter);
        }
        if (state.currentCourse?.id === action.payload.courseId) {
          state.currentCourse.chapters.push(action.payload.chapter);
        }
      });
  },
});

export const { clearError, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
