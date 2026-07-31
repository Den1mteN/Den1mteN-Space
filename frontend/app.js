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
