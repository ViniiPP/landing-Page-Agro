// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // CHAVES DO FIREBASE CONSOLE
  apiKey: "AIzaSyCiue7tZwnv0LlXI_h3ucdyqNiUd078Gig",
  authDomain: "soybean-project-c280a.firebaseapp.com",
  projectId: "soybean-project-c280a",
  storageBucket: "soybean-project-c280a.firebasestorage.app",
  messagingSenderId: "189625364986",
  appId: "1:189625364986:web:5172354d1f5ce287407443",
  easurementId: "G-NRLEVW3NC8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
