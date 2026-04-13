import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { materialsTable, quizQuestionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const router = Router();

const GEMINI_PROMPT = `Kamu adalah asisten AI untuk platform belajar bahasa Jepang bernama NIKU (Nihongoku).

Berdasarkan materi yang diberikan, buatlah:
1. Judul materi (singkat, dalam bahasa Indonesia)
2. Kategori (pilih salah satu: Tata Bahasa, Kosakata, Kanji, Percakapan, Budaya)
3. Deskripsi singkat (1-2 kalimat)
4. Rangkuman materi pembelajaran (dalam bahasa Indonesia, 200-400 kata, format markdown)
5. 10 soal kuis pilihan ganda berdasarkan materi

Format respons sebagai JSON (tanpa markdown code block):
{
  "title": "...",
  "category": "...",
  "description": "...",
  "lessonContent": "...",
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}

correctAnswer adalah indeks jawaban yang benar (0-3).
Pastikan soal bervariasi tingkat kesulitannya dan penjelasan (explanation) ditulis dalam bahasa Indonesia.`;

router.post("/materials/upload", upload.single("file"), async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || user.role !== "dosen") {
      res.status(403).json({ error: "Hanya dosen yang dapat mengunggah materi" });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "File wajib diunggah (PDF atau gambar)" });
      return;
    }

    const base64Data = file.buffer.toString("base64");
    const mimeType = file.mimetype;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: GEMINI_PROMPT },
          ],
        },
      ],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text ?? "";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      req.log.error({ rawText }, "Failed to parse Gemini response");
      res.status(500).json({ error: "Gagal memproses materi. Coba lagi." });
      return;
    }

    const materialId = uuidv4();
    const [material] = await db.insert(materialsTable).values({
      id: materialId,
      title: parsed.title || "Materi Tanpa Judul",
      category: parsed.category || "Tata Bahasa",
      description: parsed.description || "",
      lessonContent: parsed.lessonContent || "",
      questionCount: (parsed.questions || []).length,
      createdById: userId,
    }).returning();

    const questions = (parsed.questions || []).map((q: any, i: number) => ({
      id: uuidv4(),
      materialId,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      sortOrder: i,
    }));

    if (questions.length > 0) {
      await db.insert(quizQuestionsTable).values(questions);
    }

    res.status(201).json({
      id: material.id,
      title: material.title,
      category: material.category,
      description: material.description,
      questionCount: questions.length,
    });
  } catch (err) {
    req.log.error(err, "Material upload error");
    res.status(500).json({ error: "Terjadi kesalahan saat memproses materi" });
  }
});

router.get("/materials", async (req, res) => {
  try {
    const materials = await db
      .select({
        id: materialsTable.id,
        title: materialsTable.title,
        category: materialsTable.category,
        description: materialsTable.description,
        questionCount: materialsTable.questionCount,
        createdById: materialsTable.createdById,
        createdAt: materialsTable.createdAt,
      })
      .from(materialsTable)
      .orderBy(desc(materialsTable.createdAt));

    res.json(materials);
  } catch (err) {
    req.log.error(err, "List materials error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.get("/materials/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [material] = await db.select().from(materialsTable).where(eq(materialsTable.id, id)).limit(1);
    if (!material) {
      res.status(404).json({ error: "Materi tidak ditemukan" });
      return;
    }

    const questions = await db
      .select({
        id: quizQuestionsTable.id,
        question: quizQuestionsTable.question,
        options: quizQuestionsTable.options,
        correctAnswer: quizQuestionsTable.correctAnswer,
        explanation: quizQuestionsTable.explanation,
        sortOrder: quizQuestionsTable.sortOrder,
      })
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.materialId, id))
      .orderBy(quizQuestionsTable.sortOrder);

    res.json({
      ...material,
      questions,
    });
  } catch (err) {
    req.log.error(err, "Get material error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.delete("/materials/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const [material] = await db.select().from(materialsTable).where(eq(materialsTable.id, id)).limit(1);

    if (!material) {
      res.status(404).json({ error: "Materi tidak ditemukan" });
      return;
    }

    if (material.createdById !== userId) {
      res.status(403).json({ error: "Anda tidak memiliki akses untuk menghapus materi ini" });
      return;
    }

    await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.materialId, id));
    await db.delete(materialsTable).where(eq(materialsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Delete material error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

export default router;
