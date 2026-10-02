// =========================================================
// PROFILE
// =========================================================


const teacherId =
    localStorage.getItem("teacherId") || "1";


const profileImageKey =
    `teacherProfileImage_${teacherId}`;


let teacher = null;

let selectedImage = null;


// =========================================================
// ELEMENTS
// =========================================================


// -------------------------
// Loading / Content
// -------------------------

const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );


const profileContent =
    document.getElementById(
        "profileContent"
    );


// -------------------------
// Main Profile
// -------------------------

const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );


const profileName =
    document.getElementById(
        "profileName"
    );


const profileMajor =
    document.getElementById(
        "profileMajor"
    );


const profileUniversity =
    document.getElementById(
        "profileUniversity"
    );


const teacherIdElement =
    document.getElementById(
        "teacherId"
    );


const profileEmail =
    document.getElementById(
        "profileEmail"
    );


const profileDepartment =
    document.getElementById(
        "profileDepartment"
    );


// -------------------------
// Academic Information
// -------------------------

const academicId =
    document.getElementById(
        "academicId"
    );


const academicMajor =
    document.getElementById(
        "academicMajor"
    );


const academicDepartment =
    document.getElementById(
        "academicDepartment"
    );


const academicYear =
    document.getElementById(
        "academicYear"
    );


// =========================================================
// EDIT PROFILE ELEMENTS
// =========================================================


const editModal =
    document.getElementById(
        "editModal"
    );


const editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );


const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );


const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );


const editProfileForm =
    document.getElementById(
        "editProfileForm"
    );


const editAvatar =
    document.getElementById(
        "editAvatar"
    );


const profilePicture =
    document.getElementById(
        "profilePicture"
    );


const removePictureBtn =
    document.getElementById(
        "removePictureBtn"
    );


const editName =
    document.getElementById(
        "editName"
    );


const editEmail =
    document.getElementById(
        "editEmail"
    );


const editDepartment =
    document.getElementById(
        "editDepartment"
    );


const formMessage =
    document.getElementById(
        "formMessage"
    );


// =========================================================
// ACCOUNT SETTINGS ELEMENTS
// =========================================================


// -------------------------
// Change Password
// -------------------------

const changePasswordBtn =
    document.getElementById(
        "changePasswordBtn"
    );


const passwordModal =
    document.getElementById(
        "passwordModal"
    );


const closePasswordModalBtn =
    document.getElementById(
        "closePasswordModalBtn"
    );


const cancelPasswordBtn =
    document.getElementById(
        "cancelPasswordBtn"
    );


const passwordForm =
    document.getElementById(
        "passwordForm"
    );


const passwordMessage =
    document.getElementById(
        "passwordMessage"
    );


// -------------------------
// Settings Modal
// -------------------------

const settingsModal =
    document.getElementById(
        "settingsModal"
    );


const closeSettingsModalBtn =
    document.getElementById(
        "closeSettingsModalBtn"
    );


const settingsModalTitle =
    document.getElementById(
        "settingsModalTitle"
    );


const settingsModalDescription =
    document.getElementById(
        "settingsModalDescription"
    );


// -------------------------
// Language
// -------------------------

const languageBtn =
    document.getElementById(
        "languageBtn"
    );


const currentLanguage =
    document.getElementById(
        "currentLanguage"
    );


const languageOptions =
    document.getElementById(
        "languageOptions"
    );


const englishOption =
    document.getElementById(
        "englishOption"
    );


const arabicOption =
    document.getElementById(
        "arabicOption"
    );


// -------------------------
// Theme
// -------------------------

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


const currentTheme =
    document.getElementById(
        "currentTheme"
    );


const themeOptions =
    document.getElementById(
        "themeOptions"
    );


const lightThemeOption =
    document.getElementById(
        "lightThemeOption"
    );


const darkThemeOption =
    document.getElementById(
        "darkThemeOption"
    );


// =========================================================
// GET SAVED PROFILE IMAGE
// =========================================================


function getSavedProfileImage() {

    return localStorage.getItem(
        profileImageKey
    );

}


// =========================================================
// LOAD PROFILE
// =========================================================


async function loadProfile() {

    try {

        loadingMessage.textContent =
            "Loading profile...";


        // Get teacher information
        // from MockAPI

        teacher =
            await TeachersApi.get(
                teacherId
            );


        displayProfile();


        loadingMessage.style.display =
            "none";


        profileContent.classList.add(
            "loaded"
        );


    } catch (error) {

        console.error(
            "Error loading profile:",
            error
        );


        loadingMessage.textContent =
            "Could not load profile.";

    }

}


// =========================================================
// DISPLAY PROFILE
// =========================================================


function displayProfile() {

    if (!teacher) {

        return;

    }


    const name =
        teacher.name ||
        "Unknown Teacher";


    const email =
        teacher.email ||
        "Not provided";


    const department =
        teacher.department ||
        "Not provided";


    // =====================================================
    // NAME
    // =====================================================

    profileName.textContent =
        name;


    // =====================================================
    // EMAIL
    // =====================================================

    profileEmail.textContent =
        email;


    // =====================================================
    // MAJOR / DEPARTMENT
    // =====================================================

    const major =
        teacher.major ||
        teacher.department ||
        "Not provided";


    profileMajor.textContent =
        formatText(major);


    profileDepartment.textContent =
        formatText(department);


    academicMajor.textContent =
        formatText(major);


    academicDepartment.textContent =
        formatText(department);


    // =====================================================
    // TEACHER ID
    // =====================================================

    teacherIdElement.textContent =
        teacher.id ||
        "Not provided";


    academicId.textContent =
        teacher.id ||
        "Not provided";


    // =====================================================
    // OPTIONAL INFORMATION
    // =====================================================

    academicYear.textContent =
        teacher.academicYear ||
        "Not provided";


    profileUniversity.textContent =
        teacher.university ||
        "EduFlow University";


    // =====================================================
    // PROFILE PICTURE
    // =====================================================

    const savedImage =
        getSavedProfileImage();


    updateAvatar(
        profileAvatar,
        name,
        savedImage
    );

}


// =========================================================
// FORMAT TEXT
// =========================================================


function formatText(text) {

    if (!text) {

        return "Not provided";

    }


    return text
        .toString()
        .replace(
            /\b\w/g,
            function (letter) {

                return letter.toUpperCase();

            }
        );

}


// =========================================================
// GET INITIALS
// =========================================================


function getInitials(name) {

    if (!name) {

        return "?";

    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    const firstLetter =
        words[0]
            .charAt(0)
            .toUpperCase();


    const lastLetter =
        words[words.length - 1]
            .charAt(0)
            .toUpperCase();


    return firstLetter + lastLetter;

}


// =========================================================
// UPDATE AVATAR
// =========================================================


function updateAvatar(
    element,
    name,
    image
) {

    if (!element) {

        return;

    }


    // Remove previous content

    element.innerHTML = "";


    // -----------------------------------------
    // If image exists
    // -----------------------------------------

    if (image) {

        const img =
            document.createElement("img");


        img.src =
            image;


        img.alt =
            `${name} profile picture`;


        // If image doesn't work,
        // show initials instead.

        img.onerror =
            function () {

                element.innerHTML =
                    getInitials(name);

            };


        element.appendChild(img);


        return;

    }


    // -----------------------------------------
    // No image
    // -----------------------------------------

    element.textContent =
        getInitials(name);

}


// =========================================================
// OPEN EDIT PROFILE
// =========================================================


editProfileBtn.addEventListener(
    "click",
    function () {

        if (!teacher) {

            console.log(
                "Profile data is still loading."
            );

            return;

        }


        fillEditForm();


        editModal.classList.add(
            "show"
        );

    }
);


// =========================================================
// FILL EDIT FORM
// =========================================================


function fillEditForm() {

    editName.value =
        teacher.name || "";


    editEmail.value =
        teacher.email || "";


    editDepartment.value =
        teacher.department ||
        teacher.major ||
        "";


    // Get current profile picture
    // from localStorage

    selectedImage =
        getSavedProfileImage();


    updateAvatar(
        editAvatar,
        teacher.name || "",
        selectedImage
    );


    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";

}


// =========================================================
// CLOSE EDIT PROFILE MODAL
// =========================================================


function closeModal() {

    editModal.classList.remove(
        "show"
    );

}


closeModalBtn.addEventListener(
    "click",
    closeModal
);


cancelBtn.addEventListener(
    "click",
    closeModal
);


// =========================================================
// CLOSE EDIT MODAL WHEN CLICKING OUTSIDE
// =========================================================


editModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === editModal
        ) {

            closeModal();

        }

    }
);


// =========================================================
// UPLOAD PROFILE PICTURE
// =========================================================


profilePicture.addEventListener(
    "change",
    function () {

        const file =
            profilePicture.files[0];


        if (!file) {

            return;

        }


        // Make sure it is an image

        if (
            !file.type.startsWith("image/")
        ) {

            showFormMessage(
                "Please select an image file.",
                "error"
            );


            profilePicture.value =
                "";


            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                selectedImage =
                    event.target.result;


                updateAvatar(
                    editAvatar,
                    editName.value,
                    selectedImage
                );

            };


        reader.onerror =
            function () {

                showFormMessage(
                    "Could not read the image.",
                    "error"
                );

            };


        reader.readAsDataURL(file);

    }
);


// =========================================================
// REMOVE PROFILE PICTURE
// =========================================================


removePictureBtn.addEventListener(
    "click",
    function () {

        selectedImage =
            null;


        profilePicture.value =
            "";


        updateAvatar(
            editAvatar,
            editName.value,
            null
        );

    }
);


// =========================================================
// UPDATE INITIALS WHEN NAME CHANGES
// =========================================================


editName.addEventListener(
    "input",
    function () {

        // Only change the avatar if
        // there is no uploaded image.

        if (!selectedImage) {

            updateAvatar(
                editAvatar,
                editName.value,
                null
            );

        }

    }
);


// =========================================================
// SAVE PROFILE
// =========================================================


editProfileForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // -----------------------------------------
        // Get values
        // -----------------------------------------

        const name =
            editName.value.trim();


        const email =
            editEmail.value.trim();


        const department =
            editDepartment.value.trim();


        // -----------------------------------------
        // Validate
        // -----------------------------------------

        if (!name) {

            showFormMessage(
                "Name is required.",
                "error"
            );

            return;

        }


        if (!email) {

            showFormMessage(
                "Email is required.",
                "error"
            );

            return;

        }


        if (!department) {

            showFormMessage(
                "Department is required.",
                "error"
            );

            return;

        }


        // -----------------------------------------
        // Remove avatar from teacher object
        // -----------------------------------------

        const {
            avatar,
            ...teacherWithoutAvatar
        } = teacher;


        // -----------------------------------------
        // Updated teacher
        // -----------------------------------------

        const updatedTeacher = {

            ...teacherWithoutAvatar,

            name: name,

            email: email,

            department: department

        };


        try {

            showFormMessage(
                "Saving changes...",
                ""
            );


            // -----------------------------------------
            // Save teacher information to MockAPI
            // -----------------------------------------

            teacher =
                await TeachersApi.update(
                    teacher.id,
                    updatedTeacher
                );


            // -----------------------------------------
            // Save profile picture to localStorage
            // -----------------------------------------

            if (selectedImage) {

                localStorage.setItem(
                    profileImageKey,
                    selectedImage
                );

            } else {

                localStorage.removeItem(
                    profileImageKey
                );

            }


            // -----------------------------------------
            // Update page
            // -----------------------------------------

            displayProfile();


            showFormMessage(
                "Profile updated successfully.",
                "success"
            );


            // Close after a short delay

            setTimeout(
                function () {

                    closeModal();

                },
                700
            );


        } catch (error) {

            console.error(
                "Error updating profile:",
                error
            );


            showFormMessage(
                "Could not save profile. Please try again.",
                "error"
            );

        }

    }
);


// =========================================================
// FORM MESSAGE
// =========================================================


function showFormMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    formMessage.className =
        "form-message";


    if (type) {

        formMessage.classList.add(
            type
        );

    }

}


// =========================================================
// CHANGE PASSWORD
// =========================================================


// Open password modal

changePasswordBtn.addEventListener(
    "click",
    function () {

        passwordForm.reset();


        passwordMessage.textContent =
            "";


        passwordMessage.className =
            "form-message";


        passwordModal.classList.add(
            "show"
        );

    }
);


// Close password modal

function closePasswordModal() {

    passwordModal.classList.remove(
        "show"
    );

}


closePasswordModalBtn.addEventListener(
    "click",
    closePasswordModal
);


cancelPasswordBtn.addEventListener(
    "click",
    closePasswordModal
);


// =========================================================
// CLOSE PASSWORD MODAL WHEN CLICKING OUTSIDE
// =========================================================


passwordModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === passwordModal
        ) {

            closePasswordModal();

        }

    }
);


// =========================================================
// PASSWORD FORM
// =========================================================


passwordForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const currentPassword =
            document.getElementById(
                "currentPassword"
            ).value;


        const newPassword =
            document.getElementById(
                "newPassword"
            ).value;


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;


        // -----------------------------------------
        // Current password
        // -----------------------------------------

        if (!currentPassword) {

            passwordMessage.textContent =
                "Current password is required.";


            passwordMessage.className =
                "form-message error";


            return;

        }


        // -----------------------------------------
        // Password length
        // -----------------------------------------

        if (
            newPassword.length < 8
        ) {

            passwordMessage.textContent =
                "Password must be at least 8 characters.";


            passwordMessage.className =
                "form-message error";


            return;

        }


        // -----------------------------------------
        // Password confirmation
        // -----------------------------------------

        if (
            newPassword !==
            confirmPassword
        ) {

            passwordMessage.textContent =
                "Passwords do not match.";


            passwordMessage.className =
                "form-message error";


            return;

        }


        /*
         * Password backend logic will
         * be connected later.
         */


        passwordMessage.textContent =
            "Password changed successfully.";


        passwordMessage.className =
            "form-message success";


        setTimeout(
            function () {

                closePasswordModal();

            },
            1000
        );

    }
);


// =========================================================
// LANGUAGE SETTINGS
// =========================================================


// Open language settings

languageBtn.addEventListener(
    "click",
    function () {

        languageOptions.style.display =
            "block";


        themeOptions.style.display =
            "none";


        settingsModalTitle.textContent =
            "Language";


        settingsModalDescription.textContent =
            "Choose your preferred language.";


        settingsModal.classList.add(
            "show"
        );

    }
);


// =========================================================
// ENGLISH OPTION
// =========================================================


englishOption.addEventListener(
    "click",
    function () {

        currentLanguage.textContent =
            "English";


        englishOption.classList.add(
            "active"
        );


        arabicOption.classList.remove(
            "active"
        );

    }
);


// Arabic is disabled intentionally.
// It cannot be selected yet.


// =========================================================
// THEME SETTINGS
// =========================================================


// Open theme settings

themeBtn.addEventListener(
    "click",
    function () {

        languageOptions.style.display =
            "none";


        themeOptions.style.display =
            "block";


        settingsModalTitle.textContent =
            "Theme";


        settingsModalDescription.textContent =
            "Choose your preferred theme.";


        settingsModal.classList.add(
            "show"
        );

    }
);


// =========================================================
// LIGHT THEME
// =========================================================


lightThemeOption.addEventListener(
    "click",
    function () {

        currentTheme.textContent =
            "Light";


        lightThemeOption.classList.add(
            "active"
        );


        darkThemeOption.classList.remove(
            "active"
        );


        /*
         * The actual theme will be
         * connected later using cookies.
         *
         * Nothing changes visually here.
         */

    }
);


// =========================================================
// DARK THEME
// =========================================================


darkThemeOption.addEventListener(
    "click",
    function () {

        currentTheme.textContent =
            "Dark";


        darkThemeOption.classList.add(
            "active"
        );


        lightThemeOption.classList.remove(
            "active"
        );


        /*
         * The actual theme will be
         * connected later using cookies.
         *
         * Nothing changes visually here.
         */

    }
);


// =========================================================
// CLOSE SETTINGS MODAL
// =========================================================


function closeSettingsModal() {

    settingsModal.classList.remove(
        "show"
    );

}


closeSettingsModalBtn.addEventListener(
    "click",
    closeSettingsModal
);


// =========================================================
// CLOSE SETTINGS MODAL WHEN CLICKING OUTSIDE
// =========================================================


settingsModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === settingsModal
        ) {

            closeSettingsModal();

        }

    }
);


// =========================================================
// START
// =========================================================


loadProfile();