import { db, auth } from './firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById('questionForm');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popupMessage');
const loader = document.getElementById('loader');

// Show loader
const showLoader = () => loader.classList.remove("hidden");

// Hide loader
const hideLoader = () => loader.classList.add("hidden");

// Autofill user name and email
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = collection(db, "users");

    getDocs(query(userRef, where("uid", "==", uid)))
      .then(snapshot => {
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          document.getElementById("name").value = `${userData.firstName} ${userData.lastName}`;
          document.getElementById("email").value = user.email;
        }
      })
      .catch(err => console.error("Error fetching user data:", err));
  }
});

// Submit question
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const question = document.getElementById('question').value.trim();

  if (!name || !email || !question) return;

  showLoader();
  try {
    await addDoc(collection(db, "faqs"), {
      name,
      email,
      question,
      answer: "",
      timestamp: Timestamp.now()
    });
    popupMessage.textContent = "Your question has been submitted successfully!";
    form.reset();
    loadAnsweredFaqs(); // refresh after submission
  } catch (error) {
    popupMessage.textContent = "There was an error submitting your question. Please try again.";
    console.error(error);
  } finally {
    hideLoader();
    popup.classList.remove("hidden");
  }
});

// Load only answered FAQs
async function loadAnsweredFaqs() {
  const faqContainer = document.getElementById("faqItems");
  faqContainer.innerHTML = "";
  showLoader();

  try {
    const faqRef = collection(db, "faqs");
    const q = query(faqRef, where("answer", "!=", ""));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      faqContainer.innerHTML = "<p>No answered questions yet.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const faqDiv = document.createElement("div");
      faqDiv.className = "faq-item";
      faqDiv.innerHTML = `
        <h4>Q: ${data.question}</h4>
        <p><strong>A:</strong> ${data.answer}</p>
        <p class="faq-meta">Asked by ${data.name}</p>
      `;
      faqContainer.appendChild(faqDiv);
    });
  } catch (error) {
    console.error("Failed to load FAQs:", error);
    faqContainer.innerHTML = "<p>Failed to load FAQs.</p>";
  } finally {
    hideLoader();
  }
}

loadAnsweredFaqs();
