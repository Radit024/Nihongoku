import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { quizAttemptsTable, quizQuestionsTable, usersTable, materialsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

const PASS_THRESHOLD = 0.8;
const XP_PER_CORRECT = 10;
const BONUS_XP_PASS = 20;

router.post("/quizzes/:materialId/submit", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { materialId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: "Answers wajib dikirim sebagai array" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User tidak ditemukan" });
      return;
    }

    const [material] = await db.select().from(materialsTable).where(eq(materialsTable.id, materialId)).limit(1);
    if (!material) {
      res.status(404).json({ error: "Materi tidak ditemukan" });
      return;
    }

    if (!user.classCode || material.classCode !== user.classCode) {
      res.status(403).json({ error: "Anda tidak memiliki akses ke kuis ini" });
      return;
    }

    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.materialId, materialId))
      .orderBy(quizQuestionsTable.sortOrder);

    if (questions.length === 0) {
      res.status(404).json({ error: "Kuis tidak ditemukan" });
      return;
    }

    let correctCount = 0;
    const results = questions.map((q, i) => {
      const userAnswer = answers[i] ?? -1;
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const total = questions.length;
    const score = correctCount;
    const passed = correctCount / total >= PASS_THRESHOLD;
    const xpEarned = (correctCount * XP_PER_CORRECT) + (passed ? BONUS_XP_PASS : 0);

    const attemptId = uuidv4();
    await db.insert(quizAttemptsTable).values({
      id: attemptId,
      userId,
      materialId,
      score,
      total,
      passed,
      xpEarned,
    });

    const today = new Date().toISOString().slice(0, 10);
    if (user) {
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
      }
      await db.update(usersTable).set({
        xp: user.xp + xpEarned,
        streak: newStreak,
        lastActiveDate: today,
      }).where(eq(usersTable.id, userId));
    }

    res.json({
      attemptId,
      score,
      total,
      passed,
      xpEarned,
      results,
    });
  } catch (err) {
    req.log.error(err, "Quiz submit error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.get("/quizzes/history", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const attempts = await db
      .select({
        id: quizAttemptsTable.id,
        materialId: quizAttemptsTable.materialId,
        materialTitle: materialsTable.title,
        materialCategory: materialsTable.category,
        score: quizAttemptsTable.score,
        total: quizAttemptsTable.total,
        passed: quizAttemptsTable.passed,
        xpEarned: quizAttemptsTable.xpEarned,
        createdAt: quizAttemptsTable.createdAt,
      })
      .from(quizAttemptsTable)
      .innerJoin(materialsTable, eq(quizAttemptsTable.materialId, materialsTable.id))
      .where(eq(quizAttemptsTable.userId, userId))
      .orderBy(desc(quizAttemptsTable.createdAt));

    res.json(attempts);
  } catch (err) {
    req.log.error(err, "Quiz history error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.get("/progress", async (req, res) => {
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

    const allAttempts = await db
      .select()
      .from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.userId, userId));

    if (!user.classCode) {
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          classCode: user.classCode,
          xp: user.xp,
          streak: user.streak,
        },
        totalQuizzes: allAttempts.length,
        passedQuizzes: allAttempts.filter(a => a.passed).length,
        uniqueMaterialsPassed: new Set(allAttempts.filter(a => a.passed).map(a => a.materialId)).size,
        categoryProgress: [],
      });
      return;
    }

    const totalQuizzes = allAttempts.length;
    const passedQuizzes = allAttempts.filter(a => a.passed).length;
    const uniqueMaterialsPassed = new Set(allAttempts.filter(a => a.passed).map(a => a.materialId)).size;

    const categoryStats = await db
      .select({
        category: materialsTable.category,
        totalMaterials: count(materialsTable.id),
      })
      .from(materialsTable)
      .where(eq(materialsTable.classCode, user.classCode))
      .groupBy(materialsTable.category);

    const passedByCategory: Record<string, number> = {};
    for (const attempt of allAttempts.filter(a => a.passed)) {
      const [mat] = await db.select({ category: materialsTable.category })
        .from(materialsTable)
        .where(eq(materialsTable.id, attempt.materialId))
        .limit(1);
      if (mat) {
        passedByCategory[mat.category] = (passedByCategory[mat.category] || 0) + 1;
      }
    }

    const categoryProgress = categoryStats.map(cs => ({
      category: cs.category,
      total: cs.totalMaterials,
      completed: passedByCategory[cs.category] || 0,
    }));

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        classCode: user.classCode,
        xp: user.xp,
        streak: user.streak,
      },
      totalQuizzes,
      passedQuizzes,
      uniqueMaterialsPassed,
      categoryProgress,
    });
  } catch (err) {
    req.log.error(err, "Progress error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

export default router;
