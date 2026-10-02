async function loadDashboardData() {
    try {
        const [teacher, students, courses, assignments] = await Promise.all([
            TeachersApi.get(teacherId),
            StudentsApi.listMine(teacherId),
            CoursesApi.listMine(teacherId),
            AssignmentsApi.listMine(teacherId),
        ]);

        // ---------- Teacher Name ----------
        const greetingElement = document.querySelector(".greeting .name");

        if (greetingElement) {
            greetingElement.textContent = teacher.name;
        }

        // ---------- Total Students ----------
        const totalStudents = document.getElementById("totalStudents");

        if (totalStudents) {
            totalStudents.textContent = students.length;
        }

        // ---------- Active Courses ----------
        const activeCourses = document.getElementById("activeCourses");

        if (activeCourses) {
            activeCourses.textContent = courses.length;
        }

        // ---------- Total Assignments ----------
        const totalAssignments = document.getElementById("totalAssignments");

        if (totalAssignments) {
            totalAssignments.textContent = assignments.length;
        }

        // ---------- Average Students Per Course ----------
        const studentsPerCourse = document.getElementById("studentsPerCourse");

        if (studentsPerCourse) {
            const average = courses.length > 0 ? (students.length / courses.length).toFixed(1) : 0;

            studentsPerCourse.textContent = average;
        }

        createStudentPerformanceChart(students, assignments);
        displayUpcomingAssignments(assignments);
        displayCourses(courses, students);
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
    }
}

function createStudentPerformanceChart(students, assignments) {
    const studentNames = [];
    const studentAverages = [];

    students.forEach((student) => {
        const teacherScores = student.scores?.[teacherId] || {};

        let totalScore = 0;
        let totalMaxScore = 0;

        assignments.forEach((assignment) => {
            const score = teacherScores[assignment.id];

            if (score !== undefined) {
                totalScore += Number(score);
                totalMaxScore += Number(assignment.maxScore);
            }
        });

        let average = 0;

        if (totalMaxScore > 0) {
            average = (totalScore / totalMaxScore) * 100;
        }

        studentNames.push(student.fullName);
        studentAverages.push(Math.round(average));
    });

    const canvas = document.getElementById("studentPerformanceChart");

    if (!canvas) return;

    new Chart(canvas, {
        type: "bar",

        data: {
            labels: studentNames,

            datasets: [
                {
                    label: "Average Score",
                    data: studentAverages,
                    borderRadius: 8,
                    borderSkipped: false,
                },
            ],
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    grid: {
                        display: false,
                    },
                    beginAtZero: true,
                    max: 100,

                    ticks: {
                        callback: function (value) {
                            return value + "%";
                        },
                    },
                },

                x: {
                    grid: {
                        display: false,
                    },
                },
            },

            plugins: {
                legend: {
                    display: true,
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.raw + "%";
                        },
                    },
                },
            },
        },
    });
}

function displayUpcomingAssignments(assignments) {
    const container = document.querySelector(".assignments");

    if (!container) return;

    container.innerHTML = "";

    // Sort assignments by date
    const sortedAssignments = [...assignments].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Show only 4 assignments
    const assignmentsToShow = sortedAssignments.slice(0, 4);

    assignmentsToShow.forEach((assignment) => {
        const assignmentElement = document.createElement("div");

        assignmentElement.classList.add("assignment-item");

        if (assignment.status === "overdue") {
            assignmentElement.classList.add("is-overdue");
        }

        const date = new Date(assignment.date);

        const formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
        });

        assignmentElement.innerHTML = `
            <div class="assignment-info">
                <span class="assignment-title">
                    ${assignment.title}
                </span>

                <span class="assignment-meta">
                    ${assignment.type} · ${formattedDate}
                </span>
            </div>

            <span class="assignment-status ${assignment.status}">
                ${assignment.status}
            </span>
        `;

        container.appendChild(assignmentElement);
    });

    if (assignmentsToShow.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                No assignments found.
            </p>
        `;
    }
}

function displayCourses(courses, students) {
    const coursesContainer = document.getElementById("coursesContainer");

    if (!coursesContainer) return;

    coursesContainer.innerHTML = "";

    const coursesToShow = courses
        .map((course) => {
            return {
                ...course,
                students: students.filter((student) =>
                    (student.courses || []).includes(course.name),
                ),
            };
        })
        .sort((a, b) => b.students.length - a.students.length)
        .slice(0, 3);

    coursesToShow.forEach((course) => {
        // Find students enrolled in this course

        const courseCard = document.createElement("article");

        courseCard.className = "card course";

        courseCard.innerHTML = `
            <div class="course-top">
                <span class="course-icon is-blue">📘</span>
                <span class="badge">Course</span>
            </div>

            <h4>${course.name}</h4>

            <p class="meta">
                ${course.students.length} Students
            </p>

            <div class="course-stats">
                <span>
                    👥 ${course.students.length} Students
                </span>

            </div>

            <a
                class="course-link"
                href="./courses.html"
            >
                <span>View Details</span>
                <span>→</span>
            </a>
        `;

        coursesContainer.appendChild(courseCard);
    });

    if (coursesToShow.length === 0) {
        coursesContainer.innerHTML = `
            <p class="empty-message">
                No courses found.
            </p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});
