import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { Lesson } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<string, string> = {
  partikel: "#C0272D",
  konjugasi: "#2563EB",
  kosakata: "#16A34A",
  kanji: "#7C3AED",
};

export default function KuisScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lessons, lessonProgress } = useAppContext();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    },
    listContent: {
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 90),
    },
    quizCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quizCardLocked: {
      opacity: 0.5,
    },
    quizTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    quizIconBox: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    quizIconText: {
      fontSize: 24,
      fontWeight: "800" as const,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    quizInfo: {
      flex: 1,
    },
    quizTitle: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 4,
    },
    quizMeta: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "700" as const,
    },
    xpBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: "#FFF9EC",
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    xpText: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.accent,
    },
    startBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    startBtnText: {
      fontSize: 13,
      fontWeight: "700" as const,
    },
    emptyContainer: {
      paddingTop: 80,
      alignItems: "center",
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      color: colors.mutedForeground,
    },
  });

  const renderItem = ({ item: lesson }: { item: Lesson }) => {
    const prog = lessonProgress[lesson.id];
    const catColor = CATEGORY_COLORS[lesson.category] ?? colors.primary;
    const catBg = catColor + "20";

    const getStatus = () => {
      if (lesson.locked) return { label: "Terkunci", color: colors.mutedForeground, bg: colors.muted };
      if (prog?.quizPassed) return { label: "Lulus", color: colors.correct, bg: colors.correct + "20" };
      if (prog?.quizAttempts) return { label: `Skor: ${prog.quizScore}%`, color: "#F59E0B", bg: "#FFF9EC" };
      return { label: "Belum Dimulai", color: catColor, bg: catBg };
    };

    const status = getStatus();

    return (
      <Pressable
        style={[styles.quizCard, lesson.locked && styles.quizCardLocked]}
        onPress={() => {
          if (lesson.locked) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push(`/quiz/${lesson.id}`);
        }}
      >
        <View style={styles.quizTop}>
          <View style={[styles.quizIconBox, { backgroundColor: catBg }]}>
            <Text style={[styles.quizIconText, { color: catColor }]}>{lesson.titleJp}</Text>
          </View>
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle}>{lesson.title}</Text>
            <Text style={styles.quizMeta}>10 soal · {lesson.estimatedMinutes} menit</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
              {!lesson.locked && (
                <View style={styles.xpBadge}>
                  <Ionicons name="star" size={10} color={colors.accent} />
                  <Text style={styles.xpText}>+{100} XP</Text>
                </View>
              )}
            </View>
          </View>
          {lesson.locked ? (
            <Ionicons name="lock-closed" size={20} color={colors.mutedForeground} />
          ) : (
            <Pressable
              style={[styles.startBtn, { backgroundColor: catColor }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/quiz/${lesson.id}`);
              }}
            >
              <Text style={[styles.startBtnText, { color: "#FFFFFF" }]}>
                {prog?.quizAttempts ? "Ulangi" : "Mulai"}
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kuis</Text>
        <Text style={styles.headerSub}>Uji pemahaman kamu</Text>
      </View>
      <FlatList
        data={lessons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Belum ada kuis tersedia</Text>
          </View>
        }
        scrollEnabled={lessons.length > 0}
      />
    </View>
  );
}
