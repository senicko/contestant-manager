import { serve } from "bun";
import { log, resolver, Route } from "./http";
import { authHandlers } from "./auth";
import { contestantsHandlers } from "./contestants";
import { contestsHandlers } from "./contests";

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "http://localhost:4200",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Credentials": "true",
} as const;

const routes: Route[] = [
  ...contestantsHandlers,
  ...contestsHandlers,
  ...authHandlers,
];

serve({
  port: 3000,
  fetch: async (request) => {
    let response: Response;

    if (request.method === "OPTIONS") {
      response = new Response("", { headers: corsHeaders });
      response.headers.set("Connection", "keep-alive");
    } else {
      response = await resolver(request, routes);

      Object.entries(corsHeaders).forEach(([key, value]) =>
        response.headers.set(key, value)
      );
    }

    log(request, response);

    return response;
  },
  error: (error: Error) => {
    console.log(error);

    return new Response(`Error! ${error.toString()}`, {
      status: 500,
    });
  },
});
