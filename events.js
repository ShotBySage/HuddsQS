// =========================
// EVENTS
// =========================

let events = [];


// =========================
// LOAD TICKET TAILOR EVENTS
// =========================

async function loadEvents() {

  try {

    const response =
      await fetch("/api/events");

    if (!response.ok) {
      throw new Error("Could not load Ticket Tailor events");
    }

    const data =
      await response.json();


    // Convert Ticket Tailor events into our website format

    events =
      (data.data || [])
        .map(event => {

          const start =
            event.start?.datetime || event.start?.date;

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


          return {

            date: date,

            time: time,

            title:
              event.name || "Untitled event",

            venue:
              event.venue?.name ||
              "Location to be announced",

            cost:
              event.ticket_types?.length
                ? "Tickets available"
                : "See event details",

            description:
              event.description ||
              "See the Ticket Tailor listing for more information.",

            url:
              event.url || "#"

          };

        })
        .filter(Boolean);


    loadHomepageEvents();
    loadEventsPage();

  } catch (error) {

    console.error("Events error:", error);

    const homepage =
      document.getElementById("homepage-events");

    const eventsPage =
      document.getElementById("events-page-list");


    if (homepage) {

      homepage.innerHTML = `
        <p>
          Events could not be loaded right now.
        </p>
      `;

    }


    if (eventsPage) {

      eventsPage.innerHTML = `
        <p>
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
          event.date + "T23:59:59"
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
      dateString + "T12:00:00"
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
      dateString + "T12:00:00"
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

          <span class="tag">
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

  const container =
    document.getElementById(
      "events-page-list"
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


  container.innerHTML =
    upcomingEvents.map(event => {

      return `

        <details class="event-item">

          <summary>

            <div class="event-date">
              ${formatShortDate(event.date)}
            </div>

            <div class="event-main">

              <h3>
                ${event.title}
              </h3>

              <p>
                ${event.venue}
              </p>

            </div>

            <div class="event-meta">

              <span>
                ${event.time}
              </span>

              <span class="tag">
                ${event.cost}
              </span>

            </div>

          </summary>


          <div class="event-details">

            <p>
              ${event.description}
            </p>

            <p>

              <strong>Time:</strong>
              ${event.time}

              <br>

              <strong>Venue:</strong>
              ${event.venue}

              <br>

              <strong>Cost:</strong>
              ${event.cost}

            </p>


            ${
              event.url !== "#"
                ? `
                  <p>
                    <a
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

        </details>

      `;

    }).join("");

}


// =========================
// START
// =========================

loadEvents();
