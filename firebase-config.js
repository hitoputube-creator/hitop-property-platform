// Firebase CDN (ESM) 방식 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxss-gNsEVPDVB2apkJGSUFZK8SrCx8Tw",
  authDomain: "hitop-consult.firebaseapp.com",
  projectId: "hitop-consult",
  storageBucket: "hitop-consult.firebasestorage.app",
  messagingSenderId: "836728145596",
  appId: "1:836728145596:web:b2f4b8336c6c5f4ab572b9",
  measurementId: "G-Z8XP3W0Z8G"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export const COLLECTION = "consultations";
export const LISTINGS_COLLECTION = "listings";
export const PUBLIC_CONSULTATIONS_COLLECTION = "public_consultations";
