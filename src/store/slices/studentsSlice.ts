import { studentsService } from "@/services/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StudentsState } from "./types/students.slice";

const initialState: StudentsState = {
  students: {
    stats: {
      totalStudents: 0,
      activeStudents: 0,
      averageCoursesPerStudent: 0,
      averageCompletionRate: 0,
    },
    students: [],
    total: 0,
  },
  loading: false,
  error: null,
  searchQuery: "",
};

export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async () => {
    const response = await studentsService.getStudents();
    return response;
  }
);

export const searchStudents = createAsyncThunk(
  "students/searchStudents",
  async (query: string) => {
    const response = await studentsService.searchStudents(query);
    return response;
  }
);

const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Une erreur est survenue";
      })
      .addCase(searchStudents.fulfilled, (state, action) => {
        state.students = action.payload;
      });
  },
});

export const { setSearchQuery } = studentsSlice.actions;
export default studentsSlice.reducer;
