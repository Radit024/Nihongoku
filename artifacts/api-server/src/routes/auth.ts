import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function normalizeRole(role: unknown): "sensei" | "gakousei" {
  const normalizedRole = typeof role === "string" ? role.trim().toLowerCase() : "";
  if (normalizedRole === "sensei" || normalizedRole === "dosen") return "sensei";
  return "gakousei";
}

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, classCode } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, dan password wajib diisi" });
      return;
    }

    const validRole = normalizeRole(role);
    const normalizedClassCode = typeof classCode === "string" && classCode.trim()
      ? classCode.trim().toUpperCase()
      : null;

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
      classCode: normalizedClassCode,
    }).returning();

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      className: user.className,
      avatarUrl: user.avatarUrl,
      role: normalizeRole(user.role),
      classCode: user.classCode,
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
      className: user.className,
      avatarUrl: user.avatarUrl,
      role: normalizeRole(user.role),
      classCode: user.classCode,
      xp: user.xp,
      streak: newStreak,
    });
  } catch (err) {
    req.log.error(err, "Login error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.patch("/auth/profile", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User tidak ditemukan" });
      return;
    }

    const { name, currentPassword, newPassword, avatarUrl } = req.body;
    const updates: Partial<{ name: string; passwordHash: string; avatarUrl: string | null }> = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: "Password lama wajib diisi untuk mengganti password" });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        res.status(400).json({ error: "Password lama salah" });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ error: "Password baru minimal 6 karakter" });
        return;
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl === null) {
        updates.avatarUrl = null;
      } else if (typeof avatarUrl === "string") {
        const normalizedAvatarUrl = avatarUrl.trim();
        if (!normalizedAvatarUrl) {
          updates.avatarUrl = null;
        } else {
          const isImageDataUrl = normalizedAvatarUrl.startsWith("data:image/");
          const isHttpUrl = /^https?:\/\//i.test(normalizedAvatarUrl);

          if (!isImageDataUrl && !isHttpUrl) {
            res.status(400).json({ error: "Format foto profil tidak valid" });
            return;
          }

          if (normalizedAvatarUrl.length > 2_000_000) {
            res.status(400).json({ error: "Ukuran foto profil terlalu besar" });
            return;
          }

          updates.avatarUrl = normalizedAvatarUrl;
        }
      } else {
        res.status(400).json({ error: "Format foto profil tidak valid" });
        return;
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "Tidak ada data yang diubah" });
      return;
    }

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      className: updated.className,
      avatarUrl: updated.avatarUrl,
      role: normalizeRole(updated.role),
      classCode: updated.classCode,
      xp: updated.xp,
      streak: updated.streak,
    });
  } catch (err) {
    req.log.error(err, "Profile update error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

export default router;
