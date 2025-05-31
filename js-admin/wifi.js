import { db } from '../js/firebase.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM elements
const form = document.querySelector('.wifi-form');
const locationInput = document.getElementById('wifi-location');
const nameInput = document.getElementById('wifi-name');
const passwordInput = document.getElementById('wifi-password');
const table = document.querySelector('.wifi-table tbody');
const button = form.querySelector('button');
const loader = document.getElementById('loader');
const notification = document.getElementById('notification');

let editId = null;

// Show/hide loader
function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none';
}

// Show notification
function notify(msg, isError = false) {
  notification.textContent = msg;
  notification.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
  notification.style.display = 'block';
  setTimeout(() => notification.style.display = 'none', 3000);
}

// Load all WiFi entries
async function loadWiFi() {
  showLoader();
  try {
    const q = query(collection(db, 'wifiPasswords'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    table.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = table.insertRow();
      row.setAttribute('data-id', docSnap.id);
      row.innerHTML = `
        <td>${data.location}</td>
        <td>${data.name}</td>
        <td>${data.password}</td>
        <td>${data.updatedAt?.toDate().toLocaleDateString() || ''}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
    });
  } catch (error) {
    console.error("Error loading WiFi data:", error);
    notify("Error loading data", true);
  }
  hideLoader();
}

// Handle form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  const name = nameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!location || !name || !password) return;

  showLoader();

  try {
    if (editId) {
      const docRef = doc(db, 'wifiPasswords', editId);
      await updateDoc(docRef, {
        location,
        name,
        password,
        updatedAt: serverTimestamp()
      });
      notify("WiFi updated");
      button.innerHTML = `<i class='bx bx-plus'></i> Add WiFi`;
      editId = null;
    } else {
      await addDoc(collection(db, 'wifiPasswords'), {
        location,
        name,
        password,
        updatedAt: serverTimestamp()
      });
      notify("WiFi added");
    }

    form.reset();
    await loadWiFi(); // Wait for data to load before hiding loader
  } catch (error) {
    console.error("Error saving WiFi:", error);
    notify("Error saving WiFi", true);
    hideLoader(); // Ensure loader is hidden on error
  }
});

// Handle Edit/Delete buttons
table.addEventListener('click', async (e) => {
  const row = e.target.closest('tr');
  const id = row.getAttribute('data-id');

  if (e.target.classList.contains('edit-btn')) {
    locationInput.value = row.cells[0].textContent;
    nameInput.value = row.cells[1].textContent;
    passwordInput.value = row.cells[2].textContent;
    button.textContent = "Update WiFi";
    editId = id;
  }

  if (e.target.classList.contains('delete-btn')) {
    if (confirm("Delete this WiFi entry?")) {
      showLoader();
      try {
        await deleteDoc(doc(db, 'wifiPasswords', id));
        notify("WiFi deleted");
        await loadWiFi(); // Wait before hiding loader
      } catch (err) {
        console.error("Error deleting WiFi:", err);
        notify("Error deleting WiFi", true);
        hideLoader(); // Ensure loader hides on error
      }
    }
  }
});

// Initial load
loadWiFi();
