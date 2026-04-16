import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { api, ApiMaterial, QuizResult } from "@/lib/api";
import { fonts } from "@/constants/fonts";

type Phase = "lesson" | "quiz" | "result";

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, refreshProgress, refreshQuizHistory } = useAppContext();

  const [material, setMaterial] = useState<ApiMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [phase, setPhase] = useState<Phase>("lesson");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    api.getMaterial(user.id, id)
      .then(m => {
        setMaterial(m);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, user]);

  const questions = material?.questions ?? [];
  const question = questions[currentQ];
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleSelectAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelectedAnswer(idx);
    setShowFeedback(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (!user || !id) return;
    setSubmitting(true);
    try {
      const result = await api.submitQuiz(user.id, id, answers);
      setQuizResult(result);
      setPhase("result");
      await refreshProgress();
      await refreshQuizHistory();
      Haptics.notificationAsync(
        result.passed
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 10,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    topTitle: {
      flex: 1,
      fontSize: 16,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      textAlign: "center",
      marginRight: 36,
    },
    scroll: { padding: 20, paddingBottom: 100 },

    lessonCategoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      marginBottom: 12,
    },
    lessonCategoryText: {
      fontSize: 12,
      fontFamily: fonts.bold,
    },
    lessonTitle: {
      fontSize: 24,
      fontFamily: fonts.black,
      color: colors.foreground,
      marginBottom: 16,
      lineHeight: 32,
    },
    lessonContentBox: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    lessonContent: {
      fontSize: 15,
      fontFamily: fonts.regular,
      color: colors.foreground,
      lineHeight: 26,
    },
    startBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 10,
    },
    startBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: fonts.extraBold,
    },

    progressContainer: {
      marginBottom: 20,
    },
    progressTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 13,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
    },
    progressCount: {
      fontSize: 13,
      fontFamily: fonts.extraBold,
      color: colors.primary,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },

    questionCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    questionText: {
      fontSize: 18,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      lineHeight: 28,
    },

    optionBtn: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    optionCorrect: {
      borderColor: "#059669",
      backgroundColor: "#ECFDF5",
    },
    optionWrong: {
      borderColor: "#C0272D",
      backgroundColor: "#FFF0F0",
    },
    optionLetter: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    optionLetterCorrect: { backgroundColor: "#059669" },
    optionLetterWrong: { backgroundColor: "#C0272D" },
    optionLetterText: {
      fontSize: 13,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    optionLetterTextActive: { color: "#fff" },
    optionText: {
      flex: 1,
      fontSize: 15,
      fontFamily: fonts.semiBold,
      color: colors.foreground,
    },

    explanationBox: {
      backgroundColor: "#FFFBEB",
      borderRadius: 16,
      padding: 16,
      marginTop: 4,
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: "#D97706",
    },
    explanationLabel: {
      fontSize: 11,
      fontFamily: fonts.bold,
      color: "#D97706",
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    explanationText: {
      fontSize: 14,
      fontFamily: fonts.regular,
      color: colors.foreground,
      lineHeight: 21,
    },
    nextBtn: {
      backgroundColor: colors.primary,
      borderRadius: 18,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
    nextBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: fonts.extraBold,
    },

    resultHeaderBox: {
      alignItems: "center",
      padding: 28,
      backgroundColor: colors.card,
      borderRadius: 28,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
    },
    resultIconBg: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    resultTitle: {
      fontSize: 26,
      fontFamily: fonts.black,
      color: colors.foreground,
      marginBottom: 6,
    },
    resultScore: {
      fontSize: 52,
      fontFamily: fonts.black,
      color: colors.primary,
    },
    resultScoreLabel: {
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
    },
    resultSub: {
      fontSize: 14,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },

    resultStatsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    resultStatCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    resultStatVal: {
      fontSize: 22,
      fontFamily: fonts.black,
      color: colors.foreground,
    },
    resultStatLabel: {
      fontSize: 11,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      marginTop: 3,
    },

    doneBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 10,
    },
    doneBtnText: {
      color: colors.primaryForeground,
      fontSize: 17,
      fontFamily: fonts.extraBold,
    },

    errorText: {
      fontSize: 14,
      fontFamily: fonts.semiBold,
      color: colors.destructive,
      textAlign: "center",
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Memuat materi...</Text>
      </View>
    );
  }

  if (error || !material) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={styles.errorText}>{error || "Materi tidak ditemukan"}</Text>
        <Pressable style={[styles.nextBtn, { width: 200 }]} onPress={() => router.back()}>
          <Text style={styles.nextBtnText}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const categoryColor = {
    "Tata Bahasa": "#C0272D",
    "Kosakata": "#059669",
    "Kanji": "#7C3AED",
    "Percakapan": "#2563EB",
    "Budaya": "#D97706",
  }[material.category] || colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {phase === "lesson" ? "Baca Materi" : phase === "quiz" ? `Soal ${currentQ + 1}/${questions.length}` : "Hasil Kuis"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {phase === "lesson" && (
          <>
            <View style={[styles.lessonCategoryBadge, { backgroundColor: categoryColor + "18" }]}>
              <Text style={[styles.lessonCategoryText, { color: categoryColor }]}>{material.category}</Text>
            </View>
            <Text style={styles.lessonTitle}>{material.title}</Text>
            <View style={styles.lessonContentBox}>
              <Text style={styles.lessonContent}>{material.lessonContent}</Text>
            </View>
            <Pressable style={styles.startBtn} onPress={() => setPhase("quiz")}>
              <Ionicons name="play-circle" size={22} color={colors.primaryForeground} />
              <Text style={styles.startBtnText}>Mulai Kuis ({questions.length} Soal)</Text>
            </Pressable>
          </>
        )}

        {phase === "quiz" && question && (
          <>
            <View style={styles.progressContainer}>
              <View style={styles.progressTop}>
                <Text style={styles.progressLabel}>Soal {currentQ + 1} dari {questions.length}</Text>
                <Text style={styles.progressCount}>{Math.round(((currentQ + 1) / questions.length) * 100)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
              </View>
            </View>

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>

            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === question.correctAnswer;
              let optStyle = {};
              let letterStyle = {};
              let letterTextStyle = {};
              if (showFeedback) {
                if (isCorrect) {
                  optStyle = styles.optionCorrect;
                  letterStyle = styles.optionLetterCorrect;
                  letterTextStyle = styles.optionLetterTextActive;
                } else if (isSelected && !isCorrect) {
                  optStyle = styles.optionWrong;
                  letterStyle = styles.optionLetterWrong;
                  letterTextStyle = styles.optionLetterTextActive;
                }
              }

              return (
                <Pressable
                  key={idx}
                  style={[styles.optionBtn, optStyle]}
                  onPress={() => handleSelectAnswer(idx)}
                  disabled={showFeedback}
                >
                  <View style={[styles.optionLetter, letterStyle]}>
                    <Text style={[styles.optionLetterText, letterTextStyle]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
                  {showFeedback && isCorrect && <Ionicons name="checkmark-circle" size={22} color="#059669" />}
                  {showFeedback && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color="#C0272D" />}
                </Pressable>
              );
            })}

            {showFeedback && question.explanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>PENJELASAN</Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>
            )}

            {showFeedback && (
              <Pressable style={styles.nextBtn} onPress={handleNext} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={styles.nextBtnText}>
                    {currentQ < questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil"}
                  </Text>
                )}
              </Pressable>
            )}
          </>
        )}

        {phase === "result" && quizResult && (
          <>
            <View style={styles.resultHeaderBox}>
              <View style={[styles.resultIconBg, { backgroundColor: quizResult.passed ? "#ECFDF5" : "#FFF0F0" }]}>
                <Ionicons
                  name={quizResult.passed ? "trophy" : "refresh-circle"}
                  size={48}
                  color={quizResult.passed ? "#059669" : colors.primary}
                />
              </View>
              <Text style={styles.resultTitle}>
                {quizResult.passed ? "Selamat!" : "Hampir!"}
              </Text>
              <Text style={styles.resultScore}>{quizResult.score}/{quizResult.total}</Text>
              <Text style={styles.resultScoreLabel}>Jawaban Benar</Text>
              <Text style={styles.resultSub}>
                {quizResult.passed
                  ? "Kamu berhasil lulus kuis ini"
                  : "Pelajari lagi dan coba lebih baik"}
              </Text>
            </View>

            <View style={styles.resultStatsRow}>
              <View style={styles.resultStatCard}>
                <Text style={[styles.resultStatVal, { color: "#D97706" }]}>+{quizResult.xpEarned}</Text>
                <Text style={styles.resultStatLabel}>XP Didapat</Text>
              </View>
              <View style={styles.resultStatCard}>
                <Text style={[styles.resultStatVal, { color: quizResult.passed ? "#059669" : colors.primary }]}>
                  {Math.round((quizResult.score / quizResult.total) * 100)}%
                </Text>
                <Text style={styles.resultStatLabel}>Skor</Text>
              </View>
              <View style={styles.resultStatCard}>
                <Text style={[styles.resultStatVal, { color: quizResult.passed ? "#059669" : colors.primary }]}>
                  {quizResult.passed ? "Lulus" : "Coba Lagi"}
                </Text>
                <Text style={styles.resultStatLabel}>Status</Text>
              </View>
            </View>

            <Pressable style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>Kembali ke Kuis</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
