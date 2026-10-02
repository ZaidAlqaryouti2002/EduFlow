// =====================================================
// Grade and Attendance Helper Functions
// =====================================================

// Each student's scores are stored by teacher and assignment:
//
// student.scores[teacherId][assignmentId] = score
//
// Example:
// student.scores["1"]["5"] = 85
//
// Attendance is stored by teacher and date:
//
// student.attendance[teacherId][date] = status
//
// Example:
// student.attendance["1"]["2026-09-30"] = "present"


// =====================================================
// Get Letter Grade
// =====================================================

function letter(grade) {

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
// Calculate Final Grade
// =====================================================

function finalGrade(student, teacherId, assignments) {

  // Get this teacher's scores for this student.
  // If there are no scores, use an empty object.
  const scores = student.scores?.[teacherId] ?? {};

  let earned = 0;
  let totalWeight = 0;

  // Go through every assignment
  for (const assignment of assignments) {

    // Get the student's score for this assignment
    const score = scores[assignment.id];

    // If the student does not have a score yet,
    // skip this assignment.
    if (
      score === undefined ||
      score === null ||
      score === ""
    ) {
      continue;
    }

    // Calculate how much this assignment contributes
    // to the student's final grade.
    //
    // Example:
    // score = 80
    // maxScore = 100
    // weight = 20
    //
    // 80 / 100 * 20 = 16
    earned +=
      (score / assignment.maxScore) *
      assignment.weight;

    // Add this assignment's weight
    totalWeight += assignment.weight;
  }

  // If the student has scores:
  // calculate the final percentage.
  //
  // If there are no scores:
  // return null.
  if (totalWeight > 0) {

    const grade =
      (earned / totalWeight) * 100;

    return Number(grade.toFixed(1));
  }

  return null;
}


// =====================================================
// Calculate Attendance Rate
// =====================================================

function attendanceRate(student, teacherId) {

  // Get attendance records for this teacher.
  //
  // Example:
  // {
  //   "2026-09-28": "present",
  //   "2026-09-29": "absent",
  //   "2026-09-30": "present"
  // }
  //
  // Object.values() gives:
  // ["present", "absent", "present"]

  const records =
    Object.values(
      student.attendance?.[teacherId] ?? {}
    );

  // If there are no attendance records,
  // there is no attendance rate to calculate.
  if (records.length === 0) {
    return null;
  }

  // Count how many records are NOT absent.
  let presentCount = 0;

  records.forEach(function (status) {

    if (status !== "absent") {
      presentCount++;
    }

  });

  // Calculate attendance percentage.
  const rate =
    (presentCount / records.length) * 100;

  return Math.round(rate);
}


// =====================================================
// Get Active Students
// =====================================================

function activeStudents(students, teacherId) {

  return students.filter(function (student) {

    // Get the teachers who archived this student.
    const archivedBy =
      student.archivedBy ?? [];

    // Keep the student if this teacher
    // has NOT archived them.
    return !archivedBy.includes(teacherId);

  });
}


// =====================================================
// Build Student Rows
// =====================================================

function buildRows(students, teacherId, assignments) {

  // First get only active students.
  const studentsForTeacher =
    activeStudents(students, teacherId);

  // Create the information needed by
  // the Dashboard and other pages.
  return studentsForTeacher.map(function (student) {

    // Calculate student's final grade
    const grade =
      finalGrade(
        student,
        teacherId,
        assignments
      );

    // Calculate student's attendance
    const attendance =
      attendanceRate(
        student,
        teacherId
      );

    // Calculate letter grade
    let letterGrade = "—";

    if (grade !== null) {
      letterGrade = letter(grade);
    }

    return {
      id: student.id,
      code: student.studentCode,
      name: student.fullName,
      grade: grade,
      letter: letterGrade,
      attendance: attendance
    };

  });
}


// =====================================================
// Summarize Class Grades
// =====================================================

function summarize(rows) {

  // Only students who have a grade
  // should be included in the calculations.
  const gradedStudents =
    rows.filter(function (student) {
      return student.grade !== null;
    });


  // Start all grade categories at 0.
  const distribution = {
    A: 0,
    B: 0,
    C: 0,
    "D/F": 0
  };


  // Count students in each grade category.
  gradedStudents.forEach(function (student) {

    distribution[student.letter]++;

  });


  // ===================================================
  // Calculate Class Average
  // ===================================================

  let average = 0;

  if (gradedStudents.length > 0) {

    let totalGrades = 0;

    gradedStudents.forEach(function (student) {
      totalGrades += student.grade;
    });

    average =
      totalGrades / gradedStudents.length;

    average = Number(average.toFixed(1));
  }


  // ===================================================
  // Calculate Pass Rate
  // ===================================================

  let passRate = 0;

  if (gradedStudents.length > 0) {

    let passedStudents = 0;

    gradedStudents.forEach(function (student) {

      if (student.grade >= 50) {
        passedStudents++;
      }

    });

    passRate =
      (passedStudents / gradedStudents.length) * 100;

    passRate = Math.round(passRate);
  }


  // Return all calculated information
  return {
    distribution: distribution,
    average: average,
    passRate: passRate
  };
}


// =====================================================
// Draw Chart
// =====================================================

function drawChart(
  canvasId,
  type,
  labels,
  data,
  label
) {

  // Check if Chart.js is loaded.
  //
  // If Chart.js is not available,
  // simply stop the function.
  if (typeof Chart === "undefined") {
    return;
  }


  // Find the canvas element
  const canvas =
    document.getElementById(canvasId);


  // Create the chart
  new Chart(canvas, {

    // Chart type:
    // "doughnut", "bar", etc.
    type: type,

    // Chart data
    data: {

      // Names shown on the chart
      labels: labels,

      // Numbers used to create the chart
      datasets: [
        {
          label: label,
          data: data,

          backgroundColor: [
            "#16a34a",
            "#2563eb",
            "#d97706",
            "#dc2626"
          ]
        }
      ]
    },

    // Chart settings
    options: {

      // Make the chart responsive
      responsive: true,

      plugins: {

        // Show the legend only for doughnut charts
        legend: {
          display: type === "doughnut"
        }
      },

      // Bar chart needs a Y axis.
      // Doughnut chart does not.
      scales:
        type === "bar"
          ? {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          : {}
    }
  });
}