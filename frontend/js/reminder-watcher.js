(function () {

    const CHECK_INTERVAL_MS = 30000;

    const SHOWN_KEY = "den1mten_shown_reminders";

    function getShownIds() {

        return JSON.parse(
            localStorage.getItem(SHOWN_KEY) || "[]"
        );

    }

    function markShown(id) {

        const shown = getShownIds();

        shown.push(id);

        localStorage.setItem(
            SHOWN_KEY,
            JSON.stringify(shown)
        );

    }

    function showReminderPopup(reminder) {

        const overlay =
            document.createElement("div");

        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;

        const box =
            document.createElement("div");

        box.style.cssText = `
            background: #1a1a1a;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 16px;
            padding: 24px;
            max-width: 320px;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        `;

        box.innerHTML = `
            <div style="font-size:28px; margin-bottom:10px;">⏰</div>
            <div style="font-size:16px; font-weight:bold; margin-bottom:8px;">Нагадування</div>
            <div style="font-size:14px; opacity:0.85; margin-bottom:18px;">${reminder.text}</div>
            <button type="button" style="
                background: rgba(0,229,255,0.15);
                border: 1px solid rgba(0,229,255,0.4);
                color: #00e5ff;
                border-radius: 10px;
                padding: 8px 18px;
                cursor: pointer;
                font-size: 14px;
            ">Зрозуміло</button>
        `;

        box.querySelector("button")
            .addEventListener("click", () => {
                overlay.remove();
            });

        overlay.appendChild(box);

        document.body.appendChild(overlay);

    }

    async function checkReminders() {

        const token =
            localStorage.getItem("token");

        if (!token) return;

        try {

            const response =
                await fetch(
                    "/api/reminders",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok || !data.success) return;

            const now = new Date();

            const shownIds =
                getShownIds();

            data.reminders.forEach(reminder => {

                if (!reminder.reminder_time) return;

                if (shownIds.includes(reminder.id)) return;

                const reminderDateTime =
                    new Date(
                        `${String(reminder.reminder_date).slice(0, 10)}T${reminder.reminder_time}`
                    );

                const diffMs =
                    now - reminderDateTime;

                const isDue =
                    diffMs >= 0 && diffMs < 2 * 60 * 1000;

                if (isDue) {

                    showReminderPopup(reminder);

                    markShown(reminder.id);

                }

            });

        } catch (err) {

            console.error("Reminder check error:", err);

        }

    }

    checkReminders();

    setInterval(checkReminders, CHECK_INTERVAL_MS);

})();
