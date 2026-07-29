// ================================
// DEN1MTEN SPACE PROFILE MENU
// ================================

function renderProfileMenu(username) {

    const container = document.getElementById("profileMenuContainer");

    if (!container) return;

    container.innerHTML = `
        <div class="profile-panel">

            <div class="profile-header">

                <div class="profile-avatar">
                    <img src="/images/ava.jpg" alt="avatar">
                </div>

                <div class="profile-user">
                    <h3>${username}</h3>
                    <div class="status">🟢 Online</div>
                </div>

            </div>

        </div>
    `;

}
