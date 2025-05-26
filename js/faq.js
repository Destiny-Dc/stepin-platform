// faq.js
import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const questionForm = document.getElementById("questionForm");
const faqItems = document.getElementById("faqItems");

questionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const question = document.getElementById("question").value.trim();

  if (!name || !email || !question) return;

  try {
    await addDoc(collection(db, "submitted_questions"), {
      name,
      email,
      question,
      answered: false,
      timestamp: new Date()
    });

    alert("Thank you! Your question has been submitted.");
    questionForm.reset();
  } catch (error) {
    console.error("Error submitting question:", error);
    alert("Error submitting your question.");
  }
});

// ✅ Load answered FAQs only
async function loadFAQs() {
  const faqItems = document.getElementById("faqItems");
  if (!faqItems) {
    console.error("faqItems div not found");
    return;
  }

  const q = query(collection(db, "submitted_questions"), where("answered", "==", true));

  try {
    const snapshot = await getDocs(q);
    console.log("Fetched FAQs:", snapshot.docs.length);

    faqItems.innerHTML = "";

    if (snapshot.empty) {
      faqItems.innerHTML = "<p>No answered questions yet.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("FAQ data:", data);

      const faqCard = document.createElement("div");
      faqCard.className = "faq-card";
      faqCard.innerHTML = `
        <h3>${data.question}</h3>
        <p><strong>Answer:</strong> ${data.answer || "Answer coming soon."}</p>
      `;
      faqItems.appendChild(faqCard);
    });
  } catch (err) {
    console.error("Error loading FAQs:", err);
  }
}

// 🔄 Trigger on page load
window.onload = loadFAQs;


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