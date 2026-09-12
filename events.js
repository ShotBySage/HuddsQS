// =========================================================
// HUDDS QUEER SOCIAL
// EVENTS
// =========================================================

const EVENTS_API = "https://hqs-website.mxsagecrossley.workers.dev/events";

let events = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

async function loadEvents() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(EVENTS_API, {
      headers: { "Accept": "application/json" },
      cache: "no-store",
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    events = (data.data || [])
      .map(convertEvent)
      .filter(Boolean)
      .filter(event => !hasEventEnded(event));

    renderCalendar();
    renderHomepageEvents();

  } catch (error) {
    console.error("Events error:", error);
    renderHomepageEventsError();

    const calendar = document.getElementById("calendar-grid");
    const month = document.getElementById("calendar-month");

    if (month) month.textContent = "Events";

    if (calendar) {
      calendar.innerHTML = `
        <div style="grid-column:1 / -1; padding:30px;">
          <p>Events could not be loaded right now.</p>
        </div>
      `;
    }
  }
}

function convertEvent(event) {
  const start = event.start?.iso || event.start?.datetime || event.start?.date;
  if (!start) return null;

  const date = start.substring(0, 10);
  let time = "";

  if (event.start?.time) {
    time = formatTime(event.start.time);
  } else if (start.includes("T")) {
    time = formatTime(start.substring(11, 16));
  }

  const endDateTime = event.end?.iso || event.end?.datetime || null;
  const ticketTypes = event.ticket_types || [];
  const ticketsAvailable = event.tickets_available === true || event.tickets_available === "true";
  const freeTickets = ticketTypes.some(ticket => Number(ticket.price) === 0);

  let cost = "PAID";
  let statusClass = "paid";

  if (!ticketsAvailable) {
    cost = "SOLD OUT";
    statusClass = "sold-out";
  } else if (freeTickets) {
    cost = "FREE TICKETS";
    statusClass = "free";
  }

  return {
    id: event.id || Math.random().toString(36),
    date,
    time,
    startDateTime: start,
    endDateTime,
    title: event.name || "Untitled event",
    venue: event.venue?.name || "Location to be announced",
    cost,
    statusClass,
    description: cleanDescription(event.description),
    url: event.checkout_url || event.url || "#"
  };
}

function hasEventEnded(event) {
  if (event.endDateTime) {
    const end = new Date(event.endDateTime);
    if (!Number.isNaN(end.getTime())) return end.getTime() <= Date.now();
  }

  return new Date(`${event.date}T23:59:59`).getTime() <= Date.now();
}

function formatTime(timeString) {
  if (!timeString) return "";

  const parts = timeString.split(":");
  if (parts.length < 2) return timeString;

  const hours = Number(parts[0]);
  const minutes = parts[1];
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function cleanDescription(description) {
  if (!description) return "See the event listing for more information.";

  const temporary = document.createElement("div");
  temporary.innerHTML = description;

  return temporary.textContent.replace(/\s+/g, " ").trim();
}

// =========================================================
// HOMEPAGE EVENTS
// =========================================================

function renderHomepageEvents() {
  const container = document.getElementById("homepage-events");
  if (!container) return;

  const upcoming = events
    .filter(event => !hasEventEnded(event))
    .sort((a, b) => new Date(a.startDateTime || `${a.date}T23:59:59`) - new Date(b.startDateTime || `${b.date}T23:59:59`))
    .slice(0, 6);

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="homepage-events-empty">
        <p>Nothing coming up just yet.</p>
        <a class="btn secondary" href="events.html">View events</a>
      </div>
    `;
    return;
  }

  container.innerHTML = upcoming.map(event => `
    <article class="card homepage-event-card">
      <div class="date">${escapeHTML(formatLongDate(event.date))}</div>
      <h3>${escapeHTML(event.title)}</h3>
      <p>${event.time ? escapeHTML(event.time) : "Time TBC"}</p>
      <p>${escapeHTML(event.venue)}</p>
      <span class="tag ${escapeHTML(event.statusClass)}">${escapeHTML(event.cost)}</span>
      <button type="button" class="event-card-link" data-event-id="${escapeHTML(event.id)}">
        More details →
      </button>
    </article>
  `).join("");

  container.querySelectorAll(".event-card-link").forEach(button => {
    button.addEventListener("click", () => {
      const event = events.find(item => String(item.id) === String(button.dataset.eventId));
      if (event) openEvent(event);
    });
  });
}

function renderHomepageEventsError() {
  const container = document.getElementById("homepage-events");
  if (!container) return;

  container.innerHTML = `
    <div class="homepage-events-empty">
      <p>Events could not be loaded right now.</p>
      <a class="btn secondary" href="events.html">Try the events page</a>
    </div>
  `;
}

// =========================================================
// CALENDAR
// =========================================================

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function formatMonth(year, month) {
  return new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric"
  });
}

function isToday(year, month, day) {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

function isSameDate(event, year, month, day) {
  const date = new Date(`${event.date}T12:00:00`);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

function getActiveEvents() {
  return events.filter(event => !hasEventEnded(event));
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const monthTitle = document.getElementById("calendar-month");
  if (!grid || !monthTitle) return;

  events = events.filter(event => !hasEventEnded(event));
  monthTitle.textContent = formatMonth(currentYear, currentMonth);
  grid.innerHTML = "";

  const days = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= days; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (isToday(currentYear, currentMonth, day)) cell.classList.add("today");

    const number = document.createElement("div");
    number.className = "calendar-day-number";
    number.textContent = day;
    cell.appendChild(number);

    const eventContainer = document.createElement("div");
    eventContainer.className = "calendar-events";

    getActiveEvents()
      .filter(event => isSameDate(event, currentYear, currentMonth, day))
      .forEach(event => {
        const eventButton = document.createElement("button");
        eventButton.type = "button";
        eventButton.className = `calendar-event ${event.statusClass}`;
        eventButton.innerHTML = `
          <span class="calendar-event-time">${escapeHTML(event.time)}</span>
          <span class="calendar-event-title">${escapeHTML(event.title)}</span>
        `;
        eventButton.addEventListener("click", () => openEvent(event));
        eventContainer.appendChild(eventButton);
      });

    cell.appendChild(eventContainer);
    grid.appendChild(cell);
  }

  const remainder = (firstDay + days) % 7;

  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      const empty = document.createElement("div");
      empty.className = "calendar-day empty";
      grid.appendChild(empty);
    }
  }
}

// =========================================================
// POPUP
// =========================================================

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openEvent(event) {
  if (hasEventEnded(event)) return;

  const popup = document.getElementById("event-popup");
  const date = document.getElementById("event-popup-date");
  const title = document.getElementById("event-popup-title");
  const meta = document.getElementById("event-popup-meta");
  const description = document.getElementById("event-popup-description");
  const ticket = document.getElementById("event-popup-ticket");

  if (!popup || !date || !title || !meta || !description || !ticket) return;

  date.textContent = formatLongDate(event.date);
  title.textContent = event.title;

  meta.innerHTML = `
    <span>${escapeHTML(event.time || "Time TBC")}</span>
    <span>${escapeHTML(event.venue)}</span>
    <span>${escapeHTML(event.cost)}</span>
  `;

  description.innerHTML = `<p>${escapeHTML(event.description)}</p>`;

  ticket.innerHTML = event.url && event.url !== "#"
    ? `<a class="event-popup-ticket" href="${escapeHTML(event.url)}" target="_blank" rel="noopener">View tickets →</a>`
    : "";

  popup.classList.add("open");
  popup.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeEvent() {
  const popup = document.getElementById("event-popup");
  if (!popup) return;

  popup.classList.remove("open");
  popup.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function formatLongDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function goToToday() {
  const today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  renderCalendar();
}

// =========================================================
// START
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const previous = document.getElementById("previous-month");
  const next = document.getElementById("next-month");
  const today = document.getElementById("today-month");
  const close = document.getElementById("event-popup-close");
  const popup = document.getElementById("event-popup");

  if (previous) previous.addEventListener("click", previousMonth);
  if (next) next.addEventListener("click", nextMonth);
  if (today) today.addEventListener("click", goToToday);
  if (close) close.addEventListener("click", closeEvent);

  if (popup) {
    popup.addEventListener("click", event => {
      if (event.target === popup) closeEvent();
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeEvent();
  });

  loadEvents();
});
