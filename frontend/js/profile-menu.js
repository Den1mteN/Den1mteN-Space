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
        <img id="profileAvatar" src="/assets/images/default-avatar.png">
                </div>

<div class="profile-user">
    <h3>${username}</h3>
    <div class="status">🟢 Online</div>

    <button id="changeAvatarButton" class="menu-item">
        📷 Змінити аватар
    </button>

    <input
        type="file"
        id="avatarInput"
        accept=".jpg,.jpeg,.png,.webp"
        style="display: none;"
    >
</div>

            </div>

            <section id="profileAchievements"
                     class="profile-achievements"
                     aria-label="Мої відзнаки">
                <div class="profile-achievements__heading">
                    <span aria-hidden="true">🏅</span>
                    <strong>Мої відзнаки</strong>
                </div>

                <div id="profileAchievementsList"
                     class="profile-achievements__list"
                     aria-live="polite">
                    <p class="profile-achievements__empty">
                        Завантажуємо відзнаки...
                    </p>
                </div>
            </section>

            <div class="profile-divider"></div>

            <div class="profile-nav">

                <button class="menu-item">Dashboard</button>
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
    setupDashboardMenu();

    const profileButton = document.getElementById("profileButton");
    const profilePanel = document.getElementById("profilePanel");
    const settingsButton = document.getElementById("settingsButton");
    const changeAvatarButton = document.getElementById("changeAvatarButton");
    const avatarInput = document.getElementById("avatarInput");
    const logoutButton = document.getElementById("logoutBtn");

    if (!profileButton || !profilePanel) return;

// =====================================
// CHANGE AVATAR — FILE PICKER
// =====================================

if (changeAvatarButton && avatarInput) {

    changeAvatarButton.onclick = (e) => {

        e.stopPropagation();

        avatarInput.click();

    };

}

avatarInput.addEventListener("change", async () => {

    console.log("🔥 CHANGE AVATAR СПРАЦЮВАВ");

    const file = avatarInput.files[0];

    console.log("📁 FILE:", file);


    if (!file) return;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Дозволені тільки JPG, PNG та WEBP.");

        avatarInput.value = "";

        return;
    }

    if (file.size > 5 * 1024 * 1024) {

        alert("Максимальний розмір аватарки — 5 MB.");

        avatarInput.value = "";

        return;
    }

    const formData = new FormData();

    formData.append("avatar", file);

    try {

        const response = await fetch("/api/account/avatar", {

            method: "POST",

            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            },

            body: formData

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Не вдалося змінити аватар"
            );

        }

        const avatar = document.getElementById("profileAvatar");

        if (avatar && data.avatar_url) {

            avatar.src = data.avatar_url + "?v=" + Date.now();

        }

        console.log("Аватар оновлено:", data.avatar_url);

    } catch (error) {

        console.error("Avatar upload error:", error);

        alert(error.message);

    }

    avatarInput.value = "";

});

// =====================================
// LOAD USER AVATAR
// =====================================

fetch("/api/me", {
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
    }
})
.then(response => response.json())
.then(data => {

    const avatar = document.getElementById("profileAvatar");

    if (!avatar) return;

    if (data.user && data.user.avatar_url) {
        avatar.src = data.user.avatar_url;
    }

})
.catch(error => {
    console.error("Не вдалося завантажити аватар:", error);
});

// =====================================
// LOAD USER AVATAR
// =====================================

fetch("/api/me", {
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
    }
})
.then(response => response.json())
.then(data => {

    const avatar = document.getElementById("profileAvatar");

    if (!avatar) return;

    if (data.user && data.user.avatar_url) {
        avatar.src = data.user.avatar_url;
    }

})
.catch(error => {
    console.error("Не вдалося завантажити аватар:", error);
});

    // =====================================
    // PROFILE ACHIEVEMENTS CATALOG
    // Add future achievement definitions to achievementCatalog.
    // =====================================
    function initializeProfileAchievements() {
        const list = document.getElementById("profileAchievementsList");
        if (!list) return;

        let token = null;

        try {
            token = localStorage.getItem("token");
        } catch (error) {
            // Profile achievements require an authenticated account.
        }

        if (!token) {
            list.innerHTML =
                '<p class="profile-achievements__empty">' +
                'Увійдіть у Space, щоб переглянути відзнаки.' +
                '</p>';
            return;
        }

        const badgesPromise = fetch("/api/my-badges", {
            headers: {
                Authorization: "Bearer " + token
            },
            cache: "no-store"
        })
        .then(response => (response.ok ? response.json() : null))
        .catch(() => null);

        fetch("/api/launch-status", {
            headers: {
                Authorization: "Bearer " + token
            },
            cache: "no-store"
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не вдалося отримати статус відзнак");
            }
            return response.json();
        })
        .then(async data => {
            if (!data || data.success !== true) {
                throw new Error("Некоректна відповідь API відзнак");
            }

            let topActive = null;
            const badgesData = await badgesPromise;
            if (badgesData && badgesData.success === true && Array.isArray(badgesData.badges)) {
                topActive = badgesData.badges.find(badge =>
                    badge.badge_key === "top-active" &&
                    badge.period_key === "launch-2026"
                ) || null;
            }

            const achievementCatalog = [
                {
                    id: "pioneer",
                    title: "Pioneer",
                    description: "Перші учасники Den1mteN Space",
                    icon: "🚀",
                    earned: data.isPioneer === true
                },
                {
                    id: "top-active",
                    title: "Top Active in Launch Week",
                    description: topActive
                        ? "Топ-5 найактивніших Launch Week · " + topActive.place + " місце, " + topActive.points + " балів"
                        : "",
                    icon: "🏆",
                    earned: topActive !== null
                }
            ];

            const earnedAchievements =
                achievementCatalog.filter(achievement => achievement.earned);

            if (earnedAchievements.length === 0) {
                list.innerHTML =
                    '<p class="profile-achievements__empty">' +
                    'Поки що відзнак немає. Нові нагороди з’являтимуться тут.' +
                    '</p>';
                return;
            }

            list.innerHTML = earnedAchievements.map(achievement => `
                <article
                    class="profile-achievement"
                    data-achievement-id="${achievement.id}"
                >
                    <span class="profile-achievement__icon" aria-hidden="true">
                        ${achievement.icon}
                    </span>
                    <span class="profile-achievement__copy">
                        <strong>${achievement.title}</strong>
                        <small>${achievement.description}</small>
                    </span>
                </article>
            `).join("");
        })
        .catch(error => {
            console.error("Profile achievements error:", error);
            list.innerHTML =
                '<p class="profile-achievements__empty">' +
                'Не вдалося завантажити відзнаки.' +
                '</p>';
        });
    }

    initializeProfileAchievements();

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

// =====================================
// DASHBOARD MENU
// =====================================

function setupDashboardMenu() {
    const menuItems = document.querySelectorAll(
        ".profile-nav .menu-item"
    );

    menuItems.forEach(button => {
        const text = button.textContent.trim();

        // Remove duplicate navigation items
        if (
            text === "Music" ||
            text === "Blog" ||
            text === "Notes"
        ) {
            button.remove();
            return;
        }

        // Dashboard
        if (text === "Dashboard") {
            button.onclick = function () {
                window.location.href = "/dashboard.html";
            };
        }
    });
}
