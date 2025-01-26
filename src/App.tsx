import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/Auth_Check_context";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PendingApproval from "./pages/PendingApproval";
import RejectedAccount from "./pages/RejectedAccount";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import Referrals from "./pages/Referrals";
import Subscription from "./pages/Subscription";
import { APP_ROUTES } from "./pages/nehonix/app.endpoints";
import Payment from "./pages/Payment";
import PendingPayment from "./pages/PendingPayment";
import NotFound from "./NoFound";
import { Layout } from "./components/Layout";
import { usePageTitle } from "./hooks/usePageTitle";
import TooManyRequestsError from "./components/errors/TooManyRequestsError";
import CourseDetail from "./pages/CourseDetail";

function App() {
  const location = useLocation();
  const navigateTo = useNavigate();
  usePageTitle();

  useEffect(() => {
    console.log(
      "Salut et bienvenue dans le portail de NEHONIX. https://nehonix.space"
    );
    if (location.pathname === "/") {
      navigateTo(APP_ROUTES.DASHBOARD, { replace: true });
    }
  }, [location.pathname, navigateTo]);

  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path={APP_ROUTES.LOGIN} element={<Login />} />
        <Route path={APP_ROUTES.NOT_FOUND} element={<NotFound />} />
        <Route path={APP_ROUTES.REGISTER} element={<Register />} />
        <Route path={APP_ROUTES.PAYMENT} element={<Payment />} />
        <Route path={APP_ROUTES.PENDING_PAYMENT} element={<PendingPayment />} />

        <Route
          path={APP_ROUTES.PENDING_APPROVAL}
          element={<PendingApproval />}
        />
        <Route
          path={APP_ROUTES.REGISTRATION_SUCCESS}
          element={<RegistrationSuccess />}
        />
        <Route
          path={APP_ROUTES.REJECTED_ACCOUNT}
          element={<RejectedAccount />}
        />
        <Route path={"/429"} element={<TooManyRequestsError />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path={APP_ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={APP_ROUTES.PROFILE} element={<Profile />} />
            <Route path={APP_ROUTES.COURSES} element={<Courses />} />
            <Route path={APP_ROUTES.REFERRALS} element={<Referrals />} />
            <Route path={APP_ROUTES.SUBSCRIPTION} element={<Subscription />} />
            <Route
              path={"/nehonix/previews/type/courses/:courseId"}
              element={<CourseDetail />}
            />
          </Route>
        </Route>

        {/* Redirect root to dashboard */}
        <Route
          path="/"
          element={<Navigate to={APP_ROUTES.DASHBOARD} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={APP_ROUTES.NOT_FOUND} replace />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
