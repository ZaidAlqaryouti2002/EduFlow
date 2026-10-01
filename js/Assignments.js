let assignments = [];
let courses = [];

let totalAssignments = document.getElementById("totalAssignments");
let totalAssignmentsInfo = document.getElementById("totalAssignmentsInfo");

let pendingAssignments = document.getElementById("pendingAssignments");
let pendingAssignmentsInfo = document.getElementById("pendingAssignmentsInfo");

let completedAssignments = document.getElementById("completedAssignments");
let completedAssignmentsInfo = document.getElementById("completedAssignmentsInfo");

let overdueAssignments = document.getElementById("overdueAssignments");
let overdueAssignmentsInfo = document.getElementById("overdueAssignmentsInfo");

let assignmentsList = document.getElementById("assignmentsList");

let assignmentModal = document.getElementById("assignmentModal");
let addAssignmentBtn = document.getElementById("addAssignmentBtn");
let closeAssignmentBtn = document.getElementById("closeAssignmentBtn");
let cancelAssignmentBtn = document.getElementById("cancelAssignmentBtn");
let saveAssignmentBtn = document.getElementById("saveAssignmentBtn");


// ========================================
// LOAD DATA
// ========================================

async function loadDashboardData() {

    try {

        assignments = await AssignmentsApi.listMine();
        courses = await CoursesApi.listMine();


        updateStatistics();
        displayAssignments();

    } catch (error) {

        console.log(error.message);

    }
}


// ========================================
// CHECK IF DATE IS THIS WEEK
// ========================================

function isDueThisWeek(date) {

    const today = new Date();

    const startOfWeek = new Date(today);

    const day = today.getDay();

    startOfWeek.setDate(today.getDate() - day);

    startOfWeek.setHours(0, 0, 0, 0);


    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 6);

    endOfWeek.setHours(23, 59, 59, 999);


    const assignmentDate = new Date(date);


    return assignmentDate >= startOfWeek &&
           assignmentDate <= endOfWeek;
}


// ========================================
// UPDATE STATISTICS
// ========================================

function updateStatistics() {

    let total = assignments.length;

    let pending = 0;
    let completed = 0;
    let overdue = 0;
    let dueThisWeek = 0;


    for (let i = 0; i < assignments.length; i++) {

        const assignment = assignments[i];


        if (assignment.status === "pending") {

            pending++;


            if (isDueThisWeek(assignment.date)) {

                dueThisWeek++;

            }

        }


        if (assignment.status === "completed") {

            completed++;

        }


        if (assignment.status === "overdue") {

            overdue++;

        }

    }


    let totalCourses = courses.length;

    let completionRate = 0;


    if (total > 0) {

        completionRate =
            Math.round((completed / total) * 100);

    }


    totalAssignments.textContent = total;

    totalAssignmentsInfo.textContent =
        totalCourses;


    pendingAssignments.textContent =
        pending;

    pendingAssignmentsInfo.textContent =
        dueThisWeek;


    completedAssignments.textContent =
        completed;

    completedAssignmentsInfo.textContent =
        completionRate;


    overdueAssignments.textContent =
        overdue;
}


// ========================================
// DISPLAY ASSIGNMENTS
// ========================================

function displayAssignments(filter = "all") {

    let filteredAssignments = assignments;


    if (filter !== "all") {

        filteredAssignments =
            assignments.filter(
                assignment =>
                    assignment.status === filter
            );

    }


    assignmentsList.innerHTML = `
        <div class="assignment assignment-header">

            <p class="assignment-title">
                Assignment
            </p>

            <p>
                Type
            </p>

            <p>
                Due Date
            </p>

            <p>
                Max Score
            </p>

            <p>
                Status
            </p>

        </div>
    `;


    for (let i = 0; i < filteredAssignments.length; i++) {

        const assignment =
            filteredAssignments[i];


        assignmentsList.innerHTML += `
            <div
                class="assignment"
                data-id="${assignment.id}"
            >

                <p class="assignment-title">
                    ${assignment.title}
                </p>

                <p>
                    ${assignment.type}
                </p>

                <p>
                    ${assignment.date}
                </p>

                <p>
                    ${assignment.maxScore}
                </p>

                <p>

                    <span class="status ${assignment.status}">
                        ${assignment.status}
                    </span>

                </p>

            </div>
        `;

    }
}


// ========================================
// EDIT ASSIGNMENT
// ========================================

function editAssignment(id) {

    const assignment =
        assignments.find(
            assignment => assignment.id === id
        );


    if (!assignment) {

        return;

    }


    // Put assignment data inside form

    document.getElementById("assignmentTitle").value =
        assignment.title;


    document.getElementById("assignmentType").value =
        assignment.type;


    document.getElementById("assignmentDate").value =
        assignment.date;


    document.getElementById("assignmentMaxScore").value =
        assignment.maxScore;


    document.getElementById("assignmentWeight").value =
        assignment.weight;


    document.getElementById("assignmentStatus").value =
        assignment.status;


    document.getElementById("assignmentTeacherId").value =
        assignment.teacherId;


    // Remember which assignment we are editing

    assignmentModal.dataset.editingId =
        assignment.id;


    // Change modal title

    document.querySelector(".modal-header h3").textContent =
        "Edit Assignment";


    // Change save button

    saveAssignmentBtn.textContent =
        "Save Changes";


    // Open modal

    assignmentModal.style.display =
        "flex";
}


// ========================================
// FILTER BUTTONS
// ========================================

const filterButtons =
    document.querySelectorAll(".highlight button");


for (let i = 0; i < filterButtons.length; i++) {

    filterButtons[i].addEventListener(
        "click",
        function () {

            for (
                let j = 0;
                j < filterButtons.length;
                j++
            ) {

                filterButtons[j]
                    .classList
                    .remove("active");

            }


            this.classList.add("active");


            const selectedStatus =
                this.dataset.status;


            displayAssignments(
                selectedStatus
            );

        }
    );

}


// ========================================
// CLICK ASSIGNMENT
// ========================================

assignmentsList.addEventListener(
    "click",
    function (event) {

        const assignmentRow =
            event.target.closest(".assignment");


        if (!assignmentRow) {

            return;

        }


        // Don't allow the header row to open the modal

        if (
            assignmentRow.classList.contains(
                "assignment-header"
            )
        ) {

            return;

        }


        const assignmentId =
            assignmentRow.dataset.id;


        editAssignment(
            assignmentId
        );

    }
);


// ========================================
// OPEN ADD ASSIGNMENT MODAL
// ========================================

addAssignmentBtn.addEventListener(
    "click",
    function () {

        // Make sure we are in CREATE mode

        delete assignmentModal.dataset.editingId;


        // Change title

        document.querySelector(
            ".modal-header h3"
        ).textContent =
            "Add Assignment";


        // Change button

        saveAssignmentBtn.textContent =
            "Save Assignment";


        // Clear form

        document.getElementById(
            "assignmentTitle"
        ).value = "";


        document.getElementById(
            "assignmentType"
        ).value = "quiz";


        document.getElementById(
            "assignmentDate"
        ).value = "";


        document.getElementById(
            "assignmentMaxScore"
        ).value = "";


        document.getElementById(
            "assignmentWeight"
        ).value = "";


        document.getElementById(
            "assignmentStatus"
        ).value = "pending";


        document.getElementById(
            "assignmentTeacherId"
        ).value = "";


        // Open modal

        assignmentModal.style.display =
            "flex";

    }
);


// ========================================
// CLOSE MODAL - X
// ========================================

closeAssignmentBtn.addEventListener(
    "click",
    function () {

        assignmentModal.style.display =
            "none";

    }
);


// ========================================
// CLOSE MODAL - CANCEL
// ========================================

cancelAssignmentBtn.addEventListener(
    "click",
    function () {

        assignmentModal.style.display =
            "none";

    }
);


// ========================================
// CLOSE MODAL - CLICK OUTSIDE
// ========================================

assignmentModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === assignmentModal
        ) {

            assignmentModal.style.display =
                "none";

        }

    }
);


// ========================================
// SAVE ASSIGNMENT
// ========================================

saveAssignmentBtn.addEventListener(
    "click",
    async function () {

        let title =
            document.getElementById(
                "assignmentTitle"
            ).value;


        let type =
            document.getElementById(
                "assignmentType"
            ).value;


        let date =
            document.getElementById(
                "assignmentDate"
            ).value;


        let maxScore =
            document.getElementById(
                "assignmentMaxScore"
            ).value;


        let weight =
            document.getElementById(
                "assignmentWeight"
            ).value;


        let status =
            document.getElementById(
                "assignmentStatus"
            ).value;


        let teacherId =
            document.getElementById(
                "assignmentTeacherId"
            ).value;


        const assignmentData = {

            teacherId: teacherId,

            title: title,

            type: type,

            maxScore: Number(maxScore),

            status: status,

            date: date,

            weight: Number(weight)

        };


        try {

            // Check if we are editing

            const editingId =
                assignmentModal.dataset.editingId;


            if (editingId) {

                // ==============================
                // UPDATE EXISTING ASSIGNMENT
                // ==============================

                await AssignmentsApi.update(
                    editingId,
                    assignmentData
                );

            } else {

                // ==============================
                // CREATE NEW ASSIGNMENT
                // ==============================

                await AssignmentsApi.create(
                    assignmentData
                );

            }


            // Get fresh data from API

            assignments =
                await AssignmentsApi.list();


            // Update statistics

            updateStatistics();


            // Display assignments again

            displayAssignments();


            // Close modal

            assignmentModal.style.display =
                "none";


            // Reset editing mode

            delete assignmentModal.dataset.editingId;


            // Reset modal title

            document.querySelector(
                ".modal-header h3"
            ).textContent =
                "Add Assignment";


            // Reset button text

            saveAssignmentBtn.textContent =
                "Save Assignment";


            // Clear form

            document.getElementById(
                "assignmentTitle"
            ).value = "";


            document.getElementById(
                "assignmentDate"
            ).value = "";


            document.getElementById(
                "assignmentMaxScore"
            ).value = "";


            document.getElementById(
                "assignmentWeight"
            ).value = "";


            document.getElementById(
                "assignmentTeacherId"
            ).value = "";


        } catch (error) {

            console.log(
                error.message
            );

        }

    }
);


// ========================================
// START
// ========================================

loadDashboardData();