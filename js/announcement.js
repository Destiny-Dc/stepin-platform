// announcements.js

import { db } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.announcement-list');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const searchBar = document.getElementById('searchBar');
  const categoryFilter = document.querySelector('.filter-bar select');

  let announcementsData = [];

  function showLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
  }

  function hideLoading() {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }

  async function loadAnnouncements() {
    showLoading();
    list.innerHTML = '';
    try {
      const q = query(collection(db, 'announcements'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      announcementsData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      filterAndDisplay();
    } catch (error) {
      console.error('Error loading announcements:', error);
      list.innerHTML = '<p>Something went wrong while loading announcements.</p>';
    } finally {
      hideLoading();
    }
  }

  function filterAndDisplay() {
    const searchTerm = searchBar.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    list.innerHTML = '';

    const filtered = announcementsData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<p>No matching announcements found.</p>';
      return;
    }

    filtered.forEach(item => {
      const date = item.timestamp?.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) || 'Unknown Date';

      const card = document.createElement('div');
      card.classList.add('announcement-card');
      card.innerHTML = `
        <h2>${item.title}</h2>
        <p>${item.content}</p>
        <span class="date">${date}</span>
      `;
      list.appendChild(card);
    });
  }

  // Event listeners
  searchBar.addEventListener('input', filterAndDisplay);
  categoryFilter.addEventListener('change', filterAndDisplay);

  loadAnnouncements();
});
