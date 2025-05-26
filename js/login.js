import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const loginForm = document.getElementById("loginForm");
const loaderOverlay = document.getElementById("loaderOverlay");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loaderOverlay.style.display = "flex";

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    Swal.fire({
      icon: 'success',
      title: 'Login Successful!',
      text: 'Welcome back 👋',
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = "/html/homepage.html";
    }, 2200);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: error.message
    });
  } finally {
    loaderOverlay.style.display = "none";
  }
});
