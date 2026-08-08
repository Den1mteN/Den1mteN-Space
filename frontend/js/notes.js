console.log("Notes JS loaded");

const calendar = document.getElementById("calendar");

if (calendar) {

    for (let day = 1; day <= 31; day++) {

        const dayElement = document.createElement("div");

        dayElement.className = "day";
        dayElement.textContent = day;

        calendar.appendChild(dayElement);
    }

}
