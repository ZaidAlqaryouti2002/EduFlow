// ui.js
// Reusable helper functions


// ==========================================
// Make text safe before putting it into HTML
// ==========================================

function esc(text) {

  if (text === null || text === undefined) {
    return "";
  }

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


// ==========================================
// Colored grade label
// Example: 90% A
// ==========================================

function badge(grade) {

  if (grade === null) {
    return "—";
  }

  const letterGrade = letter(grade);

  const cssClass = letterGrade.replace("/", "");

  return `<span class="badge ${cssClass}">
    ${grade}% ${letterGrade}
  </span>`;
}


// ==========================================
// Show an error message on the page
// ==========================================

function showError(message) {

  const content = document.getElementById("content");

  if (content) {

    content.innerHTML =
      `<p class="message error">${esc(message)}</p>`;

  } else {

    document.getElementById("app").innerHTML =
      `<p class="message error">
        ${esc(message)}
      </p>`;
  }
}


// ==========================================
// Popup form
// ==========================================

function formDialog(title, body, onSubmit) {

  const dialog = document.createElement("dialog");

  dialog.innerHTML = `
    <form class="modal" novalidate>

      <h3>${esc(title)}</h3>

      ${body}

      <p class="message error" role="alert"></p>

      <div class="actions">
        <button type="button" class="btn" data-close>
          Cancel
        </button>

        <button class="btn primary">
          Save
        </button>
      </div>

    </form>
  `;

  document.body.append(dialog);

  dialog.showModal();

  const form = dialog.querySelector("form");


  // Cancel button

  dialog.querySelector("[data-close]").onclick = function () {
    dialog.close();
  };


  // Remove dialog when it closes

  dialog.addEventListener("close", function () {
    dialog.remove();
  });


  // Save button

  form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const saveButton = form.querySelector(".primary");

    saveButton.disabled = true;

    try {

      await onSubmit(new FormData(form));

      dialog.close();

    } catch (error) {

      dialog.querySelector(".message").textContent =
        error.message;

      saveButton.disabled = false;
    }
  });
}


// ==========================================
// Download CSV file
// ==========================================

function downloadCSV(rows, filename) {

  let text = "";

  for (let r = 0; r < rows.length; r++) {

    const cells = [];

    for (let c = 0; c < rows[r].length; c++) {

      let value = rows[r][c];

      if (value === null || value === undefined) {
        value = "";
      }

      value = String(value).replace(/"/g, '""');

      cells.push('"' + value + '"');
    }

    text += cells.join(",") + "\n";
  }


  const blob = new Blob(
    [text],
    { type: "text/csv;charset=utf-8;" }
  );

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = filename;

  link.click();

  URL.revokeObjectURL(link.href);
}