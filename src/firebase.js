import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANonBbNRuDrDgTk5hKvPRJ9lEt3Pelwlo",
  authDomain: "portfolio-b534d.firebaseapp.com",
  projectId: "portfolio-b534d",
  storageBucket: "portfolio-b534d.firebasestorage.app",
  messagingSenderId: "950233739607",
  appId: "1:950233739607:web:3306c063e4cea23a644e12",
  measurementId: "G-GR0QQDJ7YX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();

// Analytics with safety check
export let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export default app;
