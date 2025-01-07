import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD78o7t1N7axoOzz5I8FyV5JqzmCRZM1LY",
  authDomain: "brainblitz-5b02c.firebaseapp.com",
  projectId: "brainblitz-5b02c",
  storageBucket: "brainblitz-5b02c.firebasestorage.app",
  messagingSenderId: "1005547149706",
  appId: "1:1005547149706:web:d8843d5df242dad9b85073",
  measurementId: "G-4XQPVSNEBL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, analytics };
