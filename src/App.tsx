import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Courses from "./pages/Courses/Courses";
import Students from "./pages/Students/Students";
import Schedule from "./pages/Schedule/Schedule";
import Messages from "./pages/Messages/Messages";
import Settings from "./pages/Settings/Settings";
import Payments from "./pages/Payments/Payments";
import PrivateRoute from "./services/private.route";
import CreateCourse from "./pages/Courses/CreateCourse/CreateCourse";
import EditCourse from "./pages/Courses/Edit/EditCourse";
import CoursePreview from "./pages/Courses/Preview/CoursePreview";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/create" element={<CreateCourse />} />
        <Route path="courses/edit/:id" element={<EditCourse />} />
        <Route path="courses/preview/:id" element={<CoursePreview />} />
        <Route path="students" element={<Students />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="messages" element={<Messages />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
