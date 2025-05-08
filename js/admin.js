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
