// ============================================
// DEN1MTEN SPACE AUTH SYSTEM
// ============================================

// ---------- ELEMENTS ----------

const loginOpen = document.getElementById("loginOpen");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginBtn = document.getElementById("loginBtn");
const registerOpen = document.getElementById("registerOpen");
const registerModal = document.getElementById("registerModal");
const closeRegister = document.getElementById("closeRegister");
const registerBtn = document.getElementById("registerBtn");

// ---------- OPEN LOGIN ----------

if (loginOpen) {

    loginOpen.onclick = () => {

        loginModal.style.display = "flex";

    };

}

// ---------- OPEN REGISTER ----------

if (registerOpen) {

    registerOpen.onclick = () => {

        registerModal.style.display = "flex";

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

async function register() {

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                username,
                email,
                password

            })

        });

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

const loginResponse = await fetch("/api/login", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        email,
        password
    })

});

const loginData = await loginResponse.json();

if (!loginData.success) {

    alert("Account created, but automatic login failed.");
    registerModal.style.display = "none";

    return;

}

localStorage.setItem("token", loginData.token);
localStorage.setItem("username", loginData.user.username);
localStorage.setItem("email", loginData.user.email);

registerModal.style.display = "none";

updateUserPanel();


    }

    catch (err) {

        console.error(err);

        alert("Server unavailable");

    }

}

if (registerBtn) {

    registerBtn.onclick = register;

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

    updateUserPanel();

}

// ---------- START ----------

document.addEventListener("DOMContentLoaded", () => {

    updateUserPanel();

});
