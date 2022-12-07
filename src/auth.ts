import { Handler, parseCookies, Route, setCookie } from "./http";
import { sessionManager } from "./session";
import { db } from "./database";
import { error } from "./http";

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

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
    if (!userSession) return error(401, "");

    const user: User | null = db
      .query("SELECT * FROM trainers WHERE id = ?")
      .get(userSession.userId);

    if (!user) return error(404, "User does not exist.");

    return handler(user)(request, params);
  };

/** Registers a new user. */
const register: Handler = async (request) => {
  const { name, email, password } = await request.json<Omit<User, "id">>();

  const user: User | null = db
    .query(
      "INSERT OR IGNORE INTO trainers (name, email, password) VALUES (?, ?, ?) RETURNING *"
    )
    .get(name, email, password);

  if (!user)
    return Response.json({ error: "Email already taken" }, { status: 400 });

  delete user.password;
  const response = Response.json(user);

  setCookie(response.headers, {
    name: "sid",
    value: sessionManager.create(user.id).toString(),
    expire: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    httpOnly: true,
  });

  return response;
};

/** Logs in a user. */
const login: Handler = async (request) => {
  const { email, password } = await request.json<
    Pick<User, "email" | "password">
  >();

  const user: User | null = db
    .query("SELECT * FROM trainers WHERE email = ?")
    .get(email);

  if (!user || user.password !== password)
    return Response.json({ error: "Invalid credentials" }, { status: 400 });

  const response = Response.json(user);

  setCookie(response.headers, {
    name: "sid",
    value: sessionManager.create(user.id).toString(),
    expire: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    httpOnly: true,
  });

  return response;
};

/** Returns currently logged in user. */
const me: Handler = withAuth((user) => async () => Response.json(user));

export const authHandlers: Route[] = [
  {
    path: "/register",
    POST: register,
  },
  {
    path: "/login",
    POST: login,
  },
  {
    path: "/me",
    GET: me,
  },
];
