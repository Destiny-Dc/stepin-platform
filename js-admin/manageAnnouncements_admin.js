import { db } from '../js/firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// DOM Elements
const form = document.querySelector('.announcement-form');
const titleInput = form.querySelector('input');
const contentInput = form.querySelector('textarea');
const categorySelect = form.querySelector('select');
const list = document.querySelector('.announcement-list');

const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editAnnouncementForm');
const editTitle = document.getElementById('editTitle');
const editContent = document.getElementById('editContent');
const closeModal = document.querySelector('.close-button');

const loadingIndicator = document.getElementById('loadingIndicator');

let currentEditId = null;

// Show loading spinner
function showLoading() {
  loadingIndicator.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
  loadingIndicator.style.display = 'none';
}

// Load announcements from Firestore and display them
async function loadAnnouncements() {
  showLoading();
  list.innerHTML = '';  // Clear the list before reloading
  try {
    // Get announcements ordered by createdAt descending
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    snapshot.forEach(docSnap => {
      const { title, content, createdAt } = docSnap.data();

      // Format the date nicely, fallback to 'Unknown Date'
      const date = createdAt?.toDate().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      }) || 'Unknown Date';

      // Create announcement card
      const card = document.createElement('div');
      card.classList.add('announcement-card');
      card.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
        <span class="date">Posted on: ${date}</span>
        <div class="card-buttons">
          <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
          <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading announcements:', err);
  } finally {
    hideLoading();
  }
}

// Handle adding new announcement
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return; // Prevent empty submissions

  showLoading();
  try {
    await addDoc(collection(db, 'announcements'), {
      title: titleInput.value,
      content: contentInput.value,
      category: categorySelect.value, 
      createdAt: serverTimestamp()
    });
    form.reset();
    loadAnnouncements();
  } catch (err) {
    console.error('Error adding announcement:', err);
  } finally {
    hideLoading();
  }
});

// Open the edit modal when Edit button is clicked
list.addEventListener('click', async (e) => {
  if (e.target.closest('.edit-btn')) {
    const id = e.target.closest('.edit-btn').dataset.id;
    showLoading();
    try {
      const docSnap = await getDoc(doc(db, 'announcements', id));
      const data = docSnap.data();
      currentEditId = id;
      editTitle.value = data.title;
      editContent.value = data.content;
      editModal.style.display = 'flex';
    } catch (err) {
      console.error('Error fetching announcement for edit:', err);
    } finally {
      hideLoading();
    }
  }
});

// Close edit modal
closeModal.addEventListener('click', () => {
  editModal.style.display = 'none';
});

// Save edited announcement
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentEditId) return;

  const newTitle = editTitle.value.trim();
  const newContent = editContent.value.trim();

  if (!newTitle || !newContent) return;

  showLoading();
  try {
    await updateDoc(doc(db, 'announcements', currentEditId), {
      title: newTitle,
      content: newContent,
      updatedAt: serverTimestamp()
    });
    editModal.style.display = 'none';
    loadAnnouncements();
  } catch (err) {
    console.error('Error updating announcement:', err);
  } finally {
    hideLoading();
  }
});

// Delete announcement when Delete button clicked, with confirmation
list.addEventListener('click', async (e) => {
  if (e.target.closest('.delete-btn')) {
    const id = e.target.closest('.delete-btn').dataset.id;
    if (confirm('Delete this announcement?')) {
      showLoading();
      try {
        await deleteDoc(doc(db, 'announcements', id));
        loadAnnouncements();
      } catch (err) {
        console.error('Error deleting announcement:', err);
      } finally {
        hideLoading();
      }
    }
  }
});

// Load announcements on page load
loadAnnouncements();
