import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { ApiMaterial } from "@/lib/api";
import { fonts } from "@/constants/fonts";

const ALL_CATEGORIES = ["Semua", "Tata Bahasa", "Kosakata", "Kanji", "Percakapan", "Budaya"];

const CATEGORY_META: Record<string, { color: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  "Tata Bahasa": { color: "#C0272D", icon: "language-outline" },
  "Kosakata": { color: "#059669", icon: "list-outline" },
  "Kanji": { color: "#7C3AED", icon: "brush-outline" },
  "Percakapan": { color: "#2563EB", icon: "chatbubbles-outline" },
  "Budaya": { color: "#D97706", icon: "globe-outline" },
};

export default function MateriScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, materials, refreshMaterials, quizHistory, refreshQuizHistory } = useAppContext();
  const params = useLocalSearchParams<{ filter?: string }>();
  const isDosen = user?.role === "dosen";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(params.filter || "Semua");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshMaterials();
      if (!isDosen) refreshQuizHistory();
    }, [isDosen])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshMaterials(), ...(!isDosen ? [refreshQuizHistory()] : [])]);
    setRefreshing(false);
  };

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
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 16,
      paddingHorizontal: 14,
      height: 46,
      marginTop: 14,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.primaryForeground,
      marginLeft: 10,
    },
    chipScroll: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    chipTextActive: {
      color: colors.primaryForeground,
    },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
      flexDirection: "row",
      gap: 14,
      alignItems: "flex-start",
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    cardBody: { flex: 1 },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardTitle: {
      fontSize: 15,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    statusText: {
      fontSize: 11,
      fontFamily: fonts.bold,
    },
    cardDesc: {
      fontSize: 13,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
      marginTop: 4,
      lineHeight: 18,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    metaBadge: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    metaBadgeText: {
      fontSize: 11,
      fontFamily: fonts.bold,
    },
    metaText: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
    },
    emptyBox: {
      alignItems: "center",
      marginTop: 48,
      gap: 10,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  const renderMaterial = ({ item }: { item: ApiMaterial }) => {
    const isPassed = passedMaterials.has(item.id);
    const meta = CATEGORY_META[item.category] || { color: colors.primary, icon: "document-outline" as const };
    const isMyMaterial = item.createdById === user?.id;

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          if (isDosen) {
            router.push("/(tabs)/upload");
          } else {
            router.push(`/quiz/${item.id}`);
          }
        }}
      >
        <View style={[styles.cardIcon, { backgroundColor: meta.color + "18" }]}>
          <Ionicons name={meta.icon} size={22} color={meta.color} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            {!isDosen && isPassed && (
              <View style={[styles.statusBadge, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={[styles.statusText, { color: "#059669" }]}>Lulus</Text>
              </View>
            )}
            {isDosen && isMyMaterial && (
              <View style={[styles.statusBadge, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="person" size={12} color="#2563EB" />
                <Text style={[styles.statusText, { color: "#2563EB" }]}>Milik Saya</Text>
              </View>
            )}
          </View>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.cardMeta}>
            <View style={[styles.metaBadge, { backgroundColor: meta.color + "18" }]}>
              <Text style={[styles.metaBadgeText, { color: meta.color }]}>{item.category}</Text>
            </View>
            <Text style={styles.metaText}>{item.questionCount} soal</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materi</Text>
        <Text style={styles.headerSub}>{materials.length} materi tersedia</Text>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderMaterial}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <FlatList
            data={ALL_CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipScroll}
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
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>
              {materials.length === 0
                ? "Belum ada materi tersedia"
                : "Tidak ditemukan materi yang sesuai"}
            </Text>
          </View>
        }
      />
    </View>
  );
}
