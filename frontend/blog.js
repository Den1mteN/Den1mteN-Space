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

        console.error(
            "Load current user error:",
            err
        );

        currentUser = null;

    }

}

async function loadBlogPosts() {

    const postsContainer =
        document.getElementById("postsContainer");

    if (!postsContainer) return;

    try {

        const response =
            await fetch("/api/posts");

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load posts"
            );

        }

        const posts =
            data.posts;

        if (!posts.length) {

            postsContainer.innerHTML = `
                <div class="post">

                    <div class="post-title">
                        Поки що немає постів 🌌
                    </div>

                    <p>
                        Будь першим, хто щось опублікує!
                    </p>

                </div>
            `;

            return;
        }

        postsContainer.innerHTML =
            posts.map((post, index) => `

                <article
                    class="post latest-post-item"
                    data-post-id="${post.id}"
                    style="${index >= 3 ? "display:none;" : ""}"
                >

                    <div class="post-title">
                        ${escapeHtml(post.title)}
                    </div>

                    <p>
                        ${escapeHtml(post.content)}
                    </p>


                    <div class="post-meta">

                        👤 ${escapeHtml(post.username)}
                        • 📅 ${formatDate(post.created_at)}

                    </div>

                </article>

            `).join("");
             const postModal =
    document.getElementById("postModal");

const closePostModal =
    document.getElementById("closePostModal");

const modalPostTitle =
    document.getElementById("modalPostTitle");

const modalPostMeta =
    document.getElementById("modalPostMeta");

const modalPostImage =
    document.getElementById("modalPostImage");

const modalPostContent =
    document.getElementById("modalPostContent");

const editPostButton =
    document.getElementById("editPostButton");

const deletePostButton =
    document.getElementById("deletePostButton");

document
    .querySelectorAll(".latest-post-item")
    .forEach(postElement => {

        postElement.addEventListener(
            "click",
            () => {

                const postId =
                    Number(
                        postElement.dataset.postId
                    );

                const post =
                    posts.find(
                        item => item.id === postId
                    );

                if (!post) return;

                const isAuthor =
    currentUser &&
    Number(currentUser.id) === Number(post.user_id);

editPostButton.style.display =
    isAuthor ? "block" : "none";

deletePostButton.style.display =
    isAuthor ? "block" : "none";

               deletePostButton.dataset.postId =
                   post.id;

               editPostButton.dataset.postId =
    post.id;

                modalPostTitle.textContent =
                    post.title;


                modalPostMeta.textContent =
                    `👤 ${post.username} • 📅 ${formatDate(post.created_at)}`;


                modalPostContent.textContent =
                    post.content;


                if (post.image_url) {

                    modalPostImage.innerHTML = `
                        <img
                            src="${escapeHtml(post.image_url)}"
                            alt="${escapeHtml(post.title)}"
                        >
                    `;

                } else {

                    modalPostImage.innerHTML = "";

                }


                postModal.style.display =
                    "flex";

                loadComments(postId);

                const addCommentButton =
                    document.getElementById("addCommentButton");

                if (addCommentButton) {

                    addCommentButton.onclick = () => {
                        addComment(postId);
                    };

                }

            }
        );

    });

if (closePostModal) {

    closePostModal.onclick = () => {

        postModal.style.display =
            "none";

    };

}


if (postModal) {

    postModal.addEventListener(
        "click",
        event => {

            if (event.target === postModal) {

                postModal.style.display =
                    "none";

            }

        }
    );

}


if (editPostButton) {

    console.log("🟢 EDIT BUTTON HANDLER ATTACHED");


    editPostButton.onclick = async () => {

        console.log("🟢 EDIT BUTTON CLICKED");


        const postId =
            editPostButton.dataset.postId ||
            deletePostButton.dataset.postId;

        if (!postId) return;

        const token =
            localStorage.getItem("token");

        if (!token) {
            alert("Потрібно увійти в акаунт");
            return;
        }

        const isEditing =
            editPostButton.dataset.editing === "true";


        // =====================================
        // START EDITING
        // =====================================

        if (!isEditing) {

            const post =
                posts.find(
                    item =>
                        Number(item.id) === Number(postId)
                );

            if (!post) return;

            modalPostTitle.innerHTML = `
                <input
                    id="editPostTitle"
                    type="text"
                    value="${escapeHtml(post.title)}"
                    maxlength="200"
                >
            `;

            modalPostContent.innerHTML = `
                <textarea
                    id="editPostContent"
                    rows="10"
                >${escapeHtml(post.content)}</textarea>
            `;

            editPostButton.dataset.postId =
                post.id;

            editPostButton.dataset.editing =
                "true";

            editPostButton.textContent =
                "💾 Зберегти";

            return;
        }


        // =====================================
        // SAVE EDIT
        // =====================================

        const titleInput =
            document.getElementById("editPostTitle");

        const contentInput =
            document.getElementById("editPostContent");

        if (!titleInput || !contentInput) return;


        const title =
            titleInput.value.trim();

        const content =
            contentInput.value.trim();


        if (!title || !content) {

            alert(
                "Заголовок і текст не можуть бути порожніми"
            );

            return;
        }


        try {

            editPostButton.disabled = true;

            editPostButton.textContent =
                "⏳ Збереження...";


            console.log(
                "✏️ Updating post:",
                postId
            );


            const response =
                await fetch(
                    `/api/posts/${postId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title,
                            content
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Не вдалося оновити пост"
                );
            }


            console.log(
                "✅ Post updated:",
                data
            );


            editPostButton.disabled =
                false;

            editPostButton.dataset.editing =
                "false";

            editPostButton.textContent =
                "✏️ Редагувати пост";


            await loadBlogPosts();


            postModal.style.display =
                "none";


        } catch (err) {

            console.error(
                "Edit post error:",
                err
            );


            editPostButton.disabled =
                false;

            editPostButton.textContent =
                "💾 Зберегти";


            alert(
                "❌ " + err.message
            );
        }

    };

}

if (deletePostButton) {

    deletePostButton.onclick = async () => {

        const postId =
            deletePostButton.dataset.postId;

        if (!postId) return;

        const token =
    localStorage.getItem("token");


        if (!token) {
            alert("Потрібно увійти в акаунт");
            return;
        }

        try {

            const response =
                await fetch(
                    `/api/posts/${postId}`,
                    {
                        method: "DELETE",
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
                    "Не вдалося видалити пост"
                );

            }

            postModal.style.display =
                "none";

            await loadBlogPosts();

        } catch (err) {

            console.error(
                "Delete post error:",
                err
            );

            alert(
                "❌ " + err.message
            );

        }

    };

}

        const latestPostsToggle =
            document.getElementById("latestPostsToggle");

        if (latestPostsToggle) {

            latestPostsToggle.onclick = () => {

                const hiddenPosts =
                    document.querySelectorAll(
                        ".latest-post-item:nth-child(n+4)"
                    );

                const isExpanded =
                    [...hiddenPosts].some(
                        post => post.style.display !== "none"
                    );

                hiddenPosts.forEach(post => {

                    post.style.display =
                        isExpanded ? "none" : "block";

                });

                latestPostsToggle.title =
                    isExpanded
                    ? "Показати всі пости"
                    : "Сховати додаткові пости";

            };

        }

    } catch (err) {

        console.error(
            "Blog posts error:",
            err
        );

        postsContainer.innerHTML = `
            <div class="post">

                <div class="post-title">
                    ⚠️ Не вдалося завантажити пости
                </div>

                <p>
                    Спробуй оновити сторінку.
                </p>

            </div>
        `;

    }
}

async function loadComments(postId) {

    const commentsList =
        document.getElementById("commentsList");

    if (!commentsList) return;

    commentsList.innerHTML =
        "Завантаження коментарів...";

    try {

        const response =
            await fetch(
                `/api/posts/${postId}/comments`
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
                                    <button type="button" class="comment-edit" data-comment-id="${comment.id}">✏️</button>
                                    <button type="button" class="comment-delete" data-comment-id="${comment.id}">🗑️</button>
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
            .querySelectorAll(".comment-edit")
            .forEach(button => {

                button.addEventListener("click", () => {
                    startEditComment(
                        button.dataset.commentId,
                        postId
                    );
                });

            });

        commentsList
            .querySelectorAll(".comment-delete")
            .forEach(button => {

                button.addEventListener("click", () => {
                    deleteComment(
                        button.dataset.commentId,
                        postId
                    );
                });

            });

    } catch (err) {

        console.error("Load comments error:", err);

        commentsList.innerHTML =
            "<p>⚠️ Не вдалося завантажити коментарі.</p>";

    }

}

function startEditComment(commentId, postId) {

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
        <textarea
            class="comment-edit-input"
            rows="2"
        >${escapeHtml(currentText)}</textarea>

        <div class="comment-edit-actions">
            <button type="button" class="comment-save-edit">💾 Зберегти</button>
            <button type="button" class="comment-cancel-edit">✖ Скасувати</button>
        </div>
    `;

    textElement
        .querySelector(".comment-save-edit")
        .addEventListener("click", () => {
            saveEditComment(commentId, postId);
        });

    textElement
        .querySelector(".comment-cancel-edit")
        .addEventListener("click", () => {
            loadComments(postId);
        });

}


async function saveEditComment(commentId, postId) {

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
                `/api/comments/${commentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
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

        loadComments(postId);

    } catch (err) {

        console.error("Edit comment error:", err);

        alert(err.message);

    }

}


async function deleteComment(commentId, postId) {

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
                `/api/comments/${commentId}`,
                {
                    method: "DELETE",

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
                "Не вдалося видалити коментар"
            );
        }

        loadComments(postId);

    } catch (err) {

        console.error("Delete comment error:", err);

        alert(err.message);

    }

}
async function addComment(postId) {

    const commentInput =
        document.getElementById("commentInput");

    const addCommentButton =
        document.getElementById("addCommentButton");

    if (!commentInput) return;

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    const content =
        commentInput.value.trim();

    if (!content) return;

    try {

        addCommentButton.disabled = true;

        const response =
            await fetch(
                `/api/posts/${postId}/comments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
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

        commentInput.value = "";

        loadComments(postId);

    } catch (err) {

        console.error("Add comment error:", err);

        alert(err.message);

    } finally {

        addCommentButton.disabled = false;

    }

}
function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


function formatDate(date) {

    return new Date(date).toLocaleString(
        "uk-UA",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

// =====================================
// CREATE POST
// =====================================

const createPostForm =
    document.getElementById("createPostForm");

const createPostSection =
    document.getElementById("createPostSection");

const createPostMessage =
    document.getElementById("createPostMessage");


function updateCreatePostVisibility() {

    if (!createPostSection) return;

    const token =
        localStorage.getItem("token");

    if (token) {

        createPostSection.style.display = "block";

    } else {

        createPostSection.style.display = "none";

    }

}


updateCreatePostVisibility();

setInterval(
    updateCreatePostVisibility,
    500
);

window.addEventListener(
    "authChanged",
    updateCreatePostVisibility
);

window.addEventListener(
    "storage",
    updateCreatePostVisibility
);


if (createPostForm) {

    createPostForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const title =
                document.getElementById("postTitle")
                    .value
                    .trim();

            const content =
                document.getElementById("postContent")
                    .value
                    .trim();

            const imageInput =
                document.getElementById("postImage");

            const imageFile =
                imageInput?.files[0] || null;


            if (!title || !content) {

                createPostMessage.textContent =
                    "Заповни заголовок і текст поста.";

                return;

            }


            const currentToken =
                localStorage.getItem("token");


            if (!currentToken) {

                createPostMessage.textContent =
                    "Спочатку потрібно увійти в акаунт.";

                return;

            }


            try {

                createPostMessage.textContent =
                    "Публікуємо...";


                const formData =
                    new FormData();

                formData.append(
                    "title",
                    title
                );

                formData.append(
                    "content",
                    content
                );


                if (imageFile) {

                    formData.append(
                        "image",
                        imageFile
                    );

                }

console.log("🖼️ IMAGE FILE:", imageFile);
console.log("📦 FORMDATA:");

for (const [key, value] of formData.entries()) {
    console.log(
        key,
        value instanceof File
            ? `FILE: ${value.name}`
            : value
    );
}

                const response =
                    await fetch(
                        "/api/posts",
                        {

                            method: "POST",

                            headers: {

                                "Authorization":
                                    `Bearer ${currentToken}`

                            },

                            body: formData

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Не вдалося створити пост"
                    );

                }


                createPostMessage.textContent =
                    "✅ Пост опубліковано!";


                createPostForm.reset();


                await loadBlogPosts();


            } catch (err) {

                console.error(
                    "Create post error:",
                    err
                );

                createPostMessage.textContent =
                    "❌ " + err.message;

            }

        }
    );
// =====================================
// COMMUNITY CHAT
// =====================================

async function loadChatMessages() {

    const chatMessages =
        document.getElementById("chatMessages");

    if (!chatMessages) return;

    try {

        const response =
            await fetch("/api/chat");

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load chat"
            );

        }

        const messages =
            data.messages || [];

        messages.reverse();

        if (!messages.length) {

            chatMessages.innerHTML = `
                <div class="message">

                    <div class="message-text">
                        Поки що тут тихо 🌌
                    </div>

                </div>
            `;

            return;
        }

        chatMessages.innerHTML =
            messages.map(message => `

                <div
                    class="message"
                    data-message-id="${message.id}"
                >

                    <div class="message-author">
                        ${escapeHtml(message.username)}
                    </div>

                    <div class="message-text">
                        ${escapeHtml(message.content)}
                    </div>

                    <div class="message-time">
                        ${formatDate(message.created_at)}
                    </div>

                </div>

            `).join("");

        chatMessages.scrollTop = 0;

    } catch (err) {

        console.error(
            "Chat load error:",
            err
        );

        chatMessages.innerHTML = `
            <div class="message">

                <div class="message-text">
                    ⚠️ Не вдалося завантажити чат
                </div>

            </div>
        `;

    }

}


// =====================================
// SEND CHAT MESSAGE
// =====================================

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");


const chatStatus =
    document.getElementById("chatMessage");


if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const content =
                chatInput.value.trim();

            if (!content) return;


            const token =
                localStorage.getItem("token");


            if (!token) {

                chatStatus.textContent =
                    "🔒 Увійди в акаунт, щоб писати в чат.";

                return;

            }




            try {

                const response =
                    await fetch(
                        "/api/chat",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                content
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Message sending failed"
                    );

                }


                chatInput.value = "";

                await loadChatMessages();


            } catch (err) {

                console.error(
                    "Chat send error:",
                    err
                );


                chatStatus.textContent =
                    `⚠️ ${err.message}`;


                /*
                 * Якщо JWT протермінований,
                 * не вигадуємо новий токен.
                 * Користувач просто побачить,
                 * що потрібно авторизуватися.
                 */

            } finally {


                chatInput.focus();

            }

        }
    );

}


// =====================================
// INITIAL CHAT LOAD
// =====================================

loadChatMessages();

}


async function initializeBlog() {

    await loadCurrentUser();

    await loadBlogPosts();

}

initializeBlog();
