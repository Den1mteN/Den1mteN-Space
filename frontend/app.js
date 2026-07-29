async function loadFeaturedPost() {

    try {

        const response = await fetch("/api/posts");

        const posts = await response.json();

        if (!posts.length) {

            document.getElementById("featured-post").innerHTML =
                "<p>Поки що немає статей.</p>";

            return;

        }

        const post = posts[0];

        document.getElementById("featured-post").innerHTML = `
            <div class="featured-title">
                🔥 MOST VIEWED POST
            </div>

            <h2>${post.title}</h2>

            <p>${post.content}</p>

            <div class="views">
                Category: ${post.category}
            </div>
        `;

    } catch (err) {

        console.error(err);

        document.getElementById("featured-post").innerHTML =
            "<p>Не вдалося завантажити статтю.</p>";

    }

}

loadFeaturedPost();





async function loadTracks() {

    try {

        const response = await fetch("/api/music/tracks");

        const tracks = await response.json();

        if (!tracks.length) {

            document.getElementById("tracks").innerHTML =
                "<p>No music yet.</p>";

            return;

        }

        let html = "";

        tracks.forEach(track => {

            html += `
                <div class="track-card">

                    <h3>${track.title}</h3>

                    <p>${track.artist}</p>

                    <audio controls preload="none">

                        <source src="${track.file}" type="audio/mpeg">

                    </audio>

                </div>
            `;

        });

        document.getElementById("tracks").innerHTML = html;

    }

    catch(err){

        console.error(err);

        document.getElementById("tracks").innerHTML =
            "<p>Music unavailable.</p>";

    }

}

loadTracks();






/* ===========================================
   LOGIN MODAL
=========================================== */

const loginModal = document.getElementById("loginModal");
const loginOpen = document.getElementById("loginOpen");
const closeLogin = document.getElementById("closeLogin");

loginOpen.onclick = () => {

    loginModal.style.display = "flex";

};

closeLogin.onclick = () => {

    loginModal.style.display = "none";

};

window.onclick = (e) => {

    if (e.target === loginModal) {

        loginModal.style.display = "none";

    }

};






/* ===========================================
   LOGIN
=========================================== */

const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = async () => {

    const email = document.getElementById("email").value;

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

    catch(err){

        console.error(err);

        alert("Server unavailable");

    }

};






/* ===========================================
   USER PANEL
=========================================== */

function updateUserPanel(){

    const token = localStorage.getItem("token");

    const username = localStorage.getItem("username");

    if(!token){

        loginOpen.innerHTML = "👤 Login";

        return;

    }

    loginOpen.innerHTML = "👤 " + username + " ▼";

}

updateUserPanel();
