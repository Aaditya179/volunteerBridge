import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA_LXj9Q123tOCZvsd_dgWAXqOfbMZpyCo",
  authDomain: "volunteerbridge-52687.firebaseapp.com",
  projectId: "volunteerbridge-52687",
  storageBucket: "volunteerbridge-52687.firebasestorage.app",
  messagingSenderId: "540870892709",
  appId: "1:540870892709:web:e34d39fe98e59c1e24414c",
  measurementId: "G-LQ1SPXPCKP"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;