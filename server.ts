import { serve } from "bun";
import { Database } from "bun:sqlite";
import { resolver, Route } from "./http";
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

const routes: Route[] = [
  ...contestantsHandlers(db),
  ...authHandlers(db, sessionManager),
];

serve({
  port: 3000,
  fetch: (request) => {
    return resolver(request, routes);
  },
  error: (error: Error) => {
    return new Response(`Error! ${error.toString()}`, {
      status: 500,
    });
  },
});
