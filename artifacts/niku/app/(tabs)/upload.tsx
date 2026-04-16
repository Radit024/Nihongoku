import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Surface,
  Text,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "@/constants/fonts";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { api, ApiMaterial } from "@/lib/api";

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

  const myMaterials = materials.filter((m) => m.createdById === user?.id);

  const uploadFile = async (file: { uri: string; name: string; type: string }) => {
    if (!user) return;
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadStatus("Mengunggah dan memproses dengan AI...");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await api.uploadMaterial(user.id, file);
      setUploadStatus(`\"${result.title}\" berhasil dibuat dengan ${result.questionCount} soal.`);
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

  const handleDelete = async (materialId: string, title: string) => {
    if (!user) return;

    const doDelete = () => {
      api.deleteMaterial(user.id, materialId)
        .then(() => refreshMaterials())
        .catch((err) => Alert.alert("Error", err.message));
    };

    if (Platform.OS === "web") {
      if (confirm(`Hapus materi \"${title}\"?`)) doDelete();
      return;
    }

    Alert.alert("Hapus Materi", `Hapus \"${title}\" dan semua soal kuisnya?`, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: doDelete },
    ]);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 20,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
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
      opacity: 0.84,
      marginTop: 4,
    },
    content: {
      padding: 16,
      paddingBottom: 120,
      gap: 12,
    },
    uploadActions: {
      flexDirection: "row",
      gap: 10,
    },
    actionCard: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: "#FFFDFB",
    },
    actionTitle: {
      fontFamily: fonts.bold,
      fontSize: 14,
      color: colors.foreground,
      marginBottom: 8,
    },
    sectionTitle: {
      fontFamily: fonts.extraBold,
      fontSize: 18,
      color: colors.foreground,
      marginTop: 6,
      marginBottom: 4,
    },
    statusCard: {
      borderRadius: 16,
      backgroundColor: uploadSuccess ? "#ECFDF5" : "#EFF6FF",
      borderWidth: 1,
      borderColor: uploadSuccess ? "#A7F3D0" : "#BFDBFE",
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    statusText: {
      flex: 1,
      fontFamily: fonts.semiBold,
      fontSize: 13,
      color: colors.foreground,
      lineHeight: 19,
    },
    materialCard: {
      borderRadius: 16,
      backgroundColor: "#FFFDFB",
      marginBottom: 10,
    },
    materialRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },
    materialTitle: {
      flex: 1,
      fontFamily: fonts.extraBold,
      fontSize: 15,
      color: colors.foreground,
      lineHeight: 21,
    },
    materialMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 10,
    },
    metaText: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.mutedForeground,
    },
    emptyBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
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
        <Text style={styles.headerSub}>Unggah PDF atau foto, AI akan menyiapkan materi dan kuis otomatis.</Text>
      </View>

      <FlatList
        data={myMaterials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Surface style={{ borderRadius: 16, padding: 12, backgroundColor: "#FFFDFB" }} elevation={1}>
              <View style={styles.uploadActions}>
                <Card style={styles.actionCard} mode="outlined">
                  <Card.Content>
                    <Text style={styles.actionTitle}>Dokumen PDF</Text>
                    <Button
                      mode="contained-tonal"
                      icon="file-document-outline"
                      onPress={pickDocument}
                      disabled={isUploading}
                      contentStyle={{ height: 42 }}
                      labelStyle={{ fontFamily: fonts.bold }}
                    >
                      Pilih File
                    </Button>
                  </Card.Content>
                </Card>

                <Card style={styles.actionCard} mode="outlined">
                  <Card.Content>
                    <Text style={styles.actionTitle}>Foto Materi</Text>
                    <Button
                      mode="contained-tonal"
                      icon="camera-outline"
                      onPress={pickImage}
                      disabled={isUploading}
                      contentStyle={{ height: 42 }}
                      labelStyle={{ fontFamily: fonts.bold }}
                    >
                      Pilih Foto
                    </Button>
                  </Card.Content>
                </Card>
              </View>
            </Surface>

            {(isUploading || uploadStatus) && (
              <Card style={styles.statusCard} mode="contained">
                <Card.Content>
                  <View style={styles.statusRow}>
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                      <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    )}
                    <Text style={styles.statusText}>
                      {isUploading
                        ? "Memproses materi dengan AI. Tunggu sekitar 30-60 detik."
                        : uploadStatus}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            <Text style={styles.sectionTitle}>Materi Saya ({myMaterials.length})</Text>
          </>
        }
        renderItem={({ item }: { item: ApiMaterial }) => {
          const catColor = CATEGORY_COLORS[item.category] || colors.primary;
          return (
            <Card style={styles.materialCard} mode="elevated">
              <Card.Content>
                <View style={styles.materialRow}>
                  <Text style={styles.materialTitle} numberOfLines={2}>{item.title}</Text>
                  <IconButton
                    icon="trash-can-outline"
                    size={18}
                    iconColor={colors.destructive}
                    onPress={() => handleDelete(item.id, item.title)}
                  />
                </View>
                <View style={styles.materialMeta}>
                  <Chip
                    compact
                    style={{ backgroundColor: `${catColor}22` }}
                    textStyle={{ color: catColor, fontFamily: fonts.bold }}
                  >
                    {item.category}
                  </Chip>
                  <Text style={styles.metaText}>{item.questionCount} soal</Text>
                </View>
              </Card.Content>
            </Card>
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
