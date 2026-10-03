document.addEventListener("DOMContentLoaded", async () => {
    // Bail early if we can't identify the active user.
    // The fallback to "1" is a legacy dev hack. 
    // TODO: Remove the fallback once auth state is fully strictly enforced.
    const teacherId = typeof requireLogin === "function" ? requireLogin() : (localStorage.getItem("teacherId") || "1");
    if (!teacherId) return;

    const tableHead = document.getElementById("progress-table-head");
    const tableBody = document.getElementById("progress-table-body");
    const saveBtn = document.getElementById("save-progress-btn");

    // Kept at this scope so both the renderer and the live-preview listeners can access them 
    // without needing to pass them around constantly.
    let students = [];
    let assignments = [];

    async function loadPage() {
        try {
            const allStudents = await StudentsApi.listMine(teacherId);
            assignments = await AssignmentsApi.listMine(teacherId);
            
            // activeStudents is likely injected globally by grades.js. 
            // We check for it to support reusing this logic on pages that might include archived students.
            students = typeof activeStudents === "function" ? activeStudents(allStudents, teacherId) : allStudents;

            if (students.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="100%" class="empty-final">No students found. Add students first.</td></tr>';
                return;
            }

            renderTableHead();
            renderTableBody();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    function renderTableHead() {
        let headHTML = `<tr><th>Student</th>`;
        assignments.forEach(a => {
            headHTML += `<th>${a.title} /${a.maxScore}</th>`;
        });
        headHTML += `<th>Final</th></tr>`;
        tableHead.innerHTML = headHTML;
    }

    function getScore(student, assignmentId) {
        // The data shape is nested (scores -> teacherId -> assignmentId) 
        // because a student might be taking multiple courses simultaneously.
        return student.scores?.[teacherId]?.[assignmentId] ?? "";
    }

    function renderTableBody() {
        let bodyHTML = "";
        students.forEach(student => {
            const fGrade = typeof finalGrade === "function" ? finalGrade(student, teacherId, assignments) : null;
            let badgeHTML = `<span class="empty-final">—</span>`;
            
            if (fGrade !== null) {
                const lGrade = typeof letter === "function" ? letter(fGrade) : "";
                const badgeColor = fGrade >= 50 ? "badge-pass" : "badge-fail";
                badgeHTML = `<span class="badge ${badgeColor}">${fGrade}% ${lGrade}</span>`;
            }

            let scoreCells = "";
            assignments.forEach(a => {
                const score = getScore(student, a.id);
                // Flag failing individual assignments visually so teachers can spot struggling students quickly.
                const isLow = score !== "" && (Number(score) / a.maxScore) < 0.5 ? "input-error" : "";
                scoreCells += `<td><input type="number" class="grade-input ${isLow}" data-a="${a.id}" max="${a.maxScore}" min="0" value="${score}"></td>`;
            });

            bodyHTML += `<tr data-id="${student.id}">
                <td class="student-name">${student.fullName}</td>
                ${scoreCells}
                <td class="final-cell">${badgeHTML}</td>
            </tr>`;
        });
        tableBody.innerHTML = bodyHTML;
    }

    // Event delegation: listen on the parent table body instead of attaching 
    // hundreds of 'input' event listeners to individual cells. Saves memory on large rosters.
    if (tableBody) {
        tableBody.addEventListener("input", (e) => {
            if (!e.target.matches(".grade-input")) return;
            
            const input = e.target;
            const max = Number(input.getAttribute("max"));
            let val = input.value;
            const row = input.closest("tr");

            // Hard clamp values immediately. Users doing fast data entry will accidentally hit 
            // extra keys (e.g. typing 1000 instead of 100).
            if (val !== "") {
                if (Number(val) > max) {
                    input.value = max;
                    val = max;
                } else if (Number(val) < 0) {
                    input.value = 0;
                    val = 0;
                }
            }

            if (val !== "" && (Number(val) / max) < 0.5) {
                input.classList.add("input-error");
            } else {
                input.classList.remove("input-error");
            }

            const studentId = row.dataset.id;
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            // Live final grade preview computation
            const rowInputs = row.querySelectorAll(".grade-input");
            const previewScores = {};
            rowInputs.forEach(inp => {
                if (inp.value !== "") {
                    previewScores[inp.dataset.a] = Number(inp.value);
                }
            });

            // Hack to reuse the global `finalGrade` pure function without polluting our actual `students` array state.
            // We build a mock student object populated with the dirty DOM state.
            const previewStudent = { ...student };
            if (!previewStudent.scores) previewStudent.scores = {};
            previewStudent.scores[teacherId] = previewScores;

            const finalCell = row.querySelector(".final-cell");
            const fGrade = typeof finalGrade === "function" ? finalGrade(previewStudent, teacherId, assignments) : null;
            
            if (fGrade !== null) {
                const lGrade = typeof letter === "function" ? letter(fGrade) : "";
                const badgeColor = fGrade >= 50 ? "badge-pass" : "badge-fail";
                finalCell.innerHTML = `<span class="badge ${badgeColor}">${fGrade}% ${lGrade}</span>`;
            } else {
                finalCell.innerHTML = `<span class="empty-final">—</span>`;
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            const inputs = tableBody.querySelectorAll(".grade-input");
            
            // Sanity check before we fire anything to the backend.
            for (let input of inputs) {
                if (input.value !== "") {
                    const num = Number(input.value);
                    const max = Number(input.getAttribute("max"));
                    if (num < 0 || num > max) {
                        input.focus();
                        alert("A score is outside the allowed range.");
                        return;
                    }
                }
            }

            saveBtn.innerHTML = "Saving...";
            saveBtn.disabled = true;

            try {
                // TODO: PERFORMANCE BOTTLENECK. 
                // We are firing an N+1 sequence of await calls for every student. 
                // This will completely choke on a class of 100+ students. 
                // Need to refactor `StudentsApi.update` to accept a bulk payload array.
                const rows = tableBody.querySelectorAll("tr[data-id]");
                for (let row of rows) {
                    const studentId = row.dataset.id;
                    const student = students.find(s => s.id === studentId);
                    if (!student) continue;

                    const rowInputs = row.querySelectorAll(".grade-input");
                    const newScores = {};
                    
                    rowInputs.forEach(input => {
                        if (input.value !== "") {
                            newScores[input.dataset.a] = Number(input.value);
                        }
                    });

                    // Spread merge so we don't accidentally wipe out grades they have from other teachers/courses.
                    const updatedStudent = { ...student };
                    if (!updatedStudent.scores) updatedStudent.scores = {};
                    updatedStudent.scores[teacherId] = newScores;

                    await StudentsApi.update(studentId, updatedStudent);
                }
                
                await loadPage(); 
            } catch (error) {
                console.error("Save error:", error);
                alert("Failed to save changes.");
            } finally {
                saveBtn.innerHTML = "Save Changes";
                saveBtn.disabled = false;
            }
        });
    }

    loadPage();
});