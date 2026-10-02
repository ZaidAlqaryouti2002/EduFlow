// ---------- Sidebar controls ----------
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".sidebar-overlay");
const menuToggle = document.querySelector(".menu-toggle");
const closeButton = document.querySelector(".sidebar-close");
const desktopQuery = window.matchMedia("(min-width: 1025px)");

function openSidebar() {
  sidebar.classList.add("sidebar--open");
  overlay.classList.add("sidebar-overlay--visible");
  document.body.classList.add("no-scroll");
  menuToggle.setAttribute("aria-expanded", "true");
  closeButton.focus();
}

function closeSidebar() {
  sidebar.classList.remove("sidebar--open");
  overlay.classList.remove("sidebar-overlay--visible");
  document.body.classList.remove("no-scroll");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", openSidebar);
closeButton.addEventListener("click", () => {
  closeSidebar();
  menuToggle.focus();
});
overlay.addEventListener("click", closeSidebar);
sidebar.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeSidebar));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("sidebar--open")) {
    closeSidebar();
    menuToggle.focus();
  }
});

// Reset the drawer if the window is resized up to desktop size
desktopQuery.addEventListener("change", (event) => {
  if (event.matches) closeSidebar();
});

// ---------- Theme controls ----------
const themeToggle = document.querySelector(".theme-toggle");

function getSavedTheme() {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch (error) {
    return "light"; // storage unavailable (e.g. blocked by the browser)
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Ignore: the theme still works for this visit, it just won't be remembered
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  saveTheme(nextTheme);
});

applyTheme(getSavedTheme());