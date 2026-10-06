async function loadGeniusGallery() {

    const gallery =
        document.getElementById("geniusGallery");

    if (!gallery) return;

    try {

        const [photosRes, videosRes] = await Promise.all([
            fetch("/api/genius-photos"),
            fetch("/api/videos?category=real-genius")
        ]);

        const photosData = await photosRes.json();
        const videosData = await videosRes.json();

        const photos =
            (photosData.success ? photosData.photos : [])
                .map(p => ({ type: "photo", item: p }));

        const videos =
            (videosData.success ? videosData.videos : [])
                .map(v => ({ type: "video", item: v }));

        const combined =
            photos.concat(videos)
                .sort((a, b) =>
                    new Date(b.item.created_at) - new Date(a.item.created_at)
                );

        if (combined.length === 0) {

            gallery.innerHTML =
                "<p>Поки немає фото чи відео.</p>";

            return;

        }

        const isAdmin =
            currentUser && currentUser.role === "admin";

        gallery.innerHTML = "";

        combined.forEach(entry => {

            const div = document.createElement("div");
            div.className = "genius-item";

            if (entry.type === "photo") {

                div.innerHTML = `
                    <img src="${entry.item.image_url}">
                    <div class="genius-item-caption">${entry.item.caption || ""}</div>
                    ${isAdmin ? '<button class="genius-item-delete" data-type="photo" data-id="' + entry.item.id + '">🗑️ Видалити</button>' : ""}
                `;

            } else {

                const videoTag =
                    entry.item.source_type === "youtube"
                        ? `<iframe src="${entry.item.video_url}" style="width:100%;height:180px;border:none;display:block;"></iframe>`
                        : `<video src="${entry.item.video_url}" controls muted></video>`;

                div.innerHTML = `
                    ${videoTag}
                    <div class="genius-item-caption">${entry.item.title}</div>
                    ${isAdmin ? '<button class="genius-item-delete" data-type="video" data-id="' + entry.item.id + '">🗑️ Видалити</button>' : ""}
                `;

            }

            gallery.appendChild(div);

        });

        gallery.querySelectorAll(".genius-item-delete").forEach(btn => {

            btn.addEventListener("click", async () => {

                if (!confirm("Видалити цей елемент?")) return;

                const token = localStorage.getItem("token");
                const type = btn.dataset.type;
                const id = btn.dataset.id;

                const path =
                    type === "photo"
                        ? `/api/genius-photos/${id}`
                        : `/api/videos/${id}`;

                try {

                    const response = await fetch(path, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    const data = await response.json();

                    if (data.success) {
                        loadGeniusGallery();
                    } else {
                        alert("Помилка: " + data.message);
                    }

                } catch (err) {
                    console.error("Delete genius item error:", err);
                }

            });

        });

    } catch (err) {

        console.error("Load genius gallery error:", err);

        gallery.innerHTML =
            "<p>⚠️ Не вдалося завантажити галерею.</p>";

    }

}


function setupGeniusForms() {

    if (!currentUser || currentUser.role !== "admin") {
        return;
    }

    const photoForm =
        document.getElementById("addGeniusPhotoForm");

    const videoForm =
        document.getElementById("addGeniusVideoForm");

    if (photoForm) photoForm.style.display = "block";
    if (videoForm) videoForm.style.display = "block";

    const photoSubmitBtn =
        document.getElementById("submitNewGeniusPhotoButton");

    photoSubmitBtn.addEventListener("click", async () => {

        const fileInput =
            document.getElementById("newGeniusPhotoFile");

        const captionInput =
            document.getElementById("newGeniusPhotoCaption");

        const statusElement =
            document.getElementById("newGeniusPhotoStatus");

        const file = fileInput.files[0];

        if (!file) {
            statusElement.textContent = "⚠️ Вибери файл фото";
            return;
        }

        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("caption", captionInput.value.trim());

        try {

            photoSubmitBtn.disabled = true;
            statusElement.textContent = "⏳ Завантаження...";

            const response = await fetch("/api/genius-photos", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                statusElement.textContent = "⚠️ " + (data.message || "Помилка");
                return;
            }

            statusElement.textContent = "✅ Фото додано";
            fileInput.value = "";
            captionInput.value = "";
            loadGeniusGallery();

        } catch (err) {

            console.error("Upload genius photo error:", err);
            statusElement.textContent = "⚠️ Помилка завантаження";

        } finally {

            photoSubmitBtn.disabled = false;

        }

    });

    const videoSourceSelect =
        document.getElementById("newGeniusVideoSourceType");

    const videoFileInput =
        document.getElementById("newGeniusVideoFile");

    const videoYoutubeInput =
        document.getElementById("newGeniusVideoYoutubeUrl");

    videoSourceSelect.addEventListener("change", () => {

        if (videoSourceSelect.value === "youtube") {
            videoFileInput.style.display = "none";
            videoYoutubeInput.style.display = "block";
        } else {
            videoFileInput.style.display = "block";
            videoYoutubeInput.style.display = "none";
        }

    });

    const videoSubmitBtn =
        document.getElementById("submitNewGeniusVideoButton");

    videoSubmitBtn.addEventListener("click", async () => {

        const titleInput =
            document.getElementById("newGeniusVideoTitle");

        const statusElement =
            document.getElementById("newGeniusVideoStatus");

        const title = titleInput.value.trim();

        if (!title) {
            statusElement.textContent = "⚠️ Назва обов'язкова";
            return;
        }

        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("sourceType", videoSourceSelect.value);
        formData.append("category", "real-genius");

        if (videoSourceSelect.value === "youtube") {

            const youtubeUrl = videoYoutubeInput.value.trim();

            if (!youtubeUrl) {
                statusElement.textContent = "⚠️ Вкажи YouTube посилання";
                return;
            }

            formData.append("youtubeUrl", youtubeUrl);

        } else {

            const file = videoFileInput.files[0];

            if (!file) {
                statusElement.textContent = "⚠️ Вибери відеофайл";
                return;
            }

            formData.append("video", file);

        }

        try {

            videoSubmitBtn.disabled = true;
            statusElement.textContent = "⏳ Завантаження...";

            const response = await fetch("/api/videos", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                statusElement.textContent = "⚠️ " + (data.message || "Помилка");
                return;
            }

            statusElement.textContent = "✅ Відео додано";
            titleInput.value = "";
            loadGeniusGallery();

        } catch (err) {

            console.error("Upload genius video error:", err);
            statusElement.textContent = "⚠️ Помилка завантаження";

        } finally {

            videoSubmitBtn.disabled = false;

        }

    });

}
