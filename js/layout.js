// ---------- Authentication ----------
const teacherId = requireLogin();

const layoutScript = document.currentScript;
const SIDEBAR_URL = new URL("../pages/sidebar.html", layoutScript.src);
const TOPBAR_URL = new URL("../pages/topbar.html", layoutScript.src);

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

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

function initializeTheme() {
    const themeToggle = document.querySelector(".theme-toggle");

    themeToggle.addEventListener("click", () => {
        const nextTheme =
            document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
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

// ---------- Breadcrumb ----------
function initializeBreadcrumb() {
    const breadcrumb = document.querySelector(".breadcrumb");

    if (!breadcrumb) return;

    const currentPage = getCurrentPage();

    console.log(currentPage);

    const pageNames = {
        dashboard: "Dashboard",
        students: "Students",
        "student-details": "Student Details",
        courses: "Courses",
        assignments: "Assignments",
        progress: "Progress",
        reports: "Reports",
        profile: "Profile",
        settings: "Settings",
    };

    const pageName = pageNames[currentPage] || currentPage;

    // Dashboard
    if (currentPage === "dashboard") {
        breadcrumb.innerHTML = `
            <span class="breadcrumb-current">
                Dashboard
            </span>
        `;

        return;
    }

    // Other pages
    breadcrumb.innerHTML = `
        <a href="dashboard.html">Dashboard</a>

        <span class="breadcrumb-separator">/</span>

        <span class="breadcrumb-current">
            ${pageName}
        </span>
    `;
}

// ---------- Load the shared components ----------
async function fetchComponent(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not load ${url} (status ${response.status})`);
    }

    return response.text();
}

async function loadTopbarData() {
    const teacher = await TeachersApi.get(teacherId);

    const avatarElement = document.querySelector(".topbar .avatar");
    const userNameElement = document.querySelector(".topbar .user-name");
    const logoutButton = document.querySelector(".topbar .logout-button");

    if (avatarElement) {
        if (teacher.name.split(" ").length < 2) {
            avatarElement.textContent = teacher.name[0].toUpperCase();
        } else {
            avatarElement.textContent = `${teacher.name.split(" ")[0][0].toUpperCase()}${teacher.name.split(" ")[1][0].toUpperCase()}`;
        }
    }

    if (userNameElement) {
        userNameElement.textContent = teacher.name;
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault();
            logout();
        });
    }
}

async function loadLayout() {
    const sidebarContainer = document.getElementById("sidebar-container");
    const topbarContainer = document.getElementById("topbar-container");

    if (!sidebarContainer || !topbarContainer) {
        console.error(
            'layout.js needs <div id="sidebar-container"> and <div id="topbar-container"> on the page.',
        );
        return;
    }

    try {
        const [sidebarHTML, topbarHTML] = await Promise.all([
            fetchComponent(SIDEBAR_URL),
            fetchComponent(TOPBAR_URL),
        ]);
        sidebarContainer.innerHTML = sidebarHTML;
        topbarContainer.innerHTML = topbarHTML;

        // ---------- Dropdown Menu ----------
        const dropdownMenus = document.querySelectorAll(".dropdown-menu");

        dropdownMenus.forEach((dropdownMenu) => {
            const trigger = dropdownMenu.querySelector(".dropdown-menu-trigger");

            if (!trigger) return;

            trigger.addEventListener("click", () => {
                if (!dropdownMenu.hasAttribute("data-open")) {
                    dropdownMenu.setAttribute("data-open", "open");
                } else {
                    dropdownMenu.removeAttribute("data-open");
                }
            });
        });

        document.addEventListener("click", (event) => {
            dropdownMenus.forEach((dropdownMenu) => {
                if (!dropdownMenu.contains(event.target)) {
                    dropdownMenu.removeAttribute("data-open");
                }
            });
        });

        // Only now do the Sidebar/Topbar elements exist in the DOM
        initializeSidebar();
        initializeTheme();
        setActiveNavigation();
        initializeBreadcrumb();
    } catch (error) {
        console.error(error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        loadLayout();
        loadTopbarData();
    });
} else {
    loadLayout();
    loadTopbarData();
}
