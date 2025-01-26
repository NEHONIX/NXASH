import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PAGE_TITLES } from "../config/pageTitles";
import { GET_PATH_TITLE } from "../utils/getTitle";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { APP_ROUTES } from "../pages/nehonix/app.endpoints";

export const usePageTitle = () => {
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const pathTitle = Object.assign(PAGE_TITLES, {
    [APP_ROUTES.DASHBOARD]: "NXASH -" + user?.name + " Tableau de bord",
    [APP_ROUTES.PROFILE]: "NXASH -" + user?.name + " Profil",
    [APP_ROUTES.COURSES]: "NXASH -" + user?.name + " Cours",
    [APP_ROUTES.REFERRALS]: "NXASH -" + user?.name + " Parrainage",
    [APP_ROUTES.SUBSCRIPTION]: "NXASH -" + user?.name + " Abonnement",
    [APP_ROUTES.LOGIN]: "NXASH - Connexion",
    [APP_ROUTES.REGISTER]: "NXASH - Inscription",
    [APP_ROUTES.PAYMENT]: "NXASH - Paiement",
    [APP_ROUTES.PENDING_PAYMENT]: "NXASH - Paiement en attente",
    [APP_ROUTES.PENDING_APPROVAL]: "NXASH - Validation en attente",
    [APP_ROUTES.REGISTRATION_SUCCESS]: "NXASH - Inscription reussie",
    [APP_ROUTES.NOT_FOUND]: "NXASH - Page non trouvée",
  });

  useEffect(() => {
    const title = pathTitle[pathname] || "NXASH";
    GET_PATH_TITLE(title);
  }, [pathname]);
};
