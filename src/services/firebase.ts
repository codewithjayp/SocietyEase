/**
 * ARCHITECTURE & FLOW: firebase.ts
 * 
 * This file acts as the bridge between your local application and the Firebase Backend.
 * It initializes the Firebase SDK with your specific project credentials.
 * 
 * - `auth`: Used by AuthContext.tsx for logging users in and out.
 * - `db`: The Firestore database instance used by useFirestore.ts to read/write data.
 * - `storage`: Used for uploading files (like profile pictures or complaint attachments) in the future.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmFlb17lhrN6kICkEmoTeWhX4xYccl2mA",
  authDomain: "societyease-46614.firebaseapp.com",
  projectId: "societyease-46614",
  storageBucket: "societyease-46614.firebasestorage.app",
  messagingSenderId: "620689456244",
  appId: "1:620689456244:web:e6679e937c6a9580532521",
  measurementId: "G-340CZ4HB3K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
