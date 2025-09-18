// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Configuração atualizada com dados corretos do projeto
const firebaseConfig = {
  apiKey: "AIzaSyBtfIUURV0iZwk3afT6J7GORAD6Y9-H4vw",
  authDomain: "gerenciadordedieta.firebaseapp.com",
  projectId: "gerenciadordedieta",
  storageBucket: "gerenciadordedieta.firebasestorage.app",
  messagingSenderId: "390334831055",
  appId: "1:390334831055:web:a8790256f1d95a86605aba",
  measurementId: "G-1L3LWCXPY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Analytics (opcional)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

console.log('✅ Firebase configurado com projeto:', firebaseConfig.projectId);

export default app;