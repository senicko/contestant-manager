import { serve } from "bun";
import { Database } from "bun:sqlite";
import { log, resolver, Route } from "./http";
import { authHandlers } from "./auth";
import { InMemorySessionManager } from "./session";
import { contestantsHandlers } from "./contestants";

const db = new Database("db.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS contestants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

const sessionManager = new InMemorySessionManager();

const corsHeaders: HeadersInit = {
  Connection: "keep-alive",
  "Access-Control-Allow-Origin": "http://localhost:4200",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Credentials": "true",
} as const;

const routes: Route[] = [
  ...contestantsHandlers(db, sessionManager),
  ...authHandlers(db, sessionManager),
];

serve({
  port: 3000,
  fetch: async (request) => {
    let response: Response;

    if (request.method === "OPTIONS") {
      response = new Response("", { headers: corsHeaders });
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
