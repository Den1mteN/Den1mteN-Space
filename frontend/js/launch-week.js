(function () {
    "use strict";

    // Boundaries in UTC:
    // Start: 10.10.2026 00:00 Kyiv
    // End:   18.10.2026 00:00 Kyiv
    const START_AT = Date.parse("2026-10-09T21:00:00Z");
    const END_AT = Date.parse("2026-10-17T21:00:00Z");
    const CAMPAIGN_DAYS = 8;
    const DAY_MS = 24 * 60 * 60 * 1000;

    let serverOffset = 0;
    let renderedPhase = "";
    let renderedDay = 0;
    let pioneerCount = null;

    function currentTime() {
        return Date.now() + serverOffset;
    }

    function getPhase(now) {
        if (now < START_AT) return "countdown";
        if (now < END_AT) return "launch";
        return "ended";
    }

    function formatCountdown(milliseconds) {
        let seconds = Math.max(0, Math.ceil(milliseconds / 1000));

        const days = Math.floor(seconds / 86400);
        seconds %= 86400;

        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;

        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        const pad = (value) => String(value).padStart(2, "0");

        return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }

    function getBanner() {
        let banner = document.getElementById("launch-week-banner");

        if (!banner) {
            banner = document.createElement("section");
            banner.id = "launch-week-banner";
            banner.setAttribute("role", "region");
            banner.setAttribute("aria-label", "Den1mteN Space Launch Week");

            document.body.insertBefore(banner, document.body.firstChild);
        }

        return banner;
    }

    function renderPhase(phase, day) {
        if (phase === "ended") {
            const existing = document.getElementById("launch-week-banner");

            if (existing) existing.remove();

            renderedPhase = "ended";
            renderedDay = 0;
            return;
        }

        if (
            phase === renderedPhase &&
            (phase !== "launch" || day === renderedDay)
        ) {
            return;
        }

        const banner = getBanner();

        if (phase === "countdown") {
            banner.innerHTML = `
                <div class="launch-week-banner__content">
                    <strong class="launch-week-banner__brand">
                        🚀 DEN1MTEN SPACE
                    </strong>

                    <span class="launch-week-banner__label">
                        LAUNCH IN
                    </span>

                    <time
                        id="launch-week-countdown"
                        class="launch-week-banner__timer"
                    >--d --h --m --s</time>

                    <span class="launch-week-banner__message">
                        Офіційний запуск — 10.10.2026 о 00:00 за Києвом
                    </span>
                </div>
            `;
        } else {
            banner.innerHTML = `
                <div class="launch-week-banner__content">
                    <strong class="launch-week-banner__brand">
                        🎉 LAUNCH WEEK
                    </strong>

                    <span class="launch-week-banner__day">
                        DAY ${day} / ${CAMPAIGN_DAYS}
                    </span>

                    <span class="launch-week-banner__message">
                        Den1mteN Space офіційно відкритий!
                    </span>

                    <span
                        id="launch-week-first-wave"
                        class="launch-week-banner__first-wave"
                    >🚀 FIRST WAVE · Завантажуємо...</span>

                    <div
                        id="launch-week-hours-notice"
                        class="launch-week-banner__hours"
                        aria-live="polite"
                    >
                        <strong id="launch-week-hours-title"></strong>
                        <span id="launch-week-hours-text"></span>
                    </div>
                </div>
            `;
        }

        renderFirstWaveCounter();
        renderedPhase = phase;
        renderedDay = day;
    }

    function updateBanner() {
        const now = currentTime();
        const phase = getPhase(now);

        const day = phase === "launch"
            ? Math.floor((now - START_AT) / DAY_MS) + 1
            : 0;

        renderPhase(phase, day);
        renderOperatingHoursNotice();

        if (phase === "countdown") {
            const timer = document.getElementById("launch-week-countdown");

            if (timer) {
                timer.textContent = formatCountdown(START_AT - now);
            }
        }
    }

    async function syncServerTime() {
        const requestStarted = Date.now();

        try {
            const response = await fetch("/api/health", {
                cache: "no-store"
            });

            const requestEnded = Date.now();
            const serverDate = Date.parse(
                response.headers.get("Date") || ""
            );

            if (response.ok && Number.isFinite(serverDate)) {
                const requestMidpoint =
                    (requestStarted + requestEnded) / 2;

                serverOffset = serverDate - requestMidpoint;
                updateBanner();
            }
        } catch (error) {
            // If the server is temporarily unavailable, use the device clock.
            console.warn("Launch Week: server time sync unavailable.");
        }
    }


    function renderOperatingHoursNotice() {
        const notice = document.getElementById("launch-week-hours-notice");
        if (!notice) return;

        // The schedule reminder is shown only during Launch Week.
        if (getPhase(currentTime()) !== "launch") {
            notice.hidden = true;
            return;
        }

        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Kyiv",
            hour: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date(currentTime()));

        const hourPart = parts.find(part => part.type === "hour");
        const hour = hourPart ? Number(hourPart.value) : -1;
        const offline = hour >= 1 && hour < 9;

        notice.classList.toggle(
            "launch-week-banner__hours--offline",
            offline
        );

        const title = document.getElementById("launch-week-hours-title");
        const message = document.getElementById("launch-week-hours-text");

        if (!title || !message) return;

        if (offline) {
            title.textContent = "🌙 SPACE ЗАРАЗ ОФЛАЙН";
            message.textContent =
                "Сервер вимкнений за графіком. " +
                "Den1mteN Space повернеться о 09:00 за Києвом.";
        } else {
            title.textContent = "🕒 ГРАФІК РОБОТИ SPACE";
            message.textContent =
                "Працюємо щодня з 09:00 до 01:00 за Києвом. " +
                "З 01:00 до 09:00 сервер вимкнений.";
        }
    }

    function renderFirstWaveCounter() {
        const counter = document.getElementById("launch-week-first-wave");

        if (!counter || pioneerCount === null) return;

        const count = pioneerCount;
        const phrase = count === 1
            ? "pioneer has"
            : "pioneers have";

        counter.textContent =
            `🚀 FIRST WAVE · ${count} ${phrase} joined Space`;
    }

    async function syncLaunchStatus() {
        const headers = {};

        try {
            const token = localStorage.getItem("token");
            if (token) {
                headers.Authorization = "Bearer " + token;
            }
        } catch (error) {
            // Public status does not require authentication.
        }

        try {
            const response = await fetch("/api/launch-status", {
                method: "GET",
                headers,
                cache: "no-store"
            });

            const data = await response.json();

            if (
                !response.ok ||
                !data.success ||
                !Number.isInteger(data.pioneerCount)
            ) {
                return;
            }

            pioneerCount = data.pioneerCount;
            renderFirstWaveCounter();
        } catch (error) {
            console.warn("Launch Week: status update unavailable.");
        }
    }

    function initialize() {
        updateBanner();
        syncServerTime();
        syncLaunchStatus();

        setInterval(updateBanner, 1000);
        setInterval(syncServerTime, 60000);
        setInterval(syncLaunchStatus, 30000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }
})();
