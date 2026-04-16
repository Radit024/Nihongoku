import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  Chip,
  IconButton,
  ProgressBar,
  Surface,
  Text,
} from "react-native-paper";
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
  const fullName = user?.name || "Gakusei";
  const userInitial = fullName.charAt(0).toUpperCase();
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

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 6);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 10,
      paddingHorizontal: 20,
      paddingBottom: 18,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    headerUserRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    headerUserLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    headerUserInfo: {
      flex: 1,
      minWidth: 0,
    },
    headerUserName: {
      fontSize: 17,
      fontFamily: fonts.extraBold,
      color: colors.primaryForeground,
    },
    headerUserMeta: {
      fontSize: 11,
      fontFamily: fonts.semiBold,
      color: colors.primaryForeground,
      opacity: 0.82,
      marginTop: 2,
    },
    headerActionBtn: {
      backgroundColor: "rgba(255,255,255,0.2)",
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
      marginTop: 4,
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
      fontSize: 12,
      fontFamily: fonts.extraBold,
      color: colors.primaryForeground,
    },
    xpBar: {
      height: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.25)",
      marginTop: 2,
    },
    mahasiswaStatsWrap: {
      paddingHorizontal: 16,
      marginTop: -14,
      marginBottom: 12,
    },
    mahasiswaStatsRow: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-between",
    },
    mahasiswaStatCard: {
      flex: 1,
      backgroundColor: "#FFFDFB",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 8,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    mahasiswaStatIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 7,
    },
    mahasiswaStatVal: {
      fontSize: 19,
      lineHeight: 21,
      fontFamily: fonts.black,
      color: colors.foreground,
    },
    mahasiswaStatLabel: {
      fontSize: 10,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      marginTop: 2,
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
      marginTop: 2,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    categoryCard: {
      width: "47%" as any,
      backgroundColor: "#FFFDFB",
      borderRadius: 20,
      padding: 0,
      overflow: "hidden",
    },
    categoryCardContent: {
      padding: 14,
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
      backgroundColor: "#FFFDFB",
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

      {user?.classCode && (
        <Chip
          icon="school"
          style={{ alignSelf: "flex-start", marginTop: 10, backgroundColor: "rgba(255,255,255,0.2)" }}
          textStyle={{ color: colors.primaryForeground, fontFamily: fonts.bold }}
        >
          Kelas {user.classCode}
        </Chip>
      )}

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
      <View style={styles.headerUserRow}>
        <View style={styles.headerUserLeft}>
          <Avatar.Text
            size={40}
            label={userInitial}
            color={colors.primary}
            style={{ backgroundColor: "#FFFFFF" }}
            labelStyle={{ fontFamily: fonts.extraBold }}
          />
          <View style={styles.headerUserInfo}>
            <Text numberOfLines={1} style={styles.headerUserName}>{fullName}</Text>
            <Text style={styles.headerUserMeta}>Mahasiswa · Lv.{levelInfo.level} {levelInfo.title}</Text>
            {!!user?.classCode && (
              <Text style={[styles.headerUserMeta, { opacity: 0.95 }]}>Kelas {user.classCode}</Text>
            )}
          </View>
        </View>
        <IconButton
          icon="account-edit-outline"
          size={18}
          iconColor={colors.primaryForeground}
          containerColor={styles.headerActionBtn.backgroundColor as string}
          onPress={() => router.push("/(tabs)/progress")}
        />
      </View>

      <View style={styles.xpRow}>
        <View style={styles.xpLabelRow}>
          <Text style={styles.xpLabel}>Progress Lv.{levelInfo.level + 1}</Text>
          <Text style={styles.xpVal}>{xp} XP · {xpPct}%</Text>
        </View>
        <ProgressBar progress={xpPct / 100} color={colors.primaryForeground} style={styles.xpBar} />
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

          {!isDosen && (
            <View style={styles.mahasiswaStatsWrap}>
              <View style={styles.mahasiswaStatsRow}>
                <Surface style={styles.mahasiswaStatCard} elevation={2}>
                  <View style={[styles.mahasiswaStatIcon, { backgroundColor: "#FFF3F3" }]}>
                    <Ionicons name="flash" size={13} color={colors.primary} />
                  </View>
                  <Text style={styles.mahasiswaStatVal}>{xp}</Text>
                  <Text style={styles.mahasiswaStatLabel}>Total XP</Text>
                </Surface>
                <Surface style={styles.mahasiswaStatCard} elevation={2}>
                  <View style={[styles.mahasiswaStatIcon, { backgroundColor: "#FFF8E9" }]}>
                    <Ionicons name="flame" size={13} color="#D97706" />
                  </View>
                  <Text style={styles.mahasiswaStatVal}>{streak}</Text>
                  <Text style={styles.mahasiswaStatLabel}>Streak</Text>
                </Surface>
                <Surface style={styles.mahasiswaStatCard} elevation={2}>
                  <View style={[styles.mahasiswaStatIcon, { backgroundColor: "#ECFDF5" }]}>
                    <Ionicons name="trophy" size={13} color="#059669" />
                  </View>
                  <Text style={styles.mahasiswaStatVal}>{progressData?.passedQuizzes ?? 0}</Text>
                  <Text style={styles.mahasiswaStatLabel}>Kuis Lulus</Text>
                </Surface>
                <Surface style={styles.mahasiswaStatCard} elevation={2}>
                  <View style={[styles.mahasiswaStatIcon, { backgroundColor: "#EFF6FF" }]}>
                    <Ionicons name="document-text" size={13} color="#2563EB" />
                  </View>
                  <Text style={styles.mahasiswaStatVal}>{progressData?.totalQuizzes ?? 0}</Text>
                  <Text style={styles.mahasiswaStatLabel}>Total Kuis</Text>
                </Surface>
              </View>
            </View>
          )}

          <View style={styles.body}>
            <Text style={styles.sectionTitle}>{isDosen ? "Kategori Materi" : "Progress Kategori"}</Text>
            {activeCategories.length > 0 ? (
              <View style={styles.categoryGrid}>
                {activeCategories.map((cat) => (
                  <Card
                    key={cat.key}
                    style={styles.categoryCard}
                    mode="elevated"
                    onPress={() => router.push({ pathname: "/(tabs)/materi", params: { filter: cat.key } })}
                  >
                    <Card.Content style={styles.categoryCardContent}>
                      <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}> 
                        <Ionicons name={cat.icon} size={22} color={cat.color} />
                      </View>
                      <Text style={styles.categoryName}>{cat.key}</Text>
                      <Text style={styles.categoryCount}>{categoryCounts[cat.key]} materi</Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ) : (
              <Card mode="outlined" style={{ borderRadius: 18 }}>
                <Card.Content style={styles.emptyBox}>
                  <Ionicons name="book-outline" size={36} color={colors.mutedForeground} />
                  <Text style={styles.emptyText}>
                    {isDosen
                      ? "Belum ada materi. Mulai upload dari tab Upload."
                      : "Belum ada materi. Tunggu dosen mengunggah materi."}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {isDosen && (
              <Card mode="elevated" style={styles.ctaCard}>
                <View style={styles.ctaIconBox}>
                  <Ionicons name="cloud-upload-outline" size={26} color={colors.primary} />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Upload Materi Baru</Text>
                  <Text style={styles.ctaSub}>PDF atau foto, lalu AI akan membuat kuis otomatis.</Text>
                </View>
                <Button mode="text" compact icon="arrow-right" onPress={() => router.push("/(tabs)/upload")}>Buka</Button>
              </Card>
            )}

            {!isDosen && materials.length > 0 && (
              <Card mode="elevated" style={styles.ctaCard}>
                <View style={styles.ctaIconBox}>
                  <Ionicons name="help-circle-outline" size={26} color={colors.primary} />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Mulai Kuis</Text>
                  <Text style={styles.ctaSub}>{materials.length} kuis tersedia untuk kamu kerjakan.</Text>
                </View>
                <Button mode="text" compact icon="arrow-right" onPress={() => router.push("/(tabs)/kuis")}>Buka</Button>
              </Card>
            )}
          </View>
        </>
      }
    />
  );
}
