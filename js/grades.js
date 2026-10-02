const letter = g => g >= 85 ? "A" : g >= 70 ? "B" : g >= 50 ? "C" : "D/F";

const hasScore = s => s !== undefined && s !== null && s !== "";



function finalGrade(student, teacherId, assignments) {

  // Step 1: Get this student's scores for this teacher
  let scores = {};

  if (student.scores && student.scores[teacherId]) {
    scores = student.scores[teacherId];
  }


  // Step 2: Prepare two variables that start at zero
  let earned = 0;       // total points the student earned (after applying weights)
  let totalWeight = 0;  // total weight of the assignments that have a score

  // Step 3: Go through every assignment, one by one
  for (const assignment of assignments) {

    // Get the student's score for this assignment
    const score = scores[assignment.id];

    // Check if the student has a score
    const hasScore =
      score !== undefined &&
      score !== null &&
      score !== "";

    // Only calculate if there is a score
    if (hasScore) {

      // The score as a fraction of the max score (example: 8 / 10 = 0.8)
      const percentage = score / assignment.maxScore;

      // Multiply by the assignment's weight (example: 0.8 x 20 = 16)
      const contribution = percentage * assignment.weight;

      // Add the results to the totals
      earned = earned + contribution;
      totalWeight = totalWeight + assignment.weight;
    }
  }

  // Step 4: If there are no scores at all, we can't calculate a grade
  if (totalWeight === 0) {
    return null;
  }

  // Step 5: Calculate the final grade as a percentage
  const finalPercent = (earned / totalWeight) * 100;

  // Round to one decimal place (example: 80.333 becomes 80.3)
  const rounded = Number(finalPercent.toFixed(1));

  return rounded;
}





const activeStudents = (students, teacherId) =>
  students.filter(s => !(s.archivedBy ?? []).includes(teacherId));

function buildRows(students, teacherId, assignments) {
  return activeStudents(students, teacherId).map(s => {
    const grade = finalGrade(s, teacherId, assignments);
    return {
      id: s.id,
      code: s.studentCode,
      name: s.fullName,
      grade,
      letter: grade === null ? "—" : letter(grade)
    };
  });
}









function summarize(rows) {
  const graded = rows.filter(r => r.grade !== null);

  const distribution = { A: 0, B: 0, C: 0, "D/F": 0 };
  graded.forEach(r => distribution[r.letter]++);

  const total = graded.reduce((sum, r) => sum + r.grade, 0);
  const passed = graded.filter(r => r.grade >= 50).length;

  return {
    distribution,
    average: graded.length ? Number((total / graded.length).toFixed(1)) : 0,
    passRate: graded.length ? Math.round((passed / graded.length) * 100) : 0
  };
}








function drawChart(canvasId, type, labels, data, label) {
  if (typeof Chart === "undefined") return;

  new Chart(document.getElementById(canvasId), {
    type,
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: ["#16a34a", "#2563eb", "#d97706", "#dc2626"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: type === "doughnut" } },
      scales: type === "bar"
        ? { y: { beginAtZero: true, ticks: { precision: 0 } } }
        : {}
    }
  });
}
