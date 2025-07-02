document.addEventListener("DOMContentLoaded", () => {
    const includes = document.querySelectorAll("[data-include]");
  
    includes.forEach(async (el) => {
      const file = el.getAttribute("data-include");
      if (file) {
        try {
          const res = await fetch(file);
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          const content = await res.text();
          el.innerHTML = content;
        } catch (err) {
          el.innerHTML = `<p style="color:red;">Error loading: ${file}</p>`;
          console.error(err);
        }
      }
    });
  });
  