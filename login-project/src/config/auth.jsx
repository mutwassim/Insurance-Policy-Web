import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBO2AE2-su8FQp5zieMaro2578vfbtsDUU",
  authDomain: "login-project-f1f07.firebaseapp.com",
  projectId: "login-project-f1f07",
  storageBucket: "login-project-f1f07.firebasestorage.app",
  messagingSenderId: "744767492",
  appId: "1:744767492:web:9dea1777d80d975768b551",
  measurementId: "G-YXE80WBRH8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);