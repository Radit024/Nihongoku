import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiUser, ApiMaterial, QuizHistoryItem, ProgressData } from "@/lib/api";

const STORAGE_KEY = "niku_app_state_v2";

export interface AppContextType {
  isLoading: boolean;
  user: ApiUser | null;
  materials: ApiMaterial[];
  quizHistory: QuizHistoryItem[];
  progressData: ProgressData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  refreshMaterials: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  refreshQuizHistory: () => Promise<void>;
  getLevelInfo: () => { level: number; title: string; titleJp: string; xpStart: number; xpEnd: number };
}

function getLevelFromXP(xp: number): { level: number; title: string; titleJp: string; xpStart: number; xpEnd: number } {
  if (xp >= 1000) return { level: 5, title: "Master", titleJp: "Masta", xpStart: 1000, xpEnd: 1000 };
  if (xp >= 600) return { level: 4, title: "Mahir", titleJp: "Joukyuu", xpStart: 600, xpEnd: 1000 };
  if (xp >= 300) return { level: 3, title: "Menengah", titleJp: "Chuukyuu", xpStart: 300, xpEnd: 600 };
  if (xp >= 100) return { level: 2, title: "Dasar", titleJp: "Kiso", xpStart: 100, xpEnd: 300 };
  return { level: 1, title: "Pemula", titleJp: "Shoshinsha", xpStart: 0, xpEnd: 100 };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  useEffect(() => {
    loadCachedUser();
  }, []);

  const loadCachedUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          setUser(parsed.user);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (u: ApiUser | null) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
    } catch {
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.login({ email, password });
    setUser(u);
    await saveUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    const u = await api.register({ name, email, password, role });
    setUser(u);
    await saveUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setMaterials([]);
    setQuizHistory([]);
    setProgressData(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const refreshMaterials = useCallback(async () => {
    try {
      const data = await api.getMaterials();
      setMaterials(data);
    } catch {
    }
  }, []);

  const refreshProgress = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getProgress(user.id);
      setUser(data.user);
      setProgressData(data);
    } catch {
    }
  }, [user]);

  const refreshQuizHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getQuizHistory(user.id);
      setQuizHistory(data);
    } catch {
    }
  }, [user]);

  const getLevelInfo = useCallback(() => {
    return getLevelFromXP(user?.xp ?? 0);
  }, [user?.xp]);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        user,
        materials,
        quizHistory,
        progressData,
        login,
        register,
        logout,
        refreshMaterials,
        refreshProgress,
        refreshQuizHistory,
        getLevelInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
