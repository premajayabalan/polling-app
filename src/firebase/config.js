import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUqIQqpmmgXfDjsLjzSpV-TC0UgLreNc8",
  authDomain: "sprintpoll-270ba.firebaseapp.com",
  projectId: "sprintpoll-270ba",
  storageBucket: "sprintpoll-270ba.firebasestorage.app",
  messagingSenderId: "464773350230",
  appId: "1:464773350230:web:2e6d1cb2c16c2291484cf7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);