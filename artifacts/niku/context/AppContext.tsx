import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BADGES, Badge, LESSONS, Lesson, NOTIFICATIONS, NotificationItem, getLevelInfo } from "@/data/seed";

const STORAGE_KEY = "niku_app_state_v1";

export interface UserState {
  isLoggedIn: boolean;
  name: string;
  email: string;
}

export interface LessonProgress {
  lessonId: string;
  quizScore: number;
  quizPassed: boolean;
  quizAttempts: number;
  xpEarned: number;
}

interface AppState {
  user: UserState;
  totalXP: number;
  streak: number;
  weeklyActive: boolean[];
  lessonProgress: Record<string, LessonProgress>;
  unlockedLessonIds: string[];
  earnedBadgeIds: string[];
}

interface AppContextType {
  isLoading: boolean;
  user: UserState;
  totalXP: number;
  streak: number;
  weeklyActive: boolean[];
  lessons: Lesson[];
  lessonProgress: Record<string, LessonProgress>;
  notifications: NotificationItem[];
  badges: Badge[];
  earnedBadgeIds: string[];
  login: (name: string, email: string) => void;
  logout: () => void;
  completeQuiz: (lessonId: string, score: number, passed: boolean, xpEarned: number) => void;
  getLevelInfo: () => { level: number; title: string; titleJp: string };
  getCompletedCount: () => number;
  getCategoryProgress: (category: string) => number;
}

const defaultUser: UserState = { isLoggedIn: false, name: "", email: "" };
const defaultWeekly = [false, false, false, false, false, false, false];

const defaultState: AppState = {
  user: defaultUser,
  totalXP: 0,
  streak: 0,
  weeklyActive: defaultWeekly,
  lessonProgress: {},
  unlockedLessonIds: LESSONS.filter((l) => !l.locked).map((l) => l.id),
  earnedBadgeIds: [],
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AppState = JSON.parse(stored);
        setState(parsed);
      }
    } catch {
      // Use default state
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = useCallback(async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const login = useCallback(
    (name: string, email: string) => {
      const today = new Date().getDay();
      const dayIndex = today === 0 ? 6 : today - 1;
      const newWeekly = [...(state.weeklyActive ?? defaultWeekly)] as boolean[];
      newWeekly[dayIndex] = true;

      const newStreak = state.streak === 0 ? 1 : state.streak;
      const newState: AppState = {
        ...state,
        user: { isLoggedIn: true, name, email },
        weeklyActive: newWeekly,
        streak: newStreak,
      };
      setState(newState);
      saveState(newState);
    },
    [state, saveState]
  );

  const logout = useCallback(() => {
    const newState: AppState = { ...state, user: { ...defaultUser } };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const completeQuiz = useCallback(
    (lessonId: string, score: number, passed: boolean, xpEarned: number) => {
      const existing = state.lessonProgress[lessonId];
      const newProgress: LessonProgress = {
        lessonId,
        quizScore: Math.max(score, existing?.quizScore ?? 0),
        quizPassed: passed || (existing?.quizPassed ?? false),
        quizAttempts: (existing?.quizAttempts ?? 0) + 1,
        xpEarned: (existing?.xpEarned ?? 0) + xpEarned,
      };

      const newTotalXP = state.totalXP + xpEarned;
      const newLessonProgress = { ...state.lessonProgress, [lessonId]: newProgress };

      const newUnlocked = [...state.unlockedLessonIds];
      if (passed) {
        LESSONS.forEach((lesson) => {
          if (lesson.unlockedBy === lessonId && !newUnlocked.includes(lesson.id)) {
            newUnlocked.push(lesson.id);
          }
        });
      }

      const passedCount = Object.values(newLessonProgress).filter((p) => p.quizPassed).length;
      const newBadges = [...state.earnedBadgeIds];
      BADGES.forEach((badge) => {
        if (newBadges.includes(badge.id)) return;
        if (badge.requirement.type === "xp" && newTotalXP >= badge.requirement.value) {
          newBadges.push(badge.id);
        }
        if (badge.requirement.type === "quizzes" && passedCount >= badge.requirement.value) {
          newBadges.push(badge.id);
        }
        if (badge.requirement.type === "streak" && state.streak >= badge.requirement.value) {
          newBadges.push(badge.id);
        }
      });

      const today = new Date().getDay();
      const dayIndex = today === 0 ? 6 : today - 1;
      const newWeekly = [...state.weeklyActive] as boolean[];
      newWeekly[dayIndex] = true;

      const newStreak = Math.max(state.streak, 1);

      const newState: AppState = {
        ...state,
        totalXP: newTotalXP,
        lessonProgress: newLessonProgress,
        unlockedLessonIds: newUnlocked,
        earnedBadgeIds: newBadges,
        weeklyActive: newWeekly,
        streak: newStreak,
      };
      setState(newState);
      saveState(newState);
    },
    [state, saveState]
  );

  const getLevelInfoCtx = useCallback(() => {
    return getLevelInfo(state.totalXP);
  }, [state.totalXP]);

  const getCompletedCount = useCallback(() => {
    return Object.values(state.lessonProgress).filter((p) => p.quizPassed).length;
  }, [state.lessonProgress]);

  const getCategoryProgress = useCallback(
    (category: string) => {
      const categoryLessons = LESSONS.filter((l) => l.category === category);
      if (categoryLessons.length === 0) return 0;
      const total = categoryLessons.reduce((sum, l) => {
        const prog = state.lessonProgress[l.id];
        return sum + (prog ? Math.min(prog.quizScore, 100) : 0);
      }, 0);
      return Math.round(total / categoryLessons.length);
    },
    [state.lessonProgress]
  );

  const lessonsWithLockState: Lesson[] = LESSONS.map((l) => ({
    ...l,
    locked: !state.unlockedLessonIds.includes(l.id),
  }));

  return (
    <AppContext.Provider
      value={{
        isLoading,
        user: state.user,
        totalXP: state.totalXP,
        streak: state.streak,
        weeklyActive: state.weeklyActive,
        lessons: lessonsWithLockState,
        lessonProgress: state.lessonProgress,
        notifications: NOTIFICATIONS,
        badges: BADGES,
        earnedBadgeIds: state.earnedBadgeIds,
        login,
        logout,
        completeQuiz,
        getLevelInfo: getLevelInfoCtx,
        getCompletedCount,
        getCategoryProgress,
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
