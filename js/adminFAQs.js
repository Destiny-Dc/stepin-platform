import { db } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const faqForm = document.querySelector('.faq-form');
const faqList = document.querySelector('.faq-list');

// // ========== ADD FAQ ==========
// faqForm.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const question = faqForm.querySelector('input').value.trim();
//   const answer = faqForm.querySelector('textarea').value.trim();

//   if (!question || !answer) return;

//   try {
//     await addDoc(collection(db, 'faqs'), { question, answer });
//     faqForm.reset();
//     loadFAQs();
//   } catch (err) {
//     console.error("Error adding FAQ:", err);
//   }
// });

// // ========== LOAD FAQs ==========
// async function loadFAQs() {
//   faqList.innerHTML = '';
//   const snapshot = await getDocs(collection(db, 'faqs'));

//   snapshot.forEach(docSnap => {
//     const data = docSnap.data();
//     const id = docSnap.id;

//     const card = document.createElement('div');
//     card.className = 'faq-card';
//     card.dataset.id = id;

//     card.innerHTML = `
//       <h3>${data.question}</h3>
//       <p>${data.answer}</p>
//       <div class="faq-actions">
//         <button class="edit-btn" data-id="${id}"><i class='bx bxs-edit'></i> Edit</button>
//         <button class="delete-btn" data-id="${id}"><i class='bx bxs-trash'></i> Delete</button>
//       </div>
//     `;

//     faqList.appendChild(card);
//   });
// }
// window.addEventListener('DOMContentLoaded', loadFAQs);

// ========== DELETE FAQ ==========
const deleteFaqModal = document.getElementById('deleteFaqModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const closeDeleteModal = document.getElementById('closeDeleteModal');

let deleteTargetId = null;

document.addEventListener('click', (e) => {
  if (e.target.closest('.delete-btn')) {
    const btn = e.target.closest('.delete-btn');
    deleteTargetId = btn.dataset.id;
    deleteFaqModal.style.display = 'block';
  }
});

confirmDeleteBtn.addEventListener('click', async () => {
  if (deleteTargetId) {
    await deleteDoc(doc(db, 'faqs', deleteTargetId));
    deleteFaqModal.style.display = 'none';
    deleteTargetId = null;
    loadFAQs();
  }
});

cancelDeleteBtn.onclick = () => deleteFaqModal.style.display = 'none';
closeDeleteModal.onclick = () => deleteFaqModal.style.display = 'none';

// ========== EDIT FAQ ==========
const editFaqModal = document.getElementById('editFaqModal');
const closeEditModal = document.getElementById('closeEditModal');
const editFaqForm = document.getElementById('editFaqForm');
const editQuestionInput = document.getElementById('editQuestion');
const editAnswerTextarea = document.getElementById('editAnswer');

let editTargetId = null;

document.addEventListener('click', (e) => {
  if (e.target.closest('.edit-btn')) {
    const btn = e.target.closest('.edit-btn');
    const card = btn.closest('.faq-card');
    const question = card.querySelector('h3').innerText;
    const answer = card.querySelector('p').innerText;

    editQuestionInput.value = question;
    editAnswerTextarea.value = answer;
    editTargetId = btn.dataset.id;

    editFaqModal.style.display = 'block';
  }
});

editFaqForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newQ = editQuestionInput.value.trim();
  const newA = editAnswerTextarea.value.trim();

  if (!editTargetId || !newQ || !newA) return;

  await updateDoc(doc(db, 'faqs', editTargetId), {
    question: newQ,
    answer: newA,
  });

  editFaqModal.style.display = 'none';
  editTargetId = null;
  loadFAQs();
});

closeEditModal.onclick = () => editFaqModal.style.display = 'none';

// ========== CLOSE MODALS ON OUTSIDE CLICK ==========
window.onclick = (e) => {
  if (e.target === editFaqModal) editFaqModal.style.display = 'none';
  if (e.target === deleteFaqModal) deleteFaqModal.style.display = 'none';
};

// Load submitted questions
async function loadSubmittedQuestions() {
  const list = document.getElementById("submittedQuestionsList");
  if (!list) return;

  const snapshot = await getDocs(collection(db, "submitted_questions"));
  list.innerHTML = "";

  snapshot.forEach((docRef) => {
    const data = docRef.data();
    const card = document.createElement("div");
    card.classList.add("submitted-question-card");
    card.innerHTML = `
      <h3>${data.question}</h3>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Status:</strong> ${data.answered ? "Answered" : "Pending"}</p>
      ${!data.answered ? `
        <textarea placeholder="Type answer here..." class="answer-box"></textarea>
        <button data-id="${docRef.id}" class="answer-btn">Submit Answer</button>
      ` : `<p><strong>Answer:</strong> ${data.answer}</p>`}
    `;
    list.appendChild(card);
  });
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("answer-btn")) {
    const id = e.target.getAttribute("data-id");
    const answer = e.target.previousElementSibling.value;

    if (!answer) return alert("Answer cannot be empty.");

    try {
      const docRef = doc(db, "submitted_questions", id);
      await updateDoc(docRef, {
        answer,
        answered: true
      });
      alert("Answer submitted successfully.");
      loadSubmittedQuestions();
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  }
});

window.onload = () => {
  loadFAQs();  // Existing function to load FAQ entries
  loadSubmittedQuestions(); // Load user questions too
};


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