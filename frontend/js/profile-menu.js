// =====================================
// DEN1MTEN SPACE PROFILE MENU
// =====================================

function renderProfileMenu(username) {

    console.log("renderProfileMenu() викликано", username);

    const container = document.getElementById("profileMenuContainer");

    if (!container) return;

    container.innerHTML = `

        <div id="profilePanel" class="profile-panel hidden">

            <div class="profile-header">

                <div class="profile-avatar">
                    <img src="/assets/images/ava.jpg">
                </div>

                <div class="profile-user">
                    <h3>${username}</h3>
                    <div class="status">🟢 Online</div>
                </div>

            </div>

            <div class="profile-divider"></div>

            <div class="profile-nav">

                <button class="menu-item">Dashboard</button>
                <button class="menu-item">Notes</button>
                <button class="menu-item">Music</button>
                <button class="menu-item">Blog</button>

                <button id="settingsButton" class="menu-item">
                    Settings
                </button>

            </div>

            <div class="profile-divider"></div>

            <button id="logoutBtn" class="logout-btn">
                Logout
            </button>

        </div>

    `;

    const profileButton = document.getElementById("profileButton");
    const profilePanel = document.getElementById("profilePanel");
    const settingsButton = document.getElementById("settingsButton");
    const logoutButton = document.getElementById("logoutBtn");

    if (!profileButton || !profilePanel) return;


    // =====================================
    // OPEN / CLOSE PROFILE MENU
    // =====================================

    profileButton.onclick = (e) => {

        e.stopPropagation();

        profilePanel.classList.toggle("hidden");

    };


    // =====================================
    // DON'T CLOSE WHEN CLICKING INSIDE
    // =====================================

    profilePanel.onclick = (e) => {

        e.stopPropagation();

    };


    // =====================================
    // SETTINGS
    // =====================================

    if (settingsButton) {

        settingsButton.onclick = (e) => {

            e.stopPropagation();

            console.log("Settings натиснуто");

            openSettings();

        };

    }


    // =====================================
    // LOGOUT
    // =====================================

    if (logoutButton) {

        logoutButton.onclick = (e) => {

            e.stopPropagation();

            logout();

        };

    }


    // =====================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =====================================

    if (!window.__den1mtenProfileMenuHandler) {

        window.__den1mtenProfileMenuHandler = true;

        document.addEventListener("click", () => {

            const panel = document.getElementById("profilePanel");

            if (panel) {

                panel.classList.add("hidden");

            }

        });

    }


    // =====================================
    // CLOSE WITH ESCAPE
    // =====================================

    if (!window.__den1mtenProfileEscapeHandler) {

        window.__den1mtenProfileEscapeHandler = true;

        document.addEventListener("keydown", (e) => {

            if (e.key !== "Escape") return;

            const panel = document.getElementById("profilePanel");

            if (panel) {

                panel.classList.add("hidden");

            }

        });

    }

}
