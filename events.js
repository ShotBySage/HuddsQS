// =========================================================
// HUDDS QUEER SOCIAL
// EVENTS
// =========================================================


// =========================================================
// DATA
// =========================================================

let events = [];

let currentMonth =
  new Date().getMonth();

let currentYear =
  new Date().getFullYear();


// =========================================================
// LOAD TICKET TAILOR EVENTS
// =========================================================

async function loadEvents() {

  try {

    const response =
      await fetch("/api/events");


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `API returned ${response.status}: ${errorText}`
      );

    }


    const data =
      await response.json();


    events =
      (data.data || [])
        .map(convertEvent)
        .filter(Boolean);


    renderCalendar();

  } catch (error) {

    console.error(
      "Events error:",
      error
    );


    const calendar =
      document.getElementById(
        "calendar-grid"
      );


    const month =
      document.getElementById(
        "calendar-month"
      );


    if (month) {

      month.textContent =
        "Events";

    }


    if (calendar) {

      calendar.innerHTML = `

        <div
          style="
            grid-column: 1 / -1;
            padding: 30px;
          "
        >

          <p>
            Events could not be loaded right now.
          </p>

        </div>

      `;

    }

  }

}


// =========================================================
// CONVERT TICKET TAILOR EVENT
// =========================================================

function convertEvent(event) {

  const start =
    event.start?.iso ||
    event.start?.datetime ||
    event.start?.date;


  if (!start) {
    return null;
  }


  const date =
    start.substring(0, 10);


  let time = "";


  if (
    event.start?.time
  ) {

    time =
      event.start.time;

  } else if (
    start.includes("T")
  ) {

    const timePart =
      start.substring(11, 16);

    time =
      formatTime(timePart);

  }


  // =======================================================
  // TICKET STATUS
  // =======================================================

  const ticketTypes =
    event.ticket_types || [];


  const ticketsAvailable =
    event.tickets_available === true ||
    event.tickets_available === "true";


  const freeTickets =
    ticketTypes.some(
      ticket =>
        Number(ticket.price) === 0
    );


  let cost =
    "PAID";

  let statusClass =
    "paid";


  if (!ticketsAvailable) {

    cost =
      "SOLD OUT";

    statusClass =
      "sold-out";

  } else if (freeTickets) {

    cost =
      "FREE TICKETS";

    statusClass =
      "free";

  }


  return {

    id:
      event.id ||
      Math.random().toString(36),


    date:
      date,


    time:
      time,


    title:
      event.name ||
      "Untitled event",


    venue:
      event.venue?.name ||
      "Location to be announced",


    cost:
      cost,


    statusClass:
      statusClass,


    description:
      cleanDescription(
        event.description
      ),


    url:
      event.checkout_url ||
      event.url ||
      "#"

  };

}


// =========================================================
// FORMAT TIME
// =========================================================

function formatTime(timeString) {

  if (!timeString) {
    return "";
  }


  const parts =
    timeString.split(":");


  if (parts.length < 2) {
    return timeString;
  }


  const hours =
    Number(parts[0]);

  const minutes =
    parts[1];


  const suffix =
    hours >= 12
      ? "PM"
      : "AM";


  const displayHour =
    hours % 12 || 12;


  return `${displayHour}:${minutes} ${suffix}`;

}


// =========================================================
// CLEAN TICKET TAILOR DESCRIPTION
// =========================================================

function cleanDescription(description) {

  if (!description) {

    return "See the Ticket Tailor listing for more information.";

  }


  const temporary =
    document.createElement("div");


  temporary.innerHTML =
    description;


  return temporary.textContent
    .replace(/\s+/g, " ")
    .trim();

}


// =========================================================
// DATE HELPERS
// =========================================================

function getDaysInMonth(
  year,
  month
) {

  return new Date(
    year,
    month + 1,
    0
  ).getDate();

}


function getFirstDayOfMonth(
  year,
  month
) {

  const date =
    new Date(
      year,
      month,
      1
    );


  // JavaScript Sunday = 0
  // Convert to Monday = 0

  return (
    date.getDay() + 6
  ) % 7;

}


// =========================================================
// FORMAT MONTH
// =========================================================

function formatMonth(
  year,
  month
) {

  return new Date(
    year,
    month,
    1
  ).toLocaleDateString(
    "en-GB",
    {
      month: "long",
      year: "numeric"
    }
  );

}


// =========================================================
// CHECK TODAY
// =========================================================

function isToday(
  year,
  month,
  day
) {

  const today =
    new Date();


  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );

}


// =========================================================
// CHECK EVENT DATE
// =========================================================

function isSameDate(
  event,
  year,
  month,
  day
) {

  const date =
    new Date(
      `${event.date}T12:00:00`
    );


  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );

}


// =========================================================
// RENDER CALENDAR
// =========================================================

function renderCalendar() {

  const grid =
    document.getElementById(
      "calendar-grid"
    );


  const monthTitle =
    document.getElementById(
      "calendar-month"
    );


  if (!grid || !monthTitle) {
    return;
  }


  monthTitle.textContent =
    formatMonth(
      currentYear,
      currentMonth
    );


  grid.innerHTML = "";


  const days =
    getDaysInMonth(
      currentYear,
      currentMonth
    );


  const firstDay =
    getFirstDayOfMonth(
      currentYear,
      currentMonth
    );


  // =======================================================
  // EMPTY DAYS BEFORE MONTH STARTS
  // =======================================================

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const empty =
      document.createElement("div");


    empty.className =
      "calendar-day empty";


    grid.appendChild(empty);

  }


  // =======================================================
  // MONTH DAYS
  // =======================================================

  for (
    let day = 1;
    day <= days;
    day++
  ) {

    const cell =
      document.createElement("div");


    cell.className =
      "calendar-day";


    if (
      isToday(
        currentYear,
        currentMonth,
        day
      )
    ) {

      cell.classList.add(
        "today"
      );

    }


    // =====================================================
    // DAY NUMBER
    // =====================================================

    const number =
      document.createElement("div");


    number.className =
      "calendar-day-number";


    number.textContent =
      day;


    cell.appendChild(number);


    // =====================================================
    // EVENTS
    // =====================================================

    const eventContainer =
      document.createElement("div");


    eventContainer.className =
      "calendar-events";


    const dayEvents =
      events.filter(
        event =>
          isSameDate(
            event,
            currentYear,
            currentMonth,
            day
          )
      );


    dayEvents.forEach(
      event => {

        const eventButton =
          document.createElement("button");


        eventButton.type =
          "button";


        eventButton.className =
          `calendar-event ${event.statusClass}`;


        eventButton.innerHTML = `

          <span class="calendar-event-time">
            ${escapeHTML(event.time)}
          </span>

          <span class="calendar-event-title">
            ${escapeHTML(event.title)}
          </span>

        `;


        eventButton.addEventListener(
          "click",
          () => openEvent(event)
        );


        eventContainer.appendChild(
          eventButton
        );

      }
    );


    cell.appendChild(
      eventContainer
    );


    grid.appendChild(cell);

  }


  // =======================================================
  // FILL FINAL WEEK
  // =======================================================

  const totalCells =
    firstDay + days;


  const remainder =
    totalCells % 7;


  if (remainder !== 0) {

    const remaining =
      7 - remainder;


    for (
      let i = 0;
      i < remaining;
      i++
    ) {

      const empty =
        document.createElement("div");


      empty.className =
        "calendar-day empty";


      grid.appendChild(
        empty
      );

    }

  }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// =========================================================
// OPEN EVENT
// =========================================================

function openEvent(event) {

  const popup =
    document.getElementById(
      "event-popup"
    );


  const date =
    document.getElementById(
      "event-popup-date"
    );


  const title =
    document.getElementById(
      "event-popup-title"
    );


  const meta =
    document.getElementById(
      "event-popup-meta"
    );


  const description =
    document.getElementById(
      "event-popup-description"
    );


  const ticket =
    document.getElementById(
      "event-popup-ticket"
    );


  if (
    !popup ||
    !date ||
    !title ||
    !meta ||
    !description ||
    !ticket
  ) {

    return;

  }


  // =======================================================
  // DATE
  // =======================================================

  date.textContent =
    formatLongDate(
      event.date
    );


  // =======================================================
  // TITLE
  // =======================================================

  title.textContent =
    event.title;


  // =======================================================
  // META
  // =======================================================

  meta.innerHTML = `

    <span>
      ${escapeHTML(event.time || "Time TBC")}
    </span>

    <span>
      ${escapeHTML(event.venue)}
    </span>

    <span>
      ${escapeHTML(event.cost)}
    </span>

  `;


  // =======================================================
  // DESCRIPTION
  // =======================================================

  description.innerHTML = `

    <p>
      ${escapeHTML(event.description)}
    </p>

  `;


  // =======================================================
  // TICKET BUTTON
  // =======================================================

  if (
    event.url &&
    event.url !== "#"
  ) {

    ticket.innerHTML = `

      <a
        class="event-popup-ticket"
        href="${escapeHTML(event.url)}"
        target="_blank"
        rel="noopener"
      >
        View tickets →
      </a>

    `;

  } else {

    ticket.innerHTML = "";

  }


  // =======================================================
  // SHOW
  // =======================================================

  popup.classList.add(
    "open"
  );


  popup.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


// =========================================================
// CLOSE EVENT
// =========================================================

function closeEvent() {

  const popup =
    document.getElementById(
      "event-popup"
    );


  if (!popup) {
    return;
  }


  popup.classList.remove(
    "open"
  );


  popup.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";

}


// =========================================================
// FORMAT LONG DATE
// =========================================================

function formatLongDate(
  dateString
) {

  const date =
    new Date(
      `${dateString}T12:00:00`
    );


  return date.toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


// =========================================================
// MONTH NAVIGATION
// =========================================================

function previousMonth() {

  currentMonth--;


  if (
    currentMonth < 0
  ) {

    currentMonth = 11;

    currentYear--;

  }


  renderCalendar();

}


function nextMonth() {

  currentMonth++;


  if (
    currentMonth > 11
  ) {

    currentMonth = 0;

    currentYear++;

  }


  renderCalendar();

}


function goToToday() {

  const today =
    new Date();


  currentMonth =
    today.getMonth();

  currentYear =
    today.getFullYear();


  renderCalendar();

}


// =========================================================
// EVENT LISTENERS
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {


    const previous =
      document.getElementById(
        "previous-month"
      );


    const next =
      document.getElementById(
        "next-month"
      );


    const today =
      document.getElementById(
        "today-month"
      );


    const close =
      document.getElementById(
        "event-popup-close"
      );


    const popup =
      document.getElementById(
        "event-popup"
      );


    if (previous) {

      previous.addEventListener(
        "click",
        previousMonth
      );

    }


    if (next) {

      next.addEventListener(
        "click",
        nextMonth
      );

    }


    if (today) {

      today.addEventListener(
        "click",
        goToToday
      );

    }


    if (close) {

      close.addEventListener(
        "click",
        closeEvent
      );

    }


    // Close by clicking outside popup

    if (popup) {

      popup.addEventListener(
        "click",
        event => {

          if (
            event.target === popup
          ) {

            closeEvent();

          }

        }
      );

    }


    // Close with Escape

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {

          closeEvent();

        }

      }
    );


    loadEvents();

  }
);
