import { Router } from "express";
import multer from "multer";
import { extname } from "node:path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { materialsTable, quizQuestionsTable, usersTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const router = Router();

const MATERIAL_CATEGORIES = [
  "Tata Bahasa",
  "Kosakata",
  "Kanji",
  "Percakapan",
  "Budaya",
] as const;

const SUPPORTED_DOCUMENT_MIME_TYPES = new Set<string>([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const GEMINI_UPLOAD_PROMPT = `Kamu adalah asisten AI untuk platform belajar bahasa Jepang bernama NIKU (Nihongoku).

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

const GEMINI_REGENERATE_QUIZ_PROMPT = `Kamu adalah pembuat kuis untuk platform belajar bahasa Jepang.

Berdasarkan isi materi yang diberikan, buat 10 soal kuis pilihan ganda.

Format respons sebagai JSON (tanpa markdown code block):
{
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
Pastikan pertanyaan bervariasi tingkat kesulitannya dan explanation dalam bahasa Indonesia.`;

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GeneratedMaterialPayload {
  title?: unknown;
  category?: unknown;
  description?: unknown;
  lessonContent?: unknown;
  questions?: unknown;
}

interface GeneratedQuizPayload {
  questions?: unknown;
}

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getFileExtension(fileName: string): string {
  return extname(fileName || "").toLowerCase();
}

function normalizeMimeType(file: Express.Multer.File): string {
  const rawMime = (file.mimetype || "").toLowerCase();
  if (rawMime.startsWith("image/")) {
    return rawMime;
  }
  if (SUPPORTED_DOCUMENT_MIME_TYPES.has(rawMime)) {
    return rawMime;
  }

  const mapped = EXTENSION_TO_MIME[getFileExtension(file.originalname)];
  return mapped || rawMime;
}

function isSupportedFile(file: Express.Multer.File): boolean {
  const normalizedMime = normalizeMimeType(file);
  return normalizedMime.startsWith("image/") || SUPPORTED_DOCUMENT_MIME_TYPES.has(normalizedMime);
}

function toTextOrDefault(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeCategory(value: unknown): (typeof MATERIAL_CATEGORIES)[number] {
  if (typeof value !== "string") {
    return "Tata Bahasa";
  }
  const trimmed = value.trim();
  const matched = MATERIAL_CATEGORIES.find((category) => category === trimmed);
  return matched || "Tata Bahasa";
}

function toQuestionsArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

function sanitizeQuestion(raw: unknown, index: number): GeneratedQuestion | null {
  const obj = asObject(raw);
  if (!obj) {
    return null;
  }

  const question = toTextOrDefault(obj["question"], `Soal ${index + 1}`);
  const rawOptions = toQuestionsArray(obj["options"])
    .map((option) => (typeof option === "string" ? option.trim() : ""))
    .filter((option) => option.length > 0);

  const options: string[] = rawOptions.slice(0, 4);
  while (options.length < 4) {
    options.push(`Pilihan ${String.fromCharCode(65 + options.length)}`);
  }

  const rawCorrectAnswer = obj["correctAnswer"];
  const parsedCorrectAnswer = typeof rawCorrectAnswer === "number"
    ? rawCorrectAnswer
    : Number(rawCorrectAnswer);
  const correctAnswer = Number.isInteger(parsedCorrectAnswer)
    ? Math.min(Math.max(parsedCorrectAnswer, 0), options.length - 1)
    : 0;

  return {
    question,
    options,
    correctAnswer,
    explanation: toTextOrDefault(obj["explanation"], ""),
  };
}

function sanitizeQuestions(value: unknown): GeneratedQuestion[] {
  return toQuestionsArray(value)
    .map((item, index) => sanitizeQuestion(item, index))
    .filter((item): item is GeneratedQuestion => item !== null);
}

function stripFileExtension(fileName: string): string {
  const ext = getFileExtension(fileName);
  if (!ext) {
    return fileName;
  }
  return fileName.slice(0, -ext.length);
}

function toFallbackTitle(fileName: string): string {
  const base = stripFileExtension(fileName).trim();
  if (!base) {
    return "Materi Tanpa Judul";
  }
  return base.slice(0, 500);
}

function buildQuestionRows(materialId: string, questions: GeneratedQuestion[]) {
  return questions.map((question, index) => ({
    id: uuidv4(),
    materialId,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    sortOrder: index,
  }));
}

async function getUserAndMaterial(userId: string, materialId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const [material] = await db.select().from(materialsTable).where(eq(materialsTable.id, materialId)).limit(1);
  return { user, material };
}

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
    if (!user.classCode) {
      res.status(400).json({ error: "Buat kode kelas terlebih dulu sebelum upload materi" });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "File wajib diunggah (PDF, PPT, Word, atau gambar)" });
      return;
    }

    if (!isSupportedFile(file)) {
      res.status(400).json({
        error: "Format file tidak didukung. Gunakan PDF, PPT/PPTX, DOC/DOCX, atau gambar.",
      });
      return;
    }

    const base64Data = file.buffer.toString("base64");
    const mimeType = normalizeMimeType(file);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: GEMINI_UPLOAD_PROMPT },
          ],
        },
      ],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text ?? "";
    const parsed = parseJson<GeneratedMaterialPayload>(rawText);
    if (!parsed) {
      req.log.error({ rawText }, "Failed to parse Gemini response");
      res.status(500).json({ error: "Gagal memproses materi. Coba lagi." });
      return;
    }

    const questions = sanitizeQuestions(parsed.questions);
    if (questions.length === 0) {
      res.status(500).json({ error: "AI belum menghasilkan soal kuis yang valid. Coba lagi." });
      return;
    }

    const materialId = uuidv4();
    const [material] = await db.insert(materialsTable).values({
      id: materialId,
      title: toTextOrDefault(parsed.title, toFallbackTitle(file.originalname)).slice(0, 500),
      category: normalizeCategory(parsed.category),
      classCode: user.classCode,
      description: toTextOrDefault(parsed.description, ""),
      lessonContent: toTextOrDefault(parsed.lessonContent, ""),
      sourceFileName: toTextOrDefault(file.originalname, "materi"),
      sourceMimeType: mimeType,
      isPublished: false,
      questionCount: questions.length,
      createdById: userId,
    }).returning();

    const questionRows = buildQuestionRows(materialId, questions);

    if (questionRows.length > 0) {
      await db.insert(quizQuestionsTable).values(questionRows);
    }

    res.status(201).json({
      id: material.id,
      title: material.title,
      category: material.category,
      classCode: material.classCode,
      description: material.description,
      sourceFileName: material.sourceFileName,
      sourceMimeType: material.sourceMimeType,
      questionCount: questionRows.length,
      isPublished: material.isPublished,
      createdById: material.createdById,
      createdAt: material.createdAt,
    });
  } catch (err) {
    req.log.error(err, "Material upload error");
    res.status(500).json({ error: "Terjadi kesalahan saat memproses materi" });
  }
});

router.get("/materials", async (req, res) => {
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

    if (!user.classCode) {
      res.json([]);
      return;
    }

    const whereClause = user.role === "mahasiswa"
      ? and(
        eq(materialsTable.classCode, user.classCode),
        eq(materialsTable.isPublished, true),
      )
      : eq(materialsTable.classCode, user.classCode);

    const materials = await db
      .select({
        id: materialsTable.id,
        title: materialsTable.title,
        category: materialsTable.category,
        classCode: materialsTable.classCode,
        description: materialsTable.description,
        sourceFileName: materialsTable.sourceFileName,
        sourceMimeType: materialsTable.sourceMimeType,
        isPublished: materialsTable.isPublished,
        questionCount: materialsTable.questionCount,
        createdById: materialsTable.createdById,
        createdAt: materialsTable.createdAt,
      })
      .from(materialsTable)
      .where(whereClause)
      .orderBy(desc(materialsTable.createdAt));

    res.json(materials);
  } catch (err) {
    req.log.error(err, "List materials error");
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.get("/materials/:id", async (req, res) => {
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

    const { id } = req.params;

    const [material] = await db.select().from(materialsTable).where(eq(materialsTable.id, id)).limit(1);
    if (!material) {
      res.status(404).json({ error: "Materi tidak ditemukan" });
      return;
    }

    if (!user.classCode || material.classCode !== user.classCode) {
      res.status(403).json({ error: "Anda tidak memiliki akses ke materi ini" });
      return;
    }

    if (user.role === "mahasiswa" && !material.isPublished) {
      res.status(403).json({ error: "Materi ini belum dipublikasikan oleh sensei" });
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

router.patch("/materials/:id/questions", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id: materialId } = req.params;
    const { user, material } = await getUserAndMaterial(userId, materialId);

    if (!user || !material) {
      res.status(404).json({ error: "Materi atau user tidak ditemukan" });
      return;
    }

    if (user.role !== "dosen") {
      res.status(403).json({ error: "Hanya dosen yang dapat mengatur soal kuis" });
      return;
    }

    if (!user.classCode || material.classCode !== user.classCode || material.createdById !== userId) {
      res.status(403).json({ error: "Anda tidak memiliki akses untuk mengubah kuis ini" });
      return;
    }

    const payload = asObject(req.body);
    const questions = sanitizeQuestions(payload?.["questions"]);

    if (questions.length === 0) {
      res.status(400).json({ error: "Minimal harus ada 1 soal kuis yang valid" });
      return;
    }

    const questionRows = buildQuestionRows(materialId, questions);

    await db.transaction(async (tx) => {
      await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.materialId, materialId));
      await tx.insert(quizQuestionsTable).values(questionRows);
      await tx.update(materialsTable).set({
        questionCount: questionRows.length,
        isPublished: false,
      }).where(eq(materialsTable.id, materialId));
    });

    res.json({
      id: materialId,
      questionCount: questionRows.length,
      isPublished: false,
    });
  } catch (err) {
    req.log.error(err, "Update quiz questions error");
    res.status(500).json({ error: "Terjadi kesalahan saat menyimpan kuis" });
  }
});

router.post("/materials/:id/regenerate-quiz", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id: materialId } = req.params;
    const { user, material } = await getUserAndMaterial(userId, materialId);

    if (!user || !material) {
      res.status(404).json({ error: "Materi atau user tidak ditemukan" });
      return;
    }

    if (user.role !== "dosen") {
      res.status(403).json({ error: "Hanya dosen yang dapat regenerasi kuis" });
      return;
    }

    if (!user.classCode || material.classCode !== user.classCode || material.createdById !== userId) {
      res.status(403).json({ error: "Anda tidak memiliki akses untuk mengubah kuis ini" });
      return;
    }

    if (!material.lessonContent.trim()) {
      res.status(400).json({ error: "Konten materi kosong. Tidak bisa membuat kuis ulang." });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Judul materi: ${material.title}\nKategori: ${material.category}\n\nIsi materi:\n${material.lessonContent}\n\n${GEMINI_REGENERATE_QUIZ_PROMPT}`,
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text ?? "";
    const parsed = parseJson<GeneratedQuizPayload | unknown[]>(rawText);
    if (!parsed) {
      req.log.error({ rawText }, "Failed to parse quiz regeneration response");
      res.status(500).json({ error: "Gagal membuat ulang kuis dari AI. Coba lagi." });
      return;
    }

    const questions = Array.isArray(parsed)
      ? sanitizeQuestions(parsed)
      : sanitizeQuestions((parsed as GeneratedQuizPayload).questions);

    if (questions.length === 0) {
      res.status(500).json({ error: "AI belum menghasilkan soal kuis yang valid. Coba lagi." });
      return;
    }

    const questionRows = buildQuestionRows(materialId, questions);

    await db.transaction(async (tx) => {
      await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.materialId, materialId));
      await tx.insert(quizQuestionsTable).values(questionRows);
      await tx.update(materialsTable).set({
        questionCount: questionRows.length,
        isPublished: false,
      }).where(eq(materialsTable.id, materialId));
    });

    res.json({
      id: materialId,
      questionCount: questionRows.length,
      isPublished: false,
    });
  } catch (err) {
    req.log.error(err, "Regenerate quiz error");
    res.status(500).json({ error: "Terjadi kesalahan saat regenerasi kuis" });
  }
});

router.post("/materials/:id/publish", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id: materialId } = req.params;
    const { user, material } = await getUserAndMaterial(userId, materialId);

    if (!user || !material) {
      res.status(404).json({ error: "Materi atau user tidak ditemukan" });
      return;
    }

    if (user.role !== "dosen") {
      res.status(403).json({ error: "Hanya dosen yang dapat mempublikasikan kuis" });
      return;
    }

    if (!user.classCode || material.classCode !== user.classCode || material.createdById !== userId) {
      res.status(403).json({ error: "Anda tidak memiliki akses untuk mempublikasikan kuis ini" });
      return;
    }

    const payload = asObject(req.body);
    const published = payload?.["published"] === false ? false : true;

    if (published && material.questionCount <= 0) {
      res.status(400).json({ error: "Kuis belum memiliki soal. Tambahkan soal sebelum publish." });
      return;
    }

    const [updated] = await db.update(materialsTable)
      .set({ isPublished: published })
      .where(eq(materialsTable.id, materialId))
      .returning();

    res.json({
      id: updated.id,
      isPublished: updated.isPublished,
    });
  } catch (err) {
    req.log.error(err, "Publish material error");
    res.status(500).json({ error: "Terjadi kesalahan saat mempublikasikan kuis" });
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
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!user) {
      res.status(404).json({ error: "User tidak ditemukan" });
      return;
    }

    if (!material) {
      res.status(404).json({ error: "Materi tidak ditemukan" });
      return;
    }

    if (!user.classCode || material.classCode !== user.classCode) {
      res.status(403).json({ error: "Anda tidak memiliki akses untuk menghapus materi ini" });
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
