import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import session from "express-session";
import { DatabaseSync } from "node:sqlite";

const app = express();
const PORT = 3000;

const database = new DatabaseSync("rollcall.db");

database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )
`);

for (const column of ["first_name TEXT", "last_name TEXT", "location TEXT", "age INTEGER", "skate_level TEXT"]) {
  try { database.exec(`ALTER TABLE users ADD COLUMN ${column}`); } catch { /* already exists */ }
}

database.exec(`
  CREATE TABLE IF NOT EXISTS friends (
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, friend_id)
  );
  CREATE TABLE IF NOT EXISTS attended_events (
    user_id INTEGER NOT NULL,
    event_id TEXT NOT NULL,
    PRIMARY KEY (user_id, event_id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT NOT NULL,
    skill_level TEXT NOT NULL,
    image_url TEXT,
    creator_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

database.prepare(`INSERT OR IGNORE INTO events
  (id, name, date, time, location, city, description, skill_level, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(
    "beginner-skating-1",
    "Beginner Skating Workshop",
    "2026-07-11",
    "7:00 PM",
    "Astro Skate",
    "Orlando",
    "In this workshop, you will learn how to skate, starting with the basics!",
    "Beginner",
    null,
  );

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: "rollcall-development-secret-change-later",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60,
    },
  }),
);

// Create an account
app.post("/api/signup", async (request, response) => {
  try {
    const username = request.body.username?.trim();
    const email = request.body.email?.trim();
    const password = request.body.password;
    const firstName = request.body.firstName?.trim() || null;
    const lastName = request.body.lastName?.trim() || null;
    const location = request.body.location?.trim() || null;
    const age = Number(request.body.age) || null;
    const skateLevel = request.body.skateLevel || null;

    if (!username || !email || !password) {
      return response.status(400).json({
        message: "Username, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return response.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = database
      .prepare(
        `SELECT id
         FROM users
         WHERE username = ? OR email = ?`,
      )
      .get(username, email);

    if (existingUser) {
      return response.status(409).json({
        message: "That username or email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    database
      .prepare(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, location, age, skate_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(username, email, passwordHash, firstName, lastName, location, age, skateLevel);

    return response.status(201).json({
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      message: "Unable to create account.",
    });
  }
});

// Log in
app.post("/api/login", async (request, response) => {
  try {
    const username = request.body.username?.trim();
    const password = request.body.password;

    if (!username || !password) {
      return response.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = database
      .prepare(
        `SELECT id, username, password_hash
         FROM users
         WHERE username = ?`,
      )
      .get(username);

    if (!user) {
      return response.status(401).json({
        message: "Incorrect username or password.",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordIsCorrect) {
      return response.status(401).json({
        message: "Incorrect username or password.",
      });
    }

    request.session.userId = user.id;

    return response.json({
      message: "Login successful.",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      message: "Unable to log in.",
    });
  }
});

// Check the current login
app.get("/api/me", (request, response) => {
  if (!request.session.userId) {
    return response.status(401).json({
      message: "You are not logged in.",
    });
  }

  const user = database
    .prepare(`SELECT id, username, email, first_name AS firstName, last_name AS lastName,
                     location, age, skate_level AS skateLevel FROM users WHERE id = ?`)
    .get(request.session.userId);

  const friends = database.prepare(`SELECT users.id, users.username FROM friends
    JOIN users ON users.id = friends.friend_id WHERE friends.user_id = ? ORDER BY users.username`)
    .all(request.session.userId);
  const attendedEventIds = database.prepare("SELECT event_id AS eventId FROM attended_events WHERE user_id = ?")
    .all(request.session.userId).map((event) => event.eventId);

  return response.json({ user, friends, attendedEventIds });
});

function requireLogin(request, response, next) {
  if (!request.session.userId) return response.status(401).json({ message: "You are not logged in." });
  next();
}

app.post("/api/friends", requireLogin, (request, response) => {
  const friend = database.prepare("SELECT id, username FROM users WHERE username = ?")
    .get(request.body.username?.trim());
  if (!friend) return response.status(404).json({ message: "User not found." });
  if (friend.id === request.session.userId) return response.status(400).json({ message: "You cannot add yourself." });
  database.prepare("INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)")
    .run(request.session.userId, friend.id);
  return response.status(201).json({ friend });
});

app.delete("/api/friends/:friendId", requireLogin, (request, response) => {
  database.prepare("DELETE FROM friends WHERE user_id = ? AND friend_id = ?")
    .run(request.session.userId, Number(request.params.friendId));
  return response.json({ message: "Friend removed." });
});

app.post("/api/attendance/:eventId", requireLogin, (request, response) => {
  database.prepare("INSERT OR IGNORE INTO attended_events (user_id, event_id) VALUES (?, ?)")
    .run(request.session.userId, request.params.eventId);
  return response.status(201).json({ attended: true });
});

app.delete("/api/attendance/:eventId", requireLogin, (request, response) => {
  database.prepare("DELETE FROM attended_events WHERE user_id = ? AND event_id = ?")
    .run(request.session.userId, request.params.eventId);
  return response.json({ attended: false });
});

app.get("/api/events", (request, response) => {
  const events = database.prepare(`SELECT id, name, date, time, location, city, description,
    skill_level AS skillLevel, image_url AS imageUrl, creator_id AS creatorId
    FROM events ORDER BY date, time`).all().map((event) => ({
      id: event.id,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      city: event.city,
      description: event.description,
      skillLevel: event.skillLevel,
      imageUrl: event.imageUrl,
      canDelete: Boolean(request.session.userId && event.creatorId === request.session.userId),
    }));
  return response.json({ events });
});

app.post("/api/events", requireLogin, (request, response) => {
  const name = request.body.name?.trim();
  const date = request.body.date;
  const time = request.body.time;
  const location = request.body.location?.trim();
  const city = request.body.city?.trim();
  const description = request.body.description?.trim();
  const skillLevel = request.body.skillLevel;
  const imageUrl = request.body.imageUrl?.trim() || null;

  if (!name || !date || !time || !location || !city || !description || !skillLevel) {
    return response.status(400).json({ message: "Please complete every required field." });
  }

  const event = {
    id: crypto.randomUUID(), name, date, time, location, city, description, skillLevel, imageUrl,
  };

  database.prepare(`INSERT INTO events
    (id, name, date, time, location, city, description, skill_level, image_url, creator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(event.id, name, date, time, location, city, description, skillLevel, imageUrl, request.session.userId);

  return response.status(201).json({ event });
});

app.delete("/api/events/:eventId", requireLogin, (request, response) => {
  const event = database.prepare("SELECT creator_id AS creatorId FROM events WHERE id = ?")
    .get(request.params.eventId);

  if (!event) {
    return response.status(404).json({ message: "Event not found." });
  }

  if (event.creatorId !== request.session.userId) {
    return response.status(403).json({ message: "You can only delete events you created." });
  }

  database.prepare("DELETE FROM attended_events WHERE event_id = ?").run(request.params.eventId);
  database.prepare("DELETE FROM events WHERE id = ?").run(request.params.eventId);
  return response.json({ message: "Event deleted." });
});

// Log out
app.post("/api/logout", (request, response) => {
  request.session.destroy(() => {
    response.clearCookie("connect.sid");
    response.json({ message: "Logged out successfully." });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
