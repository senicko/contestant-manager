import { Route } from "./http";
import { withAuth } from "./auth";
import { db } from "./database";

type Gender = "man" | "woman";

export interface Contestant {
  id: number;
  name: string;
  gender: Gender;
  age: number;
  skiLength: number;
}

/** Get all contestants */
const getContestants = withAuth(() => async () => {
  const contestants: Contestant[] = db.query("SELECT * FROM contestants").all();
  return Response.json(contestants);
});

/** Create a new contestant */
const createContestant = withAuth(() => async (request) => {
  const { name, gender, age, skiLength } = await request.json<
    Omit<Contestant, "id">
  >();

  const contestant: Contestant = db
    .query(
      "INSERT INTO contestants (name, gender, age, skiLength) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .get(name, gender, age, skiLength);

  return Response.json(contestant, { status: 201 });
});

/**  Get specific contestant */
const getOneContestant = withAuth(() => async (_, params) => {
  const { id } = params;
  const contestant = db.query("SELECT * FROM contestants WHERE id = ?").get(id);
  return Response.json(contestant);
});

/** Delete contestant */
const deleteContestant = withAuth(() => async (_, params) => {
  const { id } = params;
  db.run("DELETE FROM contestants WHERE id = ?", id);
  return new Response();
});

/**
 * Creates routes for contestants.
 * @param db database connection
 * @returns routes for contestants
 */
export const contestantsHandlers: Route[] = [
  {
    path: "/contestants",
    GET: getContestants,
    POST: createContestant,
  },
  {
    path: "/contestants/:id",
    GET: getOneContestant,
    DELETE: deleteContestant,
  },
];
