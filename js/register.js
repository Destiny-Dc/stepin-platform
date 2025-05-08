import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById("registerForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const errorMsg = document.getElementById("passwordError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (password.value !== confirmPassword.value) {
    errorMsg.classList.remove("hidden");
    return;
  } else {
    errorMsg.classList.add("hidden");
  }

  // Grab form data
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const indexNumber = document.getElementById("indexNumber").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = `${username}@stepin.com`; // You can change this format if needed
  const userPassword = password.value;

  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, userPassword);
    const user = userCredential.user;
  
    // Log user creation details
    console.log("User created:", user.uid);
  
    // Store additional user details in Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      firstName,
      lastName,
      indexNumber,
      username,
      email,
      createdAt: new Date()
    });
  
    console.log("User data written to Firestore");
    alert("Registration successful!");
    window.location.href = "/html/login.html";  // Redirect to login after successful registration
  
  } catch (err) {
    console.error("Error registering user:", err);  // Improved error logging
    alert("Registration failed: " + err.message);
  }
})  