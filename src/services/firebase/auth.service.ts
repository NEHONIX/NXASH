import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { generateMatricule } from "../../utils/generate_matricule";

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  matricule: string;
  password: string;
}

class FirebaseAuthService {
  async register(data: RegisterData) {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Générer le matricule
      const matricule = generateMatricule();

      // Mettre à jour le profil utilisateur
      await updateProfile(user, {
        displayName: data.name,
      });

      // Créer le document utilisateur dans Firestore
      const userData = {
        uid: user.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        matricule,
        role: "student",
        approvalStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userData);

      return {
        success: true,
        data: {
          user: userData,
          loginInfo: {
            matricule,
            message:
              "Conservez précieusement ce matricule, il vous servira pour vous connecter.",
          },
        },
      };
    } catch (error: any) {
      //console.error("Erreur d'inscription:", error);
      throw error;
    }
  }

  async login(data: LoginData) {
    try {
      // Trouver l'utilisateur par matricule
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("matricule", "==", data.matricule.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Matricule ou mot de passe incorrect");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Vérifier le statut d'approbation
      if (userData.approvalStatus === "rejected") {
        throw new Error("Votre compte a été rejeté");
      }

      if (userData.approvalStatus === "pending") {
        throw new Error("Votre compte est en attente d'approbation");
      }

      // Se connecter avec email/password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        data.password
      );

      return {
        success: true,
        data: {
          user: {
            ...userData,
            id: userDoc.id,
          },
        },
      };
    } catch (error: any) {
      //console.error("Erreur de connexion:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      //console.error("Erreur de déconnexion:", error);
      throw error;
    }
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: "Un email de réinitialisation a été envoyé",
      };
    } catch (error: any) {
      //console.error("Erreur de réinitialisation du mot de passe:", error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

export const firebaseAuthService = new FirebaseAuthService();
