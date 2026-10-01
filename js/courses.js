const addCourseBtn = document.getElementById("add-course-btn");
const modalOverlay = document.getElementById("add-course-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const courseForm = document.getElementById("add-course-form");
const courseNameInput = document.getElementById("course-name");
const courseCodeInput = document.getElementById("course-code");
const coursesContainer = document.getElementById("courses-container");

let courses = JSON.parse(localStorage.getItem("edutrack_courses")) || [];

const openModal = () => {
    modalOverlay.classList.remove("hidden");
};

const closeModal = () => {
    modalOverlay.classList.add("hidden");
    courseForm.reset(); // تفريغ حقول الإدخال
};

const renderCourses = () => {
    coursesContainer.innerHTML = ""; // مسح القديم عشان ما يتكرر الكود

    courses.forEach((course) => {
        const card = document.createElement("div"); 
        card.classList.add("course-card");

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
                    <span>0%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 0%; background-color: var(--primary);"></div>
                </div>
            </div>

            <div class="course-stats">
                <span>3 credits</span>
                <span class="grade">N/A</span>
                <span>0 / 10</span>
            </div>
            
            <a href="#" class="view-details">View Details <i data-lucide="arrow-right"></i></a>
        `;
        
        coursesContainer.appendChild(card); 
    });
    
    if (window.lucide) {
        lucide.createIcons(); 
    }
};

courseForm.addEventListener("submit", (event) => {
    event.preventDefault(); 

    const name = courseNameInput.value.trim();
    const code = courseCodeInput.value.trim();

   
    if (name === "" || code === "") return; 

    const newCourse = {
        id: Date.now(), 
        name: name,
        code: code
    };

    courses.push(newCourse); 
    
    localStorage.setItem("edutrack_courses", JSON.stringify(courses));

    renderCourses(); 
    closeModal(); 
});

addCourseBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

renderCourses();