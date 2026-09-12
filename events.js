// =========================
// EVENTS
// =========================

let events = [];

let calendarDate = new Date();


// =========================
// LOAD TICKET TAILOR EVENTS
// =========================

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
        .map(event => {

          const start =
            event.start?.datetime ||
            event.start?.date;

          if (!start) return null;


          const date =
            start.split("T")[0];


          const time =
            start.includes("T")
              ? new Date(start).toLocaleTimeString(
                  "en-GB",
                  {
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )
              : "";


          // =========================
          // TICKET STATUS
          // =========================

          const ticketTypes =
            event.ticket_types || [];


          const ticketsAvailable =
            event.tickets_available === true ||
            event.tickets_available === "true";


          const freeTickets =
            ticketTypes.some(ticket =>
              Number(ticket.price) === 0
            );


          let cost;
          let statusClass;


          if (!ticketsAvailable) {

            cost = "SOLD OUT";
            statusClass = "sold-out";

          } else if (freeTickets) {

            cost = "FREE TICKETS";
            statusClass = "free";

          } else {

            cost = "PAID";
            statusClass = "paid";

          }


          return {

            date: date,

            time: time,

            title:
              event.name ||
              "Untitled event",

            venue:
              event.venue?.name ||
              "Location to be announced",

            cost: cost,

            statusClass: statusClass,

            description:
              event.description ||
              "See the Ticket Tailor listing for more information.",

            url:
              event.checkout_url ||
              event.url ||
              "#"

          };

        })
        .filter(Boolean);


    // Homepage stays the same
    loadHomepageEvents();


    // Events page becomes calendar
    loadEventsPage();

  } catch (error) {

    console.error(
      "Events error:",
      error
    );


    const homepage =
      document.getElementById(
        "homepage-events"
      );


    const calendar =
      document.getElementById(
        "events-calendar-grid"
      );


    if (homepage) {

      homepage.innerHTML = `
        <p>
          Events could not be loaded right now.
        </p>
      `;

    }


    if (calendar) {

      calendar.innerHTML = `
        <p class="calendar-error">
          Events could not be loaded right now.
        </p>
      `;

    }

  }

}


// =========================
// DATE HELPERS
// =========================

function getUpcomingEvents() {

  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );


  return events

    .filter(event => {

      const eventDate =
        new Date(
          event.date +
          "T23:59:59"
        );


      return eventDate >= today;

    })

    .sort((a, b) => {

      return (
        new Date(a.date) -
        new Date(b.date)
      );

    });

}


function formatDate(dateString) {

  const date =
    new Date(
      dateString +
      "T12:00:00"
    );


  return date.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long"
    }
  );

}


function formatShortDate(dateString) {

  const date =
    new Date(
      dateString +
      "T12:00:00"
    );


  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short"
    }
  ).toUpperCase();

}


// =========================
// HOMEPAGE
// =========================

function loadHomepageEvents() {

  const container =
    document.getElementById(
      "homepage-events"
    );


  if (!container) return;


  const upcomingEvents =
    getUpcomingEvents();


  if (
    upcomingEvents.length === 0
  ) {

    container.innerHTML = `
      <p>
        No upcoming events at the moment.
        Check back soon!
      </p>
    `;

    return;

  }


  const homepageEvents =
    upcomingEvents.slice(0, 6);


  container.innerHTML =
    homepageEvents.map(event => {

      return `

        <article class="card">

          <div class="date">
            ${formatDate(event.date)} · ${event.time}
          </div>


          <h3>
            ${event.title}
          </h3>


          <p>
            ${event.venue}
          </p>


          <span class="tag ${event.statusClass}">
            ${event.cost}
          </span>

        </article>

      `;

    }).join("");

}


// =========================
// EVENTS PAGE
// =========================

function loadEventsPage() {

  const calendar =
    document.getElementById(
      "events-calendar-grid"
    );


  if (!calendar) return;


  setupCalendarButtons();

  renderCalendar();

}


// =========================
// CALENDAR BUTTONS
// =========================

function setupCalendarButtons() {

  const previous =
    document.getElementById(
      "calendar-prev"
    );


  const next =
    document.getElementById(
      "calendar-next"
    );


  if (previous) {

    previous.onclick = () => {

      calendarDate.setMonth(
        calendarDate.getMonth() - 1
      );

      renderCalendar();

    };

  }


  if (next) {

    next.onclick = () => {

      calendarDate.setMonth(
        calendarDate.getMonth() + 1
      );

      renderCalendar();

    };

  }

}


// =========================
// RENDER CALENDAR
// =========================

function renderCalendar() {

  const calendar =
    document.getElementById(
      "events-calendar-grid"
    );


  const monthTitle =
    document.getElementById(
      "calendar-month"
    );


  if (!calendar || !monthTitle) return;


  const year =
    calendarDate.getFullYear();


  const month =
    calendarDate.getMonth();


  monthTitle.textContent =
    new Date(
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


  // First day of month
  // Convert Sunday = 0 into
  // Monday = 0

  let firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();


  firstDay =
    firstDay === 0
      ? 6
      : firstDay - 1;


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );


  let html = "";


  // Empty cells before month starts

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    html += `
      <div class="calendar-day empty"></div>
    `;

  }


  // Actual days

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const dateString =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


    const dayEvents =
      getUpcomingEvents().filter(
        event =>
          event.date === dateString
      );


    const thisDate =
      new Date(
        year,
        month,
        day
      );


    const isToday =
      thisDate.getTime() ===
      today.getTime();


    const hasEvents =
      dayEvents.length > 0;


    html += `

      <button
        type="button"
        class="
          calendar-day
          ${hasEvents ? "has-events" : ""}
          ${isToday ? "today" : ""}
        "
        data-date="${dateString}"
      >

        <span class="calendar-day-number">
          ${day}
        </span>

        ${
          hasEvents
            ? `
              <span class="calendar-event-count">
                ${dayEvents.length}
                ${dayEvents.length === 1 ? "event" : "events"}
              </span>
            `
            : ""
        }

      </button>

    `;

  }


  calendar.innerHTML =
    html;


  // Add click handlers

  calendar
    .querySelectorAll(
      ".calendar-day:not(.empty)"
    )
    .forEach(day => {

      day.addEventListener(
        "click",
        () => {

          showEventsForDate(
            day.dataset.date
          );

        }
      );

    });


  // Automatically show first
  // event in the month if there is one

  const firstEvent =
    getUpcomingEvents()
      .find(event => {

        const eventDate =
          new Date(
            event.date +
            "T12:00:00"
          );


        return (
          eventDate.getFullYear() === year &&
          eventDate.getMonth() === month
        );

      });


  if (firstEvent) {

    showEventsForDate(
      firstEvent.date
    );

  } else {

    clearSelectedEvents();

  }

}


// =========================
// SHOW EVENTS FOR DATE
// =========================

function showEventsForDate(
  dateString
) {

  const container =
    document.getElementById(
      "selected-events"
    );


  if (!container) return;


  const selectedEvents =
    getUpcomingEvents().filter(
      event =>
        event.date === dateString
    );


  const date =
    new Date(
      dateString +
      "T12:00:00"
    );


  const heading =
    date.toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );


  if (
    selectedEvents.length === 0
  ) {

    container.innerHTML = `

      <div class="selected-events-empty">

        <h2>
          ${heading}
        </h2>

        <p>
          No events on this day.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML = `

    <div class="selected-events-heading">

      <div class="kicker">
        Events
      </div>

      <h2>
        ${heading}
      </h2>

    </div>


    <div class="selected-event-list">

      ${selectedEvents.map(event => {

        return `

          <article class="selected-event">

            <div class="selected-event-time">
              ${event.time}
            </div>


            <div class="selected-event-content">

              <h3>
                ${event.title}
              </h3>


              <p>
                ${event.venue}
              </p>


              <p>
                ${event.description}
              </p>


              <span class="tag ${event.statusClass}">
                ${event.cost}
              </span>


              ${
                event.url !== "#"
                  ? `
                    <p>

                      <a
                        class="btn"
                        href="${event.url}"
                        target="_blank"
                        rel="noopener"
                      >
                        View tickets →
                      </a>

                    </p>
                  `
                  : ""
              }

            </div>

          </article>

        `;

      }).join("")}

    </div>

  `;

}


// =========================
// CLEAR SELECTED EVENTS
// =========================

function clearSelectedEvents() {

  const container =
    document.getElementById(
      "selected-events"
    );


  if (!container) return;


  container.innerHTML = `

    <div class="selected-events-empty">

      <h2>
        No upcoming events this month
      </h2>

      <p>
        Check another month using the arrows above.
      </p>

    </div>

  `;

}


// =========================
// START
// =========================

loadEvents();
