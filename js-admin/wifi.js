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

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const form = document.querySelector('.wifi-form');
  const locationInput = document.getElementById('wifi-location');
  const nameInput = document.getElementById('wifi-name');
  const passwordInput = document.getElementById('wifi-password');
  const table = document.querySelector('.wifi-table tbody');
  const button = form.querySelector('button');
  const loader = document.getElementById('loader');
  const notification = document.getElementById('notification');

  // Modal elements
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editWifiForm');
  const modalLocation = document.getElementById('edit-location');
  const modalName = document.getElementById('edit-name');
  const modalPassword = document.getElementById('edit-password');
  const closeModalBtn = document.getElementById('closeModal');

  let currentEditId = null;

  function showLoader() {
    loader.style.display = 'flex';
  }

  function hideLoader() {
    loader.style.display = 'none';
  }

  function notify(msg, isError = false) {
    notification.textContent = msg;
    notification.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
    notification.style.display = 'flex';
    setTimeout(() => notification.style.display = 'none', 3000);
  }

  function openModal() {
    editModal.style.display = 'flex';
  }

  function closeModal() {
    editModal.style.display = 'none';
    editForm.reset();
    currentEditId = null;
  }

  closeModalBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal();
  });

  async function loadWiFi() {
    showLoader();
    try {
      const q = query(collection(db, 'wifiPasswords'), orderBy('timestamp', 'desc'));
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
          <td>${data.timestamp?.toDate().toLocaleDateString() || ''}</td>
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = locationInput.value.trim();
    const name = nameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!location || !name || !password) return;

    showLoader();

    try {
      await addDoc(collection(db, 'wifiPasswords'), {
        location,
        name,
        password,
        timestamp: serverTimestamp()
      });
      notify("WiFi added");
      form.reset();
      await loadWiFi();
    } catch (error) {
      console.error("Error saving WiFi:", error);
      notify("Error saving WiFi", true);
    }

    hideLoader();
  });

  table.addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    const id = row.getAttribute('data-id');

    if (e.target.classList.contains('edit-btn')) {
      currentEditId = id;
      modalLocation.value = row.cells[0].textContent;
      modalName.value = row.cells[1].textContent;
      modalPassword.value = row.cells[2].textContent;
      openModal();
    }

    if (e.target.classList.contains('delete-btn')) {
      if (confirm("Delete this WiFi entry?")) {
        showLoader();
        try {
          await deleteDoc(doc(db, 'wifiPasswords', id));
          notify("WiFi deleted");
          await loadWiFi();
        } catch (err) {
          console.error("Error deleting WiFi:", err);
          notify("Error deleting WiFi", true);
        }
        hideLoader();
      }
    }
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = modalLocation.value.trim();
    const name = modalName.value.trim();
    const password = modalPassword.value.trim();

    if (!location || !name || !password) return;

    if (!currentEditId) {
      notify("No WiFi selected for editing", true);
      return;
    }

    showLoader();

    try {
      const docRef = doc(db, 'wifiPasswords', currentEditId);
      await updateDoc(docRef, {
        location,
        name,
        password,
        timestamp: serverTimestamp()
      });
      notify("WiFi updated");
      await loadWiFi();
      closeModal();
    } catch (error) {
      console.error("Error updating WiFi:", error);
      notify("Error updating WiFi", true);
    }

    hideLoader();
  });

  loadWiFi();
});
