import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Reemplaza estos valores con los de tu proyecto de Firebase
// (Project Settings > General > Your apps > Web app > SDK setup and configuration)
const firebaseConfig = {
  apiKey: "AIzaSyClso1e1TX_3KeeoVBj7IsKTG0_DiTPjrc",
  authDomain: "app-de-tickets-79b6a.firebaseapp.com",
  projectId: "app-de-tickets-79b6a",
  storageBucket: "app-de-tickets-79b6a.firebasestorage.app",
  messagingSenderId: "671760866798",
  appId: "1:671760866798:web:f90656f527723d754682ff",
  measurementId: "G-XWV8XCEDYD"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
