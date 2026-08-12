// =====================================
// DEN1MTEN SPACE SETTINGS
// =====================================

// ---------- ELEMENTS ----------

const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");

const settingsUsername = document.getElementById("settingsUsername");
const settingsEmail = document.getElementById("settingsEmail");
const settingsEmailPassword = document.getElementById("settingsEmailPassword");

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const updateUsernameBtn = document.getElementById("updateUsernameBtn");
const updateEmailBtn = document.getElementById("updateEmailBtn");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");


// =====================================
// OPEN / CLOSE SETTINGS
// =====================================

function openSettings() {

    if (!settingsModal) return;

    settingsModal.classList.remove("hidden");

    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");

    if (settingsUsername) {
        settingsUsername.value = username || "";
    }

    if (settingsEmail) {
        settingsEmail.value = email || "";
    }

}


function closeSettingsPanel() {

    if (!settingsModal) return;

    settingsModal.classList.add("hidden");

}


// ---------- CLOSE BUTTON ----------

if (closeSettings) {

    closeSettings.onclick = closeSettingsPanel;

}


// ---------- CLICK OUTSIDE ----------

if (settingsModal) {

    settingsModal.addEventListener("click", (e) => {

        if (e.target === settingsModal) {

            closeSettingsPanel();

        }

    });

}


// ---------- ESC ----------

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeSettingsPanel();

    }

});


// =====================================
// UPDATE USERNAME
// =====================================

async function updateUsername() {

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login again.");

        return;

    }

    const username = settingsUsername.value.trim();

    if (!username) {

        alert("Username is required.");

        return;

    }

    try {

        const response = await fetch("/api/account/username", {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify({

                username

            })

        });

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        // Backend returns a fresh JWT
        localStorage.setItem("token", data.token);

        localStorage.setItem(
            "username",
            data.user.username
        );

        localStorage.setItem(
            "email",
            data.user.email
        );

        alert("Username updated.");

        closeSettingsPanel();

        updateUserPanel();

    } catch (err) {

        console.error("Username update error:", err);

        alert("Server unavailable.");

    }

}


if (updateUsernameBtn) {

    updateUsernameBtn.onclick = updateUsername;

}


// =====================================
// UPDATE EMAIL
// =====================================

async function updateEmail() {

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login again.");

        return;

    }

    const email = settingsEmail.value.trim();
    const password = settingsEmailPassword.value;

    if (!email) {

        alert("Email is required.");

        return;

    }

    if (!password) {

        alert("Current password is required.");

        return;

    }

    try {

        const response = await fetch("/api/account/email", {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify({

                email,
                password

            })

        });

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        localStorage.setItem(
            "email",
            data.user.email
        );

        settingsEmailPassword.value = "";

        alert("Email updated.");

        closeSettingsPanel();

        updateUserPanel();

    } catch (err) {

        console.error("Email update error:", err);

        alert("Server unavailable.");

    }

}


// ---------- EMAIL BUTTON ----------

if (updateEmailBtn) {

    updateEmailBtn.onclick = updateEmail;

}


// =====================================
// UPDATE PASSWORD
// =====================================

async function updatePassword() {

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login again.");

        return;

    }

    const oldPassword = currentPassword.value;
    const password = newPassword.value;
    const confirm = confirmPassword.value;

    if (!oldPassword || !password || !confirm) {

        alert("All password fields are required.");

        return;

    }

    if (password !== confirm) {

        alert("New passwords do not match.");

        return;

    }

    if (password.length < 6) {

        alert("New password must contain at least 6 characters.");

        return;

    }

    try {

        const response = await fetch("/api/account/password", {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify({

                oldPassword,
                newPassword: password

            })

        });

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        /*
         * Password changed successfully.
         *
         * The old JWT should no longer be used.
         * Clear authentication and force a fresh login.
         */

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";

        closeSettingsPanel();

        updateUserPanel();

        alert("Password changed. Please login again.");

    } catch (err) {

        console.error("Password update error:", err);

        alert("Server unavailable.");

    }

}


// ---------- PASSWORD BUTTON ----------

if (updatePasswordBtn) {

    updatePasswordBtn.onclick = updatePassword;

}
