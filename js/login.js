import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"; // Importing signInWithEmailAndPassword
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = emailField.value.trim();
  const password = passwordField.value.trim();

  const loader = document.getElementById("loaderOverlay");
  loader.style.display = "flex"; // Show loader

  try {
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user details from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Check user role
    const role = userData.role;

    // Redirect based on role
    if (role === "admin") {
      window.location.href = "/html/admin.html";
    } else {
      window.location.href = "/html/homepage.html";
    }

  } catch (err) {
    console.error(err);
    alert("Login failed: " + err.message);
    loader.style.display = "none"; // Hide loader on failure
  }
});