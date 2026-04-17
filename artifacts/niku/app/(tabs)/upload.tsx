import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { api, ApiMaterial, EditableQuizQuestionInput } from "@/lib/api";
import { fonts } from "@/constants/fonts";

const CATEGORY_COLORS: Record<string, string> = {
  "Tata Bahasa": "#C0272D",
  "Kosakata": "#059669",
  "Kanji": "#7C3AED",
  "Percakapan": "#2563EB",
  "Budaya": "#D97706",
};

interface EditableQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function createBlankQuestion(): EditableQuestion {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  };
}

function normalizeQuestionOptions(options: string[] | undefined): string[] {
  const next = Array.isArray(options) ? [...options.slice(0, 4)] : [];
  while (next.length < 4) {
    next.push("");
  }
  return next;
}

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, materials, refreshMaterials } = useAppContext();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [publishingMaterialId, setPublishingMaterialId] = useState<string | null>(null);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorRegenerating, setEditorRegenerating] = useState(false);
  const [editorPublishing, setEditorPublishing] = useState(false);
  const [editorMaterial, setEditorMaterial] = useState<ApiMaterial | null>(null);
  const [editorQuestions, setEditorQuestions] = useState<EditableQuestion[]>([]);

  useEffect(() => {
    refreshMaterials();
  }, []);

  const myMaterials = materials.filter(m => m.createdById === user?.id);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "image/*",
        ],
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
    if (!user.classCode) {
      Alert.alert("Kode kelas belum ada", "Buat kode kelas dulu di tab Profil sebelum upload materi.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadStatus("Mengunggah dan memproses dengan AI...");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await api.uploadMaterial(user.id, file);
      setUploadStatus(`"${result.title}" berhasil dibuat sebagai draft. Edit soal lalu publish untuk mahasiswa.`);
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

  const loadEditorMaterial = async (materialId: string) => {
    if (!user) return;
    setEditorLoading(true);
    try {
      const material = await api.getMaterial(user.id, materialId);
      const mappedQuestions = (material.questions || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: normalizeQuestionOptions(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
      }));

      setEditorMaterial(material);
      setEditorQuestions(mappedQuestions.length > 0 ? mappedQuestions : [createBlankQuestion()]);
      setEditorVisible(true);
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Tidak bisa membuka editor kuis");
    } finally {
      setEditorLoading(false);
    }
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditorMaterial(null);
    setEditorQuestions([]);
  };

  const updateQuestion = (questionId: string, updater: (current: EditableQuestion) => EditableQuestion) => {
    setEditorQuestions((prev) => prev.map((q) => (q.id === questionId ? updater(q) : q)));
  };

  const moveQuestion = (fromIndex: number, direction: -1 | 1) => {
    setEditorQuestions((prev) => {
      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [picked] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, picked);
      return next;
    });
  };

  const removeQuestion = (questionId: string) => {
    setEditorQuestions((prev) => {
      if (prev.length <= 1) {
        Alert.alert("Info", "Minimal harus ada satu soal");
        return prev;
      }
      return prev.filter((q) => q.id !== questionId);
    });
  };

  const validateQuestions = (): EditableQuizQuestionInput[] | null => {
    const normalized: EditableQuizQuestionInput[] = [];

    for (let i = 0; i < editorQuestions.length; i++) {
      const q = editorQuestions[i];
      const questionText = q.question.trim();
      if (!questionText) {
        Alert.alert("Validasi", `Soal #${i + 1} masih kosong`);
        return null;
      }

      const optionValues = normalizeQuestionOptions(q.options).map((option) => option.trim());
      const hasEmptyOption = optionValues.some((option) => !option);
      if (hasEmptyOption) {
        Alert.alert("Validasi", `Semua opsi pada soal #${i + 1} harus diisi`);
        return null;
      }

      const correctAnswer = Number.isInteger(q.correctAnswer)
        ? Math.min(Math.max(q.correctAnswer, 0), 3)
        : 0;

      normalized.push({
        question: questionText,
        options: optionValues,
        correctAnswer,
        explanation: q.explanation.trim(),
      });
    }

    return normalized;
  };

  const saveQuizEdits = async () => {
    if (!user || !editorMaterial) return;
    const payload = validateQuestions();
    if (!payload) return;

    setEditorSaving(true);
    try {
      const result = await api.updateMaterialQuestions(user.id, editorMaterial.id, payload);
      setEditorMaterial((prev) => (prev ? { ...prev, questionCount: result.questionCount, isPublished: result.isPublished } : prev));
      await refreshMaterials();
      Alert.alert("Berhasil", "Perubahan kuis tersimpan. Status kembali ke draft.");
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Tidak bisa menyimpan perubahan kuis");
    } finally {
      setEditorSaving(false);
    }
  };

  const regenerateQuizWithAI = async () => {
    if (!user || !editorMaterial) return;

    const proceed = Platform.OS === "web"
      ? confirm("Regenerasi akan mengganti semua soal saat ini. Lanjut?")
      : true;
    if (!proceed) return;

    setEditorRegenerating(true);
    try {
      await api.regenerateMaterialQuiz(user.id, editorMaterial.id);
      await loadEditorMaterial(editorMaterial.id);
      await refreshMaterials();
      Alert.alert("Berhasil", "Soal baru sudah dibuat oleh AI. Review lalu publish.");
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Tidak bisa regenerasi kuis");
    } finally {
      setEditorRegenerating(false);
    }
  };

  const setPublishState = async (material: ApiMaterial, published: boolean) => {
    if (!user) return;

    setPublishingMaterialId(material.id);
    try {
      await api.setMaterialPublishState(user.id, material.id, published);
      await refreshMaterials();
      if (editorMaterial?.id === material.id) {
        setEditorMaterial((prev) => (prev ? { ...prev, isPublished: published } : prev));
      }
      Alert.alert("Berhasil", published ? "Materi dipublikasikan untuk mahasiswa" : "Materi dikembalikan ke draft");
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Tidak bisa mengubah status publikasi");
    } finally {
      setPublishingMaterialId(null);
    }
  };

  const togglePublishFromEditor = async () => {
    if (!editorMaterial || !user) return;
    setEditorPublishing(true);
    try {
      await setPublishState(editorMaterial, !(editorMaterial.isPublished ?? false));
    } finally {
      setEditorPublishing(false);
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
      flexWrap: "wrap",
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
    statusDraftBadge: {
      backgroundColor: "#FFF8E9",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusDraftText: {
      fontSize: 11,
      fontFamily: fonts.bold,
      color: "#D97706",
    },
    statusPublishedBadge: {
      backgroundColor: "#ECFDF5",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusPublishedText: {
      fontSize: 11,
      fontFamily: fonts.bold,
      color: "#059669",
    },
    actionRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    actionBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 9,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    actionBtnText: {
      fontSize: 12,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    actionBtnPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionBtnPrimaryText: {
      color: colors.primaryForeground,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    modalPanel: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
      paddingBottom: insets.bottom + 10,
    },
    modalHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 8,
    },
    modalTitle: {
      fontSize: 17,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
    },
    modalSub: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
    },
    modalHeaderActions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 2,
    },
    modalHeaderBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      flexDirection: "row",
      gap: 6,
    },
    modalHeaderBtnText: {
      fontSize: 12,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    modalHeaderBtnPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modalHeaderBtnPrimaryText: {
      color: colors.primaryForeground,
    },
    modalBody: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      gap: 12,
    },
    questionCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 12,
      gap: 10,
    },
    questionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    questionTitle: {
      fontSize: 13,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
    },
    questionHeaderActions: {
      flexDirection: "row",
      gap: 6,
    },
    iconActionBtn: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputLabel: {
      fontSize: 11,
      fontFamily: fonts.bold,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    input: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 10,
      fontSize: 13,
      fontFamily: fonts.regular,
      color: colors.foreground,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    optionMarker: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.border,
    },
    optionMarkerActive: {
      backgroundColor: colors.primary,
    },
    optionMarkerText: {
      fontSize: 12,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    optionMarkerTextActive: {
      color: colors.primaryForeground,
    },
    optionInput: {
      flex: 1,
    },
    addQuestionBtn: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
      backgroundColor: "#FFF6F6",
    },
    addQuestionText: {
      fontSize: 13,
      fontFamily: fonts.bold,
      color: colors.primary,
    },
    modalFooter: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    footerBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    footerBtnText: {
      fontSize: 14,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    footerPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    footerPrimaryText: {
      color: colors.primaryForeground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Materi</Text>
        <Text style={styles.headerSub}>Unggah PDF, PPT, Word, atau foto. Edit soal, lalu publish ke mahasiswa.</Text>
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
                <Text style={styles.uploadBtnText}>Upload Dokumen</Text>
                <Text style={styles.uploadBtnSub}>PDF, PPT, DOC</Text>
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
          const isPublished = item.isPublished ?? false;
          const isPublishing = publishingMaterialId === item.id;

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
                <View style={isPublished ? styles.statusPublishedBadge : styles.statusDraftBadge}>
                  <Text style={isPublished ? styles.statusPublishedText : styles.statusDraftText}>
                    {isPublished ? "Published" : "Draft"}
                  </Text>
                </View>
                {item.sourceFileName ? (
                  <Text style={styles.metaText} numberOfLines={1}>{item.sourceFileName}</Text>
                ) : null}
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => loadEditorMaterial(item.id)}
                  disabled={editorLoading}
                >
                  <Ionicons name="create-outline" size={14} color={colors.foreground} />
                  <Text style={styles.actionBtnText}>Atur Kuis</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, !isPublished && styles.actionBtnPrimary, isPublishing && { opacity: 0.7 }]}
                  onPress={() => setPublishState(item, !isPublished)}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <ActivityIndicator color={!isPublished ? colors.primaryForeground : colors.foreground} size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name={isPublished ? "eye-off-outline" : "send-outline"}
                        size={14}
                        color={!isPublished ? colors.primaryForeground : colors.foreground}
                      />
                      <Text style={[styles.actionBtnText, !isPublished && styles.actionBtnPrimaryText]}>
                        {isPublished ? "Unpublish" : "Publish"}
                      </Text>
                    </>
                  )}
                </Pressable>
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

      <Modal visible={editorVisible} animationType="slide" transparent onRequestClose={closeEditor}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{editorMaterial?.title || "Editor Kuis"}</Text>
              <Text style={styles.modalSub}>Edit, tambah, urutkan soal. Publish setelah siap.</Text>

              <View style={styles.modalHeaderActions}>
                <Pressable
                  style={styles.modalHeaderBtn}
                  onPress={regenerateQuizWithAI}
                  disabled={editorRegenerating || editorSaving || editorLoading}
                >
                  {editorRegenerating ? (
                    <ActivityIndicator color={colors.foreground} size="small" />
                  ) : (
                    <>
                      <Ionicons name="sparkles-outline" size={14} color={colors.foreground} />
                      <Text style={styles.modalHeaderBtnText}>Generate AI</Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={[styles.modalHeaderBtn, !(editorMaterial?.isPublished ?? false) && styles.modalHeaderBtnPrimary]}
                  onPress={togglePublishFromEditor}
                  disabled={editorPublishing || editorSaving || editorLoading}
                >
                  {editorPublishing ? (
                    <ActivityIndicator color={!(editorMaterial?.isPublished ?? false) ? colors.primaryForeground : colors.foreground} size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name={(editorMaterial?.isPublished ?? false) ? "eye-off-outline" : "send-outline"}
                        size={14}
                        color={!(editorMaterial?.isPublished ?? false) ? colors.primaryForeground : colors.foreground}
                      />
                      <Text style={[styles.modalHeaderBtnText, !(editorMaterial?.isPublished ?? false) && styles.modalHeaderBtnPrimaryText]}>
                        {(editorMaterial?.isPublished ?? false) ? "Unpublish" : "Publish"}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {editorLoading ? (
              <View style={{ padding: 20, alignItems: "center", gap: 10 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.metaText}>Memuat soal kuis...</Text>
              </View>
            ) : (
              <>
                <ScrollView style={{ maxHeight: "72%" }} contentContainerStyle={styles.modalBody}>
                  {editorQuestions.map((question, index) => (
                    <View key={question.id} style={styles.questionCard}>
                      <View style={styles.questionHeader}>
                        <Text style={styles.questionTitle}>Soal #{index + 1}</Text>
                        <View style={styles.questionHeaderActions}>
                          <Pressable style={styles.iconActionBtn} onPress={() => moveQuestion(index, -1)}>
                            <Ionicons name="arrow-up" size={14} color={colors.foreground} />
                          </Pressable>
                          <Pressable style={styles.iconActionBtn} onPress={() => moveQuestion(index, 1)}>
                            <Ionicons name="arrow-down" size={14} color={colors.foreground} />
                          </Pressable>
                          <Pressable style={styles.iconActionBtn} onPress={() => removeQuestion(question.id)}>
                            <Ionicons name="trash-outline" size={14} color={colors.destructive} />
                          </Pressable>
                        </View>
                      </View>

                      <View>
                        <Text style={styles.inputLabel}>Pertanyaan</Text>
                        <TextInput
                          style={styles.input}
                          value={question.question}
                          onChangeText={(value) => updateQuestion(question.id, (current) => ({ ...current, question: value }))}
                          placeholder="Tulis pertanyaan"
                          placeholderTextColor={colors.mutedForeground}
                          multiline
                        />
                      </View>

                      {normalizeQuestionOptions(question.options).map((option, optionIndex) => (
                        <View key={`${question.id}-${optionIndex}`}>
                          <Text style={styles.inputLabel}>Opsi {String.fromCharCode(65 + optionIndex)}</Text>
                          <View style={styles.optionRow}>
                            <Pressable
                              style={[
                                styles.optionMarker,
                                question.correctAnswer === optionIndex && styles.optionMarkerActive,
                              ]}
                              onPress={() => updateQuestion(question.id, (current) => ({ ...current, correctAnswer: optionIndex }))}
                            >
                              <Text
                                style={[
                                  styles.optionMarkerText,
                                  question.correctAnswer === optionIndex && styles.optionMarkerTextActive,
                                ]}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </Text>
                            </Pressable>

                            <TextInput
                              style={[styles.input, styles.optionInput]}
                              value={option}
                              onChangeText={(value) =>
                                updateQuestion(question.id, (current) => {
                                  const nextOptions = normalizeQuestionOptions(current.options);
                                  nextOptions[optionIndex] = value;
                                  return { ...current, options: nextOptions };
                                })
                              }
                              placeholder={`Isi opsi ${String.fromCharCode(65 + optionIndex)}`}
                              placeholderTextColor={colors.mutedForeground}
                            />
                          </View>
                        </View>
                      ))}

                      <View>
                        <Text style={styles.inputLabel}>Penjelasan</Text>
                        <TextInput
                          style={styles.input}
                          value={question.explanation}
                          onChangeText={(value) => updateQuestion(question.id, (current) => ({ ...current, explanation: value }))}
                          placeholder="Penjelasan jawaban (opsional)"
                          placeholderTextColor={colors.mutedForeground}
                          multiline
                        />
                      </View>
                    </View>
                  ))}

                  <Pressable
                    style={styles.addQuestionBtn}
                    onPress={() => setEditorQuestions((prev) => [...prev, createBlankQuestion()])}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                    <Text style={styles.addQuestionText}>Tambah Soal</Text>
                  </Pressable>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Pressable style={styles.footerBtn} onPress={closeEditor}>
                    <Text style={styles.footerBtnText}>Tutup</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.footerBtn, styles.footerPrimary]}
                    onPress={saveQuizEdits}
                    disabled={editorSaving || editorLoading}
                  >
                    {editorSaving ? (
                      <ActivityIndicator color={colors.primaryForeground} size="small" />
                    ) : (
                      <Text style={[styles.footerBtnText, styles.footerPrimaryText]}>Simpan Perubahan</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
