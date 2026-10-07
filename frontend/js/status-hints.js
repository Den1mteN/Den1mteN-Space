(function () {

    const container = document.getElementById("statusHints");

    if (!container) return;

    const items = container.querySelectorAll(".status-hint-item");

    function updateCentered() {

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closest = null;
        let closestDist = Infinity;

        items.forEach(item => {

            const rect = item.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const dist = Math.abs(itemCenter - containerCenter);

            if (dist < closestDist) {
                closestDist = dist;
                closest = item;
            }

        });

        items.forEach(item => item.classList.remove("is-centered"));

        if (closest) closest.classList.add("is-centered");

    }

    container.addEventListener("scroll", () => {
        window.requestAnimationFrame(updateCentered);
    });

    items.forEach(item => {
        item.addEventListener("click", () => {

            item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

            items.forEach(i => i.classList.remove("is-centered"));
            item.classList.add("is-centered");

        });
    });

    updateCentered();

})();
