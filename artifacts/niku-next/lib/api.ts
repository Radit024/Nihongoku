import { Capacitor } from "@capacitor/core";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveApiPrefix(): string {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (rawApiUrl) {
    return stripTrailingSlash(rawApiUrl);
  }

  const rawDomain = process.env.NEXT_PUBLIC_DOMAIN?.trim();
  const hasValidDomain = !!rawDomain && rawDomain !== "your-https-domain.example.com";

  if (hasValidDomain) {
    return `https://${rawDomain}/api`;
  }

  if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
    return "http://10.0.2.2:8080/api";
  }

  return "http://localhost:8080/api";
}

const API_PREFIX = resolveApiPrefix();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_PREFIX}${path}`;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Network request failed. Cannot reach API at ${API_PREFIX}. ${reason}`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  className: string | null;
  avatarUrl: string | null;
  role: "sensei" | "gakousei";
  classCode: string | null;
  xp: number;
  streak: number;
}

export interface ApiQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sortOrder: number;
}

export interface ApiMaterial {
  id: string;
  title: string;
  category: string;
  classCode: string;
  description: string;
  sourceFileName?: string;
  sourceMimeType?: string;
  isPublished?: boolean;
  questionCount: number;
  createdById: string;
  createdAt: string;
  lessonContent?: string;
  questions?: ApiQuestion[];
}

export interface EditableQuizQuestionInput {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizResult {
  attemptId: string;
  score: number;
  total: number;
  passed: boolean;
  xpEarned: number;
  results: {
    questionId: string;
    question: string;
    options: string[];
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface QuizHistoryItem {
  id: string;
  materialId: string;
  materialTitle: string;
  materialCategory: string;
  score: number;
  total: number;
  passed: boolean;
  xpEarned: number;
  createdAt: string;
}

export interface ProgressData {
  user: ApiUser;
  totalQuizzes: number;
  passedQuizzes: number;
  uniqueMaterialsPassed: number;
  categoryProgress: { category: string; total: number; completed: number }[];
}

export const api = {
  register(data: { name: string; email: string; password: string; role: string; classCode?: string }): Promise<ApiUser> {
    return request("/auth/register", { method: "POST", body: JSON.stringify(data) });
  },

  login(data: { email: string; password: string }): Promise<ApiUser> {
    return request("/auth/login", { method: "POST", body: JSON.stringify(data) });
  },

  updateProfile(userId: string, data: { name?: string; currentPassword?: string; newPassword?: string; avatarUrl?: string | null }): Promise<ApiUser> {
    return request("/auth/profile", {
      method: "PATCH",
      headers: { "x-user-id": userId },
      body: JSON.stringify(data),
    });
  },

  createClassroom(userId: string, className: string): Promise<{ classCode: string; className: string | null }> {
    return request("/classroom/create", {
      method: "POST",
      headers: { "x-user-id": userId },
      body: JSON.stringify({ className }),
    });
  },

  joinClassroom(userId: string, classCode: string): Promise<{ classCode: string; className: string | null }> {
    return request("/classroom/join", {
      method: "POST",
      headers: { "x-user-id": userId },
      body: JSON.stringify({ classCode }),
    });
  },

  getMaterials(userId: string): Promise<ApiMaterial[]> {
    return request("/materials", { headers: { "x-user-id": userId } });
  },

  getMaterial(userId: string, materialId: string): Promise<ApiMaterial> {
    return request(`/materials/${materialId}`, { headers: { "x-user-id": userId } });
  },

  uploadMaterial(userId: string, file: File): Promise<ApiMaterial> {
    const formData = new FormData();
    formData.append("file", file);

    return request("/materials/upload", {
      method: "POST",
      headers: { "x-user-id": userId },
      body: formData,
    });
  },

  updateMaterialQuestions(userId: string, materialId: string, questions: EditableQuizQuestionInput[]): Promise<{ id: string; questionCount: number; isPublished: boolean }> {
    return request(`/materials/${materialId}/questions`, {
      method: "PATCH",
      headers: { "x-user-id": userId },
      body: JSON.stringify({ questions }),
    });
  },

  regenerateMaterialQuiz(userId: string, materialId: string): Promise<{ id: string; questionCount: number; isPublished: boolean }> {
    return request(`/materials/${materialId}/regenerate-quiz`, {
      method: "POST",
      headers: { "x-user-id": userId },
      body: JSON.stringify({}),
    });
  },

  setMaterialPublishState(userId: string, materialId: string, published: boolean): Promise<{ id: string; isPublished: boolean }> {
    return request(`/materials/${materialId}/publish`, {
      method: "POST",
      headers: { "x-user-id": userId },
      body: JSON.stringify({ published }),
    });
  },

  deleteMaterial(userId: string, materialId: string): Promise<{ success: boolean }> {
    return request(`/materials/${materialId}`, {
      method: "DELETE",
      headers: { "x-user-id": userId },
    });
  },

  submitQuiz(userId: string, materialId: string, answers: number[]): Promise<QuizResult> {
    return request(`/quizzes/${materialId}/submit`, {
      method: "POST",
      headers: { "x-user-id": userId },
      body: JSON.stringify({ answers }),
    });
  },

  getQuizHistory(userId: string): Promise<QuizHistoryItem[]> {
    return request("/quizzes/history", { headers: { "x-user-id": userId } });
  },

  getProgress(userId: string): Promise<ProgressData> {
    return request("/progress", { headers: { "x-user-id": userId } });
  },
};
