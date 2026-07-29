const loginOpenBtn = document.getElementById("loginOpen");
const modal = document.getElementById("loginModal");
const closeBtn = document.getElementById("closeLogin");

const loginActionBtn = document.getElementById("loginBtn");


// ---------- OPEN ----------

loginOpenBtn.addEventListener("click", () => {

    modal.style.display = "flex";

});


// ---------- CLOSE ----------

closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

window.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        modal.style.display = "none";

    }

});


// ---------- LOGIN ----------

loginActionBtn.addEventListener("click", async () => {

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

        // Зберігаємо JWT

        localStorage.setItem("token", data.token);

        localStorage.setItem(

            "username",

            data.user.username

        );

        // Міняємо кнопку

loginOpenBtn.style.display = "none";

renderProfileMenu(data.user.username);
        // Закриваємо модалку

        modal.style.display = "none";

        // Очистити поля

        document.getElementById("email").value = "";

        document.getElementById("password").value = "";

    }

    catch(err){

        console.error(err);

        alert("Server error");

    }

});
