import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { getLevelInfo } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const WEEK_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const CATEGORIES = ["partikel", "konjugasi", "kosakata", "kanji"];
const CATEGORY_LABELS: Record<string, string> = {
  partikel: "Partikel は",
  konjugasi: "Konjugasi 動",
  kosakata: "Kosakata 語",
  kanji: "Kanji 漢",
};
const CATEGORY_COLORS: Record<string, string> = {
  partikel: "#C0272D",
  konjugasi: "#2563EB",
  kosakata: "#16A34A",
  kanji: "#7C3AED",
};

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const BADGE_ICONS: Record<string, IoniconName> = {
  star: "star",
  flame: "flame",
  trophy: "trophy",
  medal: "medal",
  ribbon: "ribbon",
  school: "school",
};

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, totalXP, streak, weeklyActive, badges, earnedBadgeIds, getCompletedCount, getCategoryProgress, logout } = useAppContext();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const levelInfo = getLevelInfo(totalXP);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "NK";
  const completedCount = getCompletedCount();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 90),
    },
    profileCard: {
      marginHorizontal: 20,
      marginTop: topPad + 16,
      backgroundColor: colors.navy,
      borderRadius: colors.radius + 4,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 16,
    },
    avatarCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: "#FFFFFF",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: "#FFFFFF",
      marginBottom: 2,
    },
    profileEmail: {
      fontSize: 12,
      color: "rgba(255,255,255,0.6)",
      marginBottom: 8,
    },
    levelBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.tan,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    levelText: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.navy,
    },
    logoutBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    statsCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      marginBottom: 20,
      overflow: "hidden",
    },
    statItem: {
      flex: 1,
      paddingVertical: 16,
      alignItems: "center",
      gap: 4,
    },
    statItemBorder: {
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "800" as const,
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    sectionCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 16,
    },
    catRow: {
      marginBottom: 14,
    },
    catLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    catLabel: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: "600" as const,
    },
    catPercent: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontWeight: "600" as const,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.muted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dayItem: {
      alignItems: "center",
      gap: 6,
    },
    dayCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
    },
    dayLabel: {
      fontSize: 11,
      fontWeight: "600" as const,
    },
    badgeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    badgeItem: {
      width: "30%",
      alignItems: "center",
      gap: 6,
    },
    badgeCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeName: {
      fontSize: 10,
      fontWeight: "700" as const,
      textAlign: "center",
    },
    badgeDesc: {
      fontSize: 9,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={10} color={colors.navy} />
              <Text style={styles.levelText}>Lv.{levelInfo.level} · {levelInfo.title}</Text>
            </View>
          </View>
          <Pressable
            style={styles.logoutBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              logout();
              router.replace("/login");
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={20} color={colors.primary} />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Ionicons name="star" size={20} color={colors.accent} />
            <Text style={styles.statNumber}>{totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.correct} />
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Materi Selesai</Text>
          </View>
        </View>

        {/* Category Progress */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Progress Kategori</Text>
          {CATEGORIES.map((cat) => {
            const prog = getCategoryProgress(cat);
            const catColor = CATEGORY_COLORS[cat];
            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catLabelRow}>
                  <Text style={styles.catLabel}>{CATEGORY_LABELS[cat]}</Text>
                  <Text style={styles.catPercent}>{prog}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${prog}%`, backgroundColor: catColor }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Weekly Streak Calendar */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Streak Mingguan</Text>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, i) => {
              const isActive = weeklyActive?.[i] ?? false;
              return (
                <View key={day} style={styles.dayItem}>
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: isActive ? colors.primary + "20" : colors.card,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {isActive ? (
                      <Ionicons name="flame" size={18} color={colors.primary} />
                    ) : (
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>·</Text>
                    )}
                  </View>
                  <Text style={[styles.dayLabel, { color: isActive ? colors.primary : colors.mutedForeground }]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pencapaian</Text>
          <View style={styles.badgeGrid}>
            {badges.map((badge) => {
              const earned = earnedBadgeIds.includes(badge.id);
              return (
                <View key={badge.id} style={[styles.badgeItem, { opacity: earned ? 1 : 0.4 }]}>
                  <View
                    style={[
                      styles.badgeCircle,
                      { backgroundColor: earned ? colors.tan + "30" : colors.muted },
                    ]}
                  >
                    <Ionicons
                      name={BADGE_ICONS[badge.iconName] ?? "star"}
                      size={24}
                      color={earned ? colors.tan : colors.mutedForeground}
                    />
                  </View>
                  <Text style={[styles.badgeName, { color: earned ? colors.foreground : colors.mutedForeground }]}>
                    {badge.title}
                  </Text>
                  <Text style={[styles.badgeDesc, { color: colors.mutedForeground }]}>{badge.description}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
