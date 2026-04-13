import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { id: "partikel", label: "Partikel", jp: "は", color: "#C0272D", bg: "#FDEAEA" },
  { id: "konjugasi", label: "Konjugasi", jp: "動", color: "#2563EB", bg: "#EFF6FF" },
  { id: "kosakata", label: "Kosakata", jp: "語", color: "#16A34A", bg: "#F0FDF4" },
  { id: "kanji", label: "Kanji", jp: "漢", color: "#7C3AED", bg: "#F5F3FF" },
];

export default function BerandaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, totalXP, streak, lessons, lessonProgress, notifications, getCompletedCount } = useAppContext();

  const firstName = user.name.split(" ")[0] || "Gakusei";
  const unfinishedLesson = lessons.find((l) => !l.locked && !lessonProgress[l.id]?.quizPassed);
  const completedCount = getCompletedCount();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    greeting: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    greetingSub: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    bellBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 1,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    seeAll: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "600" as const,
    },
    todayCard: {
      marginHorizontal: 20,
      borderRadius: colors.radius + 4,
      backgroundColor: colors.primary,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 8,
    },
    todayTag: {
      fontSize: 11,
      color: colors.secondary,
      fontWeight: "700" as const,
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    todayTitle: {
      fontSize: 19,
      fontWeight: "700" as const,
      color: "#FFFFFF",
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      marginBottom: 4,
    },
    todayMeta: {
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 16,
    },
    todayBtn: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    todayBtnText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700" as const,
    },
    categoryGrid: {
      paddingHorizontal: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20,
    },
    categoryCard: {
      width: "47%",
      borderRadius: colors.radius,
      padding: 16,
      aspectRatio: 1.4,
      justifyContent: "space-between",
    },
    categoryJp: {
      fontSize: 30,
      fontWeight: "800" as const,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    categoryLabel: {
      fontSize: 13,
      fontWeight: "600" as const,
    },
    notifItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
    },
    notifAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    notifAvatarText: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.primary,
    },
    notifContent: {
      flex: 1,
    },
    notifFrom: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 2,
    },
    notifRole: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "600" as const,
      marginBottom: 4,
    },
    notifMessage: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    notifTime: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },
    bottomPad: {
      height: insets.bottom + (Platform.OS === "web" ? 34 : 90),
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo, {firstName}!</Text>
            <Text style={styles.greetingSub}>Ayo belajar bahasa Jepang hari ini</Text>
          </View>
          <Pressable style={styles.bellBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#FFF4F4" }]}>
            <View style={[styles.statIconBox, { backgroundColor: "#FFE4E4" }]}>
              <Ionicons name="flame" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Hari Streak</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFF9EC" }]}>
            <View style={[styles.statIconBox, { backgroundColor: "#FFF0CC" }]}>
              <Ionicons name="star" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
        </View>

        {/* Materi Hari Ini */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Materi Hari Ini</Text>
        </View>
        {unfinishedLesson ? (
          <Pressable
            style={styles.todayCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/quiz/${unfinishedLesson.id}`);
            }}
          >
            <Text style={styles.todayTag}>{unfinishedLesson.categoryLabel.toUpperCase()}</Text>
            <Text style={styles.todayTitle}>{unfinishedLesson.title}</Text>
            <Text style={styles.todayMeta}>{unfinishedLesson.estimatedMinutes} menit · Siap dimulai</Text>
            <View style={styles.todayBtn}>
              <Ionicons name="play" size={14} color="#FFFFFF" />
              <Text style={styles.todayBtnText}>Mulai Belajar</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable style={styles.todayCard} onPress={() => router.push("/(tabs)/materi")}>
            <Text style={styles.todayTag}>SEMUA SELESAI</Text>
            <Text style={styles.todayTitle}>Hebat! Kamu sudah menyelesaikan semua materi</Text>
            <Text style={styles.todayMeta}>{completedCount} materi selesai</Text>
            <View style={styles.todayBtn}>
              <Ionicons name="refresh" size={14} color="#FFFFFF" />
              <Text style={styles.todayBtnText}>Ulangi</Text>
            </View>
          </Pressable>
        )}

        {/* Kategori Materi */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategori Materi</Text>
          <Pressable onPress={() => router.push("/(tabs)/materi")}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </Pressable>
        </View>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: cat.bg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/materi");
              }}
            >
              <Text style={[styles.categoryJp, { color: cat.color }]}>{cat.jp}</Text>
              <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Notifikasi */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifikasi Dosen</Text>
        </View>
        {notifications.map((notif, i) => (
          <React.Fragment key={notif.id}>
            <View style={styles.notifItem}>
              <View style={styles.notifAvatar}>
                <Text style={styles.notifAvatarText}>{notif.from.charAt(0)}</Text>
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifFrom}>{notif.from}</Text>
                <Text style={styles.notifRole}>{notif.role}</Text>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </View>
            {i < notifications.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}
