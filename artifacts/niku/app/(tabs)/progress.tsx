import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  IconButton,
  Portal,
  ProgressBar,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "@/constants/fonts";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

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
  const {
    user,
    materials,
    progressData,
    refreshProgress,
    refreshMaterials,
    getLevelInfo,
    logout,
    updateProfile,
    createClassroom,
    joinClassroom,
  } = useAppContext();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [classCodeInput, setClassCodeInput] = useState("");
  const [classActionLoading, setClassActionLoading] = useState(false);
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

  const openEditDialog = () => {
    setEditName(user?.name || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowEditDialog(true);
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
      setShowEditDialog(false);
      Alert.alert("Berhasil", "Profil berhasil diperbarui");
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Terjadi kesalahan");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateClassCode = async () => {
    setClassActionLoading(true);
    try {
      const code = await createClassroom();
      await Promise.all([refreshProgress(), refreshMaterials()]);
      Alert.alert("Kode Kelas", `Kode kelas kamu: ${code}`);
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Tidak bisa membuat kode kelas");
    } finally {
      setClassActionLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!classCodeInput.trim()) {
      Alert.alert("Info", "Masukkan kode kelas terlebih dahulu");
      return;
    }

    setClassActionLoading(true);
    try {
      const code = await joinClassroom(classCodeInput.trim());
      await Promise.all([refreshProgress(), refreshMaterials()]);
      setClassCodeInput("");
      Alert.alert("Berhasil", `Kamu bergabung ke kelas ${code}`);
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Tidak bisa bergabung kelas");
    } finally {
      setClassActionLoading(false);
    }
  };

  const isDosen = user?.role === "dosen";
  const xp = progressData?.user.xp ?? user?.xp ?? 0;
  const streak = progressData?.user.streak ?? user?.streak ?? 0;
  const levelInfo = getLevelInfo();
  const initials = (user?.name || "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const categoryProgress = progressData?.categoryProgress ?? [];

  const xpInCurrentLevel = xp - levelInfo.xpStart;
  const xpNeeded = levelInfo.xpEnd - levelInfo.xpStart;
  const xpPct = xpNeeded > 0 ? Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100)) : 100;

  const myMaterials = useMemo(() => materials.filter((m) => m.createdById === user?.id), [materials, user?.id]);
  const totalSoal = myMaterials.reduce((sum, m) => sum + m.questionCount, 0);

  const dosenCategoryCounts: Record<string, number> = {};
  myMaterials.forEach((m) => {
    dosenCategoryCounts[m.category] = (dosenCategoryCounts[m.category] || 0) + 1;
  });

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 18,
      paddingHorizontal: 18,
      paddingBottom: 16,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    profileLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    profileName: {
      fontFamily: fonts.extraBold,
      fontSize: 18,
      color: colors.primaryForeground,
    },
    profileSub: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.primaryForeground,
      opacity: 0.85,
      marginTop: 2,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    xpWrap: {
      marginTop: 12,
      gap: 6,
    },
    xpRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    xpLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.primaryForeground,
      opacity: 0.86,
    },
    xpValue: {
      fontFamily: fonts.bold,
      fontSize: 12,
      color: colors.primaryForeground,
    },
    xpBar: {
      height: 8,
      borderRadius: 99,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    content: {
      padding: 16,
      paddingBottom: 120,
      gap: 12,
    },
    classCard: {
      borderRadius: 16,
      backgroundColor: "#FFFDFB",
    },
    classTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    classTitle: {
      fontFamily: fonts.extraBold,
      fontSize: 15,
      color: colors.foreground,
    },
    classHint: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: "#FFFDFB",
    },
    statVal: {
      fontFamily: fonts.black,
      fontSize: 22,
      color: colors.foreground,
      marginTop: 4,
    },
    statLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.mutedForeground,
    },
    sectionTitle: {
      fontFamily: fonts.extraBold,
      fontSize: 18,
      color: colors.foreground,
      marginTop: 6,
      marginBottom: 2,
    },
    progressCard: {
      borderRadius: 16,
      backgroundColor: "#FFFDFB",
      marginBottom: 8,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressName: {
      fontFamily: fonts.bold,
      fontSize: 14,
      color: colors.foreground,
    },
    progressCount: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.mutedForeground,
    },
    progressBar: {
      height: 8,
      borderRadius: 99,
      backgroundColor: colors.border,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.profileLeft}>
              <Avatar.Text
                size={52}
                label={initials}
                style={{ backgroundColor: "#FFFFFF" }}
                labelStyle={{ color: colors.primary, fontFamily: fonts.black }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{user?.name || "Pengguna"}</Text>
                <Text style={styles.profileSub}>
                  {isDosen ? "Dosen" : `Mahasiswa · Lv.${levelInfo.level} ${levelInfo.title}`}
                </Text>
              </View>
            </View>

            <View style={styles.headerButtons}>
              <IconButton icon="account-edit-outline" iconColor={colors.primaryForeground} onPress={openEditDialog} />
              <IconButton icon="logout" iconColor={colors.primaryForeground} onPress={logout} />
            </View>
          </View>

          {!isDosen && (
            <View style={styles.xpWrap}>
              <View style={styles.xpRow}>
                <Text style={styles.xpLabel}>Progress ke Lv.{levelInfo.level + 1}</Text>
                <Text style={styles.xpValue}>{xp} XP · {xpPct}%</Text>
              </View>
              <ProgressBar progress={xpPct / 100} color={colors.primaryForeground} style={styles.xpBar} />
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        >
          <Card style={styles.classCard} mode="elevated">
            <Card.Content>
              <View style={styles.classTitleRow}>
                <Text style={styles.classTitle}>{isDosen ? "Kelas Aktif" : "Kelas Saya"}</Text>
                <Ionicons name={isDosen ? "school-outline" : "people-outline"} size={18} color={colors.primary} />
              </View>

              {user?.classCode ? (
                <>
                  <Chip
                    compact
                    icon="key-variant"
                    style={{ alignSelf: "flex-start", marginBottom: 8, backgroundColor: "#FFF3F3" }}
                    textStyle={{ color: colors.primary, fontFamily: fonts.bold }}
                  >
                    {user.classCode}
                  </Chip>
                  <Text style={styles.classHint}>
                    {isDosen
                      ? "Bagikan kode ini ke mahasiswa agar materi hanya tampil untuk kelas ini."
                      : "Materi yang tampil sekarang hanya dari kelas ini."}
                  </Text>
                </>
              ) : (
                <Text style={styles.classHint}>
                  {isDosen
                    ? "Buat kode kelas sebelum upload materi agar distribusi materi terpisah per kelas."
                    : "Masukkan kode kelas dari dosen untuk membuka materi sesuai kelas."}
                </Text>
              )}

              {isDosen ? (
                <Button
                  mode="contained"
                  style={{ marginTop: 12 }}
                  icon="plus-circle-outline"
                  onPress={handleCreateClassCode}
                  disabled={classActionLoading}
                  labelStyle={{ fontFamily: fonts.bold }}
                >
                  {classActionLoading ? "Memproses..." : user?.classCode ? "Generate Ulang Kode" : "Buat Kode Kelas"}
                </Button>
              ) : (
                !user?.classCode && (
                  <>
                    <TextInput
                      mode="outlined"
                      value={classCodeInput}
                      onChangeText={setClassCodeInput}
                      placeholder="Contoh: NIKU-AB12CD"
                      autoCapitalize="characters"
                      style={{ marginTop: 12 }}
                    />
                    <Button
                      mode="contained"
                      style={{ marginTop: 10 }}
                      onPress={handleJoinClassroom}
                      disabled={classActionLoading}
                      labelStyle={{ fontFamily: fonts.bold }}
                    >
                      {classActionLoading ? "Menghubungkan..." : "Gabung Kelas"}
                    </Button>
                  </>
                )
              )}
            </Card.Content>
          </Card>

          <View style={styles.statsGrid}>
            <Card style={styles.statCard} mode="elevated">
              <Card.Content>
                <Text style={styles.statVal}>{xp}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard} mode="elevated">
              <Card.Content>
                <Text style={styles.statVal}>{streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard} mode="elevated">
              <Card.Content>
                <Text style={styles.statVal}>{isDosen ? myMaterials.length : progressData?.passedQuizzes ?? 0}</Text>
                <Text style={styles.statLabel}>{isDosen ? "Materi Saya" : "Kuis Lulus"}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard} mode="elevated">
              <Card.Content>
                <Text style={styles.statVal}>{isDosen ? totalSoal : progressData?.totalQuizzes ?? 0}</Text>
                <Text style={styles.statLabel}>{isDosen ? "Soal Dibuat" : "Total Kuis"}</Text>
              </Card.Content>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>{isDosen ? "Distribusi Materi" : "Progress Kategori"}</Text>

          {isDosen ? (
            Object.keys(dosenCategoryCounts).length > 0 ? (
              Object.entries(dosenCategoryCounts).map(([category, count]) => {
                const color = CATEGORY_COLORS[category] || colors.primary;
                const pct = myMaterials.length > 0 ? Math.round((count / myMaterials.length) * 100) : 0;
                return (
                  <Card key={category} style={styles.progressCard} mode="elevated">
                    <Card.Content>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressName}>{category}</Text>
                        <Text style={styles.progressCount}>{count} materi · {pct}%</Text>
                      </View>
                      <ProgressBar progress={pct / 100} color={color} style={styles.progressBar} />
                    </Card.Content>
                  </Card>
                );
              })
            ) : (
              <Text style={{ color: colors.mutedForeground, fontFamily: fonts.semiBold }}>Belum ada materi yang diunggah.</Text>
            )
          ) : (
            categoryProgress.length > 0 ? (
              categoryProgress.map((cp) => {
                const pct = cp.total > 0 ? Math.round((cp.completed / cp.total) * 100) : 0;
                const color = CATEGORY_COLORS[cp.category] || colors.primary;
                return (
                  <Card key={cp.category} style={styles.progressCard} mode="elevated">
                    <Card.Content>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressName}>{cp.category}</Text>
                        <Text style={styles.progressCount}>{cp.completed}/{cp.total} · {pct}%</Text>
                      </View>
                      <ProgressBar progress={pct / 100} color={color} style={styles.progressBar} />
                    </Card.Content>
                  </Card>
                );
              })
            ) : (
              <Text style={{ color: colors.mutedForeground, fontFamily: fonts.semiBold }}>Belum ada data progress.</Text>
            )
          )}
        </ScrollView>
      </View>

      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title style={{ fontFamily: fonts.extraBold }}>Edit Profil</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <TextInput
              mode="outlined"
              label="Nama"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              mode="outlined"
              label="Password Lama"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              mode="outlined"
              label="Password Baru"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              mode="outlined"
              label="Konfirmasi Password Baru"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>Batal</Button>
            <Button onPress={handleSaveProfile} disabled={editLoading}>
              {editLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {editLoading && (
        <View style={{ position: "absolute", right: 16, bottom: 18 }}>
          <Surface style={{ borderRadius: 99, padding: 10, backgroundColor: "#FFFFFF" }} elevation={2}>
            <ActivityIndicator size="small" color={colors.primary} />
          </Surface>
        </View>
      )}
    </>
  );
}
