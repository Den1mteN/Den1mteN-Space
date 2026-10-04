/*
 * ==================================================
 * 🎯 TASKS
 * ==================================================
 */

const tasksList =
    document.getElementById("tasksList");

const taskInput =
    document.getElementById("taskInput");

const addTaskButton =
    document.getElementById("addTaskButton");

const taskGoalSelect =
    document.getElementById("taskGoalSelect");

const TASKS_STORAGE_KEY =
    "den1mteN_tasks";

let tasksSelectedDate = null;

function getTaskDateKey(task) {

    const rawDate =
        task.task_date || task.date;

    if (!rawDate) return "";

    return String(rawDate).slice(0, 10);

}

function notifyTasksUpdated() {
    document.dispatchEvent(new Event("tasksUpdated"));
}

let tasksCache = [];

async function loadTasksFromServer() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        tasksCache = [];
        return;
    }

    try {

        const response =
            await fetch(
                "/api/tasks",
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (response.ok && data.success) {
            tasksCache = data.tasks;
        } else {
            tasksCache = [];
        }

    } catch (err) {

        console.error("Load tasks error:", err);

        tasksCache = [];

    }

}

function renderTasks() {

    if (!tasksList) {
        return;
    }

    tasksList.innerHTML = "";

    const tasks = tasksSelectedDate
        ? tasksCache.filter(task =>
            String(task.task_date).slice(0, 10) === tasksSelectedDate
        )
        : tasksCache;

    if (tasks.length === 0) {

        tasksList.innerHTML =
            "<p>Поки немає задач.</p>";

        return;
    }


    tasks.forEach(task => {

        const taskElement =
            document.createElement("div");

        taskElement.className =
            "task";

        if (task.completed) {
            taskElement.classList.add(
                "task-completed"
            );
        }


        taskElement.innerHTML = `
            <div class="task-content">

                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? "checked" : ""}
                >

                <span class="task-text">
                    ${escapeTaskText(task.text)}
                </span>

            </div>

            <div class="task-actions">

                <button
                    type="button"
                    class="task-edit"
                >
                    ✏️
                </button>

                <button
                    type="button"
                    class="task-delete"
                >
                    🗑
                </button>

            </div>
        `;


        /*
         * CHECKBOX
         */

        taskElement
            .querySelector(".task-checkbox")
            .addEventListener(
                "change",
                async () => {

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/tasks/${task.id}`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${token}`
                                    },

                                    body: JSON.stringify({
                                        completed: !task.completed
                                    })
                                }
                            );

                        const data =
                            await response.json();

                        if (!response.ok || !data.success) {

                            throw new Error(
                                data.message ||
                                "Не вдалося оновити задачу"
                            );
                        }

                        await loadTasksFromServer();

                        renderTasks();

                    } catch (err) {

                        console.error("Toggle task error:", err);

                        alert(err.message);

                    }

                }
            );


        /*
         * DELETE
         */

        taskElement
            .querySelector(".task-delete")
            .addEventListener(
                "click",
                async () => {

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/tasks/${task.id}`,
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
                                "Не вдалося видалити задачу"
                            );
                        }

                        await loadTasksFromServer();

                        renderTasks();
                        notifyTasksUpdated();

                    } catch (err) {

                        console.error("Delete task error:", err);

                        alert(err.message);

                    }

                }
            );


        /*
         * EDIT
         */

        taskElement
            .querySelector(".task-edit")
            .addEventListener(
                "click",
                () => {

                    startEditTask(
                        taskElement,
                        task
                    );

                }
            );


        tasksList.appendChild(
            taskElement
        );

    });

}


/*
 * ==================================================
 * EDIT TASK
 * ==================================================
 */

function startEditTask(taskElement, task) {

    taskElement.innerHTML = `
        <div class="task-edit-form">

            <input
                type="text"
                class="task-edit-input"
                value="${escapeTaskText(task.text)}"
                maxlength="300"
            >

            <button
                type="button"
                class="task-save-edit"
            >
                💾
            </button>

            <button
                type="button"
                class="task-cancel-edit"
            >
                ✖
            </button>

        </div>
    `;


    const input =
        taskElement.querySelector(
            ".task-edit-input"
        );


    input.focus();


    /*
     * SAVE EDIT
     */

    taskElement
        .querySelector(".task-save-edit")
        .addEventListener(
            "click",
            async () => {

                const newText =
                    input.value.trim();


                if (!newText) {
                    return;
                }


                const token =
                    localStorage.getItem("token");

                try {

                    const response =
                        await fetch(
                            `/api/tasks/${task.id}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },

                                body: JSON.stringify({
                                    text: newText
                                })
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok || !data.success) {

                        throw new Error(
                            data.message ||
                            "Не вдалося зберегти задачу"
                        );
                    }

                    await loadTasksFromServer();

                    renderTasks();

                } catch (err) {

                    console.error("Edit task error:", err);

                    alert(err.message);

                }

            }
        );


    /*
     * CANCEL EDIT
     */

    taskElement
        .querySelector(".task-cancel-edit")
        .addEventListener(
            "click",
            () => {

                renderTasks();

            }
        );


    /*
     * ENTER = SAVE
     */

    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                taskElement
                    .querySelector(
                        ".task-save-edit"
                    )
                    .click();

            }


            if (event.key === "Escape") {

                renderTasks();

            }

        }
    );

}


/*
 * ==================================================
 * ADD TASK
 * ==================================================
 */

async function addTask() {

    if (!taskInput) {
        return;
    }


    const text =
        taskInput.value.trim();


    if (!text) {
        return;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Потрібно увійти в акаунт");
        return;
    }

    try {

        const response =
            await fetch(
                "/api/tasks",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        text: text,
                        task_date:
                            tasksSelectedDate || new Date().toISOString().slice(0, 10),
                        goal_id:
                            taskGoalSelect && taskGoalSelect.value
                                ? Number(taskGoalSelect.value)
                                : null
                    })

                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Не вдалося додати задачу"
            );
        }

        taskInput.value = "";

        await loadTasksFromServer();

        renderTasks();
        notifyTasksUpdated()
    } catch (err) {

        console.error("Add task error:", err);

        alert(err.message);

    }

}

function escapeTaskText(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/*
 * ==================================================
 * TASK EVENTS
 * ==================================================
 */

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        addTask
    );

}


if (taskInput) {

    taskInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                addTask();

            }

        }
    );

}


renderTasks();
console.log("Notes JS loaded");

document.addEventListener("DOMContentLoaded", () => {

    const calendar = document.getElementById("calendar");
    const selectedDateTitle =
        document.getElementById("selectedDateTitle");

    const noteInput =
        document.getElementById("noteInput");

    const addNoteButton =
        document.getElementById("addNoteButton");

    const notesList =
        document.getElementById("notesList");

    const goalsList = document.getElementById("goalsList");
const goalTitleInput = document.getElementById("goalTitleInput");
const addGoalButton = document.getElementById("addGoalButton");
const goalDeadlineInput = document.getElementById("goalDeadlineInput");
    
    const reminderTime =
        document.getElementById("reminderTime");

    const reminderInput =
        document.getElementById("reminderInput");

    const addReminderButton =
        document.getElementById("addReminderButton");

    const remindersList =
        document.getElementById("remindersList");


    if (!calendar) {
        console.log("Calendar not found");
        return;
    }

    let currentDate = new Date();
    let selectedDate = null;

    /*
     * --------------------------------------------------
     * LOCAL STORAGE
     * --------------------------------------------------
     */

           document.addEventListener("tasksUpdated", () => {
        renderCalendar();
    });

       let notesCache = [];

    async function loadNotesFromServer() {

        const token =
            localStorage.getItem("token");

        if (!token) {
            notesCache = [];
            return;
        }

        try {

            const response =
                await fetch(
                    "/api/notes",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (response.ok && data.success) {
                notesCache = data.notes;
            } else {
                notesCache = [];
            }

        } catch (err) {

            console.error("Load notes error:", err);

            notesCache = [];

        }

    }

    function getNotesForDate(dateKey) {

        return notesCache.filter(note => {

            const noteDateKey =
                String(note.note_date).slice(0, 10);

            return noteDateKey === dateKey;

        });

    }
    
    function getDateKey(year, month, day) {

        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    }


    let remindersCache = [];

    async function loadRemindersFromServer() {

        const token =
            localStorage.getItem("token");

        if (!token) {
            remindersCache = [];
            return;
        }

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

            if (response.ok && data.success) {
                remindersCache = data.reminders;
            } else {
                remindersCache = [];
            }

        } catch (err) {

            console.error("Load reminders error:", err);

            remindersCache = [];

        }

    }

    function getRemindersForDate(dateKey) {

        return remindersCache.filter(reminder => {

            const reminderDateKey =
                String(reminder.reminder_date).slice(0, 10);

            return reminderDateKey === dateKey;

        });

    }

    /*
     * --------------------------------------------------
     * SELECT DATE
     * --------------------------------------------------
     */

    function selectDate(year, month, day, dayElement) {

        selectedDate = {
            year,
            month,
            day
        };

        tasksSelectedDate = getDateKey(year, month, day);
        renderTasks();
        document
            .querySelectorAll("#calendar .day")
            .forEach(element => {
                element.classList.remove("selected");
            });

        dayElement.classList.add("selected");

        if (selectedDateTitle) {

            const selectedDateObject =
                new Date(year, month, day);

            selectedDateTitle.textContent =
                selectedDateObject.toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });
        }

        renderNotes();

        renderReminders();

        console.log(
            "Selected date:",
            getDateKey(year, month, day)
        );
    }

    /*
     * --------------------------------------------------
     * RENDER NOTES
     * --------------------------------------------------
     */

    function renderNotes() {

        if (!notesList || !selectedDate) {
            return;
        }

        notesList.innerHTML = "";

        const dateKey =
            getDateKey(
                selectedDate.year,
                selectedDate.month,
                selectedDate.day
            );

        const dateNotes =
            getNotesForDate(dateKey);

        if (dateNotes.length === 0) {

            notesList.innerHTML =
                "<p>На цю дату поки немає заміток.</p>";

            return;
        }

        dateNotes.forEach(note => {

            const noteElement =
                document.createElement("div");

            noteElement.className = "note-item";

            noteElement.innerHTML = `
                <div>
                    <strong>${escapeTaskText(note.title || "")}</strong><br>
                    <span>${escapeTaskText(note.content || "")}</span>
                </div>
                <button type="button" data-note-id="${note.id}">
                    ×
                </button>
            `;

            noteElement
                .querySelector("button")
                .addEventListener("click", async () => {

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/notes/${note.id}`,
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
                                "Не вдалося видалити замітку"
                            );
                        }

                        await loadNotesFromServer();

                        renderNotes();
                        renderCalendar();

                    } catch (err) {

                        console.error("Delete note error:", err);

                        alert(err.message);

                    }

                });

            notesList.appendChild(noteElement);

        });

    }

    /*
     * --------------------------------------------------
     * ADD NOTE
     * --------------------------------------------------
     */
    async function addNote() {

        if (!selectedDate) {

            alert("Спочатку обери день у календарі 🙂");

            return;
        }

        if (!noteInput) {
            return;
        }

        const noteTitleInput =
            document.getElementById("noteTitleInput");

        const title =
            noteTitleInput ? noteTitleInput.value.trim() : "";

        const content =
            noteInput.value.trim();

        if (!content) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            alert("Потрібно увійти в акаунт");
            return;
        }

        const dateKey =
            getDateKey(
                selectedDate.year,
                selectedDate.month,
                selectedDate.day
            );

        try {

            const response =
                await fetch(
                    "/api/notes",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title: title,
                            content: content,
                            note_date: dateKey
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Не вдалося додати замітку"
                );
            }

            if (noteTitleInput) noteTitleInput.value = "";

            noteInput.value = "";

            await loadNotesFromServer();

            renderNotes();
            renderCalendar();

        } catch (err) {

            console.error("Add note error:", err);

            alert(err.message);

        }

    }

    function renderReminders() {

        if (!remindersList || !selectedDate) {
            return;
        }

        remindersList.innerHTML = "";

        const dateKey =
            getDateKey(
                selectedDate.year,
                selectedDate.month,
                selectedDate.day
            );

        const dateReminders =
            getRemindersForDate(dateKey);

        if (dateReminders.length === 0) {

            remindersList.innerHTML =
                "<p>На цю дату поки немає нагадувань.</p>";

            return;
        }

        dateReminders.forEach(reminder => {

            const reminderElement =
                document.createElement("div");

            reminderElement.className =
                "reminder-item";

            const timeDisplay =
                reminder.reminder_time
                    ? String(reminder.reminder_time).slice(0, 5)
                    : "";

            reminderElement.innerHTML = `
                <strong>${timeDisplay}</strong>
                <span>${reminder.text}</span>
                <button type="button" data-reminder-id="${reminder.id}">
                    ×
                </button>
            `;

            reminderElement
                .querySelector("button")
                .addEventListener("click", async () => {

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/reminders/${reminder.id}`,
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
                                "Не вдалося видалити нагадування"
                            );
                        }

                        await loadRemindersFromServer();

                        renderReminders();
                        renderCalendar();

                    } catch (err) {

                        console.error("Delete reminder error:", err);

                        alert(err.message);

                    }

                });

            remindersList.appendChild(reminderElement);

        });

    }

    async function addReminder() {

        if (!selectedDate) {

            alert("Спочатку обери день у календарі 🙂");

            return;
        }

        if (!reminderTime || !reminderInput) {
            return;
        }

        const time =
            reminderTime.value;

        const text =
            reminderInput.value.trim();

        if (!text) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            alert("Потрібно увійти в акаунт");
            return;
        }

        const dateKey =
            getDateKey(
                selectedDate.year,
                selectedDate.month,
                selectedDate.day
            );

        try {

            const response =
                await fetch(
                    "/api/reminders",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            text: text,
                            reminder_date: dateKey,
                            reminder_time: time || null
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Не вдалося додати нагадування"
                );
            }

            reminderTime.value = "";
            reminderInput.value = "";

            await loadRemindersFromServer();

            renderReminders();
            renderCalendar();

        } catch (err) {

            console.error("Add reminder error:", err);

            alert(err.message);

        }

    }

    if (addNoteButton) {
        addNoteButton.addEventListener(
            "click",
            addNote
        );
    }

    if (addReminderButton) {
        addReminderButton.addEventListener(
            "click",
            addReminder
        );
    }
    /*
     * --------------------------------------------------
     * CALENDAR
     * --------------------------------------------------
     */

    function renderCalendar() {

        calendar.innerHTML = "";

        const year =
            currentDate.getFullYear();

        const month =
            currentDate.getMonth();

        const firstDay =
            new Date(year, month, 1);

        const daysInMonth =
            new Date(year, month + 1, 0).getDate();

        let startDay =
            firstDay.getDay();

        if (startDay === 0) {
            startDay = 7;
        }

        /*
         * HEADER
         */

        const monthTitle =
            document.createElement("div");

        monthTitle.className =
            "calendar-header";

        monthTitle.innerHTML = `
            <button type="button" id="prevMonth">‹</button>

            <strong>
                ${firstDay.toLocaleDateString("uk-UA", {
                    month: "long",
                    year: "numeric"
                })}
            </strong>

            <button type="button" id="nextMonth">›</button>
        `;

        calendar.appendChild(monthTitle);

        /*
         * WEEKDAYS
         */

        const weekdaysRow =
            document.createElement("div");

        weekdaysRow.className =
            "calendar-weekdays";

        [
            "Пн",
            "Вт",
            "Ср",
            "Чт",
            "Пт",
            "Сб",
            "Нд"
        ].forEach(dayName => {

            const element =
                document.createElement("div");

            element.textContent =
                dayName;

            weekdaysRow.appendChild(element);

        });

        calendar.appendChild(weekdaysRow);

        /*
         * DAYS GRID
         */

        const daysGrid =
            document.createElement("div");

        daysGrid.className =
            "calendar-grid";

        /*
         * EMPTY DAYS
         */

        for (let i = 1; i < startDay; i++) {

            const emptyDay =
                document.createElement("div");

            emptyDay.className =
                "day empty-day";

            daysGrid.appendChild(emptyDay);

        }

        /*
         * DAYS
         */

                            const notes = notesCache;

        const reminders = remindersCache;

        const tasks = tasksCache;

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const dayElement =
                document.createElement("div");

            dayElement.className =
                "day";

            const dateKey =
                getDateKey(
                    year,
                    month,
                    day
    );

                     const hasNotes =
               notes.some(note =>
                   String(note.note_date).slice(0, 10) === dateKey
               );

          const hasReminders =
              reminders.some(reminder =>
                  String(reminder.reminder_date).slice(0, 10) === dateKey
              );


          const hasTasks =
              tasks.some(task =>
                  getTaskDateKey(task) === dateKey
              );

            dayElement.textContent =
                day;
            
           const indicators =
               document.createElement("div");

           indicators.className =
               "day-indicators";

           if (hasNotes) {
               const noteDot =
                   document.createElement("span");

               noteDot.className =
                   "note-indicator";

               noteDot.textContent =
                   "•";

               indicators.appendChild(noteDot);
}

         if (hasReminders) {
             const reminderDot =
                 document.createElement("span");

         reminderDot.className =
             "reminder-indicator";

         reminderDot.textContent =
             "•";

          indicators.appendChild(reminderDot);
}


         if (hasTasks) {
             const taskDot =
                 document.createElement("span");

         taskDot.className =
             "task-indicator";

         taskDot.textContent =
             "•";

          indicators.appendChild(taskDot);
}

dayElement.appendChild(indicators);

            const today =
                new Date();

            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {

                dayElement.classList.add("today");

            }

            /*
             * SELECTED
             */

            if (
                selectedDate &&
                day === selectedDate.day &&
                month === selectedDate.month &&
                year === selectedDate.year
            ) {

                dayElement.classList.add("selected");

            }


            dayElement.addEventListener(
                "click",
                () => {

                    selectDate(
                        year,
                        month,
                        day,
                        dayElement
                    );

                }
            );

            daysGrid.appendChild(dayElement);

        }

        calendar.appendChild(daysGrid);

        /*
         * MONTH NAVIGATION
         */

        const prevMonth =
            document.getElementById("prevMonth");

        const nextMonth =
            document.getElementById("nextMonth");

        if (prevMonth) {

            prevMonth.onclick = () => {

                currentDate.setDate(1);

                currentDate.setMonth(
                    currentDate.getMonth() - 1
                );

                renderCalendar();

            };

        }

        if (nextMonth) {

            nextMonth.onclick = () => {

                currentDate.setDate(1);

                currentDate.setMonth(
                    currentDate.getMonth() + 1
                );

                renderCalendar();

            };

        }

    }

    /*
     * --------------------------------------------------
     * START
     * --------------------------------------------------
     */

    let goalsCache = [];

    async function loadGoalsFromServer() {

        const token =
            localStorage.getItem("token");

        if (!token) {
            goalsCache = [];
            return;
        }

        try {

            const response =
                await fetch(
                    "/api/goals",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (response.ok && data.success) {
                goalsCache = data.goals;
            } else {
                goalsCache = [];
            }

        } catch (err) {

            console.error("Load goals error:", err);

            goalsCache = [];

        }

    }

    function populateTaskGoalSelect() {

        if (!taskGoalSelect) return;

        const currentValue =
            taskGoalSelect.value;

        taskGoalSelect.innerHTML =
            `<option value="">Без цілі</option>` +
            goalsCache.map(goal => `
                <option value="${goal.id}">${escapeTaskText(goal.title)}</option>
            `).join("");

        taskGoalSelect.value = currentValue;

    }

    function renderGoalTasksList(goalId, listElement) {

        const linkedTasks =
            tasksCache.filter(task =>
                Number(task.goal_id) === Number(goalId)
            );

        if (linkedTasks.length === 0) {

            listElement.innerHTML =
                "<p>До цієї цілі ще не привʼязано жодної задачі.</p>";

            return;

        }

        listElement.innerHTML =
            linkedTasks.map(task => `
                <div class="goal-task-item" style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                    <input
                        type="checkbox"
                        class="goal-task-checkbox"
                        data-task-id="${task.id}"
                        ${task.completed ? "checked" : ""}
                    >
                    <span style="${task.completed ? "opacity:0.6; text-decoration:line-through;" : ""}">
                        ${escapeTaskText(task.text)}
                    </span>
                </div>
            `).join("");

        listElement
            .querySelectorAll(".goal-task-checkbox")
            .forEach(checkbox => {

                checkbox.addEventListener("change", async () => {

                    const taskId =
                        checkbox.dataset.taskId;

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/tasks/${taskId}`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${token}`
                                    },

                                    body: JSON.stringify({
                                        completed: checkbox.checked
                                    })
                                }
                            );

                        const data =
                            await response.json();

                        if (!response.ok || !data.success) {

                            throw new Error(
                                data.message ||
                                "Не вдалося оновити задачу"
                            );
                        }

                        await loadTasksFromServer();
                        await loadGoalsFromServer();

                        renderTasks();
                        renderGoals();

                        const listElementAfter =
                            document.querySelector(
                                `.goal-tasks-list[data-goal-id="${goalId}"]`
                            );

                        if (listElementAfter) {

                            renderGoalTasksList(goalId, listElementAfter);

                            listElementAfter.style.display = "block";

                        }

                    } catch (err) {

                        console.error("Toggle goal task error:", err);

                        alert(err.message);

                    }

                });

            });

    }

    function renderGoals() {

        if (!goalsList) {
            return;
        }

        goalsList.innerHTML = "";

        if (goalsCache.length === 0) {

            goalsList.innerHTML =
                "<p>Поки немає цілей.</p>";

            return;
        }

        goalsCache.forEach(goal => {

            const goalElement =
                document.createElement("div");

            goalElement.className = "goal";

            const deadlineText =
                goal.deadline
                    ? `до ${String(goal.deadline).slice(0, 10)}`
                    : "";

            goalElement.innerHTML = `
                ${escapeTaskText(goal.title)}
                ${deadlineText ? `<span class="goal-deadline">${deadlineText}</span>` : ""}

                <div class="progress">
                    <div class="bar" style="width:${goal.progress}%"></div>
                </div>

                <div class="goal-meta">
                    <span class="goal-tasks-toggle" data-goal-id="${goal.id}" style="cursor:pointer; text-decoration:underline;">
                        ${goal.tasks_completed}/${goal.tasks_total} задач
                    </span>
                    <button type="button" class="goal-delete" data-goal-id="${goal.id}">🗑</button>
                </div>

                <div class="goal-tasks-list" data-goal-id="${goal.id}" style="display:none; margin-top:8px;"></div>
            `;

            goalElement
                .querySelector(".goal-tasks-toggle")
                .addEventListener("click", () => {

                    const listElement =
                        goalElement.querySelector(".goal-tasks-list");

                    const isHidden =
                        listElement.style.display === "none";

                    if (isHidden) {

                        renderGoalTasksList(goal.id, listElement);

                        listElement.style.display = "block";

                    } else {

                        listElement.style.display = "none";

                    }

                });

            goalElement
                .querySelector(".goal-delete")
                .addEventListener("click", async () => {

                    const token =
                        localStorage.getItem("token");

                    try {

                        const response =
                            await fetch(
                                `/api/goals/${goal.id}`,
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
                                "Не вдалося видалити ціль"
                            );
                        }

            await loadGoalsFromServer();

            renderGoals();
            populateTaskGoalSelect();

        } catch (err) {

            console.error("Add goal error:", err);

                        alert(err.message);

                    }

                });

            goalsList.appendChild(goalElement);

        });

    }

    async function addGoal() {

        if (!goalTitleInput) {
            return;
        }

        const title =
            goalTitleInput.value.trim();

        if (!title) {
            return;
        }

        const deadline =
            goalDeadlineInput ? goalDeadlineInput.value : "";

        const token =
            localStorage.getItem("token");

        if (!token) {
            alert("Потрібно увійти в акаунт");
            return;
        }

        try {

            const response =
                await fetch(
                    "/api/goals",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title: title,
                            deadline: deadline || null,
                            progress_mode: "tasks"
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Не вдалося додати ціль"
                );
            }

            goalTitleInput.value = "";

            if (goalDeadlineInput) goalDeadlineInput.value = "";

            await loadGoalsFromServer();

            renderGoals();

        } catch (err) {

            console.error("Add goal error:", err);

            alert(err.message);

        }

    }

    if (addGoalButton) {
        addGoalButton.addEventListener(
            "click",
            addGoal
        );
    }

    Promise.all([
        loadNotesFromServer(),
        loadTasksFromServer(),
        loadRemindersFromServer(),
        loadGoalsFromServer()
    ]).then(() => {
        renderCalendar();
        renderGoals();
        populateTaskGoalSelect();
    });

});
