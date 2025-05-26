document.getElementById("profileBtn").addEventListener("click", function (e) {
  e.stopPropagation(); // Prevent click from bubbling
  const dropdown = document.getElementById("menuDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking outside
window.addEventListener("click", function () {
  const dropdown = document.getElementById("menuDropdown");
  dropdown.style.display = "none";
});


import { checkAuth } from "./js/auth-check.js";

checkAuth((user, userData) => {
  if (user) {
    console.log("Logged in user:", userData.name, user.email);
    // You can now safely use userData.name, department, etc.
  } else {
    // Redirect or show "Please log in" message
    window.location.href = "/html/login.html"; // Optional fallback
  }
});
