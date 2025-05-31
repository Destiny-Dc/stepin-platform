// wifi.js

import { db } from './firebase.js';
import { collection, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loader = document.getElementById("loader");
const wifiTableBody = document.getElementById("wifi-table-body");
const menuIcon = document.getElementById("menu-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}

// Format Firestore Timestamp to readable string
function formatDate(timestamp) {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  async function loadWiFiData() {
    showLoader();
    wifiTableBody.innerHTML = "";
  
    try {
      const wifiCollection = collection(db, "wifiPasswords");
      const snapshot = await getDocs(wifiCollection);
  
      if (snapshot.empty) {
        wifiTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #777;">No WiFi networks found.</td></tr>`;
      } else {
        snapshot.forEach(doc => {
          const data = doc.data();
  
          const name = data.name || "N/A";
          const password = data.password || "N/A";
          const location = data.location || "N/A";
          const updatedAt = formatDate(data.updatedAt);
  
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${name}</td>
            <td>${password}</td>
            <td>${location}</td>
            <td>${updatedAt}</td>
          `;
          wifiTableBody.appendChild(row);
        });
      }
    } catch (error) {
      console.error("Error loading WiFi data:", error);
      wifiTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Failed to load WiFi networks.</td></tr>`;
    } finally {
      hideLoader();
    }
  }
menuIcon.addEventListener("click", () => {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

window.addEventListener("load", () => {
  loadWiFiData();
});
