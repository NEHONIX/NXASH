import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/Auth_Check_context';
import { APP_ROUTES } from '../pages/nehonix/app.endpoints';

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, isAuthenticated, checkingAuth } = useAuth();

  // Afficher le chargement uniquement lors de la première vérification
  if (checkingAuth) {
    return <div>Chargement...</div>;
  }

  // Redirection vers login si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to={APP_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Redirection vers la page d'attente si l'utilisateur n'est pas approuvé
  if (user.approvalStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirection vers la page de rejet si l'utilisateur est rejeté
  if (user.approvalStatus === 'rejected') {
    return <Navigate to="/rejected" replace />;
  }

  // Afficher les routes enfants si authentifié et approuvé
  return <Outlet />;
};

export default ProtectedRoute;
