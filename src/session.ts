import { setCookie } from "./http";

export type Session = {
  sessionId: number;
  userId: number;
};

export interface SessionManager {
  /** New creates a new session for the user */
  create: (userId: number) => number;
  /** Get returns the session */
  get: (sessionId: number) => Session | undefined;
  /** Removes the session */
  remove: (sessionId: number) => void;
}

/**
 * InMemorySessionManager i an implementation of SessionManager that stores all
 * of the sessions in memory.
 */
export class InMemorySessionManager implements SessionManager {
  private sessions = new Map<number, Session>();

  /**
   * Creates a new session for specified user.
   * @param userId user's id
   * @returns session's id
   */
  create(userId: number): number {
    const sessionId = this.sessions.size;
    this.sessions.set(sessionId, { sessionId, userId });
    return sessionId;
  }

  /**
   * Retrieves the session by it's id.
   * @param sessionId session's id
   * @returns found session or undefined
   */
  get(sessionId: number): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Removes session by it's id.
   * @param sessionId session's id
   */
  remove(sessionId: number) {
    this.sessions.delete(sessionId);
  }
}

/**
 * Adds session cookie to response's headers.
 * @param headers response headers
 * @param id session id
 */
export const sessionCookie = (headers: Headers, sessionId: number) => {
  setCookie(headers, {
    name: "sid",
    value: sessionId.toString(),
    expire: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    httpOnly: true,
  });
};

export const sessionManager = new InMemorySessionManager();
