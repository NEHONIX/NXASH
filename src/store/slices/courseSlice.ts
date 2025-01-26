import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Course } from "../../types";
import { courseService } from "../../services/api";

// Type pour l'état initial
interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  selectedCourse: Course | null;
}

// État initial
const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
  selectedCourse: null,
};

// Thunk pour récupérer tous les cours avec gestion des erreurs et du loading
export const fetchAllCourses = createAsyncThunk(
  "courses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const courses = await courseService.getAllCourses();
      return courses;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Erreur lors de la récupération des cours"
      );
    }
  }
);

// Thunk pour mettre à jour périodiquement les cours
export const updateCourseProgress = createAsyncThunk(
  "courses/updateProgress",
  async (_, { rejectWithValue }) => {
    try {
      const courses = await courseService.getAllCourses();
      return courses;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Erreur lors de la mise à jour des cours"
      );
    }
  }
);

// Slice pour gérer les cours
const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload;
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    // Gestion de fetchAllCourses
    builder
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Gestion de updateCourseProgress
    builder
      .addCase(updateCourseProgress.fulfilled, (state, action) => {
        state.courses = action.payload;
      })
      .addCase(updateCourseProgress.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCourse, clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;
