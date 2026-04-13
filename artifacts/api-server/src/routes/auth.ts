import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, dan password wajib diisi" });
      return;
    }

    const validRole = role === "dosen" ? "dosen" : "mahasiswa";

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email sudah terdaftar" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const [user] = await db.insert(usersTable).values({
      id,
      name,
      email,
      passwordHash,
      role: validRole,
    }).returning();

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      streak: user.streak,
    });
  } catch (err) {
    req.log.error(err, "Register error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email dan password wajib diisi" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Email atau password salah" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Email atau password salah" });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    let newStreak = user.streak;
    if (user.lastActiveDate !== today) {
      if (user.lastActiveDate) {
        const last = new Date(user.lastActiveDate);
        const now = new Date(today);
        const diff = Math.round((now.getTime() - last.getTime()) / 86400000);
        newStreak = diff === 1 ? user.streak + 1 : 1;
      } else {
        newStreak = 1;
      }
      await db.update(usersTable).set({ streak: newStreak, lastActiveDate: today }).where(eq(usersTable.id, user.id));
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      streak: newStreak,
    });
  } catch (err) {
    req.log.error(err, "Login error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

export default router;
