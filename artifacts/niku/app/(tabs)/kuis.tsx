import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
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
import { useColors } from "@/hooks/useColors";
import { ApiMaterial } from "@/lib/api";
import { fonts } from "@/constants/fonts";

const CATEGORY_META: Record<string, { color: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  "Tata Bahasa": { color: "#C0272D", icon: "language-outline" },
  "Kosakata": { color: "#059669", icon: "list-outline" },
  "Kanji": { color: "#7C3AED", icon: "brush-outline" },
  "Percakapan": { color: "#2563EB", icon: "chatbubbles-outline" },
  "Budaya": { color: "#D97706", icon: "globe-outline" },
};

export default function KuisScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { materials, refreshMaterials, quizHistory, refreshQuizHistory } = useAppContext();

  useEffect(() => {
    refreshMaterials();
    refreshQuizHistory();
  }, []);

  const bestScores: Record<string, { score: number; total: number; passed: boolean }> = {};
  quizHistory.forEach(q => {
    const existing = bestScores[q.materialId];
    if (!existing || q.score > existing.score) {
      bestScores[q.materialId] = { score: q.score, total: q.total, passed: q.passed };
    }
  });

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    headerTitle: {
      fontSize: 26,
      fontFamily: fonts.black,
      color: colors.primaryForeground,
    },
    headerSub: {
      fontSize: 13,
      fontFamily: fonts.semiBold,
      color: colors.primaryForeground,
      opacity: 0.75,
      marginTop: 2,
    },
    list: { padding: 20, paddingBottom: 100 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cardContent: { flex: 1 },
    cardTitle: {
      fontSize: 15,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 5,
    },
    metaText: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
    },
    scorePill: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    scoreText: {
      fontSize: 12,
      fontFamily: fonts.bold,
    },
    retryTag: {
      fontSize: 11,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    emptyBox: {
      alignItems: "center",
      marginTop: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    emptySubText: {
      fontSize: 13,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  const renderQuiz = ({ item }: { item: ApiMaterial }) => {
    const best = bestScores[item.id];
    const meta = CATEGORY_META[item.category] || { color: colors.primary, icon: "help-circle-outline" as const };

    return (
      <Pressable style={styles.card} onPress={() => router.push(`/quiz/${item.id}`)}>
        <View style={[styles.iconCircle, { backgroundColor: meta.color + "18" }]}>
          <Ionicons name={meta.icon} size={24} color={meta.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>{item.questionCount} soal</Text>
            {best && (
              <View style={[styles.scorePill, { backgroundColor: best.passed ? "#ECFDF5" : "#FFF0F0" }]}>
                <Ionicons
                  name={best.passed ? "checkmark-circle" : "close-circle"}
                  size={12}
                  color={best.passed ? "#059669" : "#C0272D"}
                />
                <Text style={[styles.scoreText, { color: best.passed ? "#059669" : "#C0272D" }]}>
                  {best.score}/{best.total}
                </Text>
              </View>
            )}
          </View>
          {best && !best.passed && (
            <Text style={styles.retryTag}>Coba lagi untuk lulus</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kuis</Text>
        <Text style={styles.headerSub}>{materials.length} kuis tersedia</Text>
      </View>
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        renderItem={renderQuiz}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="help-circle-outline" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Belum ada kuis</Text>
            <Text style={styles.emptySubText}>Tunggu dosen mengunggah materi</Text>
          </View>
        }
      />
    </View>
  );
}
