async function loadDashboardData() {
    const greetingElement = document.querySelector(".greeting .name");
    const teacher = await TeachersApi.get(teacherId);

    if (greetingElement) {
        greetingElement.textContent = teacher.name;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});
