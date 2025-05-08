// auth.js
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Register new user
export const registerUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("User registered successfully!");
  } catch (error) {
    alert(error.message);
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("User logged in successfully!");
  } catch (error) {
    alert(error.message);
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    alert("User logged out successfully!");
  } catch (error) {
    alert(error.message);
  }
};
