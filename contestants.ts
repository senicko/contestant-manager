import { Route } from "./http";
import { Database } from "bun:sqlite";
import { withAuth } from "./auth";
import { SessionManager } from "./session";

type Contestant = {
  id: number;
  name: string;
};

/**
 * Creates routes for contestants.
 * @param db database connection
 * @returns routes for contestants
 */
export const contestantsHandlers = (
  db: Database,
  sessionManger: SessionManager
): Route[] => [
  {
    path: "/contestants",
    // Get all contestants
    GET: withAuth(db, sessionManger, () => async () => {
      const contestants: Contestant[] = db
        .query("SELECT * FROM contestants")
        .all();

      return Response.json(contestants);
    }),

    // Create contestants
    POST: withAuth(db, sessionManger, () => async (request) => {
      const { name } = await request.json<Omit<Contestant, "id">>();

      const contestant: Contestant = db
        .query("INSERT INTO contestants (name) VALUES (?) RETURNING *")
        .get(name);

      return Response.json(contestant, { status: 201 });
    }),
  },
  {
    path: "/contestants/:id",
    // Get specific contestant
    GET: withAuth(db, sessionManger, () => async (_, params) => {
      const { id } = params;

      const contestant = db
        .query("SELECT * FROM contestants WHERE id = ?")
        .get(id);

      return Response.json(contestant);
    }),

    // Delete contestant
    DELETE: withAuth(db, sessionManger, () => async (_, params) => {
      const { id } = params;

      db.run("DELETE FROM contestants WHERE id = ?", id);

      return new Response();
    }),
  },
];
