import { db } from "../js/firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM Elements
const form = document.querySelector(".video-form");
const titleInput = form.querySelector('input[placeholder="Video Title"]');
const linkInput = form.querySelector('input[placeholder="YouTube Link"]');
const categoryInput = form.querySelector('input[placeholder="Category (e.g. Orientation, Interview)"]');
const descriptionInput = form.querySelector('textarea[placeholder="Video Description"]');
const videoList = document.querySelector(".video-list");
const frame = document.getElementById("videoFrame");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let allVideos = []; // store all videos for filtering

// Loader
function showLoader() { loader.style.display = "flex"; }
function hideLoader() { loader.style.display = "none"; }

// Popup
function showPopup(msg, success = true) {
  if (document.querySelector(".popup")) return;
  const popup = document.createElement("div");
  popup.textContent = msg;
  popup.className = `popup ${success ? "success" : "error"}`;
  Object.assign(popup.style, {
    position: "fixed", bottom: "20px", right: "20px", background: success ? "green" : "crimson",
    color: "#fff", padding: "10px 20px", borderRadius: "8px", zIndex: 10000, fontWeight: "bold",
    fontSize: "14px", opacity: "0", transition: "opacity 0.3s ease-in-out",
  });
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.style.opacity = "1");
  setTimeout(() => {
    popup.style.opacity = "0";
    popup.addEventListener("transitionend", () => popup.remove());
  }, 3000);
}

// Escape HTML
const escapeHTML = (str) => str.replace(/[&<>"']/g, c => ({
  '&': "&amp;", '<': "&lt;", '>': "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

// Extract YouTube ID
function extractVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
  return match ? match[1] : "";
}

// Update Preview
linkInput.addEventListener("input", () => {
  const videoId = extractVideoId(linkInput.value);
  frame.src = videoId ? `https://www.youtube.com/embed/${videoId}` : "";
});

// Add New Video
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const link = linkInput.value.trim();
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const videoId = extractVideoId(link);

  if (!title || !link || !description || !videoId) {
    showPopup("Fill in all fields with a valid link!", false);
    return;
  }

  showLoader();
  try {
    await addDoc(collection(db, "videos"), {
      title, link, category, description, uploadedAt: serverTimestamp(),
    });
    form.reset(); frame.src = ""; showPopup("Video uploaded!");
  } catch (err) {
    console.error(err); showPopup("Upload failed.", false);
  }
  hideLoader();
});

// Render Videos
function renderVideos(videos) {
  videoList.innerHTML = "";

  videos.forEach(({ id, data }) => {
    const videoId = extractVideoId(data.link);
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <h3>${escapeHTML(data.title)}</h3>
      <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      <p>${escapeHTML(data.description)}</p>
      <span class="category">Category: ${escapeHTML(data.category || "Uncategorized")}</span>
      <span class="upload-date">Uploaded: ${data.uploadedAt?.toDate?.().toLocaleDateString() || "Unknown"}</span>
      <div class="video-actions">
        <button class="edit-btn" data-id="${id}">Edit</button>
        <button class="delete-btn" data-id="${id}">Delete</button>
      </div>
    `;
    videoList.appendChild(card);
  });

  // Edit Button
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const video = allVideos.find(v => v.id === btn.dataset.id);
      if (video) {
        titleInput.value = video.data.title;
        linkInput.value = video.data.link;
        categoryInput.value = video.data.category;
        descriptionInput.value = video.data.description;
        frame.src = `https://www.youtube.com/embed/${extractVideoId(video.data.link)}`;

        form.onsubmit = async (e) => {
          e.preventDefault();
          try {
            await updateDoc(doc(db, "videos", btn.dataset.id), {
              title: titleInput.value.trim(),
              link: linkInput.value.trim(),
              category: categoryInput.value.trim(),
              description: descriptionInput.value.trim()
            });
            showPopup("Video updated!");
            form.reset(); frame.src = ""; form.onsubmit = defaultSubmit;
          } catch (err) {
            showPopup("Update failed", false);
          }
        };
      }
    });
  });

  // Delete Button
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await deleteDoc(doc(db, "videos", btn.dataset.id));
        showPopup("Video deleted.");
      } catch (err) {
        showPopup("Delete failed.", false);
      }
    });
  });
}

// Store original submit for reuse
const defaultSubmit = form.onsubmit;

// Load Videos
function loadVideos() {
  showLoader();
  onSnapshot(collection(db, "videos"), (snapshot) => {
    allVideos = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    applyFilters();
    hideLoader();
  });
}

// Filter Logic
function applyFilters() {
  const query = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const filtered = allVideos.filter(v =>
    v.data.title.toLowerCase().includes(query) &&
    (category === "" || v.data.category === category)
  );
  renderVideos(filtered);
}

// Filter Events
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

// Init
loadVideos();
