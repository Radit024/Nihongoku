import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { CHAPTERS } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

type LessonStatus = "locked" | "available" | "in-progress" | "completed";

export default function MateriScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lessons, lessonProgress } = useAppContext();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 90);

  const totalLessons = lessons.length;
  const completedLessons = useMemo(
    () => lessons.filter((l) => lessonProgress[l.id]?.quizPassed).length,
    [lessons, lessonProgress]
  );

  function getLessonStatus(lessonId: string): LessonStatus {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return "locked";
    if (lesson.locked) return "locked";
    const prog = lessonProgress[lessonId];
    if (!prog || prog.quizAttempts === 0) return "available";
    if (prog.quizPassed) return "completed";
    return "in-progress";
  }

  function isChapterLocked(chapterId: string): boolean {
    const chapter = CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter || chapter.lessonIds.length === 0) return false;
    return getLessonStatus(chapter.lessonIds[0]) === "locked";
  }

  function chapterDoneCount(chapterId: string): number {
    const chapter = CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter) return 0;
    return chapter.lessonIds.filter((id) => getLessonStatus(id) === "completed").length;
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      marginBottom: 4,
    },
    headerSub: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    overallBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.muted,
      overflow: "hidden",
    },
    overallFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    overallRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 5,
    },
    overallText: { fontSize: 12, color: colors.mutedForeground },
    overallCount: { fontSize: 12, fontWeight: "700" as const, color: colors.primary },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: botPad,
    },
    chapterBlock: { marginBottom: 4 },
    connectorWrapper: {
      alignItems: "center",
      height: 32,
    },
    connectorLine: {
      width: 2,
      flex: 1,
    },
    connectorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginVertical: 2,
    },
    chapterCard: {
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    chapterCardLocked: {
      opacity: 0.55,
    },
    chapterHeader: {
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    chapterNumCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    chapterNumText: {
      fontSize: 16,
      fontWeight: "800" as const,
      color: "#FFFFFF",
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    chapterMeta: { flex: 1 },
    chapterTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 2,
    },
    chapterTitle: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    chapterTitleJp: {
      fontSize: 13,
      color: colors.mutedForeground,
    },
    chapterDesc: {
      fontSize: 12,
      color: colors.mutedForeground,
      lineHeight: 16,
    },
    chapterProgress: {
      fontSize: 12,
      fontWeight: "700" as const,
    },
    chapterDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 0,
    },
    lessonList: { paddingVertical: 4 },
    lessonRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    lessonRowBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    lessonNumCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
    },
    lessonNumText: {
      fontSize: 13,
      fontWeight: "800" as const,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    lessonInfo: { flex: 1 },
    lessonTitle: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      marginBottom: 2,
    },
    lessonTitleLocked: { color: colors.mutedForeground },
    lessonMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    lessonMetaText: { fontSize: 11, color: colors.mutedForeground },
    lessonActionBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    lessonActionText: {
      fontSize: 12,
      fontWeight: "700" as const,
    },
    lockedLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    lockedLabelText: {
      fontSize: 12,
      color: colors.mutedForeground,
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Path</Text>
        <Text style={styles.headerSub}>Selesaikan kuis setiap bab untuk melanjutkan</Text>
        <View style={styles.overallBar}>
          <View
            style={[
              styles.overallFill,
              { width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` },
            ]}
          />
        </View>
        <View style={styles.overallRow}>
          <Text style={styles.overallText}>Progres keseluruhan</Text>
          <Text style={styles.overallCount}>
            {completedLessons}/{totalLessons} bab selesai
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CHAPTERS.map((chapter, chapterIndex) => {
          const locked = isChapterLocked(chapter.id);
          const doneCount = chapterDoneCount(chapter.id);
          const total = chapter.lessonIds.length;
          const allDone = doneCount === total;
          const chapterColor = chapter.color;

          return (
            <View key={chapter.id} style={styles.chapterBlock}>
              {chapterIndex > 0 && (
                <View style={styles.connectorWrapper}>
                  <View
                    style={[
                      styles.connectorLine,
                      {
                        backgroundColor: locked ? colors.border : chapterColor + "60",
                        borderStyle: locked ? "dashed" : "solid",
                      },
                    ]}
                  />
                </View>
              )}

              <View style={[styles.chapterCard, locked && styles.chapterCardLocked]}>
                <View style={[styles.chapterHeader, { backgroundColor: chapterColor + "10" }]}>
                  <View style={[styles.chapterNumCircle, { backgroundColor: locked ? colors.muted : chapterColor }]}>
                    {locked ? (
                      <Ionicons name="lock-closed" size={18} color={colors.mutedForeground} />
                    ) : allDone ? (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.chapterNumText}>{chapter.number}</Text>
                    )}
                  </View>
                  <View style={styles.chapterMeta}>
                    <View style={styles.chapterTitleRow}>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                      <Text style={styles.chapterTitleJp}>{chapter.titleJp}</Text>
                    </View>
                    <Text style={styles.chapterDesc} numberOfLines={2}>
                      {chapter.description}
                    </Text>
                  </View>
                  <Text style={[styles.chapterProgress, { color: locked ? colors.mutedForeground : chapterColor }]}>
                    {doneCount}/{total}
                  </Text>
                </View>

                <View style={styles.chapterDivider} />

                <View style={styles.lessonList}>
                  {chapter.lessonIds.map((lessonId, lessonIndex) => {
                    const lesson = lessons.find((l) => l.id === lessonId);
                    if (!lesson) return null;
                    const status = getLessonStatus(lessonId);
                    const prog = lessonProgress[lessonId];
                    const isLocked = status === "locked";
                    const isDone = status === "completed";
                    const isAvailable = status === "available";
                    const isInProgress = status === "in-progress";

                    const circleColor = isLocked
                      ? colors.muted
                      : isDone
                      ? chapterColor
                      : chapterColor + "25";
                    const circleBorder = isLocked ? colors.border : chapterColor;
                    const numTextColor = isLocked
                      ? colors.mutedForeground
                      : isDone
                      ? "#FFFFFF"
                      : chapterColor;

                    return (
                      <Pressable
                        key={lessonId}
                        style={[
                          styles.lessonRow,
                          lessonIndex > 0 && styles.lessonRowBorder,
                        ]}
                        onPress={() => {
                          if (isLocked) return;
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/quiz/${lessonId}`);
                        }}
                        disabled={isLocked}
                      >
                        <View
                          style={[
                            styles.lessonNumCircle,
                            { backgroundColor: circleColor, borderColor: circleBorder },
                          ]}
                        >
                          {isDone ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : isLocked ? (
                            <Ionicons name="lock-closed" size={14} color={colors.mutedForeground} />
                          ) : (
                            <Text style={[styles.lessonNumText, { color: numTextColor }]}>
                              {lesson.titleJp}
                            </Text>
                          )}
                        </View>

                        <View style={styles.lessonInfo}>
                          <Text
                            style={[
                              styles.lessonTitle,
                              isLocked && styles.lessonTitleLocked,
                            ]}
                            numberOfLines={2}
                          >
                            {lesson.title}
                          </Text>
                          <View style={styles.lessonMeta}>
                            <Ionicons
                              name="time-outline"
                              size={11}
                              color={colors.mutedForeground}
                            />
                            <Text style={styles.lessonMetaText}>
                              {lesson.estimatedMinutes} menit
                            </Text>
                            {prog && prog.quizAttempts > 0 && !isDone && (
                              <>
                                <Text style={styles.lessonMetaText}> · </Text>
                                <Text style={[styles.lessonMetaText, { color: colors.primary }]}>
                                  Skor {prog.quizScore}%
                                </Text>
                              </>
                            )}
                            {isDone && (
                              <>
                                <Text style={styles.lessonMetaText}> · </Text>
                                <Text style={[styles.lessonMetaText, { color: chapterColor, fontWeight: "600" }]}>
                                  +{prog?.xpEarned ?? 0} XP
                                </Text>
                              </>
                            )}
                          </View>
                        </View>

                        {!isLocked && (
                          <View
                            style={[
                              styles.lessonActionBtn,
                              {
                                backgroundColor: isDone
                                  ? chapterColor + "15"
                                  : isInProgress
                                  ? "#F59E0B18"
                                  : chapterColor + "15",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.lessonActionText,
                                {
                                  color: isDone
                                    ? chapterColor
                                    : isInProgress
                                    ? "#F59E0B"
                                    : chapterColor,
                                },
                              ]}
                            >
                              {isDone
                                ? "Ulangi"
                                : isInProgress
                                ? "Lanjut"
                                : "Mulai"}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}

                  {locked && (
                    <View style={styles.lockedLabel}>
                      <Ionicons name="lock-closed-outline" size={14} color={colors.mutedForeground} />
                      <Text style={styles.lockedLabelText}>
                        Selesaikan semua bab di chapter sebelumnya untuk membuka chapter ini
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
