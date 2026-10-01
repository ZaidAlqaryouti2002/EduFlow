const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
const studentsContainer = document.getElementById("studentsContainer")
async function loadStudents(){
    try{
    if(!currentUser){
     console.log("No user is logged in");
     return
    } 
    const students = await StudentsApi.listMine(currentUser.id)
     console.log("students : " , students);
     displayStudentsInHtml(students)
     
                }
    catch(err){
        console.log(error)
        
    }
}

function displayStudentsInHtml(students){
    studentsContainer.textContent = ""
    students.forEach(std => {
        const row = document.createElement("tr")
        row.textContent = `
        <td>${std.fullName}</td>
        <td>${std.studentCode}</td>
        // for attendence 
        <td>-</td> 
        //for grade
        <td>-</td>
         <td>Active</td>
         <td> <button>View</button>
            <button>Edit</button>
            <button>Delete</button>
           </td>
        `
        studentsContainer.appendChild(row)
    });

}
loadStudents()
//search students ==========================================================
const searchInput = document.getElementById("searchInput")
let allStudents = []
searchInput.addEventListener("input",()=>{
    const value = searchInput.value.tolowerCase()
    const findStudent = allStudents.filter(std => std.fullName.tolowerCase().includes(value)) ||
    String(std.studentCode).toLowerCase().includes(value)
})
displayStudentsInHtml(findStudent)
loadStudents()
//course filtering ==========================================================
const courseFilter = document.getElementById("courseFilter")
async function fetchCourse (){
    try{
        const courses = await CoursesApi.listMine(String(currentUser.id))
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
      return(std.courses || []).includes(selectedCourse)
        }
    )
    displayStudentsInHtml(filterStudents)
})
loadStudents()
fetchCourse()
//students status ==========================================================
const statusFilter = document.getElementById("statusFilter")
statusFilter.addEventListener("change",function(){
    const selectedStatus = statusFilter.value
    let displayStudent
    if (selectedStatus === "active"){
        displayStudent = allStudents.filter(std =>{
            !(std.archivedBy || []).map(String).includes(String(currentUser.id))
        })
    }
    else{
        displayStudent=allStudents.filter(std=>{
            (std.archivedBy || []).map(String).includes(String(currentUser.id))
        })
    }
    displayStudentsInHtml(displayStudent)
})
