import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Replace these values with your Firebase project credentials from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCF57jL8DsNsHjboLIZjGyWgmZ0J3caa0k",
  authDomain: "leave-approval-a09c0.firebaseapp.com",
  projectId: "leave-approval-a09c0",
  storageBucket: "leave-approval-a09c0.firebasestorage.app",
  messagingSenderId: "1020175624880",
  appId: "1:1020175624880:web:b9a4ed0da756e573ca2975",
  measurementId: "G-MQTY01P7TT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
