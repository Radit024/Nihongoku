import { Ionicons } from "@expo/vector-icons";
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

const CATEGORY_COLORS: Record<string, string> = {
  "Tata Bahasa": "#C0272D",
  "Kosakata": "#059669",
  "Kanji": "#7C3AED",
  "Percakapan": "#2563EB",
  "Budaya": "#D97706",
};

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, progressData, refreshProgress, getLevelInfo, logout } = useAppContext();

  useEffect(() => {
    refreshProgress();
  }, []);

  const xp = progressData?.user.xp ?? user?.xp ?? 0;
  const streak = progressData?.user.streak ?? user?.streak ?? 0;
  const levelInfo = getLevelInfo();
  const initials = (user?.name || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const categoryProgress = progressData?.categoryProgress ?? [];

  const xpInCurrentLevel = xp - levelInfo.xpStart;
  const xpNeeded = levelInfo.xpEnd - levelInfo.xpStart;
  const xpPct = xpNeeded > 0 ? Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100)) : 100;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 20,
      paddingHorizontal: 20,
      paddingBottom: 24,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    headerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatarCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.4)",
    },
    avatarText: {
      fontSize: 20,
      fontFamily: fonts.black,
      color: colors.primaryForeground,
    },
    profileInfo: { flex: 1 },
    profileName: {
      fontSize: 18,
      fontFamily: fonts.extraBold,
      color: colors.primaryForeground,
    },
    profileSub: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.primaryForeground,
      opacity: 0.78,
      marginTop: 2,
    },
    logoutBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    xpSection: {
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
    body: { padding: 20, paddingBottom: 100 },
    statsGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    statVal: {
      fontSize: 22,
      fontFamily: fonts.black,
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      marginTop: 2,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      marginBottom: 14,
    },
    catCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    catRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    catLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    catDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    catName: {
      fontSize: 14,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    catCount: {
      fontSize: 13,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
    },
    catPct: {
      fontSize: 11,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
    },
    barBg: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: 5,
    },
    barFill: {
      height: 10,
      borderRadius: 5,
    },
    emptyText: {
      textAlign: "center",
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      fontSize: 14,
      marginTop: 20,
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
            <View style={styles.headerTopRow}>
              <View style={styles.profileRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{user?.name}</Text>
                  <Text style={styles.profileSub}>
                    {user?.role === "dosen" ? "Dosen" : "Mahasiswa"} · Lv.{levelInfo.level} {levelInfo.title}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.logoutBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color={colors.primaryForeground} />
              </Pressable>
            </View>

            <View style={styles.xpSection}>
              <View style={styles.xpLabelRow}>
                <Text style={styles.xpLabel}>Progress ke Lv.{levelInfo.level + 1}</Text>
                <Text style={styles.xpVal}>{xp} XP · {xpPct}%</Text>
              </View>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#FFF0F0" }]}>
                  <Ionicons name="flash" size={18} color="#C0272D" />
                </View>
                <Text style={styles.statVal}>{xp}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#FFF7ED" }]}>
                  <Ionicons name="flame" size={18} color="#D97706" />
                </View>
                <Text style={styles.statVal}>{streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="trophy" size={18} color="#059669" />
                </View>
                <Text style={styles.statVal}>{progressData?.passedQuizzes ?? 0}</Text>
                <Text style={styles.statLabel}>Kuis Lulus</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="document-text" size={18} color="#2563EB" />
                </View>
                <Text style={styles.statVal}>{progressData?.totalQuizzes ?? 0}</Text>
                <Text style={styles.statLabel}>Total Kuis</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Progress Kategori</Text>
            {categoryProgress.length > 0 ? (
              categoryProgress.map((cp) => {
                const pct = cp.total > 0 ? Math.round((cp.completed / cp.total) * 100) : 0;
                const color = CATEGORY_COLORS[cp.category] || colors.primary;
                return (
                  <View key={cp.category} style={styles.catCard}>
                    <View style={styles.catRow}>
                      <View style={styles.catLeft}>
                        <View style={[styles.catDot, { backgroundColor: color }]} />
                        <Text style={styles.catName}>{cp.category}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.catCount}>{cp.completed}/{cp.total}</Text>
                        <Text style={styles.catPct}>{pct}%</Text>
                      </View>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Belum ada data progress</Text>
            )}
          </View>
        </>
      }
    />
  );
}
