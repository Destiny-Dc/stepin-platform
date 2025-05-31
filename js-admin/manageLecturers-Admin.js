import { db } from "../js/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM Elements
const lecturerForm = document.querySelector(".lecturer-form");
const lecturerList = document.querySelector(".lecturers-list");
const loader = document.getElementById("loader");
const template = document.getElementById("lecturer-card-template");
const submitBtn = lecturerForm.querySelector("button");
const searchInput = document.getElementById("searchInput");

// Firestore collection reference
const lecturersRef = collection(db, "lecturers");

// State for edit mode
let editingId = null;

// Show loader with optional message
function showLoader(message = "Loading, please hang on tight") {
  loader.classList.remove("hidden");
  loader.setAttribute("aria-busy", "true");
  document.getElementById("loader-text").textContent = message;
}

// Hide loader
function hideLoader() {
  loader.classList.add("hidden");
  loader.setAttribute("aria-busy", "false");
}

// Simple toast (replace with better UI if needed)
function showToast(msg, type = "success") {
  alert(`${type.toUpperCase()}: ${msg}`);
}

// Format Firestore timestamp to readable date
function formatDate(timestamp) {
  try {
    return timestamp?.toDate().toDateString() || "Unknown";
  } catch {
    return "Unknown";
  }
}

// Create lecturer card element from data
function createLecturerCard(data, id) {
  const clone = template.content.cloneNode(true);
  clone.querySelector(".lecturer-name").textContent = `${data.title} ${data.name}`;
  clone.querySelector(".lecturer-department").textContent = data.department;
  clone.querySelector(".lecturer-title").textContent = data.title;
  clone.querySelector(".lecturer-role").textContent = data.role;
  clone.querySelector(".lecturer-phone").textContent = data.phone;
  clone.querySelector(".lecturer-email").textContent = data.email;
  clone.querySelector(".lecturer-bio").textContent = data.bio;
  clone.querySelector(".lecturer-date").textContent = formatDate(data.createdAt);

  clone.querySelector(".edit-btn").addEventListener("click", () => populateFormForEdit(data, id));
  clone.querySelector(".delete-btn").addEventListener("click", () => deleteLecturer(id));

  return clone;
}

// Load and display all lecturers
async function loadLecturers() {
  lecturerList.innerHTML = "";
  showLoader();
  try {
    const snapshot = await getDocs(lecturersRef);
    if (snapshot.empty) {
      lecturerList.textContent = "No lecturers found.";
      return;
    }
    snapshot.forEach(docSnap => {
      const card = createLecturerCard(docSnap.data(), docSnap.id);
      lecturerList.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading lecturers:", err);
    showToast("Failed to load lecturers", "error");
  } finally {
    hideLoader();
  }
}

// Add new lecturer
async function addLecturer(data) {
  try {
    await addDoc(lecturersRef, { ...data, createdAt: serverTimestamp() });
    showToast("Lecturer added successfully!");
    lecturerForm.reset();
    await loadLecturers();
  } catch (err) {
    console.error("Add failed:", err);
    showToast("Failed to add lecturer", "error");
  }
}

// Update existing lecturer
async function updateLecturer(id, data) {
  try {
    await updateDoc(doc(db, "lecturers", id), data);
    showToast("Lecturer updated!");
    lecturerForm.reset();
    editingId = null;
    submitBtn.innerHTML = "<i class='bx bx-user-plus'></i> Add Lecturer";
    await loadLecturers();
  } catch (err) {
    console.error("Update failed:", err);
    showToast("Update failed", "error");
  }
}

// Delete lecturer with confirmation
async function deleteLecturer(id) {
  if (!confirm("Are you sure you want to delete this lecturer?")) return;
  showLoader();
  try {
    await deleteDoc(doc(db, "lecturers", id));
    showToast("Lecturer deleted");
    await loadLecturers();
  } catch (err) {
    console.error("Delete failed:", err);
    showToast("Delete failed", "error");
  } finally {
    hideLoader();
  }
}

// Prefill form for editing a lecturer
function populateFormForEdit(data, id) {
  const inputs = lecturerForm.querySelectorAll("input, textarea");
  inputs[0].value = data.name;
  inputs[1].value = data.department;
  inputs[2].value = data.title;
  inputs[3].value = data.role;
  inputs[4].value = data.phone;
  inputs[5].value = data.email;
  inputs[6].value = data.bio;

  editingId = id;
  submitBtn.innerHTML = "<i class='bx bx-edit'></i> Update Lecturer";
  lecturerForm.scrollIntoView({ behavior: "smooth" });
}

// Form submit handler - add or update lecturer
lecturerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = lecturerForm.querySelectorAll("input, textarea");
  const values = [...inputs].map(i => i.value.trim());

  if (values.some(v => v === "")) {
    alert("Please fill in all fields.");
    return;
  }

  const [name, department, title, role, phone, email, bio] = values;
  const data = { name, department, title, role, phone, email, bio };

  showLoader();
  submitBtn.disabled = true;

  if (editingId) {
    await updateLecturer(editingId, data);
  } else {
    await addLecturer(data);
  }

  submitBtn.disabled = false;
  hideLoader();
});

// Search filter for lecturers list
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll(".lecturer-card").forEach(card => {
    const name = card.querySelector(".lecturer-name").textContent.toLowerCase();
    const department = card.querySelector(".lecturer-department").textContent.toLowerCase();
    const title = card.querySelector(".lecturer-title").textContent.toLowerCase();

    card.style.display = (name.includes(query) || department.includes(query) || title.includes(query)) ? "block" : "none";
  });
});

// Initial lecturers load
loadLecturers();
