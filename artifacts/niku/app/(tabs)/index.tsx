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
import { fonts } from "@/constants/fonts";

const CATEGORIES = [
  { key: "Tata Bahasa", icon: "language-outline" as const, color: "#C0272D", bg: "#FFF0F0" },
  { key: "Kosakata", icon: "list-outline" as const, color: "#059669", bg: "#ECFDF5" },
  { key: "Kanji", icon: "brush-outline" as const, color: "#7C3AED", bg: "#F5F3FF" },
  { key: "Percakapan", icon: "chatbubbles-outline" as const, color: "#2563EB", bg: "#EFF6FF" },
  { key: "Budaya", icon: "globe-outline" as const, color: "#D97706", bg: "#FFFBEB" },
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

  const xpInCurrentLevel = xp - levelInfo.xpStart;
  const xpNeeded = levelInfo.xpEnd - levelInfo.xpStart;
  const xpPct = xpNeeded > 0 ? Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100)) : 100;

  const myMaterials = materials.filter(m => m.createdById === user?.id);
  const totalSoal = myMaterials.reduce((sum, m) => sum + m.questionCount, 0);

  const categoryCounts: Record<string, number> = {};
  materials.forEach(m => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  });
  const activeCategories = CATEGORIES.filter(c => categoryCounts[c.key]);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 20,
      paddingHorizontal: 20,
      paddingBottom: 28,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    greetRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    greeting: {
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.primaryForeground,
      opacity: 0.8,
    },
    headerName: {
      fontSize: 26,
      fontFamily: fonts.black,
      color: colors.primaryForeground,
      marginTop: 2,
    },
    roleBadge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.22)",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginTop: 8,
    },
    roleBadgeText: {
      fontSize: 12,
      fontFamily: fonts.bold,
      color: colors.primaryForeground,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    streakText: {
      fontSize: 14,
      fontFamily: fonts.bold,
      color: colors.primaryForeground,
    },
    xpRow: {
      marginTop: 18,
    },
    xpLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    xpLabel: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.primaryForeground,
      opacity: 0.8,
    },
    xpVal: {
      fontSize: 13,
      fontFamily: fonts.extraBold,
      color: colors.primaryForeground,
    },
    xpBar: {
      height: 8,
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 4,
    },
    xpFill: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryForeground,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
    },
    statCard: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 16,
      padding: 12,
      alignItems: "center",
    },
    statVal: {
      fontSize: 20,
      fontFamily: fonts.black,
      color: colors.primaryForeground,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: fonts.semiBold,
      color: colors.primaryForeground,
      opacity: 0.75,
      marginTop: 2,
    },
    body: { padding: 20, paddingBottom: 20 },
    sectionTitle: {
      fontSize: 18,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      marginBottom: 14,
      marginTop: 4,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    categoryCard: {
      width: "47%" as any,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    categoryIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    categoryName: {
      fontSize: 14,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    categoryCount: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    ctaCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 4,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    ctaIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: "#FFF0F0",
      alignItems: "center",
      justifyContent: "center",
    },
    ctaContent: { flex: 1 },
    ctaTitle: {
      fontSize: 15,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
    },
    ctaSub: {
      fontSize: 13,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    emptyBox: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      gap: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  const renderDosenHeader = () => (
    <View style={styles.header}>
      <View style={styles.greetRow}>
        <View>
          <Text style={styles.greeting}>Konnichiwa, Sensei</Text>
          <Text style={styles.headerName}>{firstName}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Dosen</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{myMaterials.length}</Text>
          <Text style={styles.statLabel}>Materi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{totalSoal}</Text>
          <Text style={styles.statLabel}>Soal Dibuat</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{materials.length}</Text>
          <Text style={styles.statLabel}>Total Materi</Text>
        </View>
      </View>
    </View>
  );

  const renderMahasiswaHeader = () => (
    <View style={styles.header}>
      <View style={styles.greetRow}>
        <View>
          <Text style={styles.greeting}>Konnichiwa,</Text>
          <Text style={styles.headerName}>{firstName}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#FCD34D" />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>

      <View style={styles.xpRow}>
        <View style={styles.xpLabelRow}>
          <Text style={styles.xpLabel}>Lv.{levelInfo.level} {levelInfo.title}</Text>
          <Text style={styles.xpVal}>{xp} XP</Text>
        </View>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{materials.length}</Text>
          <Text style={styles.statLabel}>Materi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{progressData?.passedQuizzes ?? 0}</Text>
          <Text style={styles.statLabel}>Lulus</Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      style={styles.container}
      ListHeaderComponent={
        <>
          {isDosen ? renderDosenHeader() : renderMahasiswaHeader()}

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
                    <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                      <Ionicons name={cat.icon} size={22} color={cat.color} />
                    </View>
                    <Text style={styles.categoryName}>{cat.key}</Text>
                    <Text style={styles.categoryCount}>{categoryCounts[cat.key]} materi</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="book-outline" size={36} color={colors.mutedForeground} />
                <Text style={styles.emptyText}>
                  {isDosen
                    ? "Belum ada materi.\nMulai unggah di tab Upload!"
                    : "Belum ada materi.\nTunggu dosen mengunggah materi."}
                </Text>
              </View>
            )}

            {isDosen && (
              <Pressable style={styles.ctaCard} onPress={() => router.push("/(tabs)/upload")}>
                <View style={styles.ctaIconBox}>
                  <Ionicons name="cloud-upload-outline" size={26} color={colors.primary} />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Upload Materi Baru</Text>
                  <Text style={styles.ctaSub}>PDF atau foto — AI buat soal otomatis</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
              </Pressable>
            )}

            {!isDosen && materials.length > 0 && (
              <Pressable style={styles.ctaCard} onPress={() => router.push("/(tabs)/kuis")}>
                <View style={styles.ctaIconBox}>
                  <Ionicons name="help-circle-outline" size={26} color={colors.primary} />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Mulai Kuis</Text>
                  <Text style={styles.ctaSub}>{materials.length} kuis tersedia untukmu</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </>
      }
    />
  );
}
