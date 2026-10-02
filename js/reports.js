const TYPES = ["quiz", "assignment", "exam"];

let rows = [];
let letterFilter = "";
let searchText = "";

// ---------- tiny DOM helpers ----------
const setText  = (id, value) => document.getElementById(id).textContent = value;
const setWidth = (id, value) => document.getElementById(id).style.width = value + "%";

// ---------- load page ----------
async function loadPage() {
  if (!teacherId) return;

  try {
    const students    = await StudentsApi.listMine(teacherId);
    const assignments = await AssignmentsApi.listMine(teacherId);

    rows = buildRows(students, teacherId, assignments);
    const summary  = summarize(rows);
    const averages = averageByType(students, assignments);

    // summary cards
    setText("active-students", rows.length);
    setText("class-average", summary.average + "%");
    setText("pass-rate", summary.passRate + "%");
    setText("assignment-count", assignments.length);

    // progress bars (quiz / assignment / exam)
    TYPES.forEach((type, i) => {
      setText(`${type}-average`, averages[i] + "%");
      setWidth(`${type}-progress`, averages[i]);
    });

    // overall circle
    setText("performance-average", summary.average + "%");
    document.getElementById("performance-circle").style.background =
      `conic-gradient(var(--primary) 0% ${summary.average}%,
                      var(--track) ${summary.average}% 100%)`;

    // charts
    drawChart("dist", "bar", Object.keys(summary.distribution),
              Object.values(summary.distribution), "Students");
    drawChart("types", "bar", ["Quiz", "Assignment", "Exam"],
              averages, "Average %");

    // events
    document.getElementById("search").oninput = e => {
      searchText = e.target.value.trim().toLowerCase();
      displayTable();
    };
    document.getElementById("letter").onchange = e => {
      letterFilter = e.target.value;
      displayTable();
    };
    document.getElementById("print").onclick = () => window.print();
    document.getElementById("csv").onclick = exportCSV;

    displayTable();

  } catch (error) {
    showError(error.message);
  }
}

// ---------- average % per type ----------
function averageByType(students, assignments) {
  return TYPES.map(type => {
    const percents = [];

    for (const a of assignments.filter(a => a.type === type)) {
      for (const s of students) {
        const score = s.scores?.[teacherId]?.[a.id];
        if (hasScore(score)) percents.push((score / a.maxScore) * 100);
      }
    }

    const sum = percents.reduce((x, y) => x + y, 0);
    return percents.length ? Math.round(sum / percents.length) : 0;
  });
}

// ---------- search + filter ----------
function getVisibleRows() {
  return rows.filter(row =>
    (letterFilter === "" || row.letter === letterFilter) &&
    `${row.name} ${row.code}`.toLowerCase().includes(searchText)
  );
}

// ---------- table ----------
function statusClass(letterGrade) {
  if (letterGrade === "A") return "status-good";
  if (letterGrade === "B" || letterGrade === "C") return "status-average";
  return "status-low";
}

function displayTable() {
  const table   = document.getElementById("table");
  const visible = getVisibleRows();

  if (visible.length === 0) {
    table.innerHTML = `
      <div class="report-empty">
        <div class="report-empty-icon">🔍</div>
        <h3>No results found</h3>
        <p>Try changing your search or filter.</p>
      </div>`;
    return;
  }

  const rowsHTML = visible.map(row => `
    <tr>
      <td>${esc(row.code)}</td>
      <td>
        <a href="student-details.html?id=${encodeURIComponent(row.id)}">
          ${esc(row.name)}
        </a>
      </td>
      <td>${row.grade ?? "—"}</td>
      <td>
        ${row.grade === null
          ? "—"
          : `<span class="report-status ${statusClass(row.letter)}">${row.letter}</span>`}
      </td>
    </tr>`).join("");

  table.innerHTML = `
    <table class="report-table">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Final Grade</th><th>Letter</th></tr>
      </thead>
      <tbody>${rowsHTML}</tbody>
    </table>`;
}

// ---------- CSV ----------
function exportCSV() {
  const data = [
    ["Code", "Name", "Final Grade", "Letter"],
    ...getVisibleRows().map(r => [r.code, r.name, r.grade, r.letter])
  ];
  downloadCSV(data, "edutrack-report.csv");
}

loadPage();