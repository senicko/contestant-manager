import { Handler, parseCookies, Route } from "../http";
import { sessionCookie, sessionManager } from "../session";
import { db, Entry } from "../database";
import { error } from "../http";
import {
  userSchema,
  User,
  userCredentailsSchema,
  serializeUser,
} from "../models/user";

/**
 * Checks if request is made by authenticated person
 * @param handler next handler that will be called
 * @returns
 */
export const withAuth =
  (handler: (user: User) => Handler): Handler =>
  async (request, params) => {
    const { sid } = parseCookies(request);
    const userSession = sessionManager.get(parseInt(sid));

    // FIXME: handle this error
    if (!userSession) return error(401, "Session not found");

    // FIXME: use .get() when it will be working as expected
    const user: User | null = db
      .query("SELECT * FROM trainers WHERE id = ?")
      .all(userSession.userId)[0];

    if (!user) {
      sessionManager.remove(userSession.sessionId);
      return error(404, "User does not exist");
    }

    return handler(user)(request, params);
  };

/** Registers a new user. */
const register: Handler = async (request) => {
  const validation = await userSchema.safeParseAsync(await request.json());
  if (!validation.success) return error(400, "Validation error");

  const { name, email, password } = validation.data;

  // FIXME: use .get() when it will be working as expected
  const user: Entry<User> | null = db
    .query(
      "INSERT OR IGNORE INTO trainers (name, email, password) VALUES (?, ?, ?) RETURNING *"
    )
    .all(name, email, password)[0];

  if (!user) return error(400, "Email addres is already taken");

  const response = Response.json(serializeUser(user));
  const sessionId = sessionManager.create(user.id);
  sessionCookie(response.headers, sessionId);

  return response;
};

/** Logs in a user. */
const login: Handler = async (request) => {
  const validation = await userCredentailsSchema.safeParseAsync(
    await request.json()
  );

  if (!validation.success) return error(400, "Validation error");

  const { email, password } = validation.data;

  // FIXME: use .get() when it will be working as expected
  const user: Entry<User> | null = db
    .query("SELECT * FROM trainers WHERE email = ?")
    .all(email)[0];

  if (!user || user.password !== password)
    return Response.json({ error: "Invalid credentials" }, { status: 400 });

  const response = Response.json(serializeUser(user));
  const sessionId = sessionManager.create(user.id);
  sessionCookie(response.headers, sessionId);

  return response;
};

/** Returns currently logged in user. */
const me: Handler = withAuth((user) => async () => Response.json(user));

export const authHandlers: Route[] = [
  { path: "/register", POST: register },
  { path: "/login", POST: login },
  { path: "/me", GET: me },
];
