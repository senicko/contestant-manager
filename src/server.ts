import { serve } from "bun";
import { cors, log, resolver, Route } from "./http";
import { authHandlers } from "./handlers/auth";
import { contestantsHandlers } from "./handlers/contestants";
import { contestsHandlers } from "./handlers/contests";

const routes: Route[] = [
  ...contestantsHandlers,
  ...contestsHandlers,
  ...authHandlers,
];

serve({
  port: 3000,
  fetch: async (request) =>
    await cors(request, async () => {
      const response = await resolver(request, routes);
      log(request, response);
      return response;
    }),
  error: (error: Error) => {
    return new Response(`Error! ${error.toString()}`, {
      status: 500,
    });
  },
});
