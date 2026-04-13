import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { Lesson } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "partikel", label: "Partikel は" },
  { id: "konjugasi", label: "Konjugasi 動" },
  { id: "kosakata", label: "Kosakata 語" },
  { id: "kanji", label: "Kanji 漢" },
];

const CATEGORY_COLORS: Record<string, string> = {
  partikel: "#C0272D",
  konjugasi: "#2563EB",
  kosakata: "#16A34A",
  kanji: "#7C3AED",
};

export default function MateriScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lessons, lessonProgress } = useAppContext();
  const params = useLocalSearchParams<{ category?: string }>();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(params.category ?? "all");

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const matchFilter = activeFilter === "all" || l.category === activeFilter;
      const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [lessons, activeFilter, search]);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      marginBottom: 14,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 12,
      height: 44,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
    },
    filterScroll: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1.5,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipInactive: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: "600" as const,
    },
    listContent: {
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 90),
    },
    lessonCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    lessonCardLocked: {
      opacity: 0.55,
    },
    lessonTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    lessonIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    lessonIconText: {
      fontSize: 20,
      fontWeight: "800" as const,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    lessonInfo: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 4,
    },
    lessonMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    lessonCategoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    lessonCategoryText: {
      fontSize: 11,
      fontWeight: "700" as const,
    },
    lessonTime: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    lockIcon: {
      marginTop: 2,
    },
    progressContainer: {
      marginTop: 12,
    },
    progressBar: {
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.muted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 5,
    },
    progressText: {
      fontSize: 11,
      color: colors.mutedForeground,
    },
    startBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 12,
    },
    startBtnText: {
      fontSize: 12,
      fontWeight: "700" as const,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  const renderLesson = ({ item: lesson }: { item: Lesson }) => {
    const prog = lessonProgress[lesson.id];
    const progress = prog ? Math.min(prog.quizScore, 100) : 0;
    const catColor = CATEGORY_COLORS[lesson.category] ?? colors.primary;
    const catBg = catColor + "20";

    return (
      <Pressable
        style={[styles.lessonCard, lesson.locked && styles.lessonCardLocked]}
        onPress={() => {
          if (lesson.locked) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/quiz/${lesson.id}`);
        }}
      >
        <View style={styles.lessonTop}>
          <View style={[styles.lessonIconBox, { backgroundColor: catBg }]}>
            <Text style={[styles.lessonIconText, { color: catColor }]}>{lesson.titleJp}</Text>
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <View style={styles.lessonMetaRow}>
              <View style={[styles.lessonCategoryBadge, { backgroundColor: catBg }]}>
                <Text style={[styles.lessonCategoryText, { color: catColor }]}>{lesson.categoryLabel}</Text>
              </View>
              <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
              <Text style={styles.lessonTime}>{lesson.estimatedMinutes} menit</Text>
            </View>
          </View>
          {lesson.locked ? (
            <Ionicons name="lock-closed" size={18} color={colors.mutedForeground} style={styles.lockIcon} />
          ) : (
            prog?.quizPassed && <Ionicons name="checkmark-circle" size={20} color={colors.correct} />
          )}
        </View>

        {!lesson.locked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: catColor }]} />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{progress > 0 ? `${progress}% selesai` : "Belum dimulai"}</Text>
              <Pressable
                style={[styles.startBtn, { backgroundColor: catColor + "15" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/quiz/${lesson.id}`);
                }}
              >
                <Text style={[styles.startBtnText, { color: catColor }]}>
                  {prog?.quizAttempts ? "Ulangi Kuis" : "Mulai Kuis"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {lesson.locked && lesson.unlockedBy && (
          <Text style={[styles.progressText, { marginTop: 8 }]}>
            Selesaikan kuis sebelumnya untuk membuka
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materi</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            style={[styles.filterChip, activeFilter === f.id ? styles.filterChipActive : styles.filterChipInactive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveFilter(f.id);
            }}
          >
            <Text style={[styles.filterChipText, { color: activeFilter === f.id ? "#FFFFFF" : colors.foreground }]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Tidak ada materi ditemukan</Text>
          </View>
        }
        scrollEnabled={filtered.length > 0}
      />
    </View>
  );
}
