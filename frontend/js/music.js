let currentUser = null;

async function loadCurrentUser() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        currentUser = null;
        return;

    }

    try {

        const response =
            await fetch(
                "/api/me",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            currentUser = null;
            return;

        }

        currentUser =
            data.user;

    } catch (err) {

        console.error("Load current user error:", err);

        currentUser = null;

    }

}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

}


function hasViewedInSession(key, id) {

    const viewed =
        JSON.parse(
            sessionStorage.getItem(key) || "[]"
        );

    return viewed.includes(id);

}


function markViewedInSession(key, id) {

    const viewed =
        JSON.parse(
            sessionStorage.getItem(key) || "[]"
        );

    if (!viewed.includes(id)) {

        viewed.push(id);

        sessionStorage.setItem(
            key,
            JSON.stringify(viewed)
        );

    }

}


async function registerTrackView(trackId) {

    if (hasViewedInSession("den1mten_viewed_tracks", trackId)) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/tracks/${trackId}/view`,
                { method: "POST" }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            return;
        }

        markViewedInSession("den1mten_viewed_tracks", trackId);

        const viewsElement =
            document.querySelector(
                `.track-views[data-track-id="${trackId}"]`
            );

        if (viewsElement) {

            viewsElement.textContent =
                `👁️ ${data.views_count}`;

        }

    } catch (err) {

        console.error("Register track view error:", err);

    }

}


async function toggleTrackLike(trackId, buttonElement) {

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    try {

        buttonElement.disabled = true;

        const response =
            await fetch(
                `/api/tracks/${trackId}/like`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося оновити лайк"
            );
        }

        buttonElement.innerHTML = `
            ${data.liked ? "❤️" : "🤍"}
            <span class="likes-count">${data.likes_count}</span>
        `;

    } catch (err) {

        console.error("Toggle track like error:", err);

        alert(err.message);

    } finally {

        buttonElement.disabled = false;

    }

}


async function loadTrackComments(trackId) {

    const commentsList =
        document.querySelector(
            `.track-comments-list[data-track-id="${trackId}"]`
        );

    if (!commentsList) return;

    commentsList.innerHTML =
        "Завантаження коментарів...";

    try {

        const response =
            await fetch(
                `/api/tracks/${trackId}/comments`
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося завантажити коментарі"
            );
        }

        const comments =
            data.comments;

        if (!comments.length) {

            commentsList.innerHTML =
                "<p>Поки що немає коментарів.</p>";

            return;
        }

        commentsList.innerHTML =
            comments.map(comment => {

                const isCommentAuthor =
                    currentUser &&
                    Number(currentUser.id) === Number(comment.user_id);

                return `
                    <div class="comment-item" data-comment-id="${comment.id}">
                        <div class="comment-meta">
                            👤 ${escapeHtml(comment.username)}
                            • 📅 ${formatDate(comment.created_at)}
                            ${isCommentAuthor ? `
                                <span class="comment-actions">
                                    <button type="button" class="track-comment-edit" data-comment-id="${comment.id}">✏️</button>
                                    <button type="button" class="track-comment-delete" data-comment-id="${comment.id}">🗑️</button>
                                </span>
                            ` : ""}
                        </div>
                        <div class="comment-text">
                            ${escapeHtml(comment.content)}
                        </div>
                    </div>
                `;

            }).join("");

        commentsList
            .querySelectorAll(".track-comment-edit")
            .forEach(button => {

                button.addEventListener("click", () => {
                    startEditTrackComment(
                        button.dataset.commentId,
                        trackId
                    );
                });

            });

        commentsList
            .querySelectorAll(".track-comment-delete")
            .forEach(button => {

                button.addEventListener("click", () => {
                    deleteTrackComment(
                        button.dataset.commentId,
                        trackId
                    );
                });

            });

    } catch (err) {

        console.error("Load track comments error:", err);

        commentsList.innerHTML =
            "<p>⚠️ Не вдалося завантажити коментарі.</p>";

    }

}


function startEditTrackComment(commentId, trackId) {

    const commentItem =
        document.querySelector(
            `.comment-item[data-comment-id="${commentId}"]`
        );

    if (!commentItem) return;

    const textElement =
        commentItem.querySelector(".comment-text");

    const currentText =
        textElement.textContent;

    textElement.innerHTML = `
        <textarea class="comment-edit-input" rows="2">${escapeHtml(currentText)}</textarea>
        <div class="comment-edit-actions">
            <button type="button" class="comment-save-edit">💾 Зберегти</button>
            <button type="button" class="comment-cancel-edit">✖ Скасувати</button>
        </div>
    `;

    textElement
        .querySelector(".comment-save-edit")
        .addEventListener("click", () => {
            saveEditTrackComment(commentId, trackId);
        });

    textElement
        .querySelector(".comment-cancel-edit")
        .addEventListener("click", () => {
            loadTrackComments(trackId);
        });

}


async function saveEditTrackComment(commentId, trackId) {

    const textarea =
        document.querySelector(
            `.comment-item[data-comment-id="${commentId}"] .comment-edit-input`
        );

    if (!textarea) return;

    const content =
        textarea.value.trim();

    if (!content) return;

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    try {

        const response =
            await fetch(
                `/api/track-comments/${commentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({ content })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося зберегти коментар"
            );
        }

        loadTrackComments(trackId);

    } catch (err) {

        console.error("Edit track comment error:", err);

        alert(err.message);

    }

}


async function deleteTrackComment(commentId, trackId) {

    if (!confirm("Видалити цей коментар?")) return;

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    try {

        const response =
            await fetch(
                `/api/track-comments/${commentId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося видалити коментар"
            );
        }

        loadTrackComments(trackId);

    } catch (err) {

        console.error("Delete track comment error:", err);

        alert(err.message);

    }

}


async function addTrackComment(trackId) {

    const input =
        document.querySelector(
            `.track-comment-input[data-track-id="${trackId}"]`
        );

    if (!input) return;

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    const content =
        input.value.trim();

    if (!content) return;

    try {

        const response =
            await fetch(
                `/api/tracks/${trackId}/comments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({ content })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося додати коментар"
            );
        }

        input.value = "";

        loadTrackComments(trackId);

    } catch (err) {

        console.error("Add track comment error:", err);

        alert(err.message);

    }

}


async function loadTracks() {

    const tracksContainer =
        document.getElementById("tracksContainer");

    if (!tracksContainer) return;

    try {

        const response =
            await fetch("/api/tracks");

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося завантажити треки"
            );
        }

        const tracks =
            data.tracks;

        if (!tracks.length) {

            tracksContainer.innerHTML =
                "<p>Поки що немає треків.</p>";

            return;
        }

        tracksContainer.innerHTML =
            tracks.map(track => `

                <div class="card">

                    <div class="track-title">
                        ${escapeHtml(track.artist)} — ${escapeHtml(track.title)}
                    </div>

                    <audio controls>
                        <source src="${escapeHtml(track.file_url)}" type="audio/mpeg">
                    </audio>

                    <div class="track-meta">

                        <button
                            type="button"
                            class="like-button"
                            data-track-id="${track.id}"
                        >
                            ${track.liked_by_me ? "❤️" : "🤍"}
                            <span class="likes-count">${track.likes_count}</span>
                        </button>

                        <span
                            class="track-views"
                            data-track-id="${track.id}"
                        >
                            👁️ ${track.views_count}
                        </span>

${currentUser && currentUser.role === "admin" ? `
    <button
        type="button"
        class="track-edit-button"
        data-track-id="${track.id}"
    >
        ✏️ Редагувати
    </button>

    <button
        type="button"
        class="track-delete-button"
        data-track-id="${track.id}"
    >
        🗑️ Видалити
    </button>
` : ""}

                    </div>
 
${currentUser && currentUser.role === "admin" ? `
    <div
        class="music-edit-form track-edit-form"
        data-track-id="${track.id}"
        style="display: none;"
    >

        <input
            type="text"
            class="track-edit-title"
            value="${escapeHtml(track.title)}"
            placeholder="Назва"
        >

        <input
            type="text"
            class="track-edit-artist"
            value="${escapeHtml(track.artist)}"
            placeholder="Виконавець"
        >

        <textarea
            class="track-edit-lyrics"
            rows="5"
            placeholder="Текст пісні..."
        >${escapeHtml(track.lyrics || "")}</textarea>

        <div class="music-edit-actions">

            <button
                type="button"
                class="track-edit-save"
                data-track-id="${track.id}"
            >
                💾 Зберегти
            </button>

            <button
                type="button"
                class="track-edit-cancel"
                data-track-id="${track.id}"
            >
                ❌ Скасувати
            </button>

        </div>

        <div class="track-edit-status"></div>

    </div>
` : ""}


                    <div class="comment-form">

                        <textarea
                            class="track-comment-input"
                            data-track-id="${track.id}"
                            placeholder="Написати коментар..."
                            maxlength="500"
                            rows="2"
                        ></textarea>

                        <button
                            type="button"
                            class="track-comment-submit"
                            data-track-id="${track.id}"
                        >
                            💬 Додати коментар
                        </button>

                    </div>

                    <div
                        class="track-comments-list comments-list"
                        data-track-id="${track.id}"
                    ></div>

                </div>

            `).join("");

        document
            .querySelectorAll(".like-button[data-track-id]")
            .forEach(button => {

                button.addEventListener("click", () => {

                    toggleTrackLike(
                        Number(button.dataset.trackId),
                        button
                    );

                });

            });

        document
            .querySelectorAll(".track-comment-submit")
            .forEach(button => {

                button.addEventListener("click", () => {

                    addTrackComment(
                        Number(button.dataset.trackId)
                    );

                });

            });

        document
            .querySelectorAll(".track-delete-button")
            .forEach(button => {

                button.addEventListener("click", async () => {

                    if (!confirm("Видалити цей трек назавжди?")) return;

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/tracks/${button.dataset.trackId}`,
                                {
                                    method: "DELETE",

                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                }
                            );

                        const data =
                            await response.json();

                        if (!response.ok || !data.success) {

                            throw new Error(
                                data.message ||
                                "Не вдалося видалити трек"
                            );
                        }

                        loadTracks();

                    } catch (err) {

                        console.error("Delete track error:", err);

                        alert(err.message);

                    }

                });

            });

        document
            .querySelectorAll(".track-edit-button")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const form =
                        document.querySelector(
                            `.track-edit-form[data-track-id="${button.dataset.trackId}"]`
                        );

                    if (!form) return;

                    form.style.display =
                        form.style.display === "none"
                            ? "block"
                            : "none";

                });

            });


        document
            .querySelectorAll(".track-edit-cancel")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const form =
                        document.querySelector(
                            `.track-edit-form[data-track-id="${button.dataset.trackId}"]`
                        );

                    if (!form) return;

                    form.style.display = "none";

                });

            });


        document
            .querySelectorAll(".track-edit-save")
            .forEach(button => {

                button.addEventListener("click", async () => {

                    const form =
                        document.querySelector(
                            `.track-edit-form[data-track-id="${button.dataset.trackId}"]`
                        );

                    if (!form) return;

                    const title =
                        form.querySelector(".track-edit-title").value.trim();

                    const artist =
                        form.querySelector(".track-edit-artist").value.trim();

                    const lyrics =
                        form.querySelector(".track-edit-lyrics").value.trim();

                    const statusElement =
                        form.querySelector(".track-edit-status");

                    if (!title || !artist) {

                        statusElement.textContent =
                            "⚠️ Назва і виконавець — обов'язкові";

                        return;

                    }

                    const token =
                        localStorage.getItem("token");

                    if (!token) {

                        statusElement.textContent =
                            "⚠️ Потрібно увійти в акаунт";

                        return;

                    }

                    try {

                        button.disabled = true;

                        statusElement.textContent =
                            "⏳ Збереження...";

                        const response =
                            await fetch(
                                `/api/tracks/${button.dataset.trackId}`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Authorization": `Bearer ${token}`,
                                        "Content-Type": "application/json"
                                    },

                                    body: JSON.stringify({
                                        title,
                                        artist,
                                        lyrics
                                    })
                                }
                            );

                        const data =
                            await response.json();

                        if (!response.ok || !data.success) {

                            throw new Error(
                                data.message ||
                                "Не вдалося оновити трек"
                            );

                        }

                        statusElement.textContent =
                            "✅ Збережено";

                        loadTracks();

                    } catch (err) {

                        console.error(
                            "Update track error:",
                            err
                        );

                        statusElement.textContent =
                            "❌ " + err.message;

                        button.disabled = false;

                    }

                });

            });

        tracks.forEach(track => {

            registerTrackView(track.id);

            loadTrackComments(track.id);

        });

    } catch (err) {

        console.error("Load tracks error:", err);

        tracksContainer.innerHTML =
            "<p>⚠️ Не вдалося завантажити треки.</p>";

    }

}


function setupAddTrackForm() {

    const addTrackForm =
        document.getElementById("addTrackForm");

    if (!addTrackForm) return;

    if (!currentUser || currentUser.role !== "admin") {
        return;
    }

    addTrackForm.style.display = "block";

    const submitButton =
        document.getElementById("submitNewTrackButton");

    submitButton.addEventListener("click", async () => {

        const title =
            document.getElementById("newTrackTitle").value.trim();

        const artist =
            document.getElementById("newTrackArtist").value.trim();

        const lyrics =
            document.getElementById("newTrackLyrics").value.trim();

        const fileInput =
            document.getElementById("newTrackFile");

        const file =
            fileInput.files[0];

        const statusElement =
            document.getElementById("newTrackStatus");

        if (!title || !artist || !file) {

            statusElement.textContent =
                "⚠️ Назва, виконавець і файл — обов'язкові";

            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            statusElement.textContent = "⚠️ Потрібно увійти в акаунт";
            return;
        }

        const formData = new FormData();

        formData.append("title", title);
        formData.append("artist", artist);
        formData.append("lyrics", lyrics);
        formData.append("audio", file);

        try {

            submitButton.disabled = true;

            statusElement.textContent =
                "⏳ Завантаження...";

            const response =
                await fetch(
                    "/api/tracks",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Не вдалося завантажити трек"
                );
            }

            statusElement.textContent =
                "✅ Трек додано";

            document.getElementById("newTrackTitle").value = "";
            document.getElementById("newTrackArtist").value = "";
            document.getElementById("newTrackLyrics").value = "";
            fileInput.value = "";

            loadTracks();

        } catch (err) {

            console.error("Add track error:", err);

            statusElement.textContent =
                "❌ " + err.message;

        } finally {

            submitButton.disabled = false;

        }

    });

}

async function registerVideoView(videoId) {

    if (hasViewedInSession("den1mten_viewed_videos", videoId)) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/videos/${videoId}/view`,
                { method: "POST" }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            return;
        }

        markViewedInSession("den1mten_viewed_videos", videoId);

        const viewsElement =
            document.querySelector(
                `.video-views[data-video-id="${videoId}"]`
            );

        if (viewsElement) {

            viewsElement.textContent =
                `👁️ ${data.views_count}`;

        }

    } catch (err) {

        console.error("Register video view error:", err);

    }

}


async function toggleVideoLike(videoId, buttonElement) {

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    try {

        buttonElement.disabled = true;

        const response =
            await fetch(
                `/api/videos/${videoId}/like`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося оновити лайк"
            );
        }

        buttonElement.innerHTML = `
            ${data.liked ? "❤️" : "🤍"}
            <span class="likes-count">${data.likes_count}</span>
        `;

    } catch (err) {

        console.error("Toggle video like error:", err);

        alert(err.message);

    } finally {

        buttonElement.disabled = false;

    }

}


async function loadVideoComments(videoId) {

    const commentsList =
        document.querySelector(
            `.video-comments-list[data-video-id="${videoId}"]`
        );

    if (!commentsList) return;

    commentsList.innerHTML =
        "Завантаження коментарів...";

    try {

        const response =
            await fetch(
                `/api/videos/${videoId}/comments`
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося завантажити коментарі"
            );
        }

        const comments =
            data.comments;

        if (!comments.length) {

            commentsList.innerHTML =
                "<p>Поки що немає коментарів.</p>";

            return;
        }

        commentsList.innerHTML =
            comments.map(comment => {

                const isCommentAuthor =
                    currentUser &&
                    Number(currentUser.id) === Number(comment.user_id);

                return `
                    <div class="comment-item" data-comment-id="${comment.id}">
                        <div class="comment-meta">
                            👤 ${escapeHtml(comment.username)}
                            • 📅 ${formatDate(comment.created_at)}
                            ${isCommentAuthor ? `
                                <span class="comment-actions">
                                    <button type="button" class="video-comment-edit" data-comment-id="${comment.id}">✏️</button>
                                    <button type="button" class="video-comment-delete" data-comment-id="${comment.id}">🗑️</button>
                                </span>
                            ` : ""}
                        </div>
                        <div class="comment-text">
                            ${escapeHtml(comment.content)}
                        </div>
                    </div>
                `;

            }).join("");

        commentsList
            .querySelectorAll(".video-comment-edit")
            .forEach(button => {

                button.addEventListener("click", () => {
                    startEditVideoComment(
                        button.dataset.commentId,
                        videoId
                    );
                });

            });

        commentsList
            .querySelectorAll(".video-comment-delete")
            .forEach(button => {

                button.addEventListener("click", () => {
                    deleteVideoComment(
                        button.dataset.commentId,
                        videoId
                    );
                });

            });

    } catch (err) {

        console.error("Load video comments error:", err);

        commentsList.innerHTML =
            "<p>⚠️ Не вдалося завантажити коментарі.</p>";

    }

}


function startEditVideoComment(commentId, videoId) {

    const commentItem =
        document.querySelector(
            `.comment-item[data-comment-id="${commentId}"]`
        );

    if (!commentItem) return;

    const textElement =
        commentItem.querySelector(".comment-text");

    const currentText =
        textElement.textContent;

    textElement.innerHTML = `
        <textarea class="comment-edit-input" rows="2">${escapeHtml(currentText)}</textarea>
        <div class="comment-edit-actions">
            <button type="button" class="comment-save-edit">💾 Зберегти</button>
            <button type="button" class="comment-cancel-edit">✖ Скасувати</button>
        </div>
    `;

    textElement
        .querySelector(".comment-save-edit")
        .addEventListener("click", () => {
            saveEditVideoComment(commentId, videoId);
        });

    textElement
        .querySelector(".comment-cancel-edit")
        .addEventListener("click", () => {
            loadVideoComments(videoId);
        });

}


async function saveEditVideoComment(commentId, videoId) {

    const textarea =
        document.querySelector(
            `.comment-item[data-comment-id="${commentId}"] .comment-edit-input`
        );

    if (!textarea) return;

    const content =
        textarea.value.trim();

    if (!content) return;

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    try {

        const response =
            await fetch(
                `/api/video-comments/${commentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({ content })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося зберегти коментар"
            );
        }

        loadVideoComments(videoId);

    } catch (err) {

        console.error("Edit video comment error:", err);

        alert(err.message);

    }

}


async function deleteVideoComment(commentId, videoId) {

    if (!confirm("Видалити цей коментар?")) return;

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    try {

        const response =
            await fetch(
                `/api/video-comments/${commentId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося видалити коментар"
            );
        }

        loadVideoComments(videoId);

    } catch (err) {

        console.error("Delete video comment error:", err);

        alert(err.message);

    }

}


async function addVideoComment(videoId) {

    const input =
        document.querySelector(
            `.video-comment-input[data-video-id="${videoId}"]`
        );

    if (!input) return;

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    const content =
        input.value.trim();

    if (!content) return;

    try {

        const response =
            await fetch(
                `/api/videos/${videoId}/comments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({ content })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося додати коментар"
            );
        }

        input.value = "";

        loadVideoComments(videoId);

    } catch (err) {

        console.error("Add video comment error:", err);

        alert(err.message);

    }

}


async function loadVideos() {

    const videosContainer =
        document.getElementById("videosContainer");

    if (!videosContainer) return;

    try {

        const response =
            await fetch("/api/videos");

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося завантажити відео"
            );
        }

        const videos =
            data.videos;

        if (!videos.length) {

            videosContainer.innerHTML =
                "<p>Поки що немає відео.</p>";

            return;
        }

        videosContainer.innerHTML =
            videos.map(video => `

                <div class="card">

                    <div class="video-frame">
                        ${video.source_type === "youtube" ? `
                            <iframe
                                src="${escapeHtml(video.video_url)}"
                                frameborder="0"
                                allowfullscreen>
                            </iframe>
                        ` : `
                            <video controls muted>
                                <source src="${escapeHtml(video.video_url)}" type="video/mp4">
                            </video>
                        `}
                    </div>

                    <div class="video-name">
                        ${escapeHtml(video.title)}
                    </div>

                    ${video.description ? `
                        <div class="video-desc">
                            ${escapeHtml(video.description)}
                        </div>
                    ` : ""}

                    <div class="track-meta">

                        <button
                            type="button"
                            class="like-button"
                            data-video-id="${video.id}"
                        >
                            ${video.liked_by_me ? "❤️" : "🤍"}
                            <span class="likes-count">${video.likes_count}</span>
                        </button>

                        <span
                            class="video-views"
                            data-video-id="${video.id}"
                        >
                            👁️ ${video.views_count}
                        </span>

${currentUser && currentUser.role === "admin" ? `
    <button
        type="button"
        class="video-edit-button"
        data-video-id="${video.id}"
    >
        ✏️ Редагувати
    </button>

    <button
        type="button"
        class="video-delete-button"
        data-video-id="${video.id}"
    >
        🗑️ Видалити
    </button>
` : ""}


                    </div>

${currentUser && currentUser.role === "admin" ? `
    <div
        class="music-edit-form video-edit-form"
        data-video-id="${video.id}"
        style="display: none;"
    >

        <input
            type="text"
            class="video-edit-title"
            value="${escapeHtml(video.title)}"
            placeholder="Назва відео"
        >

        <textarea
            class="video-edit-description"
            rows="4"
            placeholder="Опис відео..."
        >${escapeHtml(video.description || "")}</textarea>

        ${video.source_type === "youtube" ? `
            <input
                type="url"
                class="video-edit-url"
                value="${escapeHtml(video.video_url)}"
                placeholder="YouTube посилання"
            >
        ` : ""}

        <div class="music-edit-actions">

            <button
                type="button"
                class="video-edit-save"
                data-video-id="${video.id}"
            >
                💾 Зберегти
            </button>

            <button
                type="button"
                class="video-edit-cancel"
                data-video-id="${video.id}"
            >
                ❌ Скасувати
            </button>

        </div>

        <div class="video-edit-status"></div>

    </div>
` : ""}

                    <div class="comment-form">

                        <textarea
                            class="video-comment-input"
                            data-video-id="${video.id}"
                            placeholder="Написати коментар..."
                            maxlength="500"
                            rows="2"
                        ></textarea>

                        <button
                            type="button"
                            class="video-comment-submit"
                            data-video-id="${video.id}"
                        >
                            💬 Додати коментар
                        </button>

                    </div>

                    <div
                        class="video-comments-list comments-list"
                        data-video-id="${video.id}"
                    ></div>

                </div>

            `).join("");

        document
            .querySelectorAll(".like-button[data-video-id]")
            .forEach(button => {

                button.addEventListener("click", () => {

                    toggleVideoLike(
                        Number(button.dataset.videoId),
                        button
                    );

                });

            });

        document
            .querySelectorAll(".video-comment-submit")
            .forEach(button => {

                button.addEventListener("click", () => {

                    addVideoComment(
                        Number(button.dataset.videoId)
                    );

                });

            });

        document
            .querySelectorAll(".video-delete-button")
            .forEach(button => {

                button.addEventListener("click", async () => {

                    if (!confirm("Видалити це відео назавжди?")) return;

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/videos/${button.dataset.videoId}`,
                                {
                                    method: "DELETE",

                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                }
                            );

                        const data =
                            await response.json();

                        if (!response.ok || !data.success) {

                            throw new Error(
                                data.message ||
                                "Не вдалося видалити відео"
                            );
                        }

                        loadVideos();

                    } catch (err) {

                        console.error("Delete video error:", err);

                        alert(err.message);

                    }

                });

            });

        document
            .querySelectorAll(".video-edit-button")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const form =
                        document.querySelector(
                            `.video-edit-form[data-video-id="${button.dataset.videoId}"]`
                        );

                    if (!form) return;

                    form.style.display =
                        form.style.display === "none"
                            ? "block"
                            : "none";

                });

            });


        document
            .querySelectorAll(".video-edit-cancel")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const form =
                        document.querySelector(
                            `.video-edit-form[data-video-id="${button.dataset.videoId}"]`
                        );

                    if (!form) return;

                    form.style.display = "none";

                });

            });


        document
            .querySelectorAll(".video-edit-save")
            .forEach(button => {

                button.addEventListener("click", async () => {

                    const form =
                        document.querySelector(
                            `.video-edit-form[data-video-id="${button.dataset.videoId}"]`
                        );

                    if (!form) return;

                    const title =
                        form.querySelector(".video-edit-title").value.trim();

                    const description =
                        form.querySelector(".video-edit-description").value.trim();

                    const urlInput =
                        form.querySelector(".video-edit-url");

                    const statusElement =
                        form.querySelector(".video-edit-status");

                    const videoId =
                        button.dataset.videoId;

                    if (!title) {

                        statusElement.textContent =
                            "⚠️ Назва обов'язкова";

                        return;

                    }

                    const token =
                        localStorage.getItem("token");

                    if (!token) {

                        statusElement.textContent =
                            "⚠️ Потрібно увійти в акаунт";

                        return;

                    }

                    const video =
                        videos.find(
                            item => String(item.id) === String(videoId)
                        );

                    if (!video) {

                        statusElement.textContent =
                            "❌ Відео не знайдено";

                        return;

                    }

                    const body = {
                        title,
                        description,
                        sourceType: video.source_type
                    };

                    if (video.source_type === "youtube") {

                        const videoUrl =
                            urlInput ? urlInput.value.trim() : "";

                        if (!videoUrl) {

                            statusElement.textContent =
                                "⚠️ YouTube посилання обов'язкове";

                            return;

                        }

                        body.videoUrl = videoUrl;

                    }

                    try {

                        button.disabled = true;

                        statusElement.textContent =
                            "⏳ Збереження...";

                        const response =
                            await fetch(
                                `/api/videos/${videoId}`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Authorization": `Bearer ${token}`,
                                        "Content-Type": "application/json"
                                    },

                                    body: JSON.stringify(body)
                                }
                            );

                        const data =
                            await response.json();

                        if (!response.ok || !data.success) {

                            throw new Error(
                                data.message ||
                                "Не вдалося оновити відео"
                            );

                        }

                        statusElement.textContent =
                            "✅ Збережено";

                        loadVideos();

                    } catch (err) {

                        console.error(
                            "Update video error:",
                            err
                        );

                        statusElement.textContent =
                            "❌ " + err.message;

                        button.disabled = false;

                    }

                });

            });

        videos.forEach(video => {

            registerVideoView(video.id);

            loadVideoComments(video.id);

        });

    } catch (err) {

        console.error("Load videos error:", err);

        videosContainer.innerHTML =
            "<p>⚠️ Не вдалося завантажити відео.</p>";

    }

}


function setupAddVideoForm() {

    const addVideoForm =
        document.getElementById("addVideoForm");

    if (!addVideoForm) return;

    if (!currentUser || currentUser.role !== "admin") {
        return;
    }

    addVideoForm.style.display = "block";

    const sourceTypeSelect =
        document.getElementById("newVideoSourceType");

    const fileInput =
        document.getElementById("newVideoFile");

    const youtubeInput =
        document.getElementById("newVideoYoutubeUrl");

    sourceTypeSelect.addEventListener("change", () => {

        if (sourceTypeSelect.value === "youtube") {

            fileInput.style.display = "none";
            youtubeInput.style.display = "block";

        } else {

            fileInput.style.display = "block";
            youtubeInput.style.display = "none";

        }

    });

    const submitButton =
        document.getElementById("submitNewVideoButton");

    submitButton.addEventListener("click", async () => {

        const title =
            document.getElementById("newVideoTitle").value.trim();

        const description =
            document.getElementById("newVideoDescription").value.trim();

        const sourceType =
            sourceTypeSelect.value;

        const statusElement =
            document.getElementById("newVideoStatus");

        if (!title) {

            statusElement.textContent =
                "⚠️ Назва обов'язкова";

            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            statusElement.textContent = "⚠️ Потрібно увійти в акаунт";
            return;
        }

        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("sourceType", sourceType);

        if (sourceType === "youtube") {

            const youtubeUrl =
                youtubeInput.value.trim();

            if (!youtubeUrl) {

                statusElement.textContent =
                    "⚠️ Вкажи YouTube посилання";

                return;
            }

            formData.append("youtubeUrl", youtubeUrl);

        } else {

            const file =
                fileInput.files[0];

            if (!file) {

                statusElement.textContent =
                    "⚠️ Вибери відеофайл";

                return;
            }

            formData.append("video", file);

        }

        try {

            submitButton.disabled = true;

            statusElement.textContent =
                "⏳ Завантаження...";

            const response =
                await fetch(
                    "/api/videos",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Не вдалося завантажити відео"
                );
            }

            statusElement.textContent =
                "✅ Відео додано";

            document.getElementById("newVideoTitle").value = "";
            document.getElementById("newVideoDescription").value = "";
            youtubeInput.value = "";
            fileInput.value = "";

            loadVideos();

        } catch (err) {

            console.error("Add video error:", err);

            statusElement.textContent =
                "❌ " + err.message;

        } finally {

            submitButton.disabled = false;

        }

    });

}

async function loadFireSection() {

    try {

        const [tracksResponse, videosResponse] =
            await Promise.all([
                fetch("/api/tracks"),
                fetch("/api/videos")
            ]);

        const tracksData =
            await tracksResponse.json();

        const videosData =
            await videosResponse.json();

        if (tracksData.success && tracksData.tracks.length) {

            const topTrack =
                tracksData.tracks.reduce(
                    (top, current) =>
                        current.views_count > top.views_count ? current : top,
                    tracksData.tracks[0]
                );

            const topAudioCard =
                document.querySelector(".fire-grid .card:first-child");

            if (topAudioCard) {

                const titleElement =
                    topAudioCard.querySelector("h2");

                const audioSource =
                    topAudioCard.querySelector("audio source");

                const metaElement =
                    topAudioCard.querySelector(".track-meta");

                if (titleElement) {
                    titleElement.textContent =
                        `${topTrack.artist} — ${topTrack.title}`;
                }

                if (audioSource) {

                    audioSource.src = topTrack.file_url;

                    audioSource.closest("audio").load();

                }

                if (metaElement) {

                    const isHit =
                        topTrack.views_count >= 50;

                    metaElement.innerHTML = `
                        <span>❤️ ${topTrack.likes_count} вподобань</span>
                        <span>👁️ ${topTrack.views_count} переглядів</span>
                        ${isHit ? `<span class="fire-badge">🔥 Хіт</span>` : ""}
                    `;

                }

            }

        }

        if (videosData.success && videosData.videos.length) {

            const topVideo =
                videosData.videos.reduce(
                    (top, current) =>
                        current.views_count > top.views_count ? current : top,
                    videosData.videos[0]
                );

            const topVideoCard =
                document.querySelector(".fire-grid .card:last-child");

            if (topVideoCard) {

                const frameElement =
                    topVideoCard.querySelector(".video-frame");

                const nameElement =
                    topVideoCard.querySelector(".video-name");

                const descElement =
                    topVideoCard.querySelector(".video-desc");

                if (frameElement) {

                    frameElement.innerHTML =
                        topVideo.source_type === "youtube"
                            ? `
                                <iframe
                                    src="${topVideo.video_url}"
                                    frameborder="0"
                                    allowfullscreen>
                                </iframe>
                            `
                            : `
                                <video controls muted>
                                    <source src="${topVideo.video_url}" type="video/mp4">
                                </video>
                            `;

                }

                if (nameElement) {
                    nameElement.textContent =
                        `🎬 ${topVideo.title}`;
                }

                if (descElement) {
                    descElement.textContent =
                        topVideo.description || "";
                }

            }

        }

    } catch (err) {

        console.error("Load fire section error:", err);

    }

}

async function initializeMusic() {

    await loadCurrentUser();

    loadFireSection();

    setupAddTrackForm();
    setupAddVideoForm();
    setupGeniusForms();

    await loadTracks();
    await loadVideos();
    await loadGeniusGallery();

}

initializeMusic();
