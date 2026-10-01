const courses_API = "https://6abd87975121d616d90ceedd.mockapi.io/api/courses";

const addCourseBtn = document.getElementById("add-course-btn");
const modalOverlay = document.getElementById("add-course-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const courseForm = document.getElementById("add-course-form");
const courseNameInput = document.getElementById("course-name");
const coursesContainer = document.getElementById("courses-container");

let courses = [];

const openModal = () => modalOverlay.classList.remove("hidden");

const closeModal = () => {
    modalOverlay.classList.add("hidden");
    courseForm.reset();
};

// Prevents user input from being injected as HTML
const escapeHTML = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

const renderCourses = () => {
    coursesContainer.innerHTML = "";

    courses.forEach((course) => {
        const card = document.createElement("div");
        card.classList.add("course-card");

        card.innerHTML = `
            <div class="card-header">
                <div class="course-icon"><i data-lucide="book"></i></div>
                <span class="badge badge-success">Active</span>
            </div>
            <h3>${escapeHTML(course.name)}</h3>
            <p class="instructor">Course ID: ${course.id}</p>

            <div class="progress-section">
                <div class="progress-labels">
                    <span>Progress</span>
                    <span>0%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 0%; background-color: var(--primary);"></div>
                </div>
            </div>
        `;

        coursesContainer.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
};

const fetchCoursesAPI = async () => {
    try {
        const response = await fetch(courses_API);
        const data = await response.json();

        courses = data.map((item) => ({
            id: item.id,
            name: item.title || item.name,
        }));
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
    renderCourses();
};

courseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameValue = courseNameInput.value.trim();
    if (nameValue === "") return;

    try {
        const response = await fetch(courses_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: nameValue }),
        });

        if (!response.ok) throw new Error(`Server responded with ${response.status}`);

        const savedCourse = await response.json(); // contains the new auto-incremented id

        courses.push({ id: savedCourse.id, name: savedCourse.title });
        renderCourses();
        closeModal();
    } catch (error) {
        console.error("Error adding course to API:", error);
        alert("Could not add the course. Please try again.");
    }
});

addCourseBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal();
});

fetchCoursesAPI();