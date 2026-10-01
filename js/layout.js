// =========================================================
// EduFlow shared layout: loads the Sidebar + Topbar into the
// page, then runs the drawer, theme and active-link logic.
// Link this file in the <head> of every page, AFTER the CSS.
// =========================================================

// Build the component URLs from this script's own location, so they
// work from any page folder: js/layout.js -> ../components/...
const layoutScript = document.currentScript;
const SIDEBAR_URL = new URL("/pages/sidebar.html", layoutScript.src);
const TOPBAR_URL = new URL("/pages/topbar.html", layoutScript.src);

// ---------- Theme (restored right away to avoid a light flash) ----------
function getSavedTheme() {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch (error) {
    return "light"; // storage unavailable
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Ignore: the theme still works for this visit, it just won't be remembered
  }
}

function updateThemeToggleLabel(theme) {
  const themeToggle = document.querySelector(".theme-toggle");
  if (!themeToggle) return; // the Topbar has not loaded yet
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeToggleLabel(theme);
}

function initializeTheme() {
  const themeToggle = document.querySelector(".theme-toggle");
  updateThemeToggleLabel(getSavedTheme());

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
}

applyTheme(getSavedTheme());

// ---------- Sidebar controls ----------
function initializeSidebar() {
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
}

// ---------- Active navigation link ----------
// The page name comes from <body data-page="..."> if present
// (e.g. student-details.html can set data-page="students"),
// otherwise from the file name (dashboard.html -> "dashboard").
function getCurrentPage() {
  if (document.body.dataset.page) return document.body.dataset.page;
  const fileName = window.location.pathname.split("/").pop();
  return fileName.replace(".html", "");
}

function setActiveNavigation() {
  const currentPage = getCurrentPage();

  document.querySelectorAll(".menu a[data-page]").forEach((link) => {
    const isActive = link.dataset.page === currentPage;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// ---------- Load the shared components ----------
async function fetchComponent(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url} (status ${response.status})`);
  }
  return response.text();
}

function showLayoutError() {
  const message = document.createElement("p");
  message.className = "layout-error";
  message.textContent = "Could not load the navigation. Open this page through a local server (for example VS Code Live Server).";
  document.body.prepend(message);
}

async function loadLayout() {
  const sidebarContainer = document.getElementById("sidebar-container");
  const topbarContainer = document.getElementById("topbar-container");

  if (!sidebarContainer || !topbarContainer) {
    console.error('layout.js needs <div id="sidebar-container"> and <div id="topbar-container"> on the page.');
    return;
  }

  try {
    const [sidebarHTML, topbarHTML] = await Promise.all([
      fetchComponent(SIDEBAR_URL),
      fetchComponent(TOPBAR_URL),
    ]);

    sidebarContainer.innerHTML = sidebarHTML;
    topbarContainer.innerHTML = topbarHTML;

    // Only now do the Sidebar/Topbar elements exist in the DOM
    initializeSidebar();
    initializeTheme();
    setActiveNavigation();
  } catch (error) {
    console.error(error);
    showLayoutError();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadLayout);
} else {
  loadLayout();
}