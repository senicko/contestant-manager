import { serve } from "bun";
import { Database } from "bun:sqlite";
import { resolver, Route } from "./http";

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

const routes: Route[] = [
  {
    path: "/contestants",
    GET: () => {
      const contestants: Contestant[] = db
        .query("SELECT * FROM contestants")
        .all();

      return Response.json(contestants);
    },
    POST: async (request) => {
      const { name } = await request.json<Pick<Contestant, "name">>();

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
  fetch: (request) => {
    return resolver(request, routes);
  },
  error: (error: Error) => {
    return new Response(`Error! ${error.toString()}`, {
      status: 500,
    });
  },
});
