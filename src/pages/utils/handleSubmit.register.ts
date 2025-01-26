import { NavigateFunction } from "react-router-dom";
import { StudentLevel } from "../../types/auth";
import { validateEmail, validatePhone, validatePassword } from "./validation";
import { APP_ROUTES } from "../nehonix/app.endpoints";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialty: StudentLevel;
}

interface FormErrors {
  email: string;
  phone: string;
  password: string;
}

interface HandleRegisterSubmitProps {
  formData: FormData;
  setError: (message: string) => void;
  setFormErrors: (errors: FormErrors) => void;
  setLoading: (isLoading: boolean) => void;
  navigate: NavigateFunction;
  authService: any;
  SPECIALTY_PRICES: Record<string, number>;
  encodeData: (data: any) => string;
}

export const handleRegisterSubmit = async (
  e: React.FormEvent,
  {
    formData,
    setError,
    setFormErrors,
    setLoading,
    navigate,
    authService,
    SPECIALTY_PRICES,
    encodeData,
  }: HandleRegisterSubmitProps
) => {
  e.preventDefault();
  setError("");

  // Validation des champs
  const emailError = validateEmail(formData.email);
  const phoneError = validatePhone(formData.phone);
  const passwordError = validatePassword(formData.password);

  setFormErrors({
    email: emailError,
    phone: phoneError,
    password: passwordError,
  });

  if (emailError || phoneError || passwordError) {
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Les mots de passe ne correspondent pas");
    return;
  }

  if (!formData.specialty) {
    setError("Veuillez sélectionner une spécialité");
    return;
  }

  setLoading(true);

  try {
    const { confirmPassword, ...registerData } = formData;
    const response = await authService.register(registerData);
    const { paymentToken } = response.data;

    if (response.success) {
      // Préparer les données à encoder
      const paymentData = {
        u: response.data.user.name, // nom
        e: response.data.user.email, // email
        m: response.data.loginInfo.matricule, // matricule
        s: formData.specialty, // spécialité
        t: paymentToken, // token de paiement
        a: SPECIALTY_PRICES[formData.specialty], // montant
      };

      // Encoder les données
      const encodedData = encodeData(paymentData);

      // Rediriger avec les données encodées /nehonix/secure-payment dans l'URL
      navigate(`${APP_ROUTES.PAYMENT}?data=${encodedData}`, { replace: true });
    }
  } catch (error: any) {
    setError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Une erreur est survenue lors de l'inscription"
    );
  } finally {
    setLoading(false);
  }
};
