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

courseForm.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const nameValue = courseNameInput.value.trim();
    const codeValue = courseCodeInput.value.trim();

    if (nameValue === "" || codeValue === "") return; 

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
            name: savedCourse.title,
            code: `Course Code: ${savedCourse.code}`
        };

        courses.push(formattedNewCourse); 
        localStorage.setItem("edutrack_courses", JSON.stringify(courses));
        
        renderCourses(); 
        closeModal(); 
        
    } catch (error) {
        console.error("Error adding course to API:", error);
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

const courses_API= "https://6abd87975121d616d90ceedd.mockapi.io/api/courses";

const fetchCoursesFromAPI = async () => {
    try {
        const response = await fetch(courses_API);
        const data = await response.json();
        
        // تجهيز البيانات لتطابق الكروت تبعتنا
        const formattedData = data.map(item => ({
            // استخدم title إذا موجود، وإلا استخدم name
            name: item.title || item.name, 
            // استخدم code إذا موجود، وإلا اعرض الـ id كبديل
            code: item.code ? `Course Code: ${item.code}` : `Course ID: ${item.id}`
        }));

        courses = [...formattedData, ...courses];
        renderCourses();
    } catch (error) {
        console.error(error);
        renderCourses();
    }
};

fetchCoursesFromAPI();

renderCourses();