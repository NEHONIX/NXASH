//Contexte pour gérer l'authentification (vérification de l'utilisateur)

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import { AppDispatch, RootState } from "../store";
import {
  login as loginAction,
  logout as logoutAction,
  checkAuth as checkAuthAction,
} from "../store/slices/authSlice";
import { APP_ROUTES } from "../pages/nehonix/app.endpoints";
import { encodeData } from "../utils/encryption";
import TooManyRequestsError from "../components/errors/TooManyRequestsError";
import { courseService } from "../services/api";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";

interface User {
  id: string;
  name: string;
  email: string;
  matricule: string;
  phone: string;
  role: "student" | "admin";
  approvalStatus: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkingAuth: boolean;
  login: (credentials: {
    matricule: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  hasError429: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasError429, setHasError429] = useState(false);
  const [courses, setCourses] = useState([]);
  const coursesFetchInterval = React.useRef<NodeJS.Timeout | null>(null);
  const isFetchingCourses = React.useRef(false);

  const checkAuthStatus = async () => {
    try {
      await dispatch(checkAuthAction() as any);
      setHasError429(false);
    } catch (error: any) {
      // console.error(
      //   "Erreur lors de la vérification de l'authentification:",
      //   error
      // );
      if (error.status === 429) {
        setHasError429(true);
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  const login = async (credentials: {
    matricule: string;
    password: string;
  }) => {
    try {
      const resultAction = await dispatch(loginAction(credentials) as any);
      const response = resultAction.payload;
      const user = response.data.user;

      // Vérifier si le paiement est requis
      if (response.data.requiresPayment && response.data.paymentSession) {
        //console.log("response 2: ", response);

        // Préparer les données pour la page de paiement
        const paymentData = {
          u: user.name,
          e: response.data.paymentSession.studentEmail,
          m: user.matricule,
          s: response.data.paymentSession.formationLevel,
          t: response.data.token,
          a: response.data.paymentSession.amount,
        };
        //console.log("Payment Data: ", paymentData);

        // Encoder les données pour la redirection
        const encodedData = encodeData(paymentData);
        navigate(`${APP_ROUTES.PAYMENT}?data=${encodedData}`);
        return;
      }

      // Si le paiement n'est pas requis, vérifier le statut d'approbation
      switch (user.approvalStatus) {
        case "pending":
          navigate(APP_ROUTES.PENDING_APPROVAL);
          break;
        case "rejected":
          navigate(APP_ROUTES.REJECTED_ACCOUNT);
          break;
        case "approved":
          navigate(APP_ROUTES.DASHBOARD);
          break;
        default:
          navigate(APP_ROUTES.DASHBOARD);
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur de connexion"
      );
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutAction() as any);
      navigate(APP_ROUTES.LOGIN);
    } catch (error) {
      //console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const courses = await courseService.getAllCourses();

      // Vérification supplémentaire pour éviter les requêtes redondantes
      if (courses && courses.length > 0) {
        // Mise à jour potentielle de l'état des cours si nécessaire
        setCourses(courses);
      }
    } catch (error) {
      //console.error("Erreur lors de la récupération des cours:", error);
    }
  };

  const startPeriodicCourseFetching = () => {
    // Stopper tout intervalle existant pour éviter les doublons
    if (coursesFetchInterval.current) {
      clearInterval(coursesFetchInterval.current);
    }

    // Démarrer un nouvel intervalle
    coursesFetchInterval.current = setInterval(() => {
      // Vérification supplémentaire pour éviter les appels en cascade
      if (!isFetchingCourses.current) {
        isFetchingCourses.current = true;

        fetchCourses().finally(() => {
          isFetchingCourses.current = false;
        });
      }
    }, 10000); // Toutes les 6 secondes
  };

  useEffect(() => {
    startPeriodicCourseFetching();
    checkAuthStatus();
  }, []);

  if (checkingAuth) {
    return <LoadingSpinner message="Vérification de l'authentification..." />;
  }

  if (hasError429) {
    return <TooManyRequestsError />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        checkingAuth,
        login,
        logout,
        checkAuthStatus,
        hasError429,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
