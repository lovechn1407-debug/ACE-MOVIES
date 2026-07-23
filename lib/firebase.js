import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAVCbRAsvQgN77XEiwjYWZ5dGorWVdYyiU",
  authDomain: "ace-movies.firebaseapp.com",
  databaseURL: "https://ace-movies-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ace-movies",
  storageBucket: "ace-movies.firebasestorage.app",
  messagingSenderId: "1034180809598",
  appId: "1:1034180809598:web:43e12b21542ccaead6d92f",
  measurementId: "G-61F1NV02G0"
};

// Singleton Firebase App initialization for Next.js SSR/Serverless environment
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
