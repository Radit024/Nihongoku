import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
  const { user, materials, progressData, refreshProgress, refreshMaterials, getLevelInfo, logout, updateProfile } = useAppContext();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshProgress();
    refreshMaterials();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProgress(), refreshMaterials()]);
    setRefreshing(false);
  };

  const openEditModal = () => {
    setEditName(user?.name || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    const nameChanged = editName.trim() && editName.trim() !== user?.name;
    const passwordChanging = newPassword.length > 0;

    if (!nameChanged && !passwordChanging) {
      Alert.alert("Info", "Tidak ada perubahan");
      return;
    }

    if (passwordChanging) {
      if (!currentPassword) {
        Alert.alert("Error", "Password lama wajib diisi");
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert("Error", "Password baru minimal 6 karakter");
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "Konfirmasi password tidak cocok");
        return;
      }
    }

    setEditLoading(true);
    try {
      await updateProfile({
        ...(nameChanged ? { name: editName.trim() } : {}),
        ...(passwordChanging ? { currentPassword, newPassword } : {}),
      });
      setShowEditModal(false);
      Alert.alert("Berhasil", "Profil berhasil diperbarui");
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Terjadi kesalahan");
    } finally {
      setEditLoading(false);
    }
  };

  const isDosen = user?.role === "dosen";
  const xp = progressData?.user.xp ?? user?.xp ?? 0;
  const streak = progressData?.user.streak ?? user?.streak ?? 0;
  const levelInfo = getLevelInfo();
  const initials = (user?.name || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const categoryProgress = progressData?.categoryProgress ?? [];

  const xpInCurrentLevel = xp - levelInfo.xpStart;
  const xpNeeded = levelInfo.xpEnd - levelInfo.xpStart;
  const xpPct = xpNeeded > 0 ? Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100)) : 100;

  const myMaterials = materials.filter(m => m.createdById === user?.id);
  const totalSoal = myMaterials.reduce((sum, m) => sum + m.questionCount, 0);

  const dosenCategoryCounts: Record<string, number> = {};
  myMaterials.forEach(m => {
    dosenCategoryCounts[m.category] = (dosenCategoryCounts[m.category] || 0) + 1;
  });

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
    editBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerBtns: {
      flexDirection: "row",
      gap: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 13,
      fontFamily: fonts.bold,
      color: colors.foreground,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: fonts.regular,
      color: colors.foreground,
    },
    inputHint: {
      fontSize: 11,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    passwordSectionTitle: {
      fontSize: 14,
      fontFamily: fonts.bold,
      color: colors.foreground,
      marginBottom: 4,
    },
    modalBtns: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
    },
    modalCancelText: {
      fontSize: 15,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    modalSaveBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    modalSaveText: {
      fontSize: 15,
      fontFamily: fonts.bold,
      color: colors.primaryForeground,
    },
  });

  const renderDosenBody = () => (
    <View style={styles.body}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#FFF0F0" }]}>
            <Ionicons name="document-text" size={18} color="#C0272D" />
          </View>
          <Text style={styles.statVal}>{myMaterials.length}</Text>
          <Text style={styles.statLabel}>Materi Saya</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="help-circle" size={18} color="#2563EB" />
          </View>
          <Text style={styles.statVal}>{totalSoal}</Text>
          <Text style={styles.statLabel}>Soal Dibuat</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="library" size={18} color="#059669" />
          </View>
          <Text style={styles.statVal}>{materials.length}</Text>
          <Text style={styles.statLabel}>Total Materi</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Materi per Kategori</Text>
      {Object.keys(dosenCategoryCounts).length > 0 ? (
        Object.entries(dosenCategoryCounts).map(([category, count]) => {
          const color = CATEGORY_COLORS[category] || colors.primary;
          const pct = myMaterials.length > 0 ? Math.round((count / myMaterials.length) * 100) : 0;
          return (
            <View key={category} style={styles.catCard}>
              <View style={styles.catRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <Text style={styles.catName}>{category}</Text>
                </View>
                <View style={{ alignItems: "flex-end" as const }}>
                  <Text style={styles.catCount}>{count} materi</Text>
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
        <Text style={styles.emptyText}>Belum ada materi yang diunggah</Text>
      )}
    </View>
  );

  const renderMahasiswaBody = () => (
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
                <View style={{ alignItems: "flex-end" as const }}>
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
  );

  return (
    <>
      <FlatList
        data={[]}
        renderItem={() => null}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
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
                      {isDosen ? "Dosen" : `Mahasiswa · Lv.${levelInfo.level} ${levelInfo.title}`}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerBtns}>
                  <Pressable style={styles.editBtn} onPress={openEditModal}>
                    <Ionicons name="create-outline" size={20} color={colors.primaryForeground} />
                  </Pressable>
                  <Pressable style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.primaryForeground} />
                  </Pressable>
                </View>
              </View>

              {!isDosen && (
                <View style={styles.xpSection}>
                  <View style={styles.xpLabelRow}>
                    <Text style={styles.xpLabel}>Progress ke Lv.{levelInfo.level + 1}</Text>
                    <Text style={styles.xpVal}>{xp} XP · {xpPct}%</Text>
                  </View>
                  <View style={styles.xpBar}>
                    <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
                  </View>
                </View>
              )}
            </View>

            {isDosen ? renderDosenBody() : renderMahasiswaBody()}
          </>
        }
      />

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit Profil</Text>

            <Text style={styles.inputLabel}>Nama</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nama lengkap"
              placeholderTextColor={colors.mutedForeground}
            />

            <View style={styles.divider} />

            <Text style={styles.passwordSectionTitle}>Ganti Password</Text>
            <Text style={styles.inputHint}>Kosongkan jika tidak ingin mengganti password</Text>

            <Text style={styles.inputLabel}>Password Lama</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Masukkan password lama"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Password Baru</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimal 6 karakter"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ulangi password baru"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
            />

            <View style={styles.modalBtns}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </Pressable>
              <Pressable style={[styles.modalSaveBtn, editLoading && { opacity: 0.7 }]} onPress={handleSaveProfile} disabled={editLoading}>
                {editLoading ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Simpan</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
