async function loadFeaturedPost() {

    try {

        const response = await fetch("/api/posts");

        const data = await response.json();
        const posts = data.posts;

        if (!posts.length) {

            document.getElementById("featured-post").innerHTML =
                "<p>Поки що немає статей.</p>";

            return;

        }

        const post = posts.reduce(
            (mostViewed, current) =>
                current.views_count > mostViewed.views_count ? current : mostViewed,
            posts[0]
        );

        document.getElementById("featured-post").innerHTML = `
            <div class="featured-title">
                🔥 MOST VIEWED POST
            </div>

            <h2>${post.title}</h2>

            <p>${post.content}</p>

            <div class="views">
                👁️ ${post.views_count} переглядів
            </div>
        `;

        const featuredSection = document.getElementById("featured-post");
        featuredSection.style.cursor = "pointer";
        featuredSection.onclick = () => {
            window.location.href = `/blog.html#post-${post.id}`;
        };


    } catch (err) {

        console.error(err);

        document.getElementById("featured-post").innerHTML =
            "<p>Не вдалося завантажити статтю.</p>";

    }

}

loadFeaturedPost();





async function loadTracks() {

    try {

        const response = await fetch("/api/tracks");

        const data = await response.json();

        const tracks = data.tracks;

        if (!tracks.length) {

            document.getElementById("tracks").innerHTML = "<p>No music yet.</p>";

            return;

        }

        const latestTrack = tracks.reduce(
            (latest, current) =>
                new Date(current.created_at) > new Date(latest.created_at) ? current : latest,
            tracks[0]
        );

        document.getElementById("tracks").innerHTML = `
            <div class="track-card">

                <h3>${latestTrack.title}</h3>

                <p>${latestTrack.artist}</p>

                <audio controls preload="none">
                    <source src="${latestTrack.file_url}" type="audio/mpeg">
                </audio>

            </div>
        `;

        const tracksSection = document.getElementById("tracks").closest("section");
        if (tracksSection) {
            tracksSection.style.cursor = "pointer";
            tracksSection.onclick = (event) => {
                if (event.target.tagName === "AUDIO" || event.target.tagName === "SOURCE") {
                    return;
                }
                window.location.href = "/music.html";
            };
        }

    }

    catch(err){

        console.error(err);

        document.getElementById("tracks").innerHTML =
            "<p>Music unavailable.</p>";

    }

}

loadTracks();


async function loadPopularForumPost() {

    try {

        const response = await fetch("/api/efootball/posts/popular");

        const data = await response.json();

        if (!data.post) {

            document.getElementById("popularForumPost").innerHTML =
                "<p>Поки що немає тем на форумі.</p>";

            return;

        }

        const post = data.post;

        document.getElementById("popularForumPost").innerHTML = `
            <div class="featured-title">
                🔥 MOST DISCUSSED TOPIC
            </div>

            <h3>${post.title}</h3>

            <p>${post.content}</p>

            <div class="views">
                👤 ${post.username} · 💬 ${post.comments_count} коментарів
                (${post.unique_commenters} учасників) · ❤️ ${post.likes_count}
            </div>
        `;

        const section = document.getElementById("popularForumSection");
        if (section) {
            section.onclick = () => {
                window.location.href = `/efootball.html#post-${post.id}`;
            };
        }

    } catch (err) {

        console.error(err);

        document.getElementById("popularForumPost").innerHTML =
            "<p>Не вдалося завантажити тему форуму.</p>";

    }

}

loadPopularForumPost();
