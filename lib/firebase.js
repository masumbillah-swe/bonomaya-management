import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiovt5RfAKTIyw3cZ4XWtdmhTrNdzZ_Cg", // আমি এটা ঠিক করে দিয়েছি
  authDomain: "bonomaya-smart-management.firebaseapp.com",
  projectId: "bonomaya-smart-management",
  storageBucket: "bonomaya-smart-management.firebasestorage.app",
  messagingSenderId: "55064313883",
  appId: "1:55064313883:web:8cc72fa71be683de0f38be"
};

// Next.js এর জন্য সেফ ইনিশিয়ালাইজেশন
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);