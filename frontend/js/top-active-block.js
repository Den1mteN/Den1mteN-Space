(function () {
    "use strict";

    var WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    var MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    var preview = /[?&]preview=top5(&|$)/.test(window.location.search);

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function render(rows) {
        var box = el("aside", "top-active-block");
        box.id = "topActiveBlock";
        box.appendChild(el("h3", "top-active-block__title", "🏆 Топ-5 активних"));
        box.appendChild(el("p", "top-active-block__subtitle", "Launch Week"));

        var list = el("ol", "top-active-block__list");
        rows.forEach(function (row, index) {
            var item = el("li", "top-active-block__item");
            item.appendChild(el("span", "top-active-block__medal", MEDALS[index] || String(index + 1)));
            item.appendChild(el("span", "top-active-block__name", row.username));
            item.appendChild(el("span", "top-active-block__points", row.points + " б."));
            list.appendChild(item);
        });
        box.appendChild(list);
        document.body.appendChild(box);
    }

    fetch("/api/top-active?period=launch-2026", { cache: "no-store" })
        .then(function (response) { return response.ok ? response.json() : null; })
        .then(function (data) {
            if (!data || data.success !== true || !Array.isArray(data.rows) || data.rows.length === 0) return;
            var showAt = Date.parse(data.periodEnd) + 60 * 1000;
            var now = Date.now();
            if (!preview && !(now >= showAt && now < showAt + WEEK_MS)) return;
            render(data.rows);
        })
        .catch(function () {});
})();
