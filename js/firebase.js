// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase config (replace with your actual Firebase project config)
const firebaseConfig = {
  apiKey: "AIzaSyBmO6ESGO7ZbaXlwONtcbpLEefC0hqEyeo",
  authDomain: "final-year-project-a943b.firebaseapp.com",
  projectId: "final-year-project-a943b",
  storageBucket: "final-year-project-a943b.firebasestorage.app",
  messagingSenderId: "173650024500",
  appId: "1:173650024500:web:4f850241cdb12ffa82d261",
  measurementId: "G-J6TC54V5DM"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for other files
export { auth, db };
