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
import { api, ApiMaterial, ApiQuestion, QuizResult } from "@/lib/api";

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
    if (!id) return;
    api.getMaterial(id)
      .then(m => {
        setMaterial(m);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

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
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { padding: 8 },
    topTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      textAlign: "center",
      marginRight: 36,
    },
    scroll: { padding: 20, paddingBottom: 100 },
    lessonTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      marginBottom: 8,
    },
    categoryBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 16,
    },
    categoryText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600" as const,
    },
    lessonContent: {
      fontSize: 15,
      color: colors.foreground,
      lineHeight: 24,
      marginBottom: 24,
    },
    startBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    startBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700" as const,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: 20,
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    questionNum: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    questionText: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 20,
      lineHeight: 26,
    },
    optionBtn: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    optionCorrect: {
      borderColor: "#2D6A4F",
      backgroundColor: "#2D6A4F10",
    },
    optionWrong: {
      borderColor: "#C0272D",
      backgroundColor: "#C0272D10",
    },
    optionLetter: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    optionLetterText: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    optionText: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
    },
    explanationBox: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 14,
      marginTop: 8,
      marginBottom: 16,
    },
    explanationText: {
      fontSize: 13,
      color: colors.foreground,
      lineHeight: 20,
    },
    nextBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    nextBtnText: {
      color: colors.primaryForeground,
      fontSize: 15,
      fontWeight: "700" as const,
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultIcon: {
      marginBottom: 16,
    },
    resultTitle: {
      fontSize: 24,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      marginBottom: 8,
    },
    resultScore: {
      fontSize: 40,
      fontWeight: "800" as const,
      color: colors.primary,
    },
    resultSub: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    resultRow: {
      flexDirection: "row",
      gap: 16,
      marginTop: 20,
    },
    resultStat: {
      alignItems: "center",
    },
    resultStatVal: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    resultStatLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    doneBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    doneBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700" as const,
    },
    errorText: {
      fontSize: 14,
      color: colors.destructive,
      textAlign: "center",
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !material) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || "Materi tidak ditemukan"}</Text>
        <Pressable style={[styles.nextBtn, { marginTop: 16, width: 200 }]} onPress={() => router.back()}>
          <Text style={styles.nextBtnText}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {phase === "lesson" ? material.title : phase === "quiz" ? `Soal ${currentQ + 1}/${questions.length}` : "Hasil"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {phase === "lesson" && (
          <>
            <Text style={styles.lessonTitle}>{material.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{material.category}</Text>
            </View>
            <Text style={styles.lessonContent}>{material.lessonContent}</Text>
            <Pressable style={styles.startBtn} onPress={() => setPhase("quiz")}>
              <Text style={styles.startBtnText}>Mulai Kuis ({questions.length} Soal)</Text>
            </Pressable>
          </>
        )}

        {phase === "quiz" && question && (
          <>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
            </View>
            <Text style={styles.questionNum}>Soal {currentQ + 1} dari {questions.length}</Text>
            <Text style={styles.questionText}>{question.question}</Text>

            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === question.correctAnswer;
              let optStyle = {};
              if (showFeedback) {
                if (isCorrect) optStyle = styles.optionCorrect;
                else if (isSelected && !isCorrect) optStyle = styles.optionWrong;
              }

              return (
                <Pressable
                  key={idx}
                  style={[styles.optionBtn, optStyle]}
                  onPress={() => handleSelectAnswer(idx)}
                  disabled={showFeedback}
                >
                  <View style={[styles.optionLetter, showFeedback && isCorrect && { backgroundColor: "#2D6A4F" }, showFeedback && isSelected && !isCorrect && { backgroundColor: "#C0272D" }]}>
                    <Text style={[styles.optionLetterText, showFeedback && (isCorrect || (isSelected && !isCorrect)) && { color: "#fff" }]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
                  {showFeedback && isCorrect && <Ionicons name="checkmark-circle" size={20} color="#2D6A4F" />}
                  {showFeedback && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color="#C0272D" />}
                </Pressable>
              );
            })}

            {showFeedback && question.explanation && (
              <View style={styles.explanationBox}>
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
            <View style={styles.resultCard}>
              <Ionicons
                name={quizResult.passed ? "trophy" : "refresh-circle"}
                size={56}
                color={quizResult.passed ? "#C9A882" : colors.primary}
                style={styles.resultIcon}
              />
              <Text style={styles.resultTitle}>
                {quizResult.passed ? "Lulus!" : "Belum Lulus"}
              </Text>
              <Text style={styles.resultScore}>{quizResult.score}/{quizResult.total}</Text>
              <Text style={styles.resultSub}>
                {quizResult.passed ? "Kamu berhasil menyelesaikan kuis ini" : "Coba lagi untuk mendapat skor lebih tinggi"}
              </Text>
              <View style={styles.resultRow}>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatVal}>+{quizResult.xpEarned}</Text>
                  <Text style={styles.resultStatLabel}>XP</Text>
                </View>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatVal}>{Math.round((quizResult.score / quizResult.total) * 100)}%</Text>
                  <Text style={styles.resultStatLabel}>Skor</Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>Kembali</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
