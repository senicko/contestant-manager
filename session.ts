export type Session = {
  userId: number;
};

interface SessionManager {
  /** new creates a new session for the user */
  new: (userId: number) => void;

  /** get returns the session */
  get: (sessionId: number) => void;
}

/**
 * InMemorySessionManager i an implementation of SessionManager that stores all
 * of the sessions in memory.
 */
export class InMemorySessionManager implements SessionManager {
  private sessions = new Map<number, Session>();

  new(userId: number) {
    this.sessions.set(this.sessions.size, { userId });
  }

  get(sessionId: number): Session {
    return this.sessions.get(sessionId);
  }
}
