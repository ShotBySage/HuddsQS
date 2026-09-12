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
// LOAD EVENTS FROM TICKET TAILOR API
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


    // Also update the homepage if it exists.
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


    // Homepage fallback

    const homepage =
      document.getElementById(
        "homepage-events"
      );


    if (homepage) {

      homepage.innerHTML = `

        <p>
          Events could not be loaded right now.
        </p>

        <a href="events.html">
          View the events page →
        </a>

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


  // =======================================================
  // START DATE
  // =======================================================

  const date =
    start.substring(0, 10);


  // =======================================================
  // START TIME
  // =======================================================

  let time = "";


  if (event.start?.time) {

    time =
      formatTime(
        event.start.time
      );

  } else if (start.includes("T")) {

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
      end,


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

  if (event.endDateTime) {

    const end =
      new Date(
        event.endDateTime
      );


    return (
      end.getTime() <= Date.now()
    );

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
// CLEAN DESCRIPTION
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
// GET ACTIVE EVENTS
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


  events =
    events.filter(
      event =>
        !hasEventEnded(event)
    );


  monthTitle.textContent =
    formatMonth(
      currentYear,
      currentMonth
    );


  grid.innerHTML =
    "";


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
  // EMPTY DAYS
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


    grid.appendChild(
      empty
    );

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


    const number =
      document.createElement("div");


    number.className =
      "calendar-day-number";


    number.textContent =
      day;


    cell.appendChild(
      number
    );


    const eventContainer =
      document.createElement("div");


    eventContainer.className =
      "calendar-events";


    const dayEvents =
      getActiveEvents().filter(
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


    grid.appendChild(
      cell
    );

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
// HOMEPAGE EVENTS
// =========================================================

function loadHomepageEvents() {

  // If the homepage is present, start loading events.

  const container =
    document.getElementById(
      "homepage-events"
    );


  if (!container) {

    return;

  }


  container.innerHTML = `

    <p>
      Loading events...
    </p>

  `;


  loadEvents();

}


// =========================================================
// RENDER HOMEPAGE EVENTS
// =========================================================

function renderHomepageEvents() {

  const container =
    document.getElementById(
      "homepage-events"
    );


  if (!container) {

    return;

  }


  const upcoming =
    getActiveEvents()
      .sort(
        (a, b) =>
          new Date(a.startDateTime) -
          new Date(b.startDateTime)
      )
      .slice(0, 3);


  // =======================================================
  // NO EVENTS
  // =======================================================

  if (upcoming.length === 0) {

    container.innerHTML = `

      <div class="homepage-events-empty">

        <p>
          Nothing coming up just yet.
        </p>

        <a href="events.html">
          Check the events page →
        </a>

      </div>

    `;

    return;

  }


  // =======================================================
  // EVENTS
  // =======================================================

  container.innerHTML =
    upcoming.map(
      event => {

        return `

          <article
            class="
              card
              homepage-event-card
              ${event.statusClass}
            "
          >

            <div class="date">

              ${escapeHTML(
                formatShortDate(event.date)
              )}

            </div>


            <h3>

              ${escapeHTML(
                event.title
              )}

            </h3>


            <p>

              ${escapeHTML(
                event.time || "Time TBC"
              )}

            </p>


            <p>

              ${escapeHTML(
                event.venue
              )}

            </p>


            <span
              class="tag ${event.statusClass}"
            >

              ${escapeHTML(
                event.cost
              )}

            </span>


            <button
              type="button"
              class="event-card-link"
              data-event-id="${escapeHTML(event.id)}"
            >

              More info →

            </button>

          </article>

        `;

      }
    )
    .join("");


  // =======================================================
  // POPUP BUTTONS
  // =======================================================

  container
    .querySelectorAll(
      ".event-card-link"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const event =
              events.find(
                item =>
                  String(item.id) ===
                  String(
                    button.dataset.eventId
                  )
              );


            if (event) {

              openEvent(event);

            }

          }
        );

      }
    );

}


// =========================================================
// SHORT DATE
// =========================================================

function formatShortDate(
  dateString
) {

  const date =
    new Date(
      `${dateString}T12:00:00`
    );


  return date.toLocaleDateString(
    "en-GB",
    {
      weekday: "short",
      day: "numeric",
      month: "short"
    }
  );

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

  if (
    hasEventEnded(event)
  ) {

    return;

  }


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


  date.textContent =
    formatLongDate(
      event.date
    );


  title.textContent =
    event.title;


  meta.innerHTML = `

    <span>
      ${escapeHTML(
        event.time || "Time TBC"
      )}
    </span>

    <span>
      ${escapeHTML(
        event.venue
      )}
    </span>

    <span>
      ${escapeHTML(
        event.cost
      )}
    </span>

  `;


  description.innerHTML = `

    <p>
      ${escapeHTML(
        event.description
      )}
    </p>

  `;


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

    ticket.innerHTML =
      "";

  }


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
      month
