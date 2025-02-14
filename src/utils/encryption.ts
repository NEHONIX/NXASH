// Fonction pour encoder les données en Base64 de manière sécurisée
export const encodeData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  // On utilise btoa pour encoder en Base64
  return btoa(encodeURIComponent(jsonString));
};

// Fonction pour décoder les données
export const decodeData = (encodedData: string): any => {
  try {
    // On décode le Base64 et on parse le JSON
    const jsonString = decodeURIComponent(atob(encodedData));
    return JSON.parse(jsonString);
  } catch (error) {
    //console.error("Erreur lors du décodage des données:", error);
    return null;
  }
};
