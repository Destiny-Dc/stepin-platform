// register.js

import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  doc,
  setDoc,
  serverTimestamp
} 
from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

const registerForm = document.getElementById("registerForm");
const passwordError = document.getElementById("passwordError");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const indexNumber = document.getElementById("indexNumber").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    passwordError.style.display = "block";
    Swal.fire({
      icon: 'error',
      title: 'Passwords do not match!',
    });
    return;
  } else {
    passwordError.style.display = "none";
  }

  const email = `${username}@ktu.edu.gh`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      email,
      indexNumber,
      username,
      role: "user",
      timestamp: serverTimestamp()
    });

    Swal.fire({
      icon: 'success',
      title: 'Registration Successful!',
      text: 'You will be redirected shortly...',
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2200);
  } catch (error) {
    console.error("Error creating user:", error.message);
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: error.message
    });
  }
});
