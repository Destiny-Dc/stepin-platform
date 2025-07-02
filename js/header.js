function initDropdown() {
    const menuIcon = document.getElementById("menu-icon");
    const dropdownMenu = document.getElementById("dropdown-menu");
  
    if (!menuIcon || !dropdownMenu) return;
  
    menuIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });
  
    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && !menuIcon.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
      const menuIcon = document.getElementById("menu-icon");
      if (menuIcon) {
        initDropdown();
        observer.disconnect(); // done observing
      }
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
  