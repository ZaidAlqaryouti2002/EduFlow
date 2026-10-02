const teacherId = getTeacherId();

const addStudentBtn = document.getElementById("addStudentsBtn")
console.log("Teacher ID:", teacherId);
if (!teacherId) { location.replace("Login.html"); }
const studentsContainer = document.getElementById("studentsContainer")
let allStudents = [];
const exportStudentsBtn = document.getElementById("export");

exportStudentsBtn.addEventListener("click", function () {

    if (allStudents.length === 0) {
        alert("No students to export.");
        return;
    }

    // نحول الداتا إلى JSON
     let csv = "Student ID,Student Code,Full Name,Email,Courses,Grade\n"
   allStudents.forEach(student => {

        const grade = calculateCourseGrade(student.scores);

        const courses = (student.courses || []).join(" - ");

        csv += `"${student.id}","${student.studentCode || ""}","${student.fullName}","${student.email}","${courses}","${grade}"\n`;
    })
     const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "students.csv";

    link.click();

    URL.revokeObjectURL(url);
})
async function loadStudents(){
    try{
    const students = await StudentsApi.listMine(String(teacherId))
        assignments = await AssignmentsApi.listMine(teacherId);
    console.log("students : ",students);
    allStudents = students;
    updateDashboardStats()
     displayStudentsInHtml(students)
     
                }
    catch(err){
        console.log(err)
        
    }
}

function displayStudentsInHtml(students){
    studentsContainer.innerHTML = ""
    if (students.length === 0) { 
        studentsContainer.innerHTML = ` <tr>
         <td colspan="6"> No students found. </td> 
         </tr> `
        return }
 students.forEach(std => {

    const isArchived =
        (std.archivedBy || [])
        .map(String)
        .includes(String(teacherId));
const today = new Date().toISOString().split("T")[0];

const todayAttendance =
    (std.attendance && std.attendance[today]) || "Present";
    const row = document.createElement("tr");
    const grade = calculateCourseGrade(std.scores);
    row.innerHTML = `
        <td>${std.fullName}</td>
        <td>${std.studentCode}</td>
        <td>
        <select class="attendance-select" data-id="${std.id}">
         <option value="Present" ${todayAttendance === "Present" ? "selected" : ""}>
        Present
    </option>
    <option value="Absent" ${todayAttendance === "Absent" ? "selected" : ""}>
        Absent
    </option>
    <option value="Late" ${todayAttendance === "Late" ? "selected" : ""}>
        Late
    </option>
</select>
        
        </td>
        <td>(${grade.letter})</td>
        <td>${isArchived ? "Archived" : "Active"}</td>

        <td>
            <button class="archive-btn" data-id="${std.id}">
                ${isArchived ? "Unarchive" : "Archive"}
            </button>

            <button class="view-btn" data-id="${std.id}">
                View
            </button>

            <button class="edit-btn" data-id="${std.id}">
                Edit
            </button>

            <button class="delete-btn" data-id="${std.id}">
                Delete
            </button>
        </td>
    `;

    studentsContainer.appendChild(row);
})

}

//search students ==========================================================
const searchInput = document.getElementById("searchInput")

searchInput.addEventListener("input",()=>{
    const value = searchInput.value.trim().toLowerCase()
    const findStudent = allStudents.filter(std => 
        {
            const name = String(std.fullName || "") .toLowerCase();
    const code = String(std.studentCode || "") .toLowerCase();
    return ( name.includes(value) || code.includes(value) );
})
displayStudentsInHtml(findStudent);
})


//course filtering ==========================================================
const courseFilter = document.getElementById("courseFilter")
async function fetchCourse (){
    try{
        const courses = await CoursesApi.listMine(String(teacherId))
        console.log("teacher : " ,teacherId);
        
        console.log("courses : ",courses);
        
        courses.forEach((course)=>{
            const option = document.createElement("option")
            option.value = course.name
            option.textContent = course.name 
            courseFilter.appendChild(option)
        })
    }
    catch(err){
        console.log(err);
        
    }
}
courseFilter.addEventListener("change",function(){
    const selectedCourse = courseFilter.value
    if(selectedCourse === "all"){
        displayStudentsInHtml(allStudents)
        return
    }
    const filterStudents = allStudents.filter(std =>{
      return(std.courses || []).map(String).includes(String(selectedCourse))
        }
    )
    displayStudentsInHtml(filterStudents)
})

//students status ==========================================================
const statusFilter = document.getElementById("statusFilter")
statusFilter.addEventListener("change",()=>{
    const selectedStatus = statusFilter.value
    let displayStudent
    if (selectedStatus === "active"){
        displayStudent = allStudents.filter(std =>{
           return !(std.archivedBy || []).map(String).includes(String(teacherId))
        })
    }
    else{
        displayStudent=allStudents.filter(std=>{
            return(std.archivedBy || []).map(String).includes(String(teacherId))
        })
    }
    displayStudentsInHtml(displayStudent)
})
//add new student ========================================================================================


  //edit student ========================================================================================
 


// add and edit student
let editingStudent = null;


// create form
function createStudentForm(student = null) {

    // إذا في فورم مفتوح احذفه
    const oldForm = document.getElementById("studentFormBox");

    if (oldForm) {
        oldForm.remove();
    }

    editingStudent = student;

    const formBox = document.createElement("div");

    formBox.id = "studentFormBox";

    formBox.innerHTML = `
        <div class="form-overlay">

            <div class="student-form">

                <h2>
                    ${student ? "Edit Student" : "Add Student"}
                </h2>

                <form id="studentForm">

                    <label>Full Name</label>

                    <input
                        type="text"
                        id="fullName"
                        value="${student ? student.fullName : ""}"
                        required
                    >
                    <label>Email</label>

                    <input
                        type="email"
                        id="email"
                        value="${student ? student.email || "" : ""}"
                        required
                    >


                    <label>Courses</label>

                    <input
                        type="text"
                        id="courses"
                        value="${
                            student
                                ? (student.courses || []).join(", ")
                                : ""
                        }"
                    >


                    <div class="form-buttons">

                        <button type="submit">
                            ${student ? "Update" : "Add"}
                        </button>

                        <button
                            type="button"
                            id="cancelForm"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;


    document.body.appendChild(formBox);


    // submit
    document
        .getElementById("studentForm")
        .addEventListener("submit", saveStudent);


    // cancel
    document
        .getElementById("cancelForm")
        .addEventListener("click", function () {

            formBox.remove();

            editingStudent = null;

        });
}



// save add or edit
async function saveStudent(event) {

    event.preventDefault();


    const fullName =
        document.getElementById("fullName").value.trim();
    const email =
        document.getElementById("email").value.trim();

    const courses =
        document.getElementById("courses").value
            .split(",")
            .map(course => course.trim())
            .filter(course => course !== "");


    try {

        // EDIT
        if (editingStudent) {

            const updatedStudent = {

                ...editingStudent,

                fullName: fullName,

                studentCode: studentCode,

                email: email,

                courses: courses

            };


            const result =
                await StudentsApi.update(
                    editingStudent.id,
                    updatedStudent
                );


            const index = allStudents.findIndex(
                student =>
                    String(student.id) ===
                    String(editingStudent.id)
            );


            allStudents[index] = result;


            alert("Student updated successfully!");

        }


        // ADD
        else {

            const newStudent = {

                fullName: fullName,
                email: email,

                courses: courses,

                teacherIds: [
                    String(teacherId)
                ],

                archivedBy: [],

                scores: {},

                attendance: {},

                notes: {},

                createdAt: new Date().toISOString()

            };


            const result =
                await StudentsApi.create(newStudent);


            allStudents.push(result);
            updateDashboardStats()


            alert("Student added successfully!");

        }


        displayStudentsInHtml(allStudents);


        document
            .getElementById("studentFormBox")
            .remove();


        editingStudent = null;


    } catch (error) {

        alert(error.message);

    }
}



// edit student
function editStudent(student) {

    createStudentForm(student);

}



// add student
addStudentBtn.addEventListener("click", function () {

    createStudentForm();

});




    //archive student ========================================================================================
 
async function archiveStudent(student) {
     let archivedBy = student.archivedBy || []
      const isArchived = archivedBy .map(String) .includes(String(teacherId))
       if (isArchived) { 
      archivedBy = archivedBy.filter( id => String(id) !== String(teacherId) ) 
    } else 
        {  archivedBy.push( String(teacherId) ) } 
        try { 
            const updatedStudent = await StudentsApi.update( student.id, { ...student, archivedBy: archivedBy } )
             const index = allStudents.findIndex( item => String(item.id) === String(student.id) ); allStudents[index] = updatedStudent
              displayStudentsInHtml(allStudents)} 
              catch (error) {
                 alert(error.message);
                } }
    //delete student ========================================================================================
async function deleteStudent(student) {
     const confirmDelete = confirm( `Delete ${student.fullName}?` )
      if (!confirmDelete) { 
        return } 
        try {
            await StudentsApi.remove(student.id)
             allStudents = allStudents.filter( item => String(item.id) !== String(student.id) )
              displayStudentsInHtml(allStudents)
              updateDashboardStats()
               alert("Student deleted successfully!")} 
catch (error) {
     alert(error.message)
     } }

studentsContainer.addEventListener( "click", function (event) { 
    const id = event.target.dataset.id
     if (!id) { 
        return } 
        const student = allStudents.find( item => String(item.id) === String(id) )
         if (!student) { 
            return } 
             // VIEW
              if ( event.target.classList.contains( "view-btn" ) ) {
                 location.href = `studentDetails.html?id=${student.id}`;
                 } 
                 // EDIT 
                 else if ( event.target.classList.contains( "edit-btn" ) ) { editStudent(student)}
                  // ARCHIVE 
                  else if ( event.target.classList.contains( "archive-btn" ) ) { archiveStudent(student) } 
                  // DELETE
                   else if
                    ( event.target.classList.contains( "delete-btn" ) ) {
                         deleteStudent(student)}

                         })

addStudentBtn.addEventListener( "click", ()=>{
    createStudentForm()
} )
function calculateCourseGrade(scores) {

    let total = 0;
    let maxTotal = 0;

    Object.values(scores || {}).forEach(courseScores => {

        const marks = Object.values(courseScores);

        const quiz = Number(marks[0] || 0);
        const project = Number(marks[1] || 0);
        const final = Number(marks[2] || 0);

        total += quiz + project + final;

        maxTotal += 10 + 50 + 100;
    });

    if (maxTotal === 0) {
        return {
            percentage: 0,
            letter: "N/A"
        };
    }

    const percentage = Math.round((total / maxTotal) * 100);

    let letter;

    if (percentage >= 90) {
        letter = "A";
    } else if (percentage >= 80) {
        letter = "B";
    } else if (percentage >= 70) {
        letter = "C";
    } else if (percentage >= 60) {
        letter = "D";
    } else {
        letter = "F";
    }

    return {
        percentage: percentage,
        letter: letter
    };
}
studentsContainer.addEventListener("change", async function(event) {

    if (!event.target.classList.contains("attendance-select")) {
        return;
    }

    const studentId = event.target.dataset.id;
    const attendanceStatus = event.target.value;

    const student = allStudents.find(
        item => String(item.id) === String(studentId)
    );

    if (!student) {
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    const attendance = {
        ...(student.attendance || {}),
        [today]: attendanceStatus
    };

    try {

        const updatedStudent = await StudentsApi.update(
            student.id,
            {
                ...student,
                attendance: attendance
            }
        );

        const index = allStudents.findIndex(
            item => String(item.id) === String(student.id)
        );

        allStudents[index] = updatedStudent;
        updateDashboardStats()

        console.log("Attendance saved:", updatedStudent);

    } catch (error) {

        console.log(error);
        alert(error.message);

    }

});
function calculateAttendancePercentage(attendance) {

    const records = Object.values(attendance || {});

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

        else if (status === "Absent") {
            points += 0;
        }
    });

    return Math.round((points / records.length) * 100);
}
function getStudentsNeedMonitoring() {

    return allStudents.filter(student => {

        const grade = calculateCourseGrade(student.scores);

        return grade.percentage < 50;
    });
}
 const monitoringStudents = getStudentsNeedMonitoring();

console.log("Students need monitoring:", monitoringStudents.length);

function getActiveStudents() {

    return allStudents.filter(student => {

        return !(student.archivedBy || [])
            .map(String)
            .includes(String(teacherId));

    });
}
const activeStudents = getActiveStudents();

console.log("Active Students:", activeStudents.length);
function calculateClassAverage() {
    let total = 0;
    let studentsWithGrades = 0;

    allStudents.forEach(student => {

        const grade = calculateCourseGrade(student.scores);

        if (Object.keys(student.scores || {}).length > 0) {
            total += grade.percentage;
            studentsWithGrades++;
        }
    });

    if (studentsWithGrades === 0) {
        return 0;
    }

    return Math.round(total / studentsWithGrades);
}
function updateDashboardStats() {

    

     const classAverage = calculateClassAverage();
    const activeStudents = getActiveStudents();

    const monitoringStudents = getStudentsNeedMonitoring();

    let attendanceTotal = 0;
    let studentsWithAttendance = 0;

    allStudents.forEach(student => {

        const attendance =
            calculateAttendancePercentage(student.attendance);

        if (Object.keys(student.attendance || {}).length > 0) {

            attendanceTotal += attendance;
            studentsWithAttendance++;
        }
    });

    const attendanceAverage =
        studentsWithAttendance === 0
            ? 0
            : Math.round(attendanceTotal / studentsWithAttendance);


    document.getElementById("classAverage").textContent =
        `${classAverage}%`;

    document.getElementById("attendanceAverage").textContent =
        `${attendanceAverage}%`;

    document.getElementById("monitoringCount").textContent =
        monitoringStudents.length;

    document.getElementById("activeStudentsCount").textContent =
        activeStudents.length;
}
loadStudents();
fetchCourse();