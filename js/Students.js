// ==========================================
// 1. VARIABLES
// ==========================================

const studentsContainer = document.getElementById("studentsContainer");
const addStudentBtn = document.getElementById("addStudentsBtn");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const statusFilter = document.getElementById("statusFilter");
const exportStudentsBtn = document.getElementById("export");

let allStudents = [];
let allAssignments = [];
let allCourses = [];        // NEW: used to show course names from ids
let editingStudent = null;


// ==========================================
// 2. ATTENDANCE LOCAL STORAGE
// ==========================================

const ATTENDANCE_KEY = "attendance";

// Get attendance from Local Storage
function getAttendanceData() {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
}

// Save attendance to Local Storage
function saveAttendanceData(data) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
}

// Get today's date
function getToday() {
    return new Date().toISOString().split("T")[0];
}


// ==========================================
// 3. LOAD STUDENTS
// ==========================================

async function loadStudents() {

    try {

        const students = await StudentsApi.listMine(String(teacherId));

        allStudents = students;

        filterStudents();

        updateDashboardStats();

    } catch (error) {

        console.log(error);

        alert(error.message);

    }

}


// ==========================================
// LOAD ASSIGNMENTS
// ==========================================

async function loadAssignments() {
    try {
        console.log("Teacher ID for assignments:", teacherId);

        allAssignments = await AssignmentsApi.listMine(String(teacherId));

        console.log("Assignments:", allAssignments);
        console.log("Assignments count:", allAssignments.length);

    } catch (error) {
        console.log("Assignments error:", error);
        allAssignments = [];
    }
}


// ==========================================
// 4. DISPLAY STUDENTS
// ==========================================

function displayStudents(students) {

    studentsContainer.innerHTML = "";

    if (students.length === 0) {

        studentsContainer.innerHTML = `
            <tr>
                <td colspan="6">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }

    // Get attendance from Local Storage
    const attendanceData = getAttendanceData();

    const today = getToday();

    students.forEach(student => {

        const row = document.createElement("tr");

        // ==================================
        // ARCHIVE STATUS
        // ==================================

        const isArchived = (student.archivedBy || [])
            .map(String)
            .includes(String(teacherId));

        // ==================================
        // ATTENDANCE
        // ==================================

        const attendance = attendanceData[student.id]?.[today] || "Not Marked";

        // ==================================
        // GRADE
        // ==================================

        const grade = getStudentGrade(student);
        const gradeLetter = grade === null ? "—" : letter(grade);

        // ==================================
        // ROW
        // ==================================

        row.innerHTML = `

            <td>
                <a href="StudentDetails.html?id=${student.id}">
                    ${student.fullName}
                </a>
            </td>

            <td>
                ${student.id}
            </td>

            <td>
                <select class="attendance-select" data-id="${student.id}">
                    <option value="Not Marked" ${attendance === "Not Marked" ? "selected" : ""}>
                        Not Marked
                    </option>
                    <option value="Present" ${attendance === "Present" ? "selected" : ""}>
                        Present
                    </option>
                    <option value="Absent" ${attendance === "Absent" ? "selected" : ""}>
                        Absent
                    </option>
                    <option value="Late" ${attendance === "Late" ? "selected" : ""}>
                        Late
                    </option>
                </select>
            </td>

            <td>
                ${gradeLetter}
            </td>

            <td>
                ${isArchived ? "Archived" : "Active"}
            </td>

            <td>
                <button class="view-btn" data-id="${student.id}">
                    View
                </button>

                <button class="edit-btn" data-id="${student.id}">
                    Edit
                </button>

                <button class="archive-btn" data-id="${student.id}">
                    ${isArchived ? "Unarchive" : "Archive"}
                </button>

                <button class="delete-btn" data-id="${student.id}">
                    Delete
                </button>
            </td>

        `;

        studentsContainer.appendChild(row);

    });

}


// ==========================================
// 5. SEARCH
// (uses the same combined filter below)
// ==========================================

searchInput.addEventListener("input", filterStudents);


// ==========================================
// 6. COURSE FILTER
// ==========================================

async function loadCourses() {

    try {

        const courses = await CoursesApi.listMine(String(teacherId));

        allCourses = courses;

        console.log("Courses:", courses);

        courses.forEach(course => {

            const option = document.createElement("option");

            // FIX: students store course IDs, so the value must be the id
            option.value = course.id;

            // The user still sees the course name
            option.textContent = course.name;

            courseFilter.appendChild(option);

        });

    } catch (error) {

        console.log(error);

    }

}

courseFilter.addEventListener("change", filterStudents);


// ==========================================
// 7. STATUS FILTER
// ==========================================

statusFilter.addEventListener("change", filterStudents);


// ==========================================
// 8. ONE FILTER FUNCTION (search + course + status)
// ==========================================

function filterStudents() {

    const value = searchInput.value.trim().toLowerCase();
    const selectedCourse = courseFilter.value;
    const selectedStatus = statusFilter.value;

    const isArchived = student =>
        (student.archivedBy || [])
            .map(String)
            .includes(String(teacherId));

    const filteredStudents = allStudents.filter(student => {

        // SEARCH
        const name = String(student.fullName || "").toLowerCase();
        const id = String(student.id || "").toLowerCase();

        const matchSearch =
            !value ||
            name.includes(value) ||
            id === value;

        // COURSE
        const matchCourse =
            selectedCourse === "all" ||
            (student.courses || [])
                .map(String)
                .includes(String(selectedCourse));

        // STATUS
        let matchStatus = true;

        if (selectedStatus === "active") {
            matchStatus = !isArchived(student);
        } else if (selectedStatus === "archived") {
            matchStatus = isArchived(student);
        }

        return matchSearch && matchCourse && matchStatus;

    });

    displayStudents(filteredStudents);

}


// ==========================================
// 9. ADD / EDIT FORM
// ==========================================

function openStudentForm(student = null) {

    editingStudent = student;

    // Remove old form
    const oldForm = document.getElementById("studentFormBox");

    if (oldForm) {
        oldForm.remove();
    }

    const formBox = document.createElement("div");

    formBox.id = "studentFormBox";
    formBox.style.marginLeft = "250px";

    formBox.innerHTML = `

        <div class="form-overlay">

            <div class="student-form">

                <h2>
                    ${student ? "Edit Student" : "Add Student"}
                </h2>

                <form id="studentForm">

                    <!-- FULL NAME -->
                    <label>Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        value="${student?.fullName || ""}"
                        required
                    >

                    <!-- EMAIL -->
                    <label>Email</label>
                    <input
                        type="email"
                        id="email"
                        value="${student?.email || ""}"
                        required
                    >

                    <!-- STUDENT CODE -->
                    <label>Student Code</label>
                    <input
                        type="text"
                        id="studentCode"
                        value="${student?.studentCode || ""}"
                        required
                    >

                    <!-- COURSES (course ids, comma separated) -->
                    <label>Courses (ids, e.g. 1, 2, 3)</label>
                    <input
                        type="text"
                        id="courses"
                        value="${(student?.courses || []).join(", ")}"
                    >

                    <!-- BUTTONS -->
                    <div class="form-buttons">

                        <button type="submit">
                            ${student ? "Update" : "Add"}
                        </button>

                        <button type="button" id="cancelForm">
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.appendChild(formBox);

    // Submit
    document
        .getElementById("studentForm")
        .addEventListener("submit", saveStudent);

    // Cancel
    document
        .getElementById("cancelForm")
        .addEventListener("click", () => {

            formBox.remove();

            editingStudent = null;

        });

}


// ==========================================
// 10. SAVE STUDENT
// ==========================================

async function saveStudent(event) {

    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

    const email = document.getElementById("email").value.trim();

    const studentCode = document.getElementById("studentCode").value.trim();

    const courses = document
        .getElementById("courses")
        .value
        .split(",")
        .map(course => course.trim())
        .filter(course => course !== "");

    const emailExists = allStudents.some(student =>
        student.email?.toLowerCase() === email.toLowerCase() &&
        String(student.id) !== String(editingStudent?.id)
    );

    if (emailExists) {
        showToast("This email is already registered!");
        return;
    }

    try {

        // ==================================
        // EDIT
        // ==================================

        if (editingStudent) {

            const updatedStudent = {

                // Keep original ID
                ...editingStudent,

                fullName,
                email,
                studentCode,
                courses

            };

            const result = await StudentsApi.update(
                editingStudent.id,
                updatedStudent
            );

            const index = allStudents.findIndex(
                student => String(student.id) === String(editingStudent.id)
            );

            allStudents[index] = result;

            showToast("Student updated successfully!");

        }

        // ==================================
        // ADD
        // ==================================

        else {

            const newStudent = {

                // IMPORTANT:
                // No id here.
                // API will generate it.

                fullName,
                email,
                studentCode,
                courses,

                teacherIds: [String(teacherId)],

                archivedBy: [],

                scores: {},

                notes: {},

                createdAt: new Date().toISOString()

            };

            const result = await StudentsApi.create(newStudent);

            allStudents.push(result);

            showToast("Student added successfully!");

        }

        // FIX: keep the current search / course / status filters
        filterStudents();

        updateDashboardStats();

        document.getElementById("studentFormBox").remove();

        editingStudent = null;

    } catch (error) {

        alert(error.message);

    }

}


// ==========================================
// 11. ADD BUTTON
// ==========================================

addStudentBtn.addEventListener("click", () => openStudentForm());


// ==========================================
// 12. ARCHIVE / UNARCHIVE
// ==========================================

async function toggleArchive(student) {

    let archivedBy = student.archivedBy || [];

    const isArchived = archivedBy
        .map(String)
        .includes(String(teacherId));

    if (isArchived) {

        archivedBy = archivedBy.filter(
            id => String(id) !== String(teacherId)
        );

    } else {

        archivedBy.push(String(teacherId));

    }

    try {

        const updatedStudent = await StudentsApi.update(
            student.id,
            {
                ...student,
                archivedBy
            }
        );

        const index = allStudents.findIndex(
            item => String(item.id) === String(student.id)
        );

        allStudents[index] = updatedStudent;

        filterStudents();

        updateDashboardStats();

    } catch (error) {

        alert(error.message);

    }

}


// ==========================================
// 13. DELETE
// ==========================================

async function deleteStudent(student) {

    const confirmed = confirm(`Delete ${student.fullName}?`);

    if (!confirmed) {
        return;
    }

    try {

        await StudentsApi.remove(student.id);

        allStudents = allStudents.filter(
            item => String(item.id) !== String(student.id)
        );

        // Also remove student's attendance from Local Storage
        const attendanceData = getAttendanceData();

        delete attendanceData[student.id];

        saveAttendanceData(attendanceData);

        // FIX: keep the current search / course / status filters
        filterStudents();

        updateDashboardStats();

        showToast("Student deleted successfully!");

    } catch (error) {

        alert(error.message);

    }

}


// ==========================================
// 14. TABLE BUTTONS
// ==========================================

studentsContainer.addEventListener("click", event => {

    const id = event.target.dataset.id;

    if (!id) {
        return;
    }

    const student = allStudents.find(
        item => String(item.id) === String(id)
    );

    if (!student) {
        return;
    }

    // VIEW
    if (event.target.classList.contains("view-btn")) {

        location.href = `studentDetails.html?id=${student.id}`;

    }

    // EDIT
    else if (event.target.classList.contains("edit-btn")) {

        openStudentForm(student);

    }

    // ARCHIVE
    else if (event.target.classList.contains("archive-btn")) {

        toggleArchive(student);

    }

    // DELETE
    else if (event.target.classList.contains("delete-btn")) {

        deleteStudent(student);

    }

});


// ==========================================
// 15. ATTENDANCE
// ==========================================

studentsContainer.addEventListener("change", event => {

    if (!event.target.classList.contains("attendance-select")) {
        return;
    }

    const studentId = event.target.dataset.id;

    const attendanceStatus = event.target.value;

    const today = getToday();

    // Get old attendance
    const attendanceData = getAttendanceData();

    // Create student object if it doesn't exist
    if (!attendanceData[studentId]) {
        attendanceData[studentId] = {};
    }

    // NOT MARKED
    if (attendanceStatus === "Not Marked") {

        delete attendanceData[studentId][today];

    }

    // PRESENT / ABSENT / LATE
    else {

        attendanceData[studentId][today] = attendanceStatus;

    }

    // Save
    saveAttendanceData(attendanceData);

    // Update dashboard
    updateDashboardStats();

});


// ==========================================
// 16. GRADE CALCULATION
// Same calculation used in Grades page
// ==========================================

const letter = g =>
    g >= 85 ? "A" :
    g >= 70 ? "B" :
    g >= 50 ? "C" :
    "D/F";


function finalGrade(student, teacherId, assignments) {

    // Get this student's scores for this teacher
    let scores = {};

    if (student.scores && student.scores[teacherId]) {
        scores = student.scores[teacherId];
    }

    let earned = 0;
    let totalWeight = 0;

    // Go through every assignment
    for (const assignment of assignments) {

        const score = scores[assignment.id];

        const hasScore =
            score !== undefined &&
            score !== null &&
            score !== "";

        // Only calculate assignments that have a score
        if (hasScore) {

            const percentage = score / assignment.maxScore;

            const contribution = percentage * assignment.weight;

            earned = earned + contribution;

            totalWeight = totalWeight + assignment.weight;
        }
    }

    // No scores
    if (totalWeight === 0) {
        return null;
    }

    const finalPercent = (earned / totalWeight) * 100;

    return Number(finalPercent.toFixed(1));
}


function getStudentGrade(student) {
    return finalGrade(student, teacherId, allAssignments);
}


function getStudentLetter(student) {

    const grade = getStudentGrade(student);

    if (grade === null) {
        return "—";
    }

    return letter(grade);
}


// ==========================================
// 17. ATTENDANCE PERCENTAGE
// ==========================================

function calculateAttendancePercentage(studentId) {

    const attendanceData = getAttendanceData();

    const records = Object.values(attendanceData[studentId] || {});

    if (records.length === 0) {
        return 0;
    }

    let points = 0;

    records.forEach(status => {

        if (status === "Present") {
            points += 1;
        }

        else if (status === "Late") {
            points += 0.5;
        }

        // Absent = 0

    });

    return Math.round((points / records.length) * 100);

}


// ==========================================
// 18. ACTIVE STUDENTS
// ==========================================

function getActiveStudents() {

    return allStudents.filter(
        student =>
            !(student.archivedBy || [])
                .map(String)
                .includes(String(teacherId))
    );

}


// ==========================================
// 19. STUDENTS NEED MONITORING
// ==========================================

function getStudentsNeedMonitoring() {

    return getActiveStudents().filter(student => {

        const grade = getStudentGrade(student);

        return grade !== null && grade < 50;

    });

}


// ==========================================
// 20. CLASS AVERAGE
// ==========================================

function calculateClassAverage() {

    const activeStudents = getActiveStudents();

    let total = 0;
    let studentsWithGrades = 0;

    activeStudents.forEach(student => {

        const grade = getStudentGrade(student);

        if (grade !== null) {
            total += grade;
            studentsWithGrades++;
        }
    });

    if (studentsWithGrades === 0) {
        return 0;
    }

    return Number((total / studentsWithGrades).toFixed(1));
}


// ==========================================
// 21. UPDATE DASHBOARD STATS
// ==========================================

function updateDashboardStats() {

    const activeStudents = getActiveStudents();

    const monitoringStudents = getStudentsNeedMonitoring();

    const classAverage = calculateClassAverage();

    // ==================================
    // ATTENDANCE FROM LOCAL STORAGE
    // ==================================

    const attendanceData = getAttendanceData();

    let attendanceTotal = 0;

    let studentsWithAttendance = 0;

    allStudents.forEach(student => {

        const records = attendanceData[student.id] || {};

        const attendance = calculateAttendancePercentage(student.id);

        if (Object.keys(records).length > 0) {

            attendanceTotal += attendance;

            studentsWithAttendance++;

        }

    });

    const attendanceAverage =
        studentsWithAttendance === 0
            ? 0
            : Math.round(attendanceTotal / studentsWithAttendance);

    // ==================================
    // UPDATE UI
    // ==================================

    document.getElementById("classAverage").textContent = `${classAverage}%`;

    document.getElementById("attendanceAverage").textContent = `${attendanceAverage}%`;

    document.getElementById("monitoringCount").textContent = monitoringStudents.length;

    document.getElementById("activeStudentsCount").textContent = activeStudents.length;

}


// ==========================================
// 22. EXPORT CSV
// ==========================================

// Turn course ids into course names (falls back to the id)
function getCourseNames(student) {

    return (student.courses || [])
        .map(courseId => {

            const course = allCourses.find(
                item => String(item.id) === String(courseId)
            );

            return course ? course.name : courseId;

        })
        .join(" - ");

}


exportStudentsBtn.addEventListener("click", () => {

    if (allStudents.length === 0) {

        alert("No students to export.");

        return;

    }

    let csv = "Student ID,Student Code,Full Name,Email,Courses,Grade\n";

    allStudents.forEach(student => {

        const grade = getStudentGrade(student);
        const gradeLetter = grade === null ? "—" : letter(grade);

        const courses = getCourseNames(student);

        csv +=
            `"${student.id}",` +
            `"${student.studentCode || ""}",` +
            `"${student.fullName}",` +
            `"${student.email || ""}",` +
            `"${courses}",` +
            `${gradeLetter}\n`;

    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "students.csv";

    link.click();

    URL.revokeObjectURL(url);

});


// ==========================================
// 23. TOAST
// ==========================================

function showToast(message) {

    const toast = document.getElementById("toast");

    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ==========================================
// 24. START PAGE
// ==========================================

async function startPage() {
    await loadAssignments();
    await loadCourses();   // load courses before students so names are ready
    await loadStudents();
}

startPage();