import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";
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

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshMaterials();
      refreshQuizHistory();
    }, [refreshMaterials, refreshQuizHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshMaterials(), refreshQuizHistory()]);
    setRefreshing(false);
  };

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
      paddingBottom: 16,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
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
      marginTop: 4,
    },
    list: { padding: 16, paddingBottom: 100, paddingTop: 14 },
    card: {
      backgroundColor: "#FFFDFB",
      borderRadius: 18,
      marginBottom: 12,
      overflow: "hidden",
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: { flex: 1 },
    cardTitle: {
      fontSize: 16,
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
      paddingHorizontal: 8,
      paddingVertical: 2,
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
      <Card style={styles.card} mode="elevated" onPress={() => router.push(`/quiz/${item.id}`)}>
        <Card.Content style={styles.cardRow}>
          <View style={[styles.iconCircle, { backgroundColor: meta.color + "18" }]}> 
            <Ionicons name={meta.icon} size={24} color={meta.color} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>{item.questionCount} soal</Text>
              {best && (
                <Chip compact style={[styles.scorePill, { backgroundColor: best.passed ? "#ECFDF5" : "#FFF0F0" }]}>
                  <Text style={[styles.scoreText, { color: best.passed ? "#059669" : "#C0272D" }]}> 
                    {best.score}/{best.total}
                  </Text>
                </Chip>
              )}
            </View>
            {best && !best.passed && (
              <Text style={styles.retryTag}>Coba lagi untuk lulus</Text>
            )}
          </View>
          <Button compact mode="text" icon="chevron-right" onPress={() => router.push(`/quiz/${item.id}`)}>Buka</Button>
        </Card.Content>
      </Card>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
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
