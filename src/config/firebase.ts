import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCREH0MgfprhHSVhNsJyPEeugDVo1gmBPs",
  authDomain: "nehonix-a-portail.firebaseapp.com",
  projectId: "nehonix-a-portail",
  storageBucket: "nehonix-a-portail.firebasestorage.app",
  messagingSenderId: "680995385245",
  appId: "1:680995385245:web:d7267b3718ed30188c0974",
  measurementId: "G-LK4TQCX6E3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Collection references
export const collections = {
  users: db.collection('users'),
  courses: db.collection('courses'),
  modules: db.collection('modules'),
  enrollments: db.collection('enrollments'),
};

export default app;
