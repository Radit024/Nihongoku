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
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.primary,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800" as const,
      color: colors.primaryForeground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    headerSub: {
      fontSize: 14,
      color: colors.primaryForeground,
      opacity: 0.8,
      marginTop: 4,
    },
    list: { padding: 20, paddingBottom: 100 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cardContent: { flex: 1 },
    cardTitle: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.foreground,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    scoreBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    scoreText: {
      fontSize: 11,
      fontWeight: "600" as const,
    },
    arrow: { marginLeft: "auto" },
    emptyText: {
      textAlign: "center",
      color: colors.mutedForeground,
      fontSize: 14,
      marginTop: 40,
    },
  });

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      "Tata Bahasa": "#C0272D",
      "Kosakata": "#2D6A4F",
      "Kanji": "#7B2D8B",
      "Percakapan": "#1C2340",
      "Budaya": "#C9A882",
    };
    return map[cat] || colors.primary;
  };

  const renderQuiz = ({ item }: { item: ApiMaterial }) => {
    const best = bestScores[item.id];
    const catColor = getCategoryColor(item.category);

    return (
      <Pressable style={styles.card} onPress={() => router.push(`/quiz/${item.id}`)}>
        <View style={[styles.iconCircle, { backgroundColor: catColor + "20" }]}>
          <Ionicons name="help-circle" size={24} color={catColor} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>{item.questionCount} soal</Text>
            {best && (
              <View style={[styles.scoreBadge, { backgroundColor: best.passed ? "#2D6A4F20" : "#C0272D20" }]}>
                <Text style={[styles.scoreText, { color: best.passed ? "#2D6A4F" : "#C0272D" }]}>
                  {best.score}/{best.total}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} style={styles.arrow} />
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
          <Text style={styles.emptyText}>Belum ada kuis tersedia</Text>
        }
      />
    </View>
  );
}
