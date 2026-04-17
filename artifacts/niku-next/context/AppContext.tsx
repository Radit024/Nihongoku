"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  api,
  ApiMaterial,
  ApiUser,
  ProgressData,
  QuizHistoryItem,
} from "@/lib/api";

const STORAGE_KEY = "niku_next_state_v2";

type LevelInfo = {
  level: number;
  title: string;
  titleJp: string;
  xpStart: number;
  xpEnd: number;
};

export interface AppContextType {
  isLoading: boolean;
  user: ApiUser | null;
  materials: ApiMaterial[];
  quizHistory: QuizHistoryItem[];
  progressData: ProgressData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  createClassroom: () => Promise<string>;
  joinClassroom: (classCode: string) => Promise<string>;
  refreshMaterials: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  refreshQuizHistory: () => Promise<void>;
  getLevelInfo: () => LevelInfo;
}

function getLevelFromXP(xp: number): LevelInfo {
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
  const authVersionRef = useRef(0);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentUserIdRef.current = user?.id ?? null;
  }, [user?.id]);

  const bumpAuthVersion = useCallback(() => {
    authVersionRef.current += 1;
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user?: ApiUser | null };
        setUser(parsed.user ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = useCallback((nextUser: ApiUser | null) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser }));
    } catch {
      // Ignore persistence failures on constrained environments.
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await api.login({ email, password });
    bumpAuthVersion();
    setUser(nextUser);
    saveUser(nextUser);
  }, [bumpAuthVersion, saveUser]);

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    const nextUser = await api.register({ name, email, password, role });
    bumpAuthVersion();
    setUser(nextUser);
    saveUser(nextUser);
  }, [bumpAuthVersion, saveUser]);

  const logout = useCallback(() => {
    bumpAuthVersion();
    setUser(null);
    setMaterials([]);
    setQuizHistory([]);
    setProgressData(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore persistence failures on constrained environments.
    }

    window.location.replace("/login");
  }, [bumpAuthVersion]);

  const refreshMaterials = useCallback(async () => {
    if (!user) return;
    const requestVersion = authVersionRef.current;
    const requestUserId = user.id;
    try {
      const nextMaterials = await api.getMaterials(requestUserId);
      const hasSessionChanged = authVersionRef.current !== requestVersion || currentUserIdRef.current !== requestUserId;
      if (hasSessionChanged) return;
      setMaterials(nextMaterials);
    } catch {
      // Screen-level components can still trigger manual retries.
    }
  }, [user]);

  const refreshProgress = useCallback(async () => {
    if (!user) return;
    const requestVersion = authVersionRef.current;
    const requestUserId = user.id;
    try {
      const nextProgress = await api.getProgress(requestUserId);
      const hasSessionChanged = authVersionRef.current !== requestVersion || currentUserIdRef.current !== requestUserId;
      if (hasSessionChanged) return;
      setProgressData(nextProgress);
      setUser(nextProgress.user);
      saveUser(nextProgress.user);
    } catch {
      // Screen-level components can still trigger manual retries.
    }
  }, [saveUser, user]);

  const refreshQuizHistory = useCallback(async () => {
    if (!user) return;
    const requestVersion = authVersionRef.current;
    const requestUserId = user.id;
    try {
      const history = await api.getQuizHistory(requestUserId);
      const hasSessionChanged = authVersionRef.current !== requestVersion || currentUserIdRef.current !== requestUserId;
      if (hasSessionChanged) return;
      setQuizHistory(history);
    } catch {
      // Screen-level components can still trigger manual retries.
    }
  }, [user]);

  const updateProfile = useCallback(async (data: { name?: string; currentPassword?: string; newPassword?: string }) => {
    if (!user) throw new Error("Not logged in");
    const updatedUser = await api.updateProfile(user.id, data);
    setUser(updatedUser);
    saveUser(updatedUser);
  }, [saveUser, user]);

  const createClassroom = useCallback(async () => {
    if (!user) throw new Error("Not logged in");
    const result = await api.createClassroom(user.id);
    const updatedUser = { ...user, classCode: result.classCode };
    setUser(updatedUser);
    saveUser(updatedUser);
    return result.classCode;
  }, [saveUser, user]);

  const joinClassroom = useCallback(async (classCode: string) => {
    if (!user) throw new Error("Not logged in");
    const result = await api.joinClassroom(user.id, classCode);
    const updatedUser = { ...user, classCode: result.classCode };
    setUser(updatedUser);
    saveUser(updatedUser);
    return result.classCode;
  }, [saveUser, user]);

  const getLevelInfo = useCallback(() => getLevelFromXP(user?.xp ?? 0), [user?.xp]);

  const value = useMemo(
    () => ({
      isLoading,
      user,
      materials,
      quizHistory,
      progressData,
      login,
      register,
      logout,
      updateProfile,
      createClassroom,
      joinClassroom,
      refreshMaterials,
      refreshProgress,
      refreshQuizHistory,
      getLevelInfo,
    }),
    [
      isLoading,
      user,
      materials,
      quizHistory,
      progressData,
      login,
      register,
      logout,
      updateProfile,
      createClassroom,
      joinClassroom,
      refreshMaterials,
      refreshProgress,
      refreshQuizHistory,
      getLevelInfo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
