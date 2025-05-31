import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lecturersContainer = document.querySelector('.lecturers-grid');
const loader = document.getElementById('page-loader');

loader.style.display = 'flex';
async function loadLecturers() {
  try {
    const querySnapshot = await getDocs(collection(db, "lecturers"));

    lecturersContainer.innerHTML = ""; // Clear any hardcoded cards

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.role === "lecturer", "senior lecturer") {
        const fullName = `${capitalize(data.title)} ${capitalize(data.name)}`;
        const lecturerCard = document.createElement("div");
        lecturerCard.className = "lecturer-card";
        lecturerCard.innerHTML = `
          <img src="/images/profile.jpg" alt="Lecturer Photo" class="profile-pic">
          <h2>${fullName}</h2>
          <p class="role">${capitalize(data.role)}</p>
          <p class="department">${formatDepartment(data.department)}</p>
          <div class="contact-info">
            <a href="mailto:${data.email}" class="contact-btn"><i class='bx bx-envelope'></i> Email</a>
            <a href="tel:${formatPhone(data.phone)}" class="contact-btn"><i class='bx bx-phone'></i> Call</a>
          </div>
        `;
        lecturersContainer.appendChild(lecturerCard);
      }
    });

  } catch (error) {
    console.error("Failed to load lecturers:", error);
    lecturersContainer.innerHTML = `<p style="color: red;">Failed to load lecturers. Please try again later.</p>`;
  }finally{
    loader.style.display = 'none'; // Hide loader after data is loaded
  }
}

function capitalize(text) {
  if (!text) return "";
  return text
    .split(" ")
    .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
    .join(" ");
}

function formatDepartment(dept) {
  // You can expand this to full names if needed
  return dept.toUpperCase(); // or use a map to display proper department names
}

function formatPhone(phone) {
  return phone.replace(/\s+/g, ""); // removes spaces if any
}

export function showButtonLoader() {
  loader.style.display = 'flex';
}
export function hideButtonLoader() {
  loader.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadLecturers);
// Example: Show loader when a button is clicked
const exampleButton = document.getElementById('action'); // Use your actual button ID

if (exampleButton) {
  exampleButton.addEventListener('click', async () => {
    showButtonLoader();

    try {
      // Simulate an action like fetching or updating
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated 2s delay
      // You can replace this with real logic
    } catch (err) {
      console.error("Something went wrong", err);
    } finally {
      hideButtonLoader();
    }
  });
}
