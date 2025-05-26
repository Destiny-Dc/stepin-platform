import { db } from './firebase.js';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const testimonialContainer = document.querySelector('.testimonial-slider');
  const popup = document.getElementById("testimonialPopup");
  const openBtn = document.getElementById("openTestimonialForm");
  const closeBtn = document.getElementById("closeTestimonialForm");
  const submitBtn = document.getElementById("submitTestimonial");

  let current = 0;
  let intervalId;

  function startTestimonialSlider() {
    if (intervalId) clearInterval(intervalId);
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length === 0) return;

    testimonials.forEach(t => t.classList.remove('active'));
    current = 0;
    testimonials[current].classList.add('active');

    intervalId = setInterval(() => {
      testimonials[current].classList.remove('active');
      current = (current + 1) % testimonials.length;
      testimonials[current].classList.add('active');
    }, 3000);
  }

  async function loadTestimonials() {
    try {
      const testimonialRef = query(collection(db, "testimonials"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(testimonialRef);
      console.log("Loaded testimonials:", querySnapshot.size);

      testimonialContainer.innerHTML = "";
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        const testimonialDiv = document.createElement('div');
        testimonialDiv.classList.add('testimonial');
        if (index === 0) testimonialDiv.classList.add('active');

        const postedTime = data.timestamp?.toDate().toLocaleString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) || "Just now";

        testimonialDiv.innerHTML = `
          <p>"${data.message}"</p>
          <h4>- ${data.name}, ${data.department}</h4>
          <span class="testimonial-time" style="float: right; font-size: 0.8rem;">${postedTime}</span>
        `;
        testimonialContainer.appendChild(testimonialDiv);
      });

      startTestimonialSlider();
    } catch (err) {
      console.error("Error loading testimonials:", err);
    }
  }

  loadTestimonials();

  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          document.getElementById("testimonialName").value = `${userData.firstName} ${userData.lastName}`;
          document.getElementById("testimonialDept").value = userData.department;

          document.getElementById("testimonialName").disabled = true;
          document.getElementById("testimonialDept").disabled = true;
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    }
  });

  // Popup controls
  openBtn.addEventListener("click", () => {
    popup.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Submit testimonial
  submitBtn.addEventListener("click", async () => {
    const name = document.getElementById("testimonialName").value.trim();
    const department = document.getElementById("testimonialDept").value.trim();
    const message = document.getElementById("testimonialMessage").value.trim();

    if (!name || !department || !message) {
      return showNotification("Please fill in all fields.", "error");
    }

    try {
      await addDoc(collection(db, "testimonials"), {
        name,
        department,
        message,
        timestamp: serverTimestamp()
      });
      showNotification("Thanks for sharing your experience!", "success");
      popup.style.display = "none";
      document.getElementById("testimonialMessage").value = "";
      loadTestimonials();
    } catch (error) {
      console.error("Failed to submit testimonial:", error);
      showNotification("Something went wrong. Please try again.", "error");
    }
  });
});

// Show notification popup
function showNotification(message, type = 'success') {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove("show");
    notification.classList.add("hidden");
  }, 3000);
}