const teacherId = getTeacherId();
const addStudentBtn = document.getElementById("addStudentsBtn")
console.log("Teacher ID:", teacherId);
if (!teacherId) { location.replace("Login.html"); }
const studentsContainer = document.getElementById("studentsContainer")
let allStudents = [];
async function loadStudents(){
    try{
    const students = await StudentsApi.listMine(String(teacherId))
    console.log("students : ",students);
    allStudents = students;
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

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${std.fullName}</td>
        <td>${std.studentCode}</td>
        <td>-</td>
        <td>-</td>
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


                    <label>Student Code</label>

                    <input
                        type="text"
                        id="studentCode"
                        value="${student ? student.studentCode : ""}"
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

    const studentCode =
        document.getElementById("studentCode").value.trim();

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

                studentCode: studentCode,

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
    //delte student ========================================================================================
async function deleteStudent(student) {
     const confirmDelete = confirm( `Delete ${student.fullName}?` )
      if (!confirmDelete) { 
        return } 
        try {
            await StudentsApi.remove(student.id)
             allStudents = allStudents.filter( item => String(item.id) !== String(student.id) )
              displayStudentsInHtml(allStudents)
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
                         deleteStudent(student)} } )

addStudentBtn.addEventListener( "click", ()=>{
    createStudentForm()
} )
  


 
loadStudents();
fetchCourse();