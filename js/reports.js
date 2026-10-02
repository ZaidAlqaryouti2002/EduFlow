// reports.js

const teacherId = requireLogin();

let rows = [];            // one row per active student
let letterFilter = "";    // "" = all letters
let searchText = "";


// ==========================================
// Load the page
// ==========================================

async function loadPage() {

  if (!teacherId) {
    return;
  }

  try {

    const teacher = await TeachersApi.get(teacherId);
    const content = document.getElementById("content");
    

    const students = await StudentsApi.listMine(teacherId);
    const assignments = await AssignmentsApi.listMine(teacherId);

    rows = buildRows(students, teacherId, assignments);

    const summary = summarize(rows);
    const averages = averageByType(students, assignments);

    content.innerHTML = `
      <div class="grid">

        <div class="card stat">
          <b>${rows.length}</b>
          <span>Active students</span>
        </div>

        <div class="card stat">
          <b>${summary.average}%</b>
          <span>Class average</span>
        </div>

        <div class="card stat">
          <b>${summary.passRate}%</b>
          <span>Pass rate (≥ 50)</span>
        </div>

      </div>

      <div class="charts">

        <div class="card">
          <h3>Grade distribution</h3>
          <canvas id="dist"></canvas>
        </div>

        <div class="card">
          <h3>Average by type (%)</h3>
          <canvas id="types"></canvas>
        </div>

      </div>

      <div class="toolbar no-print">
        <input id="search" type="search" placeholder="Search student" aria-label="Search">

        <select id="letter" aria-label="Filter by letter">
          <option value="">All letters</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D/F</option>
        </select>

        <button class="btn" id="csv">Export CSV</button>
        <button class="btn" id="print">Print</button>
      </div>

      <div class="card table-wrap" id="table"></div>
    `;


    // Charts
    drawChart("dist", "bar", Object.keys(summary.distribution), Object.values(summary.distribution), "Students");
    drawChart("types", "bar", ["Quiz", "Assignment", "Exam"], averages, "Average %");

    // Search box
    document.getElementById("search").oninput = function (event) {
      searchText = event.target.value.trim().toLowerCase();
      displayTable();
    };

    // Letter filter
    document.getElementById("letter").onchange = function (event) {
      letterFilter = event.target.value;
      displayTable();
    };

    // Print
    document.getElementById("print").onclick = function () {
      window.print();
    };

    // Export CSV
    document.getElementById("csv").onclick = exportCSV;

    displayTable();

  } catch (error) {

    showError(error.message);
  }
}


// ==========================================
// Average score (in %) for quiz / assignment / exam
// ==========================================

function averageByType(students, assignments) {

  const types = ["quiz", "assignment", "exam"];
  const averages = [];

  for (let t = 0; t < types.length; t++) {

    let total = 0;
    let count = 0;

    for (let i = 0; i < assignments.length; i++) {

      const a = assignments[i];

      if (a.type !== types[t]) {
        continue;
      }

      for (let j = 0; j < students.length; j++) {

        const student = students[j];

        if (student.scores && student.scores[teacherId]) {

          const score = student.scores[teacherId][a.id];

          if (score !== undefined) {
            total += (score / a.maxScore) * 100;
            count++;
          }
        }
      }
    }

    if (count > 0) {
      averages.push(Math.round(total / count));
    } else {
      averages.push(0);
    }
  }

  return averages;
}


// ==========================================
// Rows that match the search and the letter filter
// ==========================================

function getVisibleRows() {

  const visible = [];

  for (let i = 0; i < rows.length; i++) {

    const row = rows[i];

    if (letterFilter !== "" && row.letter !== letterFilter) {
      continue;
    }

    const text = (row.name + " " + row.code).toLowerCase();

    if (!text.includes(searchText)) {
      continue;
    }

    visible.push(row);
  }

  return visible;
}


// ==========================================
// Show the table
// ==========================================

function displayTable() {

  const table = document.getElementById("table");
  const visible = getVisibleRows();

  if (visible.length === 0) {
    table.innerHTML = '<p class="empty">No results.</p>';
    return;
  }

  let rowsHTML = "";

  for (let i = 0; i < visible.length; i++) {

    const row = visible[i];

    let gradeText = "—";
    let letterHTML = "—";
    let attendanceText = "—";

    if (row.grade !== null) {
      gradeText = row.grade;
      letterHTML = `<span class="badge ${row.letter.replace("/", "")}">${row.letter}</span>`;
    }

    if (row.attendance !== null) {
      attendanceText = row.attendance + "%";
    }

    rowsHTML += `
      <tr>
        <td>${esc(row.code)}</td>
        <td>
          <a href="student-details.html?id=${encodeURIComponent(row.id)}">${esc(row.name)}</a>
        </td>
        <td>${gradeText}</td>
        <td>${letterHTML}</td>
        <td>${attendanceText}</td>
      </tr>
    `;
  }

  table.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Final grade</th>
          <th>Letter</th>
          <th>Attendance</th>
        </tr>
      </thead>
      <tbody>${rowsHTML}</tbody>
    </table>
  `;
}


// ==========================================
// Export the visible rows to a CSV file
// ==========================================

function exportCSV() {

  const visible = getVisibleRows();

  const data = [
    ["Code", "Name", "Final Grade", "Letter", "Attendance %"]
  ];

  for (let i = 0; i < visible.length; i++) {

    const row = visible[i];

    data.push([row.code, row.name, row.grade, row.letter, row.attendance]);
  }

  downloadCSV(data, "edutrack-report.csv");
}


loadPage();
