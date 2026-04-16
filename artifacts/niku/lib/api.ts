import { Platform } from "react-native";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveApiPrefix(): string {
  const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (rawApiUrl) {
    return stripTrailingSlash(rawApiUrl);
  }

  const rawDomain = process.env.EXPO_PUBLIC_DOMAIN?.trim();
  const hasValidDomain =
    !!rawDomain && rawDomain !== "your-https-domain.example.com";

  if (hasValidDomain) {
    return `https://${rawDomain}/api`;
  }

  // Fallback for local debugging when env domain is not configured.
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080/api";
  }

  return "http://localhost:8080/api";
}

const API_PREFIX = resolveApiPrefix();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_PREFIX}${path}`;
  let res: Response;

  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Network request failed. Cannot reach API at ${API_PREFIX}. ${reason}`,
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "dosen" | "mahasiswa";
  classCode: string | null;
  xp: number;
  streak: number;
}

export interface ApiMaterial {
  id: string;
  title: string;
  category: string;
  classCode: string;
  description: string;
  questionCount: number;
  createdById: string;
  createdAt: string;
  lessonContent?: string;
  questions?: ApiQuestion[];
}

export interface ApiQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sortOrder: number;
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

export interface ClassroomState {
  role: "dosen" | "mahasiswa";
  classCode: string | null;
}

export const api = {
  register(data: { name: string; email: string; password: string; role: string; classCode?: string }): Promise<ApiUser> {
    return request("/auth/register", { method: "POST", body: JSON.stringify(data) });
  },

  login(data: { email: string; password: string }): Promise<ApiUser> {
    return request("/auth/login", { method: "POST", body: JSON.stringify(data) });
  },

  getMaterials(userId: string): Promise<ApiMaterial[]> {
    return request("/materials", { headers: { "x-user-id": userId } });
  },

  getMaterial(userId: string, id: string): Promise<ApiMaterial> {
    return request(`/materials/${id}`, { headers: { "x-user-id": userId } });
  },

  uploadMaterial(userId: string, file: { uri: string; name: string; type: string }): Promise<ApiMaterial> {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const url = `${API_PREFIX}/materials/upload`;
    return fetch(url, {
      method: "POST",
      headers: { "x-user-id": userId },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      return res.json();
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

  updateProfile(userId: string, data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<ApiUser> {
    return request("/auth/profile", {
      method: "PATCH",
      headers: { "x-user-id": userId },
      body: JSON.stringify(data),
    });
  },

  getClassroomState(userId: string): Promise<ClassroomState> {
    return request("/classroom/me", {
      headers: { "x-user-id": userId },
    });
  },

  createClassroom(userId: string): Promise<{ classCode: string }> {
    return request("/classroom/create", {
      method: "POST",
      headers: { "x-user-id": userId },
    });
  },

  joinClassroom(userId: string, classCode: string): Promise<{ classCode: string }> {
    return request("/classroom/join", {
      method: "POST",
      headers: { "x-user-id": userId },
      body: JSON.stringify({ classCode }),
    });
  },
};
