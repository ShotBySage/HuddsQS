export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // =========================
    // TEST TICKET TAILOR KEY
    // =========================

    if (url.pathname === "/api/test") {

      return new Response(
        JSON.stringify({
          keyExists: !!env.TICKETTAILOR_API_KEY,
          keyLength: env.TICKETTAILOR_API_KEY
            ? env.TICKETTAILOR_API_KEY.length
            : 0
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

    }


    // =========================
    // TICKET TAILOR EVENTS
    // =========================

    if (url.pathname === "/api/events") {

      try {

        const credentials =
          btoa(`${env.TICKETTAILOR_API_KEY}:`);

        const response = await fetch(
          "https://api.tickettailor.com/v1/events?limit=100",
          {
            headers: {
              "Accept": "application/json",
              "Authorization": `Basic ${credentials}`
            }
          }
        );

        const data =
          await response.json();

        return new Response(
          JSON.stringify(data),
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {

        return new Response(
          JSON.stringify({
            error: "Ticket Tailor request failed",
            details: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      }

    }


    // =========================
    // NORMAL WEBSITE
    // =========================

    return env.ASSETS.fetch(request);

  }
};
