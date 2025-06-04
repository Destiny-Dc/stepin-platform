// admin.js
import { db } from '../js/firebase.js';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Show loader initially
const loader = document.getElementById('loader');
if (loader) loader.style.display = 'flex';

const stats = [
  { collection: 'announcements', id: 'activeAnnouncements' },
  { collection: 'users', id: 'totalUsers' },
  { collection: 'faqs', id: 'totalFAQs' },
  { collection: 'lecturers', id: 'totalLecturers' },
  { collection: 'videos', id: 'totalVids' },
  { collection: 'wifiPasswords', id: 'totalWifi' }
];

let loadedCount = 0;
const checkIfAllLoaded = () => {
  loadedCount++;
  // Wait for all stats + quote + tasks to load (stats.length + 2)
  if (loadedCount >= stats.length + 2 && loader) {
    loader.style.display = 'none';
  }
};

const updateStat = (collectionName, elementId) => {
  const colRef = collection(db, collectionName);
  onSnapshot(colRef, (snapshot) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = snapshot.size;
    checkIfAllLoaded();
  }, (error) => {
    console.warn(`Error reading ${collectionName}:`, error);
    const el = document.getElementById(elementId);
    if (el) el.textContent = '—';
    checkIfAllLoaded();
  });
};

// Load stats counts
stats.forEach(({ collection, id }) => {
  try {
    updateStat(collection, id);
  } catch (err) {
    console.warn(`${collection} collection not found:`, err);
    const el = document.getElementById(id);
    if (el) el.textContent = '—';
    checkIfAllLoaded();
  }
});

// === Load Inspirational Quote ===
const loadInspirationalQuote = () => {
  const quoteEl = document.getElementById('quoteText');
  if (!quoteEl) {
    checkIfAllLoaded();
    return;
  }

  const q = query(collection(db, 'quotes'), orderBy('timestamp', 'desc'), limit(10));
  onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      // Pick a random quote from the latest 10
      const quotesArray = snapshot.docs.map(doc => doc.data().text).filter(Boolean);
      const randomIndex = Math.floor(Math.random() * quotesArray.length);
      const randomQuote = quotesArray[randomIndex] || 'Stay motivated and do great things!';
      quoteEl.textContent = `💡 "${randomQuote}"`;
    } else {
      quoteEl.textContent = '"Stay motivated and do great things!"';
    }
    checkIfAllLoaded();
  }, (err) => {
    console.warn('Failed to load quote:', err);
    quoteEl.textContent = '"Could not load inspiration."';
    checkIfAllLoaded();
  });
};

// === Load Pending Tasks from faqQuestions ===
// const loadPendingTasks = () => {
//   const taskListEl = document.getElementById('pendingTasks');
//   if (!taskListEl) {
//     checkIfAllLoaded();
//     return;
//   }

//   const q = query(collection(db, 'faqQuestions'), orderBy('timestamp', 'desc'));
//   onSnapshot(q, (snapshot) => {
//     // Filter FAQs that are unanswered
//     const pendingFAQs = snapshot.docs.filter(doc => !doc.data().answered);

//     if (pendingFAQs.length === 0) {
//       taskListEl.textContent = 'No pending tasks 🎉';
//     } else {
//       taskListEl.textContent = `You have ${pendingFAQs.length} pending task${pendingFAQs.length > 1 ? 's' : ''}`;
//     }

//     checkIfAllLoaded();
//   }, (err) => {
//     console.warn('Failed to load FAQ questions:', err);
//     taskListEl.textContent = 'Could not load pending tasks.';
//     checkIfAllLoaded();
//   });
// };

const loadPendingTasks = () => {
  const taskListEl = document.getElementById('pendingTasks');
  if (!taskListEl) {
    checkIfAllLoaded();
    return;
  }

  const q = query(collection(db, 'faqQuestions'), orderBy('timestamp', 'desc'));
  onSnapshot(q, (snapshot) => {
    const pendingFAQs = snapshot.docs.filter(doc => !doc.data().answered);

    let alertClass = 'alert-info';
    let message = '';
    let icon = 'ℹ️'; // default icon

    if (pendingFAQs.length === 0) {
      message = 'No pending tasks 🎉';
      alertClass = 'alert-success';
      icon = '✅';
    } else {
      message = `You have ${pendingFAQs.length} pending task${pendingFAQs.length > 1 ? 's' : ''}`;
      alertClass = 'alert-warning';
      icon = '⚠️';
    }

    taskListEl.innerHTML = `
      <div class="alert ${alertClass}">
        <span class="alert-icon">${icon}</span>
        <span class="alert-message">${message}</span>
        <span class="alert-close" onclick="this.parentElement.remove()">×</span>
      </div>
    `;
    checkIfAllLoaded();
  }, (err) => {
    console.warn('Failed to load FAQ questions:', err);
    taskListEl.innerHTML = `
      <div class="alert alert-danger">
        <span class="alert-icon">❌</span>
        <span class="alert-message">Could not load pending tasks.</span>
        <span class="alert-close" onclick="this.parentElement.remove()">×</span>
      </div>
    `;
    checkIfAllLoaded();
  });
};


// === Update Recent Activity Widget ===
const updateRecentActivity = () => {
  const activityList = document.querySelector('.widget-card ul');
  if (!activityList) return;

  const activityItems = [];

  const formatSmartTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const isToday = now.toDateString() === time.toDateString();

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (isToday) {
      return `Today at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${time.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const pushActivity = (text, timestamp) => {
    activityItems.push({ text, time: timestamp });
    renderActivities();
  };

  const renderActivities = () => {
    const sorted = activityItems.sort((a, b) => b.time - a.time).slice(0, 5);
    activityList.innerHTML = '';
    sorted.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.text} – ${formatSmartTime(item.time)}`;
      activityList.appendChild(li);
    });
  };

  const setupListener = (colName, label) => {
    const q = query(collection(db, colName), orderBy('timestamp', 'desc'), limit(5));
    onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const title = data.title || data.name || 'Untitled';
        const ts = data.timestamp?.toDate?.() || new Date(0);
        pushActivity(`${label} - ${title}`, ts.getTime());
      });
      checkIfAllLoaded();
    }, (err) => {
      console.warn(`Failed to load ${colName}:`, err);
      checkIfAllLoaded();
    });
  };

  // Listen for recent updates in these collections
  setupListener('users', 'New user');
  setupListener('faqs', 'FAQ updated');
  setupListener('announcements', 'Announcement posted');
  setupListener('lecturers', 'New lecturer added');
  setupListener('testimonials', 'New testimonial added');
  setupListener('wifiPasswords', 'New wifi detail posted');
};

// Initialize all
loadInspirationalQuote();
loadPendingTasks();
updateRecentActivity();
