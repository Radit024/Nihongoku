import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { api, ApiMaterial } from "@/lib/api";
import { fonts } from "@/constants/fonts";

const CATEGORY_COLORS: Record<string, string> = {
  "Tata Bahasa": "#C0272D",
  "Kosakata": "#059669",
  "Kanji": "#7C3AED",
  "Percakapan": "#2563EB",
  "Budaya": "#D97706",
};

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, materials, refreshMaterials } = useAppContext();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    refreshMaterials();
  }, []);

  const myMaterials = materials.filter(m => m.createdById === user?.id);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      await uploadFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/pdf",
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Gagal memilih file");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const name = asset.uri.split("/").pop() || "photo.jpg";
      await uploadFile({
        uri: asset.uri,
        name,
        type: asset.mimeType || "image/jpeg",
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Gagal memilih gambar");
    }
  };

  const uploadFile = async (file: { uri: string; name: string; type: string }) => {
    if (!user) return;
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadStatus("Mengunggah dan memproses dengan AI...");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await api.uploadMaterial(user.id, file);
      setUploadStatus(`"${result.title}" berhasil dibuat — ${result.questionCount} soal kuis siap!`);
      setUploadSuccess(true);
      await refreshMaterials();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setUploadStatus("");
      Alert.alert("Gagal Upload", err.message || "Terjadi kesalahan saat memproses materi");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (materialId: string, title: string) => {
    if (!user) return;
    const doDelete = () => {
      api.deleteMaterial(user.id, materialId)
        .then(() => refreshMaterials())
        .catch((err) => Alert.alert("Error", err.message));
    };

    if (Platform.OS === "web") {
      if (confirm(`Hapus materi "${title}"?`)) doDelete();
    } else {
      Alert.alert("Hapus Materi", `Hapus "${title}" dan semua soal kuisnya?`, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    headerTitle: {
      fontSize: 26,
      fontFamily: fonts.black,
      color: colors.primaryForeground,
    },
    headerSub: {
      fontSize: 13,
      fontFamily: fonts.regular,
      color: colors.primaryForeground,
      opacity: 0.78,
      marginTop: 4,
      lineHeight: 18,
    },
    content: { padding: 20, paddingBottom: 100 },
    uploadSectionTitle: {
      fontSize: 15,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      marginBottom: 12,
    },
    uploadSection: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    uploadBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
      paddingVertical: 24,
      paddingHorizontal: 12,
      alignItems: "center",
      gap: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    uploadBtnIconBox: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: "#FFF0F0",
      alignItems: "center",
      justifyContent: "center",
    },
    uploadBtnText: {
      fontSize: 14,
      fontFamily: fonts.bold,
      color: colors.foreground,
      textAlign: "center",
    },
    uploadBtnSub: {
      fontSize: 11,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    statusBox: {
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statusProcessing: {
      backgroundColor: "#EFF6FF",
      borderLeftWidth: 3,
      borderLeftColor: "#2563EB",
    },
    statusSuccess: {
      backgroundColor: "#ECFDF5",
      borderLeftWidth: 3,
      borderLeftColor: "#059669",
    },
    statusText: {
      flex: 1,
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.foreground,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      marginBottom: 14,
    },
    materialCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    materialRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },
    materialTitle: {
      fontSize: 15,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      flex: 1,
    },
    materialMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    badge: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      fontSize: 11,
      fontFamily: fonts.bold,
    },
    metaText: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
    },
    deleteBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: "#FFF0F0",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyBox: {
      alignItems: "center",
      paddingVertical: 32,
      gap: 10,
    },
    emptyText: {
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      fontSize: 14,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Materi</Text>
        <Text style={styles.headerSub}>Unggah PDF atau foto — AI otomatis buat soal kuis</Text>
      </View>

      <FlatList
        data={myMaterials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.uploadSectionTitle}>Pilih File</Text>
            <View style={styles.uploadSection}>
              <Pressable
                style={[styles.uploadBtn, isUploading && { opacity: 0.5 }]}
                onPress={pickDocument}
                disabled={isUploading}
              >
                <View style={styles.uploadBtnIconBox}>
                  <Ionicons name="document-text-outline" size={26} color={colors.primary} />
                </View>
                <Text style={styles.uploadBtnText}>Upload PDF</Text>
                <Text style={styles.uploadBtnSub}>Dokumen materi</Text>
              </Pressable>
              <Pressable
                style={[styles.uploadBtn, isUploading && { opacity: 0.5 }]}
                onPress={pickImage}
                disabled={isUploading}
              >
                <View style={styles.uploadBtnIconBox}>
                  <Ionicons name="camera-outline" size={26} color={colors.primary} />
                </View>
                <Text style={styles.uploadBtnText}>Foto Materi</Text>
                <Text style={styles.uploadBtnSub}>Foto papan tulis / buku</Text>
              </Pressable>
            </View>

            {(isUploading || uploadStatus) && (
              <View style={[styles.statusBox, uploadSuccess ? styles.statusSuccess : styles.statusProcessing]}>
                {isUploading
                  ? <ActivityIndicator color="#2563EB" size="small" />
                  : <Ionicons name="checkmark-circle" size={20} color="#059669" />
                }
                <Text style={styles.statusText}>
                  {isUploading ? "Memproses dengan AI... ini mungkin 30-60 detik" : uploadStatus}
                </Text>
              </View>
            )}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Materi Saya ({myMaterials.length})</Text>
          </>
        }
        renderItem={({ item }: { item: ApiMaterial }) => {
          const catColor = CATEGORY_COLORS[item.category] || colors.primary;
          return (
            <View style={styles.materialCard}>
              <View style={styles.materialRow}>
                <Text style={styles.materialTitle} numberOfLines={2}>{item.title}</Text>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.title)}>
                  <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                </Pressable>
              </View>
              <View style={styles.materialMeta}>
                <View style={[styles.badge, { backgroundColor: catColor + "18" }]}>
                  <Text style={[styles.badgeText, { color: catColor }]}>{item.category}</Text>
                </View>
                <Text style={styles.metaText}>{item.questionCount} soal</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="cloud-upload-outline" size={44} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Belum ada materi yang diunggah</Text>
          </View>
        }
      />
    </View>
  );
}
