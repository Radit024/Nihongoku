import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { and, eq, or } from "drizzle-orm";

const router = Router();

function isSenseiRole(role: string): boolean {
  return role === "sensei" || role === "dosen";
}

function isGakouseiRole(role: string): boolean {
  return role === "gakousei" || role === "mahasiswa";
}

function generateClassCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "NIKU-";
  for (let i = 0; i < 6; i++) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

router.get("/classroom/me", async (req, res) => {
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

    res.json({
      role: user.role,
      className: user.className,
      classCode: user.classCode,
    });
  } catch (err) {
    req.log.error(err, "Get classroom state error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.post("/classroom/create", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || !isSenseiRole(user.role)) {
      res.status(403).json({ error: "Hanya sensei yang dapat membuat kode kelas" });
      return;
    }

    const classNameRaw = req.body?.className;
    if (typeof classNameRaw !== "string" || !classNameRaw.trim()) {
      res.status(400).json({ error: "Nama kelas wajib diisi" });
      return;
    }

    const normalizedClassName = classNameRaw.trim();
    if (normalizedClassName.length < 3) {
      res.status(400).json({ error: "Nama kelas minimal 3 karakter" });
      return;
    }

    if (normalizedClassName.length > 120) {
      res.status(400).json({ error: "Nama kelas maksimal 120 karakter" });
      return;
    }

    let nextCode = user.classCode;
    if (!nextCode) {
      // Retry a few times to avoid collisions when generating random class codes.
      for (let i = 0; i < 5; i++) {
        const candidate = generateClassCode();
        const [exists] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.classCode, candidate))
          .limit(1);
        if (!exists) {
          nextCode = candidate;
          break;
        }
      }
    }

    if (!nextCode) {
      res.status(500).json({ error: "Gagal membuat kode kelas, coba lagi" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ className: normalizedClassName, classCode: nextCode })
      .where(eq(usersTable.id, user.id))
      .returning();

    res.json({ className: updated.className, classCode: updated.classCode });
  } catch (err) {
    req.log.error(err, "Create classroom code error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.post("/classroom/join", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const classCodeRaw = req.body?.classCode;
    if (typeof classCodeRaw !== "string" || !classCodeRaw.trim()) {
      res.status(400).json({ error: "Kode kelas wajib diisi" });
      return;
    }

    const classCode = classCodeRaw.trim().toUpperCase();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User tidak ditemukan" });
      return;
    }

    if (!isGakouseiRole(user.role)) {
      res.status(403).json({ error: "Hanya gakousei yang dapat bergabung kelas" });
      return;
    }

    const [classOwner] = await db
      .select({ id: usersTable.id, className: usersTable.className })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.classCode, classCode),
          or(eq(usersTable.role, "sensei"), eq(usersTable.role, "dosen")),
        ),
      )
      .limit(1);

    if (!classOwner) {
      res.status(404).json({ error: "Kode kelas tidak ditemukan" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ classCode })
      .where(eq(usersTable.id, user.id))
      .returning();

    res.json({ classCode: updated.classCode, className: classOwner.className ?? null });
  } catch (err) {
    req.log.error(err, "Join classroom error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

export default router;
