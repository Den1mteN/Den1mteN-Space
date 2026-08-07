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
        <button class="menu-item">Settings</button>

    </div>

    <div class="profile-divider"></div>

    <button id="logoutBtn" class="logout-btn">

        Logout

    </button>

</div>

`;

    const profileButton = document.getElementById("profileButton");
    const profilePanel  = document.getElementById("profilePanel");

    profileButton.onclick = (e)=>{

        e.stopPropagation();

        profilePanel.classList.toggle("hidden");

    };

    document.addEventListener("click",()=>{

        profilePanel.classList.add("hidden");

    });

    profilePanel.addEventListener("click",(e)=>{

        e.stopPropagation();

    });

    document
        .getElementById("logoutBtn")
        .onclick = logout;

}
