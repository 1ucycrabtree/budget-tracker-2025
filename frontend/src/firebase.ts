import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2bCdVPOlObvW4UXMIEmwIo0Hh9gCvjlg",
  authDomain: "budget-tracker-462522.firebaseapp.com",
  projectId: "budget-tracker-462522",
  storageBucket: "budget-tracker-462522.firebasestorage.app",
  messagingSenderId: "518890210937",
  appId: "1:518890210937:web:9a12af48a71214ac4bb6a8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
