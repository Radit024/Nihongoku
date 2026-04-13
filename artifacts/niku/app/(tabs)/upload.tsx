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

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, materials, refreshMaterials } = useAppContext();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

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
    setUploadStatus("Mengunggah dan memproses dengan AI...");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await api.uploadMaterial(user.id, file);
      setUploadStatus(`Berhasil! "${result.title}" - ${result.questionCount} soal dibuat`);
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
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.primary,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800" as const,
      color: colors.primaryForeground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    headerSub: {
      fontSize: 14,
      color: colors.primaryForeground,
      opacity: 0.8,
      marginTop: 4,
    },
    content: { padding: 20 },
    uploadSection: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    uploadBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: "dashed",
      padding: 20,
      alignItems: "center",
      gap: 8,
    },
    uploadBtnText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      textAlign: "center",
    },
    statusBox: {
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statusText: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 12,
    },
    materialCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    materialRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    materialTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      flex: 1,
    },
    materialMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
    },
    badge: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    badgeText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "500" as const,
    },
    metaText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    deleteBtn: {
      padding: 8,
    },
    emptyText: {
      textAlign: "center",
      color: colors.mutedForeground,
      fontSize: 14,
      marginTop: 40,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Materi</Text>
        <Text style={styles.headerSub}>Unggah PDF atau foto materi, AI akan otomatis membuat soal kuis</Text>
      </View>

      <FlatList
        data={myMaterials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.uploadSection}>
              <Pressable
                style={[styles.uploadBtn, isUploading && { opacity: 0.5 }]}
                onPress={pickDocument}
                disabled={isUploading}
              >
                <Ionicons name="document-outline" size={32} color={colors.primary} />
                <Text style={styles.uploadBtnText}>Upload PDF</Text>
              </Pressable>
              <Pressable
                style={[styles.uploadBtn, isUploading && { opacity: 0.5 }]}
                onPress={pickImage}
                disabled={isUploading}
              >
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={styles.uploadBtnText}>Foto Materi</Text>
              </Pressable>
            </View>

            {(isUploading || uploadStatus) && (
              <View style={styles.statusBox}>
                {isUploading && <ActivityIndicator color={colors.primary} />}
                {!isUploading && uploadStatus && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                <Text style={styles.statusText}>{isUploading ? "Mengunggah dan memproses dengan AI..." : uploadStatus}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Materi Saya ({myMaterials.length})</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.materialCard}>
            <View style={styles.materialRow}>
              <Text style={styles.materialTitle} numberOfLines={2}>{item.title}</Text>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.title)}>
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </Pressable>
            </View>
            <View style={styles.materialMeta}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
              <Text style={styles.metaText}>{item.questionCount} soal</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada materi yang diunggah</Text>
        }
      />
    </View>
  );
}
