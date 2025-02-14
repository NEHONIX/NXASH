/**
 * Ce fichier est utilisé pour la gestion et la sécurisation du cache
 */
import fs from "fs";
import crypto from "crypto";
import path from "path";

let encryptionKey: string = process.env.ENC_SECRET_KEY || ""; // Clé d'encryption depuis .env
const iv: Buffer = Buffer.alloc(16, 0); // Vecteur d'initialisation

// Fonction pour lire les données du cache
type CachedData = Record<string, any>; // Définition d'un type générique pour le cache

const readCache = (filepath: string): CachedData => {
  try {
    // Vérifiez si le répertoire existe, sinon créez-le
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      // Créez le répertoire si il n'existe pas
      fs.mkdirSync(dir, { recursive: true });
      // console.info(`Le répertoire ${dir} a été créé`);
    }

    const encryptedData = fs.readFileSync(filepath, "utf8");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey, "hex"),
      iv
    );
    let decryptedData = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Erreur lors de la lecture du cache:", error);
    // console.error("Erreur lors de la lecture du cache");
    return {};
  }
};

// Fonction pour écrire des données dans le cache
const writeCache = ({
  data,
  filepath,
}: {
  data: CachedData;
  filepath: string;
}): void => {
  try {
    // Vérifiez si le répertoire existe, sinon créez-le
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      // Créez le répertoire si il n'existe pas
      fs.mkdirSync(dir, { recursive: true });
      // console.info(`Le répertoire ${dir} a été créé`);
    }

    // Écrire dans le fichier
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey, "hex"),
      iv
    );
    let encryptedData = cipher.update(JSON.stringify(data), "utf8", "hex");
    encryptedData += cipher.final("hex");
    fs.writeFileSync(filepath, encryptedData);
  } catch (error) {
    console.error("Erreur lors de l'écriture dans le cache");
    // console.error("Erreur lors de l'écriture dans le cache:", error);
  }
};

// Fonction pour faire pivoter la clé d'encryption
const rotateKeys = (): void => {
  const newEncryptionKey = crypto.randomBytes(32).toString("hex");
  const cachedData = readCache(filepath("/cacheData.txt")); // Lire l'ancien cache
  encryptionKey = newEncryptionKey; // Mettre à jour la clé d'encryption
  writeCache({
    data: cachedData,
    filepath: filepath("/cacheData.txt"),
  }); // Réécrire les données
};

// Fonction pour expirer le cache après un certain temps
const expireCache = (): void => {
  try {
    fs.truncateSync(filepath("/cacheData.txt"), 0);
    // console.log("Cache expiré à:", new Date());
  } catch (error) {
    // console.error("Erreur lors de l'expiration du cache:", error);
    console.error("Erreur lors de l'expiration du cache");
  }
};

// Planification de l'expiration du cache et de la rotation des clés
setInterval(expireCache, 10 * 60 * 60 * 1000); // Toutes les 10 minutes
setInterval(rotateKeys, 10 * 24 * 60 * 60 * 1000); // Tous les 10 jours

export { readCache, writeCache };

export const filepath = (path: string) => `.cache${path}`;
