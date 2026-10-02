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
    courseForm.reset(); 
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

            <div style="display: flex; justify-content: flex-end; margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
                <button class="delete-course-btn" data-id="${course.id}" 
                    onmouseenter="this.querySelector('i').style.transform='scale(1.25)'" 
                    onmouseleave="this.querySelector('i').style.transform='scale(1)'"
                    style="background-color: #fee2e2; color: #ef4444; border: none; padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease;"
                    title="Delete Course">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px; transition: transform 0.2s ease;"></i>
                </button>
            </div>
        `;
        
        coursesContainer.appendChild(card); 
    });
    
    if (window.lucide) {
        lucide.createIcons(); 
    }
};

const courses_API = "https://6abd87975121d616d90ceedd.mockapi.io/api/courses";

const fetchCoursesAPI = async () => {
    try {
        const response = await fetch(courses_API);
        const data = await response.json();
        
        const formattedData = data.map(item => ({
            id: item.id,
            name: item.title || item.name, 
            code: item.code ? `Course Code: ${item.code}` : `Course ID: ${item.id}`
        }));

        courses = formattedData;
        localStorage.setItem("edutrack_courses", JSON.stringify(courses));
        renderCourses();
    } catch (error) {
        console.error(error);
        renderCourses();
    }
};

courseForm.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const nameValue = courseNameInput.value.trim();
    const codeValue = courseCodeInput.value.trim();

    if (nameValue === "" || codeValue === "") return; 

    const isDuplicate = courses.some(course => course.name.toLowerCase() === nameValue.toLowerCase());
    
    if (isDuplicate) {
        alert("هذا الكورس موجود مسبقاً، لا يمكن إضافة كورس بنفس الاسم!");
        return; 
    }

    const newCourseData = {
        title: nameValue,
        code: codeValue
    };

    try {
        const response = await fetch(courses_API, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json", 
            },
            body: JSON.stringify(newCourseData) 
        });

        const savedCourse = await response.json();

        const formattedNewCourse = {
            id: savedCourse.id,
            name: savedCourse.title || savedCourse.name,
            code: savedCourse.code ? `Course Code: ${savedCourse.code}` : `Course ID: ${savedCourse.id}`
        };

        courses.push(formattedNewCourse); 
        localStorage.setItem("edutrack_courses", JSON.stringify(courses));
        
        renderCourses(); 
        closeModal(); 
        
    } catch (error) {
        console.error("Error adding course to API:", error);
    }
});

coursesContainer.addEventListener("click", async (event) => {
    const deleteBtn = event.target.closest(".delete-course-btn");
    
    if (deleteBtn) {
        const courseId = deleteBtn.getAttribute("data-id");
        
        const confirmDelete = confirm("Are you sure you want to delete this course?");
        if (!confirmDelete) return;

        deleteBtn.style.opacity = "0.5";
        deleteBtn.disabled = true;

        try {
            const response = await fetch(`${courses_API}/${courseId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                courses = courses.filter(course => String(course.id) !== String(courseId));
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
    if (event.target === modalOverlay) {
        closeModal();
    }
});

fetchCoursesAPI();