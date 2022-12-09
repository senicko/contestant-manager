import { Route } from "./http";
import { withAuth } from "./auth";
import { db } from "./database";
import type { Entry } from "./database";

type Gender = "man" | "woman";

export interface Contestant {
  name: string;
  gender: Gender;
  age: number;
  skiLength: number;
}

/** Get all contestants */
const getContestants = withAuth(() => async () => {
  const contestants: Entry<Contestant>[] = db
    .query("SELECT * FROM contestants")
    .all();

  return Response.json(contestants);
});

/** Create a new contestant */
const createContestant = withAuth(() => async (request) => {
  const { name, gender, age, skiLength } = await request.json<
    Omit<Contestant, "id">
  >();

  // FIXME: use .get() when it will be working as expected
  const contestant: Entry<Contestant> = db
    .query(
      "INSERT INTO contestants (name, gender, age, skiLength) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .all(name, gender, age, skiLength)[0];

  return Response.json(contestant, { status: 201 });
});

/**  Get specific contestant */
const getOneContestant = withAuth(() => async (_, params) => {
  const { id } = params;

  // FIXME: use .get() when it will be working as expected
  const contestant: Entry<Contestant> = db
    .query("SELECT * FROM contestants WHERE id = ?")
    .all(id)[0];

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
  { path: "/contestants", GET: getContestants, POST: createContestant },
  { path: "/contestants/:id", GET: getOneContestant, DELETE: deleteContestant },
];
