// api.js

// ==============================
// API URLs
// ==============================

const TEACHERS_API =
  "https://6abd73c85121d616d90ce824.mockapi.io/api/teachers";

const STUDENTS_API =
  "https://6abd73c85121d616d90ce824.mockapi.io/api/students";

const COURSES_API =
  "https://6abd87975121d616d90ceedd.mockapi.io/api/courses";

const ASSIGNMENTS_API =
  "https://6abd87975121d616d90ceedd.mockapi.io/api/assignments";


// ==============================
// Basic request function
// ==============================

async function request(url, options = {}) {

  try {

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });


    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status}`
      );
    }


    return await response.json();

  } catch (error) {

    if (error.message.startsWith("Server error")) {
      throw error;
    }

    throw new Error(
      "Cannot connect to the server."
    );
  }
}


// ==============================
// TEACHERS
// ==============================

const TeachersApi = {

  // GET all teachers
  async list() {
    return await request(TEACHERS_API);
  },


  // GET one teacher
  async get(id) {
    return await request(
      `${TEACHERS_API}/${id}`
    );
  },


  // POST new teacher
  async create(teacher) {

    return await request(
      TEACHERS_API,
      {
        method: "POST",
        body: JSON.stringify(teacher)
      }
    );
  },


  // PUT teacher
  async update(id, teacher) {

    return await request(
      `${TEACHERS_API}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(teacher)
      }
    );
  },


  // DELETE teacher
  async remove(id) {

    return await request(
      `${TEACHERS_API}/${id}`,
      {
        method: "DELETE"
      }
    );
  },


  // Find teacher by email
  async findByEmail(email) {

    const teachers =
      await this.list();

    return teachers.find(
      teacher =>
        teacher.email.toLowerCase() ===
        email.toLowerCase()
    ) || null;
  }
};


// ==============================
// STUDENTS
// ==============================

const StudentsApi = {

  // GET all students
  async list() {

    return await request(
      STUDENTS_API
    );
  },


  // GET one student
  async get(id) {

    return await request(
      `${STUDENTS_API}/${id}`
    );
  },


  // GET students belonging to teacher
  async listMine(teacherId) {

    const students =
      await this.list();

    return students.filter(
      student =>
        (student.teacherIds || [])
      .map(String)
          .includes(String(teacherId))
    );
  },


  // Find student by student ID
  async findByCode(studentCode) {

    const students =
      await this.list();

    return students.find(
      student =>
        String(student.studentCode)
          .toLowerCase() ===
        String(studentCode)
          .toLowerCase()
    ) || null;
  },


  // POST new student
  async create(student) {

    return await request(
      STUDENTS_API,
      {
        method: "POST",
        body: JSON.stringify(student)
      }
    );
  },


  // PUT student
  async update(id, student) {

    return await request(
      `${STUDENTS_API}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(student)
      }
    );
  },


  // DELETE student
  async remove(id) {

    return await request(
      `${STUDENTS_API}/${id}`,
      {
        method: "DELETE"
      }
    );
  }
};


// ==============================
// COURSES - BEECEPTOR
// ==============================

const CoursesApi = {

  // GET all courses
  async list() {

    return await request(
      COURSES_API
    );
  },


  // GET one course
  async get(id) {

    return await request(
      `${COURSES_API}/${id}`
    );
  },


  // GET courses belonging to teacher
  async listMine(teacherId) {

    const courses =
      await this.list();
      console.log("Teacher ID inside CoursesApi:", teacherId); console.log("All courses:", courses);

    return courses.filter(
      course =>
       course.teacherIds.includes(String(teacherId))
    );
  },


  // POST new course
  async create(course) {

    return await request(
      COURSES_API,
      {
        method: "POST",
        body: JSON.stringify(course)
      }
    );
  },


  // PUT course
  async update(id, course) {

    return await request(
      `${COURSES_API}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(course)
      }
    );
  },


  // DELETE course
  async remove(id) {

    return await request(
      `${COURSES_API}/${id}`,
      {
        method: "DELETE"
      }
    );
  }
};


// ==============================
// ASSIGNMENTS
// ==============================

const AssignmentsApi = {

  // GET all assignments
  async list() {

    return await request(
      ASSIGNMENTS_API
    );
  },


  // GET assignments belonging to teacher
  async listMine(teacherId) {

    const assignments =
      await this.list();

    return assignments.filter(
      assignment =>
        assignment.teacherId === teacherId
    );
  },


  // GET one assignment
  async get(id) {

    return await request(
      `${ASSIGNMENTS_API}/${id}`
    );
  },


  // POST assignment
  async create(assignment) {

    return await request(
      ASSIGNMENTS_API,
      {
        method: "POST",
        body: JSON.stringify(assignment)
      }
    );
  },


  // PUT assignment
  async update(id, assignment) {

    return await request(
      `${ASSIGNMENTS_API}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(assignment)
      }
    );
  },


  // DELETE assignment
  async remove(id) {

    return await request(
      `${ASSIGNMENTS_API}/${id}`,
      {
        method: "DELETE"
      }
    );
  }
};