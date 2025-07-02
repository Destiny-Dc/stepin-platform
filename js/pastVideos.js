// pastVideos.js

import { db } from "../js/firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const videoGrid = document.querySelector(".video-grid");

async function fetchVideos() {
  try {
    const videosRef = collection(db, "videos");
    const q = query(videosRef, orderBy("uploadedAt", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Convert YouTube watch URL to embed URL
      const watchUrl = data.link;
      const videoId = new URL(watchUrl).searchParams.get("v");
      const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

      const videoCard = document.createElement("div");
      videoCard.className = "video-card";

      videoCard.innerHTML = `
        <iframe src="${embedUrl}" title="${data.title}" allowfullscreen></iframe>
        <h4>${data.title}</h4>
        <p>${data.description}</p>
      `;

      videoGrid.appendChild(videoCard);
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
}

fetchVideos();
