import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Badge,
  Card,
  Chip,
  Searchbar,
  Surface,
  Text,
} from "react-native-paper";
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
    }, [isDosen, refreshMaterials, refreshQuizHistory])
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
    controls: {
      marginTop: -16,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 18,
      padding: 12,
      backgroundColor: "#FFFCFA",
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchbar: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 0,
    },
    chipRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 8,
    },
    list: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 2 },
    card: {
      backgroundColor: "#FFFDFB",
      borderRadius: 18,
      marginBottom: 12,
      flexDirection: "row",
      gap: 14,
      alignItems: "flex-start",
      overflow: "hidden",
    },
    cardContent: {
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
      fontSize: 16,
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
      marginTop: 6,
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
      <Card
        style={styles.card}
        mode="elevated"
        onPress={() => {
          if (isDosen) {
            router.push("/(tabs)/upload");
          } else {
            router.push(`/quiz/${item.id}`);
          }
        }}
      >
        <Card.Content style={styles.cardContent}>
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
              <Chip compact style={[styles.metaBadge, { backgroundColor: meta.color + "18" }]} textStyle={[styles.metaBadgeText, { color: meta.color }]}>
                {item.category}
              </Chip>
              <Text style={styles.metaText}>{item.questionCount} soal</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materi</Text>
        <Text style={styles.headerSub}>{materials.length} materi tersedia</Text>
      </View>

      <Surface style={styles.controls} elevation={1}>
        <Searchbar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari materi..."
          style={styles.searchbar}
          inputStyle={{ fontFamily: fonts.semiBold, fontSize: 14 }}
        />
      </Surface>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderMaterial}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {ALL_CATEGORIES.map((item) => (
              <Chip
                key={item}
                selected={selectedCategory === item}
                showSelectedOverlay
                selectedColor={colors.primary}
                onPress={() => setSelectedCategory(item)}
                textStyle={{ fontFamily: fonts.bold }}
              >
                {item}
              </Chip>
            ))}
          </ScrollView>
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
