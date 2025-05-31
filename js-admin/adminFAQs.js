import { db } from '../js/firebase.js';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const questionsList = document.getElementById("submittedQuestionsList");
const answerModal = document.getElementById("answerModal");
const closeAnswerModal = document.getElementById("closeAnswerModal");
const answerForm = document.getElementById("answerForm");
const answerText = document.getElementById("answerText");

let currentFaqId = null; // Track which FAQ is being answered

// Load only unanswered questions
async function loadUnansweredQuestions() {
  questionsList.innerHTML = "<p>Loading...</p>";

  const q = query(collection(db, "faqs"), where("answer", "==", ""));
  const snapshot = await getDocs(q);
  questionsList.innerHTML = "";

  if (snapshot.empty) {
    questionsList.innerHTML = "<p>No unanswered questions at the moment.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const faqDiv = document.createElement("div");
    faqDiv.className = "faq-card";
    faqDiv.innerHTML = `
      <div class="faq-header">
        <img src="/assets/user.png" alt="Profile" class="profile-pic">
        <div>
          <p><strong>${data.name}</strong> (${data.email})</p>
          <p class="question-text">${data.question}</p>
          <p class="timestamp">${new Date(data.timestamp?.toDate()).toLocaleString()}</p>
        </div>
      </div>
      <div class="faq-actions">
        <button class="answer-btn" data-id="${docSnap.id}"><i class='bx bx-edit'></i> Answer</button>
        <button class="delete-btn" data-id="${docSnap.id}"><i class='bx bx-trash'></i> Delete</button>
      </div>
    `;
    questionsList.appendChild(faqDiv);
  });

  // Add listeners to buttons
  document.querySelectorAll(".answer-btn").forEach(btn =>
    btn.addEventListener("click", () => openAnswerModal(btn.dataset.id))
  );
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => confirmDeleteFaq(btn.dataset.id))
  );
}

loadUnansweredQuestions();

// Open answer modal
function openAnswerModal(faqId) {
  currentFaqId = faqId;
  answerText.value = "";
  answerModal.classList.add("show");
}

// Close modal
closeAnswerModal.addEventListener("click", () => {
  answerModal.classList.remove("show");
});

// Submit answer
answerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentFaqId) return;

  try {
    await updateDoc(doc(db, "faqs", currentFaqId), {
      answer: answerText.value.trim()
    });
    answerModal.classList.remove("show");
    loadUnansweredQuestions();
  } catch (err) {
    console.error("Error updating answer:", err);
  }
});

// Confirm delete
function confirmDeleteFaq(faqId) {
  const confirmed = confirm("Are you sure you want to delete this question?");
  if (!confirmed) return;

  deleteDoc(doc(db, "faqs", faqId))
    .then(() => {
      alert("Question deleted successfully.");
      loadUnansweredQuestions();
    })
    .catch(err => {
      console.error("Error deleting FAQ:", err);
      alert("Error deleting FAQ. Try again.");
    });
}
