import { type Express, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ─── Session type augmentation ─────────────────────────────────────────────

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// ─── Validation schemas ────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/\d/, "Password must contain a number"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Middleware ────────────────────────────────────────────────────────────

export function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.session.userId) return next();
  res.status(401).json({ message: "Not authenticated" });
}

// ─── Route registration ────────────────────────────────────────────────────

export function registerAuthRoutes(app: Express) {

  // POST /api/auth/signup
  app.post("/api/auth/signup", async (req, res) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { name, email, password } = result.data;

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    }).returning({ id: users.id, name: users.name, email: users.email });

    req.session.userId = user.id;
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { email, password } = result.data;

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!user) {
      return res.status(401).json({ message: "No account found with that email." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    req.session.userId = user.id;
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });

  // GET /api/auth/user — rehydrate session on page load
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }
    res.json({ user });
  });
}
