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
        .filter(Boolean)
        .filter(event => !hasEventEnded(event));


    renderCalendar();

    renderHomepageEvents();

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


    renderHomepageEventsError();

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


  // =======================================================
  // START DATE
  // =======================================================

  const date =
    start.substring(0, 10);


  // =======================================================
  // START TIME
  // =======================================================

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
  // END TIME
  // =======================================================

  const end =
    event.end?.iso ||
    event.end?.datetime ||
    null;


  const endDateTime =
    end || null;


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


  // =======================================================
  // RETURN EVENT
  // =======================================================

  return {

    id:
      event.id ||
      Math.random().toString(36),


    date:
      date,


    time:
      time,


    startDateTime:
      start,


    endDateTime:
      endDateTime,


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
// CHECK WHETHER EVENT HAS ENDED
// =========================================================

function hasEventEnded(event) {

  if (
    event.endDateTime
  ) {

    const end =
      new Date(
        event.endDateTime
      );


    return end.getTime() <= Date.now();

  }


  const fallbackEnd =
    new Date(
      `${event.date}T23:59:59`
    );


  return (
    fallbackEnd.getTime() <= Date.now()
  );

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
// GET CURRENT EVENTS
// =========================================================

function getActiveEvents() {

  return events.filter(
    event =>
      !hasEventEnded(event)
  );

}


// =========================================================
// RENDER CALENDAR
// =========================================================

function renderCalendar() {

  const grid =
    document.get
