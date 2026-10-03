const addCourseBtn = document.getElementById("add-course-btn");
const modalOverlay = document.getElementById("add-course-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const courseForm = document.getElementById("add-course-form");
const courseNameInput = document.getElementById("course-name");
const coursesContainer = document.getElementById("courses-container");

// Hydrate from localStorage to avoid a blank UI flash while the API loads
let assignments = [];
let courses = JSON.parse(localStorage.getItem("edutrack_courses")) || [];

const openModal = () => {
    modalOverlay.classList.remove("hidden");
};

const closeModal = () => {
    modalOverlay.classList.add("hidden");
    courseForm.reset();
};

const renderCourses = () => {
    coursesContainer.innerHTML = "";

    // TODO: The API currently doesn't map assignments to specific courses.
    // Hack: We're rendering a global progress average across all cards for now.
    let globalProgress = 0;
    if (assignments.length > 0) {
        const completed = assignments.filter(a => a.status === "completed").length;
        globalProgress = Math.round((completed / assignments.length) * 100);
    }

    courses.forEach((course) => {
        // TODO: Swap to this per-course logic once the backend includes `courseId` in the assignment payload
        /*
        let courseAssignments = assignments.filter(a => String(a.courseId) === String(course.id));
        let courseProgress = 0;
        if (courseAssignments.length > 0) {
            let comp = courseAssignments.filter(a => a.status === "completed").length;
            courseProgress = Math.round((comp / courseAssignments.length) * 100);
        }
        let currentProgress = courseProgress; 
        */
        
        let currentProgress = globalProgress; 

        const card = document.createElement("div");
        card.classList.add("course-card");

        // Note: Using innerHTML here is safe enough since we trust the mock API, 
        // but keep an eye on XSS if we start allowing un-sanitized user inputs for course names.
        card.innerHTML = `
            <div class="card-header">
                <div class="course-icon"><i data-lucide="book"></i></div>
                <span class="badge badge-success">Active</span>
            </div>
            <h3>${course.name}</h3>
            <p class="instructor">${course.code}</p>
            
            <div class="progress-section">
                <div class="progress-labels">
                    <span>Progress</span>
                    <span>${currentProgress}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${currentProgress}%; background-color: var(--primary); transition: width 0.5s ease;"></div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
                <button class="delete-course-btn" data-id="${course.id}" 
                 onmouseenter="this.querySelector('svg').style.transform='scale(1.25)'" 
                 onmouseleave="this.querySelector('svg').style.transform='scale(1)'"
                 style="background-color: rgba(239, 68, 68, 0.2); color: #ef4444; border: none; padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease;"
                 title="Delete Course">
                 <i data-lucide="trash-2" style="width: 16px; height: 16px; transition: transform 0.2s ease;"></i>
                س</button>
            </div>
        `;

        coursesContainer.appendChild(card);
    });

    // Re-initialize icons for the newly injected DOM nodes
    if (window.lucide) {
        lucide.createIcons();
    }
};

const courses_API = "https://6abd87975121d616d90ceedd.mockapi.io/api/courses";

const fetchCoursesAPI = async () => {
    // Fetch assignments independently. If it throws, we catch it silently so it doesn't nuke the whole course view.
    try {
        if (typeof AssignmentsApi !== "undefined") {
            assignments = await AssignmentsApi.listMine(teacherId);
        }
    } catch (err) {
        console.warn("Failed to fetch assignments, defaulting to 0% progress", err);
    }

    try {
        const response = await fetch(courses_API);
        const data = await response.json();

        // Normalize the payload. The mock API is inconsistent and sometimes sends `title` instead of `name`.
        const formattedData = data.map((item) => ({
            id: item.id,
            name: item.title || item.name,
            code: `Course ID: ${item.id}`,
        }));

        courses = formattedData;
        localStorage.setItem("edutrack_courses", JSON.stringify(courses));
        
        renderCourses();
    } catch (error) {
        console.error("Error loading courses:", error);
        // Graceful degradation: render stale cached data if the network drops
        renderCourses();
    }
};

courseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameValue = courseNameInput.value.trim();

    // Bail early on empty inputs
    if (nameValue === "") return;

    // Enforce unique names client-side to prevent UI clutter
    const isDuplicate = courses.some(
        (course) => course.name.toLowerCase() === nameValue.toLowerCase(),
    );

    if (isDuplicate) {
        alert("This course already exists. Cannot add a course with the same name!");
        return;
    }

    // Fix: Send 'name' instead of 'title', and attach the current teacher to the 'teacherIds' array
    const newCourseData = {
        name: nameValue,
        teacherIds: [String(teacherId)] 
    };

    try {
        const response = await fetch(courses_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newCourseData),
        });

        const savedCourse = await response.json();

        // Fix: Read 'name' directly from the saved API response
        const formattedNewCourse = {
            id: savedCourse.id,
            name: savedCourse.name,
            code: `Course ID: ${savedCourse.id}`
        };

        courses.push(formattedNewCourse);
        localStorage.setItem("edutrack_courses", JSON.stringify(courses));

        renderCourses();
        closeModal();
    } catch (error) {
        console.error("Error adding course to API:", error);
    }
});

// Event delegation: Attach listener to the parent container since course cards are dynamically destroyed/created
coursesContainer.addEventListener("click", async (event) => {
    const deleteBtn = event.target.closest(".delete-course-btn");

    if (deleteBtn) {
        const courseId = deleteBtn.getAttribute("data-id");

        const confirmDelete = confirm("Are you sure you want to delete this course?");
        if (!confirmDelete) return;

        // Lock the UI immediately to prevent double-click deletion spam while network is pending
        deleteBtn.style.opacity = "0.5";
        deleteBtn.disabled = true;

        try {
            const response = await fetch(`${courses_API}/${courseId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                courses = courses.filter((course) => String(course.id) !== String(courseId));
                localStorage.setItem("edutrack_courses", JSON.stringify(courses));
                renderCourses();
            } else {
                alert("Failed to delete the course from API.");
                deleteBtn.style.opacity = "1";
                deleteBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            deleteBtn.style.opacity = "1";
            deleteBtn.disabled = false;
        }
    }
});

addCourseBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (event) => {
    // Only close if they clicked the backdrop, not the modal content itself
    if (event.target === modalOverlay) {
        closeModal();
    }
});

fetchCoursesAPI();