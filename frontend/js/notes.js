console.log("Notes JS loaded");

const calendar = document.getElementById("calendar");

if (calendar) {

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Неділя = 0, понеділок = 1...
    // Робимо понеділок першим днем тижня
    let startDay = firstDay.getDay();

    if (startDay === 0) {
        startDay = 7;
    }

    // Порожні клітинки перед 1 числом
    for (let i = 1; i < startDay; i++) {

        const emptyDay = document.createElement("div");

        emptyDay.className = "day empty-day";

        calendar.appendChild(emptyDay);
    }

    // Дні поточного місяця
    for (let day = 1; day <= daysInMonth; day++) {

        const dayElement = document.createElement("div");

        dayElement.className = "day";
        dayElement.textContent = day;

        calendar.appendChild(dayElement);
    }

}
