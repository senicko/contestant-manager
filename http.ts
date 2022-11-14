import { serve } from "bun";
import { STATUS_CODES } from "http";
import { Database } from "bun:sqlite";

// Database
const db = new Database("db.sqlite");

type Contestant = {
  id: number;
  name: string;
};

db.run(`
  CREATE TABLE IF NOT EXISTS contestants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`);

// Server
type Routes = {
  [k: string]: {
    [m: string]: (request: Request) => Promise<Response> | Response;
  };
};

const routes: Routes = {
  "/": {
    GET: () => {
      return new Response("Hello, World!");
    },
  },
  "/contestants": {
    POST: async (request) => {
      const { name } = await request.json<Contestant>();

      const created: Contestant = db
        .query("INSERT INTO contestants (name) VALUES (?) RETURNING *")
        .get(name);

      return Response.json(created);
    },
  },
};

const resolver = (request: Request, routes: Routes) => {
  const { pathname } = new URL(request.url);
  const handler = routes[pathname][request.method];

  return handler
    ? handler(request)
    : new Response(STATUS_CODES[404], { status: 404 });
};

serve({
  fetch: (request) => {
    return resolver(request, routes);
  },
  error: (error: Error) => {
    return new Response(`Error! ${error.toString()}`, {
      status: 500,
    });
  },
});
