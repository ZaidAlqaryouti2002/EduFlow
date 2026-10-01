// 1. تحديد العناصر من الـ HTML
const addCourseBtn = document.getElementById("add-course-btn");
const modalOverlay = document.getElementById("add-course-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const courseForm = document.getElementById("add-course-form");
const courseNameInput = document.getElementById("course-name");
const courseCodeInput = document.getElementById("course-code");
const coursesContainer = document.getElementById("courses-container");

// 2. جلب المواد المحفوظة مسبقاً من المتصفح، أو مصفوفة فارغة إذا كان أول استخدام
let courses = JSON.parse(localStorage.getItem("edutrack_courses")) || [];

// 3. دوال فتح وإغلاق النافذة المنبثقة
const openModal = () => {
    modalOverlay.classList.remove("hidden");
};

const closeModal = () => {
    modalOverlay.classList.add("hidden");
    courseForm.reset(); // تفريغ حقول الإدخال
};

// 4. دالة رسم كروت المواد على الشاشة
const renderCourses = () => {
    coursesContainer.innerHTML = ""; // مسح القديم عشان ما يتكرر الكود

    courses.forEach((course) => {
        // إنشاء الحاوية (div) في الذاكرة أولاً
        const card = document.createElement("div"); 
        card.classList.add("course-card");

        // استخدام Template Literals لدمج البيانات داخل الـ HTML
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
        
        // إرفاق البطاقة المكتملة إلى الصفحة لتصبح مرئية
        coursesContainer.appendChild(card); 
    });
    
    // تفعيل أيقونات Lucide للبطاقات الجديدة التي تم رسمها
    if (window.lucide) {
        lucide.createIcons(); 
    }
};

// 5. الاستماع لحدث الإرسال (Submit) عند الضغط على Add Course داخل النافذة
courseForm.addEventListener("submit", (event) => {
    event.preventDefault(); // منع المتصفح من إعادة تحميل الصفحة

    const name = courseNameInput.value.trim();
    const code = courseCodeInput.value.trim();

    // تأكد إن الحقول مش فاضية
    if (name === "" || code === "") return; 

    // بناء كائن (Object) يمثل المادة الجديدة
    const newCourse = {
        id: Date.now(), // رقم تعريفي مميز
        name: name,
        code: code
    };

    // إضافتها للمصفوفة
    courses.push(newCourse); 
    
    // حفظ المصفوفة في المتصفح (LocalStorage)
    localStorage.setItem("edutrack_courses", JSON.stringify(courses));

    // تحديث الشاشة وإغلاق النافذة
    renderCourses(); 
    closeModal(); 
});

// 6. ربط الأحداث (Event Listeners) بأزرار النافذة المنبثقة
addCourseBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

// إغلاق النافذة لو كبس المستخدم على المساحة المعتمة برا الصندوق
modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// التنفيذ الفوري: رسم المواد المحفوظة مسبقاً بمجرد فتح الصفحة
renderCourses();