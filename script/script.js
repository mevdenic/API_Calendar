"use strict";

const dayContainer = document.querySelector(".days");
const gridContainer = document.querySelector(".grid-container");
const btnLeft = document.querySelector(".btn-left");
const btnRight = document.querySelector(".btn-right");
const monthYear = document.querySelector(".month-year");

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const calendarFields = 42;

let currentDate = luxon.DateTime.local();
let currentMonthNum = currentDate.toFormat("MM");
let currentYear = currentDate.year;

const createCalendar = () => {
    days.forEach((day) => {
        dayContainer.insertAdjacentHTML(
            "beforeend",
            `<p class="day-name">${day}</p>
            <p class="day-name-short">${day[0]}</p> `
        );
    });
    for (let i = 0; i < calendarFields; i++) {
        gridContainer.insertAdjacentHTML("beforeend", `<div class="grid-component"></div>`);
    }
};
createCalendar();

const uniqueDays = document.querySelectorAll(".grid-component");

const updateCalendar = (month, year, events = []) => {
    let calendarDate = currentDate.set({ day: 1, month, year });
    const firstDayOfMonth = calendarDate.toFormat("c") - 1;
    const daysInMonth = calendarDate.daysInMonth;
    const monthName = calendarDate.toFormat("LLLL");

    monthYear.textContent = `${monthName} ${year}`;

    uniqueDays.forEach((day, i) => {
        day.innerHTML = "";
        if (i >= firstDayOfMonth && i < daysInMonth + firstDayOfMonth) {
            day.insertAdjacentHTML(
                "beforeend",
                `<div class="day-number">${i - firstDayOfMonth + 1}</div>`
            );
            let date = `${year}-${month}-${calendarDate.toFormat("dd")}`;
            events.forEach((ev) => {
                if (date === ev.date && day.children.length < 2) {
                    day.insertAdjacentHTML(
                        "beforeend",
                        `<div class="day-event">
                            <h3 class="event-name">${ev.title}</h3>
                            <p class="event-detail hidden">${ev.date}</p>
                            <p class="event-detail hidden">Bunting: ${ev.bunting}</p>
                            <p class="event-detail hidden">Notes: ${
                                ev.notes === "" ? "none" : ev.notes
                            }</p>
                        </div> `
                    );
                }
            });
            calendarDate = calendarDate.plus({ days: 1 });
        }
    });
};

const apiUrl = "https://www.gov.uk/bank-holidays.json";

const getData = async (month, year) => {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Request failed with status: ${response.status}`);
        const data = await response.json();
        return data.scotland.events.filter((ev) => ev.date.includes(`${year}-${month}`));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const initApiCall = async (month, year) => {
    console.log("Getting events data...");
    try {
        const events = await getData(month, year);
        updateCalendar(month, year, events);
        console.log(events);
    } catch (error) {
        updateCalendar(month, year);
        console.error(error);
    } finally {
        console.log("Events data request finished.");
    }
};
initApiCall(currentMonthNum, currentYear);

const updateMonthAndYear = (monthDiff) => {
    console.clear();
    currentDate = currentDate.plus({ months: monthDiff });
    currentMonthNum = currentDate.toFormat("MM");
    currentYear = currentDate.year;
    initApiCall(currentMonthNum, currentYear);
};
btnLeft.addEventListener("click", () => updateMonthAndYear(-1));
btnRight.addEventListener("click", () => updateMonthAndYear(1));

gridContainer.addEventListener("click", (e) => {
    const clicked = e.target.closest(".day-event");
    //guard clause
    if (!clicked) return;
    const hidden = clicked.children[1].classList.contains("hidden");
    const firstChild = clicked.children[0];
    [...clicked.children].forEach((child) => {
        child.classList.toggle("hidden", !hidden && child !== firstChild);
    });
});
