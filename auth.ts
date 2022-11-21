import Database from "bun:sqlite";
import { Route } from "./http";
import { setCookie } from "./httputil";
import { SessionManager } from "./session";

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

/**
 * Creates routes for auth.
 * @param db database connection
 * @param sessionManager session manager
 * @returns auth handlers
 */
export const authHandlers = (
  db: Database,
  sessionManager: SessionManager
): Route[] => [
  {
    path: "/register",
    POST: async (request) => {
      // Create a new user
      const { name, email, password } = await request.json<Omit<User, "id">>();

      const user: User | null = db
        .query(
          "INSERT OR IGNORE INTO trainers (name, email, password) VALUES (?, ?, ?) RETURNING *"
        )
        .get(name, email, password);

      // If user was not inserted it means that email was already taken
      if (!user)
        return Response.json({ error: "Email already taken" }, { status: 400 });

      // Create session and return response with session cookie
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
  {
    path: "/login",
    POST: async (request) => {
      // Get candidate user from the database
      const { email, password } = await request.json<
        Pick<User, "email" | "password">
      >();

      const user: User | null = db
        .query("SELECT * FROM trainers WHERE email = ?")
        .get(email);

      // Compare passwords of the user and the candidate user
      if (!user || user.password !== password)
        return Response.json({ error: "Invalid credentials" }, { status: 400 });

      // Return response
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
];
