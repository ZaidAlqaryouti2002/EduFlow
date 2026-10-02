const teacherId = requireLogin();

let rows = [];
let letterFilter = "";
let searchText = "";


// ==========================================
// Load the page
// ==========================================

async function loadPage() {

  if (!teacherId) {
    return;
  }

  try {

    const students = await StudentsApi.listMine(teacherId);

    const assignments =
      await AssignmentsApi.listMine(teacherId);


    // Build report rows

    rows =
      buildRows(
        students,
        teacherId,
        assignments
      );


    // Calculate summary

    const summary =
      summarize(rows);


    // Calculate averages

    const averages =
      averageByType(
        students,
        assignments
      );


    // ==========================================
    // Update Summary Cards
    // ==========================================

    document.getElementById("active-students").textContent =
      rows.length;


    document.getElementById("class-average").textContent =
      summary.average + "%";


    document.getElementById("pass-rate").textContent =
      summary.passRate + "%";


    document.getElementById("assignment-count").textContent =
      assignments.length;


    // ==========================================
    // Update Progress
    // ==========================================

    document.getElementById("quiz-average").textContent =
      averages[0] + "%";

    document.getElementById("quiz-progress").style.width =
      averages[0] + "%";


    document.getElementById("assignment-average").textContent =
      averages[1] + "%";

    document.getElementById("assignment-progress").style.width =
      averages[1] + "%";


    document.getElementById("exam-average").textContent =
      averages[2] + "%";

    document.getElementById("exam-progress").style.width =
      averages[2] + "%";


    // ==========================================
    // Overall Performance
    // ==========================================

    document.getElementById("performance-average").textContent =
      summary.average + "%";


    document.getElementById("performance-circle").style.background =
      `conic-gradient(
        var(--primary) 0% ${summary.average}%,
        var(--track) ${summary.average}% 100%
      )`;


    // ==========================================
    // Charts
    // ==========================================

    drawChart(
      "dist",
      "bar",
      Object.keys(summary.distribution),
      Object.values(summary.distribution),
      "Students"
    );


    drawChart(
      "types",
      "bar",
      ["Quiz", "Assignment", "Exam"],
      averages,
      "Average %"
    );


    // ==========================================
    // Search
    // ==========================================

    document.getElementById("search").oninput =
      function (event) {

        searchText =
          event.target.value
            .trim()
            .toLowerCase();

        displayTable();

      };


    // ==========================================
    // Letter Filter
    // ==========================================

    document.getElementById("letter").onchange =
      function (event) {

        letterFilter =
          event.target.value;

        displayTable();

      };


    // ==========================================
    // Print
    // ==========================================

    document.getElementById("print").onclick =
      function () {

        window.print();

      };


    // ==========================================
    // Export CSV
    // ==========================================

    document.getElementById("csv").onclick =
      exportCSV;


    // ==========================================
    // Show Table
    // ==========================================

    displayTable();


  } catch (error) {

    showError(error.message);

  }

}


// ==========================================
// Average score for Quiz / Assignment / Exam
// ==========================================

function averageByType(students, assignments) {

  const types = [
    "quiz",
    "assignment",
    "exam"
  ];

  const averages = [];


  for (let t = 0; t < types.length; t++) {

    let total = 0;
    let count = 0;


    for (let i = 0; i < assignments.length; i++) {

      const assignment =
        assignments[i];


      if (assignment.type !== types[t]) {
        continue;
      }


      for (let j = 0; j < students.length; j++) {

        const student =
          students[j];


        if (
          student.scores &&
          student.scores[teacherId]
        ) {

          const score =
            student.scores[teacherId][assignment.id];


          if (score !== undefined) {

            total +=
              (score / assignment.maxScore) * 100;

            count++;

          }

        }

      }

    }


    if (count > 0) {

      averages.push(
        Math.round(total / count)
      );

    } else {

      averages.push(0);

    }

  }


  return averages;

}


// ==========================================
// Get rows after Search + Filter
// ==========================================

function getVisibleRows() {

  const visible = [];


  for (let i = 0; i < rows.length; i++) {

    const row =
      rows[i];


    // Letter filter

    if (
      letterFilter !== "" &&
      row.letter !== letterFilter
    ) {

      continue;

    }


    // Search

    const text =
      (
        row.name +
        " " +
        row.code
      ).toLowerCase();


    if (!text.includes(searchText)) {

      continue;

    }


    visible.push(row);

  }


  return visible;

}


// ==========================================
// Display Student Table
// ==========================================

function displayTable() {

  const table =
    document.getElementById("table");


  const visible =
    getVisibleRows();


  // ==========================================
  // No Results
  // ==========================================

  if (visible.length === 0) {

    table.innerHTML = `

      <div class="report-empty">

        <div class="report-empty-icon">
          🔍
        </div>

        <h3>
          No results found
        </h3>

        <p>
          Try changing your search or filter.
        </p>

      </div>

    `;

    return;

  }


  // ==========================================
  // Create Table Rows
  // ==========================================

  let rowsHTML = "";


  for (let i = 0; i < visible.length; i++) {

    const row =
      visible[i];


    let gradeText = "—";

    let letterHTML = "—";

    let attendanceText = "—";


    // Grade

    if (row.grade !== null) {

      gradeText =
        row.grade;


      // Letter badge

      let statusClass =
        "status-low";


      if (row.letter === "A") {

        statusClass =
          "status-good";

      } else if (
        row.letter === "B" ||
        row.letter === "C"
      ) {

        statusClass =
          "status-average";

      }


      letterHTML = `

        <span class="report-status ${statusClass}">
          ${row.letter}
        </span>

      `;

    }


    // Attendance

    if (row.attendance !== null) {

      attendanceText =
        row.attendance + "%";

    }


    // Row

    rowsHTML += `

      <tr>

        <td>
          ${esc(row.code)}
        </td>


        <td>

          <a
            href="student-details.html?id=${encodeURIComponent(row.id)}"
          >
            ${esc(row.name)}
          </a>

        </td>


        <td>
          ${gradeText}
        </td>


        <td>
          ${letterHTML}
        </td>


        <td>
          ${attendanceText}
        </td>

      </tr>

    `;

  }


  // ==========================================
  // Add Table to Page
  // ==========================================

  table.innerHTML = `

    <table class="report-table">

      <thead>

        <tr>

          <th>
            ID
          </th>

          <th>
            Name
          </th>

          <th>
            Final Grade
          </th>

          <th>
            Letter
          </th>

          <th>
            Attendance
          </th>

        </tr>

      </thead>


      <tbody>

        ${rowsHTML}

      </tbody>

    </table>

  `;

}


// ==========================================
// Export CSV
// ==========================================

function exportCSV() {

  const visible =
    getVisibleRows();


  const data = [

    [
      "Code",
      "Name",
      "Final Grade",
      "Letter",
      "Attendance %"
    ]

  ];


  for (let i = 0; i < visible.length; i++) {

    const row =
      visible[i];


    data.push([

      row.code,

      row.name,

      row.grade,

      row.letter,

      row.attendance

    ]);

  }


  downloadCSV(
    data,
    "edutrack-report.csv"
  );

}


// ==========================================
// Start
// ==========================================

loadPage();
