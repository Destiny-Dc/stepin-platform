import { 
    getAuth, 
    onAuthStateChanged 
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  
  import { 
    getFirestore, 
    doc, 
    getDoc, 
    collection, 
    addDoc, 
    serverTimestamp 
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
  
  const auth = getAuth();
  const db = getFirestore();
  
  const form = document.getElementById("testimonialForm");
  const input = document.getElementById("testimonialInput");
  const statusMessage = document.getElementById("statusMessage");
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Helper to update status messages consistently
  function updateStatus(message, color = "green") {
    statusMessage.textContent = message;
    statusMessage.style.color = color;
  }
  
  // Flag to prevent adding multiple listeners
  let listenerAdded = false;
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      updateStatus(""); // Clear any previous message
  
      if (!listenerAdded) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
  
          const testimonialText = input.value.trim();
  
          if (testimonialText === "") {
            updateStatus("Please enter a testimonial.", "red");
            return;
          }
  
          submitBtn.disabled = true; // Disable to prevent multiple submits
          updateStatus("Submitting your testimonial...", "blue");
  
          try {
            // Fetch user data from Firestore
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
  
            if (!userSnap.exists()) {
              updateStatus("User data not found. Please complete your profile.", "red");
              submitBtn.disabled = false;
              return;
            }
  
            const userData = userSnap.data();
  
            // Build testimonial object
            const testimonial = {
              uid: user.uid,
              name: userData.name || "Anonymous",
              department: userData.department || "Unknown Department",
              profilePic: userData.profilePic || "",  // Optional field
              message: testimonialText,
              timestamp: serverTimestamp()
            };
  
            // Add testimonial to Firestore
            await addDoc(collection(db, "testimonials"), testimonial);
  
            input.value = "";  // Clear form
            updateStatus("Thank you for your testimonial!", "green");
          } catch (error) {
            console.error("Error saving testimonial:", error);
            updateStatus("Error submitting testimonial. Please try again later.", "red");
          } finally {
            submitBtn.disabled = false; // Re-enable submit button
          }
        });
  
        listenerAdded = true;  // Mark listener as added
      }
  
    } else {
      // User is not logged in - disable form and show message
      updateStatus("You need to be logged in to submit a testimonial.", "red");
      form.querySelector('button[type="submit"]').disabled = true;
      input.disabled = true;
    }
  });
  


import { checkAuth } from "./js/auth-check.js";

checkAuth((user, userData) => {
  if (user) {
    console.log("Logged in user:", userData.name, user.email);
    // You can now safely use userData.name, department, etc.
  } else {
    // Redirect or show "Please log in" message
    window.location.href = "/html/login.html"; // Optional fallback
  }
});