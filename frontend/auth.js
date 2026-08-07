// ============================================
// DEN1MTEN SPACE AUTH SYSTEM
// ============================================

// ---------- ELEMENTS ----------

const loginOpen = document.getElementById("loginOpen");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginBtn = document.getElementById("loginBtn");

// ---------- OPEN LOGIN ----------

if (loginOpen) {

    loginOpen.onclick = () => {

        loginModal.style.display = "flex";

    };

}

// ---------- CLOSE LOGIN ----------

if (closeLogin) {

    closeLogin.onclick = () => {

        loginModal.style.display = "none";

    };

}

window.addEventListener("click", (e) => {

    if (e.target === loginModal) {

        loginModal.style.display = "none";

    }

});

window.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        loginModal.style.display = "none";

    }

});

// ============================================
// LOGIN
// ============================================

async function login() {

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

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

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);

        loginModal.style.display = "none";

        updateUserPanel();

    }

    catch (err) {

        console.error(err);

        alert("Server unavailable");

    }

}

if (loginBtn) {

    loginBtn.onclick = login;

}

// ============================================
// USER PANEL
// ============================================

function updateUserPanel() {

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const panel = document.getElementById("userPanel");

    if (!panel) return;

    // -----------------------
    // NOT LOGGED
    // -----------------------

    if (!token) {

        panel.innerHTML = `
            <button id="loginOpen">
                👤 Login
            </button>
        `;

        document
            .getElementById("loginOpen")
            .onclick = () => {

                loginModal.style.display = "flex";

            };

        return;

    }

    // -----------------------
    // LOGGED
    // -----------------------

    panel.innerHTML = `
        <button id="profileButton">
            👤 ${username}
        </button>

        <div id="profileMenuContainer"></div>
    `;

    console.log("Перед renderProfileMenu");
    console.log(typeof renderProfileMenu);

    renderProfileMenu(username);

}

// ============================================
// LOGOUT
// ============================================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    const container = document.getElementById("profileMenuContainer");

    if (container) {
        container.innerHTML = "";
    }

if (loginOpen) {

    loginOpen.innerHTML = "👤 Login";

}

}

// ---------- START ----------

document.addEventListener("DOMContentLoaded", () => {

    updateUserPanel();

});
