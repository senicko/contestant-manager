import { error, Route } from "./http";
import { withAuth } from "./auth";
import { Contestant } from "./contestants";
import { db } from "./database";

interface Contest {
  id: number;
  name: string;
  contestants: Contestant[];
}

/** Retrieves all created contests */
const getContests = withAuth(() => async (request) => {
  const contests: Contest[] = db.query("SELEimage.pngCT * FROM contests").all();
  return Response.json(contests);
});

/** Creates a new contest */
const createContest = withAuth(() => async (request) => {
  const { name } = await request.json<Omit<Contest, "id">>();

  const contest: Contest = db
    .query("INSERT INTO contests (name) VALUES (?) RETURNING *")
    .get(name);
  contest.contestants = [];

  return Response.json(contest, { status: 201 });
});

const getOneContest = withAuth(() => async (_, params) => {
  const { id } = params;

  const contest = db.query("SELECT * FROM contests WHERE id = ?").get(id);
  if (!contest) return error(404, "Contest not found!");

  const contestants = db
    .query(
      `SELECT contestants.* FROM contestants_contests 
            INNER JOIN contestants ON contestants.id = contestants_contests.contestant_id 
            WHERE contestants_contests.contest_id = ?`
    )
    .all(id);

  return Response.json({ ...contest, contestants });
});

/** Adds contestant to contest */
const addContestantToContest = withAuth(() => async (request, params) => {
  const { id: contestId } = params;
  const { id: contestantId } = await request.json<{ id: number }>();

  db.query(
    "INSERT INTO contestants_contests (contestant_id, contest_id) VALUES (?, ?)"
  ).run(contestantId, contestId);

  return new Response("", { status: 201 });
});

export const contestsHandlers: Route[] = [
  {
    path: "/contests",
    GET: getContests,
    POST: createContest,
  },
  {
    path: "/contests/:id",
    GET: getOneContest,
  },
  {
    path: "/contests/:id/contestants",
    POST: addContestantToContest,
  },
];
