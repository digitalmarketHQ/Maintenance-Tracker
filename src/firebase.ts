import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "eternal-antonym-t46tg",
  appId: "1:294051564820:web:8430d9264d2e337fc30601",
  apiKey: "AIzaSyAwtbBBWvP1ccRQQ0X2R8KvftrN-eir1fo",
  authDomain: "eternal-antonym-t46tg.firebaseapp.com",
  storageBucket: "eternal-antonym-t46tg.firebasestorage.app",
  messagingSenderId: "294051564820"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific custom database ID provisioned for us
export const db = getFirestore(app, "ai-studio-meridienheightsm-385b3140-49c3-41a1-bd7c-75345cd3c524");
