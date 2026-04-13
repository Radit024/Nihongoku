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
  const initials = (user?.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const categoryProgress = progressData?.categoryProgress ?? [];

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
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    avatarCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
    },
    profileInfo: { flex: 1 },
    profileName: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
    },
    profileSub: {
      fontSize: 13,
      color: colors.primaryForeground,
      opacity: 0.8,
      marginTop: 2,
    },
    logoutBtn: {
      padding: 8,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    statBox: {
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
    body: { padding: 20, paddingBottom: 100 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 12,
      marginTop: 8,
    },
    catCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    catRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    catName: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
    },
    catCount: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    barBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
    },
    barFill: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryVal: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.primary,
    },
    summaryLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 4,
      textAlign: "center",
    },
    emptyText: {
      textAlign: "center",
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
            <View style={styles.profileRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileSub}>
                  {user?.role === "dosen" ? "Dosen" : "Mahasiswa"} - Lv{levelInfo.level} {levelInfo.title}
                </Text>
              </View>
              <Pressable style={styles.logoutBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color={colors.primaryForeground} />
              </Pressable>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{xp}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="flame" size={16} color={colors.primaryForeground} />
                <Text style={styles.statVal}>{streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{progressData?.passedQuizzes ?? 0}</Text>
                <Text style={styles.statLabel}>Kuis Lulus</Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryVal}>{progressData?.totalQuizzes ?? 0}</Text>
                <Text style={styles.summaryLabel}>Total Percobaan</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryVal}>{progressData?.uniqueMaterialsPassed ?? 0}</Text>
                <Text style={styles.summaryLabel}>Materi Selesai</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Progress Kategori</Text>
            {categoryProgress.length > 0 ? (
              categoryProgress.map((cp) => {
                const pct = cp.total > 0 ? Math.round((cp.completed / cp.total) * 100) : 0;
                return (
                  <View key={cp.category} style={styles.catCard}>
                    <View style={styles.catRow}>
                      <Text style={styles.catName}>{cp.category}</Text>
                      <Text style={styles.catCount}>{cp.completed}/{cp.total}</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${pct}%` }]} />
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
