import { Route, error } from "../http";
import { withAuth } from "./auth";
import { db, Entry } from "../database";
import { Contestant, contestantSchema } from "../models/contestant";

/** Get all contestants */
const getContestants = withAuth(() => async () => {
  const contestants: Entry<Contestant>[] = db
    .query("SELECT * FROM contestants")
    .all();

  return Response.json(contestants);
});

/** Create a new contestant */
const createContestant = withAuth(() => async (request) => {
  const validation = await contestantSchema.safeParseAsync(
    await request.json()
  );

  if (!validation.success) return error(400, "Validation error");

  const { name, gender, birthDate, skiLength } = validation.data;

  // FIXME: use .get() when it will be working as expected
  const contestant: Entry<Contestant> = db
    .query(
      "INSERT INTO contestants (name, gender, birth_date, skiLength) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .all(name, gender, birthDate.toUTCString(), skiLength)[0];

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
