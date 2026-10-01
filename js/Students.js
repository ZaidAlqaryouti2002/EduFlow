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
    const findStudent = allStudents.filter(std => std.fullName.tolowerCase().includes(value))
})