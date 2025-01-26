// Fonctions de validation
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Format d'email invalide";
  }
  return "";
};

export const validatePhone = (phone: string) => {
  // Supprime les espaces du numéro
  const cleanPhone = phone.replace(/\s+/g, "");
  const phoneRegex = /^\+2250\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return "Le numéro doit être au format: +225 0XXXXXXXXX";
  }
  return "";
};

export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une minuscule";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  return "";
};
