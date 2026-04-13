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

const CATEGORIES = [
  { key: "Tata Bahasa", icon: "language-outline" as const, color: "#C0272D" },
  { key: "Kosakata", icon: "list-outline" as const, color: "#2D6A4F" },
  { key: "Kanji", icon: "brush-outline" as const, color: "#7B2D8B" },
  { key: "Percakapan", icon: "chatbubbles-outline" as const, color: "#1C2340" },
  { key: "Budaya", icon: "globe-outline" as const, color: "#C9A882" },
];

export default function BerandaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, materials, refreshMaterials, getLevelInfo, progressData, refreshProgress } = useAppContext();

  useEffect(() => {
    refreshMaterials();
    refreshProgress();
  }, []);

  const firstName = user?.name.split(" ")[0] || "Gakusei";
  const xp = progressData?.user.xp ?? user?.xp ?? 0;
  const streak = progressData?.user.streak ?? user?.streak ?? 0;
  const levelInfo = getLevelInfo();
  const isDosen = user?.role === "dosen";

  const categoryCounts: Record<string, number> = {};
  materials.forEach(m => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  });
  const activeCategories = CATEGORIES.filter(c => categoryCounts[c.key]);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    greeting: {
      fontSize: 14,
      color: colors.primaryForeground,
      opacity: 0.8,
    },
    headerName: {
      fontSize: 24,
      fontWeight: "800" as const,
      color: colors.primaryForeground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    roleBadge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginTop: 6,
    },
    roleBadgeText: {
      fontSize: 12,
      color: colors.primaryForeground,
      fontWeight: "600" as const,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
    },
    statVal: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
    },
    statLabel: {
      fontSize: 11,
      color: colors.primaryForeground,
      opacity: 0.8,
      marginTop: 2,
    },
    body: { padding: 20 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 12,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    categoryCard: {
      width: "47%" as any,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
    },
    categoryCount: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    ctaCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    ctaText: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
    },
    ctaBold: {
      fontWeight: "700" as const,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 30,
    },
  });

  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      style={styles.container}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.greeting}>Konnichiwa,</Text>
            <Text style={styles.headerName}>{firstName}</Text>
            {isDosen && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Dosen</Text>
              </View>
            )}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{xp}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="flame" size={16} color={colors.primaryForeground} />
                <Text style={styles.statVal}>{streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>Lv{levelInfo.level}</Text>
                <Text style={styles.statLabel}>{levelInfo.title}</Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.sectionTitle}>Kategori Materi</Text>
            {activeCategories.length > 0 ? (
              <View style={styles.categoryGrid}>
                {activeCategories.map((cat) => (
                  <Pressable
                    key={cat.key}
                    style={styles.categoryCard}
                    onPress={() => router.push({ pathname: "/(tabs)/materi", params: { filter: cat.key } })}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + "20" }]}>
                      <Ionicons name={cat.icon} size={22} color={cat.color} />
                    </View>
                    <Text style={styles.categoryName}>{cat.key}</Text>
                    <Text style={styles.categoryCount}>{categoryCounts[cat.key]} materi</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                {isDosen
                  ? "Belum ada materi. Mulai unggah materi di tab Upload!"
                  : "Belum ada materi tersedia. Tunggu dosen mengunggah materi."}
              </Text>
            )}

            {isDosen && (
              <Pressable style={styles.ctaCard} onPress={() => router.push("/(tabs)/upload")}>
                <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
                <Text style={styles.ctaText}>
                  <Text style={styles.ctaBold}>Upload Materi Baru</Text>
                  {"\n"}Unggah PDF atau foto, AI otomatis buat soal kuis
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
              </Pressable>
            )}

            {!isDosen && materials.length > 0 && (
              <Pressable style={styles.ctaCard} onPress={() => router.push("/(tabs)/kuis")}>
                <Ionicons name="help-circle-outline" size={28} color={colors.primary} />
                <Text style={styles.ctaText}>
                  <Text style={styles.ctaBold}>Mulai Kuis</Text>
                  {"\n"}{materials.length} materi tersedia
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </>
      }
    />
  );
}
