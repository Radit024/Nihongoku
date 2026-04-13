import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLocalSearchParams, router } from "expo-router";
import { ApiMaterial } from "@/lib/api";

const ALL_CATEGORIES = ["Semua", "Tata Bahasa", "Kosakata", "Kanji", "Percakapan", "Budaya"];

export default function MateriScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { materials, refreshMaterials, quizHistory, refreshQuizHistory } = useAppContext();
  const params = useLocalSearchParams<{ filter?: string }>();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(params.filter || "Semua");

  useEffect(() => {
    refreshMaterials();
    refreshQuizHistory();
  }, []);

  useEffect(() => {
    if (params.filter) setSelectedCategory(params.filter);
  }, [params.filter]);

  const passedMaterials = new Set(quizHistory.filter(q => q.passed).map(q => q.materialId));

  const filtered = materials.filter((m) => {
    const matchCategory = selectedCategory === "Semua" || m.category === selectedCategory;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
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
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 44,
      marginTop: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.primaryForeground,
      marginLeft: 8,
    },
    chipRow: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: "row",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: "500" as const,
    },
    chipTextActive: {
      color: colors.primaryForeground,
    },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600" as const,
    },
    cardDesc: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 6,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 10,
    },
    metaBadge: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    metaBadgeText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "500" as const,
    },
    metaText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    emptyText: {
      textAlign: "center",
      color: colors.mutedForeground,
      fontSize: 14,
      marginTop: 40,
    },
  });

  const renderMaterial = ({ item }: { item: ApiMaterial }) => {
    const isPassed = passedMaterials.has(item.id);

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/quiz/${item.id}`)}
      >
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {isPassed && (
            <View style={[styles.statusBadge, { backgroundColor: "#2D6A4F20" }]}>
              <Text style={[styles.statusText, { color: "#2D6A4F" }]}>Lulus</Text>
            </View>
          )}
        </View>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.cardMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>{item.category}</Text>
          </View>
          <Text style={styles.metaText}>{item.questionCount} soal</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materi</Text>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color={colors.primaryForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderMaterial}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <FlatList
            data={ALL_CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.chip, selectedCategory === item && styles.chipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            )}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {materials.length === 0
              ? "Belum ada materi tersedia"
              : "Tidak ditemukan materi yang sesuai"}
          </Text>
        }
      />
    </View>
  );
}
