export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/events") {
      const response = await fetch(
        "https://www.eventbriteapi.com/v3/users/me/organizations/",
        {
          headers: {
            Authorization: `Bearer ${env.EVENTBRITE_TOKEN}`
          }
        }
      );

    if (!response.ok) {
  const errorText = await response.text();

  return new Response(
    JSON.stringify({
      error: "Eventbrite request failed",
      status: response.status,
      details: errorText
    }),
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
