import { serve } from "bun";
import { Database } from "bun:sqlite";
import { resolver, Route } from "./http";
import { setCookie } from "./httputil";
import { InMemorySessionManager } from "./session";

const db = new Database("db.sqlite");

type Contestant = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  password: string;
};

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
    password TEXT NOT NULL
  );
`);

const sessionManager = new InMemorySessionManager();

const routes: Route[] = [
  // User
  {
    path: "/user",
    POST: async (request) => {
      const { name, password } = await request.json<Omit<User, "id">>();

      const user: User = db
        .query(
          "INSERT INTO trainers (name, password) VALUES (?, ?) RETURNING *"
        )
        .get(name, password);

      delete user.password;

      const response = Response.json(user);

      setCookie(response.headers, {
        name: "sid",
        value: sessionManager.create(user.id).toString(),
        expire: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
        httpOnly: true,
      });

      return response;
    },
  },

  // Contestants
  {
    path: "/contestants",
    GET: () => {
      const contestants: Contestant[] = db
        .query("SELECT * FROM contestants")
        .all();

      return Response.json(contestants);
    },
    POST: async (request) => {
      const { name } = await request.json<Omit<Contestant, "id">>();

      const contestant: Contestant = db
        .query("INSERT INTO contestants (name) VALUES (?) RETURNING *")
        .get(name);

      return Response.json(contestant, { status: 201 });
    },
  },
  {
    path: "/contestants/:id",
    GET: (_, params) => {
      const { id } = params;

      const contestant = db
        .query("SELECT * FROM contestants WHERE id = ?")
        .get(id);

      return Response.json(contestant);
    },
    DELETE: (_, params) => {
      const { id } = params;

      db.run("DELETE FROM contestants WHERE id = ?", id);
      return new Response();
    },
  },
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
