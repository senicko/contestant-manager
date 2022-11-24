export type Session = {
  userId: number;
};

export interface SessionManager {
  /** New creates a new session for the user */
  create: (userId: number) => number;
  /** Get returns the session */
  get: (sessionId: number) => Session;
  /** Removes the session */
  remove: (sessionId: number) => void;
}

/**
 * InMemorySessionManager i an implementation of SessionManager that stores all
 * of the sessions in memory.
 */
export class InMemorySessionManager implements SessionManager {
  private sessions = new Map<number, Session>();

  create(userId: number): number {
    const sessionId = this.sessions.size;
    this.sessions.set(sessionId, { userId });
    return sessionId;
  }

  get(sessionId: number): Session | undefined {
    return this.sessions.get(sessionId);
  }

  remove(sessionId: number) {
    this.sessions.delete(sessionId);
  }

  createCookie: (session: Session) => {};
}
