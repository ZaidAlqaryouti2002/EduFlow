// auth.js

// This stores the teacher ID during the current session
const SESSION_KEY = "teacherId";

// Used to check if the email looks valid
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// PASSWORD
// ==========================================

// Convert the password into a SHA-256 hash
async function hashPassword(password) {
    const data = new TextEncoder().encode(password);

    const hash = await crypto.subtle.digest("SHA-256", data);

    const bytes = new Uint8Array(hash);

    let result = "";

    bytes.forEach(function (byte) {
        result += byte.toString(16).padStart(2, "0");
    });

    return result;
}

// ==========================================
// MESSAGE
// ==========================================

// Show an error or success message
function showMessage(message, type = "error") {
    const messageBox = document.getElementById("message");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;

    messageBox.className = "message " + type;
}

// ==========================================
// BUTTON
// ==========================================

// Disable button while waiting for the API
function setBusy(button, isBusy, normalText) {
    button.disabled = isBusy;

    if (isBusy) {
        button.textContent = "Please wait...";
    } else {
        button.textContent = normalText;
    }
}

// ==========================================
// COOKIES
// ==========================================

// Save a cookie
function setCookie(name, value, days = 30) {
    const date = new Date();

    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    const expires = date.toUTCString();

    document.cookie =
        name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
}

// Get a cookie
function getCookie(name) {
    const cookies = document.cookie.split("; ");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];

        if (cookie.startsWith(name + "=")) {
            const value = cookie.split("=")[1];

            return decodeURIComponent(value);
        }
    }

    return "";
}

// Delete a cookie
function deleteCookie(name) {
    setCookie(name, "", -1);
}

// ==========================================
// SESSION
// ==========================================

// Get the logged-in teacher ID
function getTeacherId() {
    return sessionStorage.getItem(SESSION_KEY);
}

// Make sure the teacher is logged in
function requireLogin() {
    const teacherId = getTeacherId();

    if (!teacherId) {
        location.replace("index.html");

        return null;
    }

    return teacherId;
}

// Logout
function logout() {
    sessionStorage.removeItem(SESSION_KEY);

    location.replace("Login.html");
}

// ==========================================
// REGISTER
// ==========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        // Stop the page from refreshing
        event.preventDefault();

        // Get values from the form
        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email").value.trim().toLowerCase();

        const department = document.getElementById("department").value.trim();

        const password = document.getElementById("password").value;

        const confirmPassword = document.getElementById("confirmPassword").value;

        // Get the Register button
        const button = registerForm.querySelector('button[type="submit"]');

        // -------------------------
        // Validation
        // -------------------------

        if (name.length < 2) {
            showMessage("Please enter your full name.");

            return;
        }

        if (!EMAIL_PATTERN.test(email)) {
            showMessage("Please enter a valid email.");

            return;
        }

        if (!department) {
            showMessage("Please enter your department.");

            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.");

            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");

            return;
        }

        // Disable button while creating account
        setBusy(button, true);

        try {
            // Check if email already exists
            const existingTeacher = await TeachersApi.findByEmail(email);

            if (existingTeacher) {
                throw new Error("This email is already registered.");
            }

            // Hash the password
            const passwordHash = await hashPassword(password);

            // Create teacher
            await TeachersApi.create({
                name: name,

                email: email,

                department: department,

                passwordHash: passwordHash,

                createdAt: new Date().toISOString(),
            });

            // Show message after redirect
            sessionStorage.setItem("flash", "Account created. Please sign in.");

            // Go to login page
            location.href = "Login.html";
        } catch (error) {
            showMessage(error.message);

            // Enable button again
            setBusy(button, false, "Register");
        }
    });
}

// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    // If already logged in, go to dashboard
    if (getTeacherId()) {
        location.replace("dashboard.html");
    }

    // Get inputs
    const emailInput = document.getElementById("email");

    const rememberInput = document.getElementById("rememberMe");

    // Load saved email from cookie
    const savedEmail = getCookie("edutrack_remember");

    emailInput.value = savedEmail;

    // Check Remember Me if email exists
    if (savedEmail) {
        rememberInput.checked = true;
    } else {
        rememberInput.checked = false;
    }

    // Get message from registration
    const flashMessage = sessionStorage.getItem("flash");

    if (flashMessage) {
        showMessage(flashMessage, "success");

        sessionStorage.removeItem("flash");
    }

    // -------------------------
    // Login form
    // -------------------------

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get values
        const email = emailInput.value.trim().toLowerCase();

        const password = document.getElementById("password").value;

        // Get Sign In button
        const button = loginForm.querySelector('button[type="submit"]');

        // -------------------------
        // Validation
        // -------------------------

        if (!EMAIL_PATTERN.test(email)) {
            showMessage("Please enter a valid email.");

            return;
        }

        if (!password) {
            showMessage("Please enter your password.");

            return;
        }

        // Disable button
        setBusy(button, true);

        try {
            // Find teacher by email
            const teacher = await TeachersApi.findByEmail(email);

            // Hash entered password
            const passwordHash = await hashPassword(password);

            // Check email and password
            if (!teacher || teacher.passwordHash !== passwordHash) {
                throw new Error("Invalid email or password.");
            }

            // Save teacher ID in sessionStorage
            sessionStorage.setItem(SESSION_KEY, teacher.id);

            // Remember email if checkbox is checked
            if (rememberInput.checked) {
                setCookie("edutrack_remember", email);
            } else {
                deleteCookie("edutrack_remember");
            }

            // Go to dashboard
            location.href = "dashboard.html";
        } catch (error) {
            showMessage(error.message);

            // Clear password
            document.getElementById("password").value = "";

            // Enable button again
            setBusy(button, false, "Sign In");
        }
    });
}
