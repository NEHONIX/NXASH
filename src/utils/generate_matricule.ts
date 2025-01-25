import { firestore } from "../conf/firebase";

export async function generateMatricule(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = "NHX";

  // Récupérer le dernier matricule de l'année en cours
  const usersRef = firestore.collection("users");
  const lastUserQuery = await usersRef
    .where("matricule", ">=", `${prefix}${currentYear}`)
    .where("matricule", "<", `${prefix}${currentYear + 1}`)
    .orderBy("matricule", "desc")
    .limit(1)
    .get();

  let sequence = 1;
  if (!lastUserQuery.empty) {
    const lastMatricule = lastUserQuery.docs[0].data().matricule;
    sequence = parseInt(lastMatricule.slice(-4)) + 1;
  }

  // Formater le numéro de séquence sur 4 chiffres
  const sequenceStr = sequence.toString().padStart(4, "0");
  const x = Math.floor(1000 * Math.random() + 9000);
  const matricule = `${prefix}-${currentYear}${x}`;

  return matricule;
}

export const isValidMatricule = (matricule: string): boolean => {
  const pattern = /^NX-\d{4}\d{4}$/;
  return pattern.test(matricule);
};
