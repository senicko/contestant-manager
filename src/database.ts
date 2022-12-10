import { Database } from "bun:sqlite";

export type Entry<T> = T & { id: number };

export const setupDatabaseConnection = () => {
  const db = Database.open("db.sqlite");

  db.exec(`
    CREATE TABLE IF NOT EXISTS contestants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gender TEXT CHECK(gender in ('male', 'famale')) NOT NULL,
      birht_date DATE NOT NULL, 
      skiLength REAL NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL 
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS contests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS contestants_contests (
      contestant_id INTEGER,
      contest_id INTEGER,
      FOREIGN KEY (contestant_id) REFERENCES contestants(id),
      FOREIGN KEY (contest_id) REFERENCES contest(id)
    );
  `);

  return db;
};

export const db = setupDatabaseConnection();
