// =====================================================
// STUDENT DETAILS
// =====================================================


// =====================================================
// 1. GET TEACHER ID
// =====================================================



// =====================================================
// 2. GET STUDENT ID FROM URL
// =====================================================

const params = new URLSearchParams(window.location.search);

const studentId = params.get("id");


// If there is no student ID
if (!studentId) {

    alert("Student ID is missing.");

    window.location.href = "Students.html";
}


// =====================================================
// 3. VARIABLES
// =====================================================

let student = null;
let assignments = [];


// LocalStorage key for attendance
const ATTENDANCE_KEY = "attendance";


// =====================================================
// 4. PAGE ELEMENTS
// =====================================================

const studentName =
    document.getElementById("studentName");

const studentCode =
    document.getElementById("studentCode");

const studentEmail =
    document.getElementById("studentEmail");

const studentAvatar =
    document.getElementById("studentAvatar");

const finalGradeElement =
    document.getElementById("finalGrade");

const letterGradeElement =
    document.getElementById("letterGrade");

const attendancePercentageElement =
    document.getElementById("attendancePercentage");

const scoresTable =
    document.getElementById("scoresTable");

const attendanceTable =
    document.getElementById("attendanceTable");

const feedbackInput =
    document.getElementById("feedbackInput");

const saveFeedbackBtn =
    document.getElementById("saveFeedbackBtn");

const feedbackMessage =
    document.getElementById("feedbackMessage");


// =====================================================
// 5. LETTER GRADE
// =====================================================

function getLetterGrade(grade) {

    if (grade >= 85) {
        return "A";
    }

    if (grade >= 70) {
        return "B";
    }

    if (grade >= 50) {
        return "C";
    }

    return "D/F";
}


// =====================================================
// 6. CALCULATE FINAL GRADE
// Same calculation used in Grades page
// =====================================================

function calculateFinalGrade(student, teacherId, assignments) {

    let scores = {};

    if (
        student.scores &&
        student.scores[teacherId]
    ) {

        scores = student.scores[teacherId];

    }


    let earned = 0;

    let totalWeight = 0;


    for (const assignment of assignments) {

        const score =
            scores[assignment.id];


        const hasScore =
            score !== undefined &&
            score !== null &&
            score !== "";


        if (hasScore) {

            const percentage =
                Number(score) /
                Number(assignment.maxScore);


            const contribution =
                percentage *
                Number(assignment.weight);


            earned =
                earned +
                contribution;


            totalWeight =
                totalWeight +
                Number(assignment.weight);
        }
    }


    // No grades
    if (totalWeight === 0) {

        return null;

    }


    const finalPercent =
        (earned / totalWeight) * 100;


    return Number(
        finalPercent.toFixed(1)
    );
}


// =====================================================
// 7. GET ATTENDANCE FROM LOCAL STORAGE
// =====================================================

function getAttendanceData() {

    return JSON.parse(
        localStorage.getItem(ATTENDANCE_KEY)
    ) || {};

}


// =====================================================
// 8. GET STUDENT ATTENDANCE
// =====================================================

function getStudentAttendance() {

    const attendanceData =
        getAttendanceData();


    return attendanceData[studentId] || {};

}


// =====================================================
// 9. CALCULATE ATTENDANCE PERCENTAGE
// Same logic used in Students page
// =====================================================

function calculateAttendancePercentage() {

    const attendance =
        getStudentAttendance();


    const records =
        Object.values(attendance);


    if (records.length === 0) {

        return null;

    }


    let points = 0;


    records.forEach(status => {

        if (status === "Present") {

            points += 1;

        }

        else if (status === "Late") {

            points += 0.5;

        }

    });


    return Math.round(
        (points / records.length) * 100
    );
}


// =====================================================
// 10. LOAD STUDENT
// =====================================================

async function loadStudent() {

    try {

        student =
            await StudentsApi.get(studentId);


        console.log(
            "Student:",
            student
        );


        displayStudent();

    }

    catch (error) {

        console.log(error);

        studentName.textContent =
            "Failed to load student.";

    }

}


// =====================================================
// 11. LOAD ASSIGNMENTS
// =====================================================

async function loadAssignments() {

    try {

        assignments =
            await AssignmentsApi.listMine(
                teacherId
            );


        console.log(
            "Assignments:",
            assignments
        );

    }

    catch (error) {

        console.log(error);

        assignments = [];

    }

}


// =====================================================
// 12. DISPLAY STUDENT INFORMATION
// =====================================================

function displayStudent() {

    if (!student) {
        return;
    }


    // Name

    studentName.textContent =
        student.fullName || "Unknown Student";


    // Student code

    studentCode.textContent =
        student.studentCode || "—";


    // Email

    studentEmail.textContent =
        student.email || "—";


    // Avatar

    if (student.fullName) {

        studentAvatar.textContent =
            student.fullName
                .charAt(0)
                .toUpperCase();

    }


    // Grade

    const grade =
        calculateFinalGrade(
            student,
            teacherId,
            assignments
        );


    if (grade === null) {

        finalGradeElement.textContent =
            "—";

        letterGradeElement.textContent =
            "—";

    }

    else {

        finalGradeElement.textContent =
            `${grade}%`;

        letterGradeElement.textContent =
            getLetterGrade(grade);

    }


    // Attendance

    const attendance =
        calculateAttendancePercentage();


    if (attendance === null) {

        attendancePercentageElement.textContent =
            "—";

    }

    else {

        attendancePercentageElement.textContent =
            `${attendance}%`;

    }


    displayScores();

    displayAttendance();

    loadFeedback();

}


// =====================================================
// 13. DISPLAY SCORES
// =====================================================

function displayScores() {

    if (!student) {
        return;
    }


    const studentScores =
        (
            student.scores &&
            student.scores[teacherId]
        ) || {};


    if (assignments.length === 0) {

        scoresTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No assignments found.
                </td>
            </tr>
        `;

        return;

    }


    scoresTable.innerHTML = "";


    assignments.forEach(assignment => {

        const score =
            studentScores[assignment.id];


        const hasScore =
            score !== undefined &&
            score !== null &&
            score !== "";


        const scoreText =
            hasScore
                ? `${score} / ${assignment.maxScore}`
                : "—";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${assignment.title}
            </td>

            <td>
                ${assignment.type}
            </td>

            <td>
                ${scoreText}
            </td>

            <td>
                ${assignment.weight}%
            </td>

        `;


        scoresTable.appendChild(row);

    });

}


// =====================================================
// 14. DISPLAY ATTENDANCE
// =====================================================

function displayAttendance() {

    const attendance =
        getStudentAttendance();


    const dates =
        Object.keys(attendance);


    if (dates.length === 0) {

        attendanceTable.innerHTML = `

            <tr>
                <td colspan="2">
                    No attendance recorded.
                </td>
            </tr>

        `;

        return;

    }


    attendanceTable.innerHTML = "";


    dates.sort();


    dates.forEach(date => {

        const status =
            attendance[date];


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${date}
            </td>

            <td>
                ${status}
            </td>

        `;


        attendanceTable.appendChild(row);

    });

}


// =====================================================
// 15. FEEDBACK
// =====================================================

function getFeedbackData() {

    return JSON.parse(
        localStorage.getItem("studentFeedback")
    ) || {};

}


// =====================================================
// 16. LOAD FEEDBACK
// =====================================================

function loadFeedback() {

    const feedbackData =
        getFeedbackData();


    feedbackInput.value =
        feedbackData[studentId] || "";

}


// =====================================================
// 17. SAVE FEEDBACK
// =====================================================

saveFeedbackBtn.addEventListener(
    "click",
    function () {

        const feedback =
            feedbackInput.value.trim();


        const feedbackData =
            getFeedbackData();


        feedbackData[studentId] =
            feedback;


        localStorage.setItem(
            "studentFeedback",
            JSON.stringify(feedbackData)
        );


        feedbackMessage.textContent =
            "Feedback saved successfully.";


        setTimeout(() => {

            feedbackMessage.textContent =
                "";

        }, 2000);

    }
);


// =====================================================
// 18. START PAGE
// =====================================================

async function startPage() {

    await loadAssignments();

    await loadStudent();

}


startPage();