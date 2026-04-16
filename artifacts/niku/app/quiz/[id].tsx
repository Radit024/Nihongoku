import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  ProgressBar,
  Surface,
  Text,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "@/constants/fonts";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { api, ApiMaterial, QuizResult } from "@/lib/api";

type Phase = "lesson" | "quiz" | "result";

const CATEGORY_COLORS: Record<string, string> = {
  "Tata Bahasa": "#C0272D",
  "Kosakata": "#059669",
  "Kanji": "#7C3AED",
  "Percakapan": "#2563EB",
  "Budaya": "#D97706",
};

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
      .then((m) => {
        setMaterial(m);
        setLoading(false);
      })
      .catch((err) => {
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
      setCurrentQ((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      return;
    }
    submitQuiz();
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
          : Haptics.NotificationFeedbackType.Warning,
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
    appbar: {
      marginTop: topPad,
      backgroundColor: colors.background,
    },
    title: {
      fontFamily: fonts.extraBold,
      fontSize: 17,
      color: colors.foreground,
    },
    scroll: { padding: 16, paddingBottom: 110, gap: 10 },
    card: {
      borderRadius: 18,
      backgroundColor: "#FFFDFB",
    },
    lessonTitle: {
      fontFamily: fonts.black,
      fontSize: 24,
      color: colors.foreground,
      marginTop: 8,
      marginBottom: 10,
    },
    lessonContent: {
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: 24,
      color: colors.foreground,
    },
    progressLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    progressLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.mutedForeground,
    },
    progressValue: {
      fontFamily: fonts.bold,
      fontSize: 12,
      color: colors.primary,
    },
    questionText: {
      fontFamily: fonts.extraBold,
      fontSize: 18,
      color: colors.foreground,
      lineHeight: 27,
    },
    optionButton: {
      justifyContent: "flex-start",
      borderRadius: 14,
      marginBottom: 8,
    },
    optionContent: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingVertical: 8,
      minHeight: 48,
    },
    optionLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
    },
    explainCard: {
      borderRadius: 14,
      backgroundColor: "#FFFBEB",
      borderLeftWidth: 3,
      borderLeftColor: "#D97706",
    },
    explainTitle: {
      fontFamily: fonts.bold,
      fontSize: 11,
      color: "#D97706",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    explainText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 21,
    },
    resultTitle: {
      fontFamily: fonts.black,
      fontSize: 28,
      color: colors.foreground,
      marginTop: 10,
    },
    resultScore: {
      fontFamily: fonts.black,
      fontSize: 48,
      color: colors.primary,
    },
    resultSub: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
    },
    statsRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 2,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: "#FFFDFB",
    },
    statValue: {
      fontFamily: fonts.black,
      fontSize: 22,
      color: colors.foreground,
    },
    statLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      color: colors.mutedForeground,
    },
    errorText: {
      fontFamily: fonts.semiBold,
      color: colors.destructive,
      textAlign: "center",
    },
  });

  const screenTitle =
    phase === "lesson"
      ? "Baca Materi"
      : phase === "quiz"
        ? `Soal ${currentQ + 1}/${questions.length}`
        : "Hasil Kuis";

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ fontFamily: fonts.semiBold, color: colors.mutedForeground }}>Memuat materi...</Text>
      </View>
    );
  }

  if (error || !material) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={styles.errorText}>{error || "Materi tidak ditemukan"}</Text>
        <Button mode="contained" onPress={() => router.back()}>Kembali</Button>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[material.category] || colors.primary;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} mode="small">
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={screenTitle} titleStyle={styles.title} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {phase === "lesson" && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Chip compact style={{ alignSelf: "flex-start", backgroundColor: `${categoryColor}22` }} textStyle={{ color: categoryColor, fontFamily: fonts.bold }}>
                {material.category}
              </Chip>
              <Text style={styles.lessonTitle}>{material.title}</Text>
              <Text style={styles.lessonContent}>{material.lessonContent}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="play-circle-outline"
                onPress={() => setPhase("quiz")}
                labelStyle={{ fontFamily: fonts.bold }}
              >
                Mulai Kuis ({questions.length} Soal)
              </Button>
            </Card.Actions>
          </Card>
        )}

        {phase === "quiz" && question && (
          <>
            <Surface style={{ borderRadius: 14, padding: 12, backgroundColor: "#FFFDFB" }} elevation={1}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Soal {currentQ + 1} dari {questions.length}</Text>
                <Text style={styles.progressValue}>{Math.round(((currentQ + 1) / questions.length) * 100)}%</Text>
              </View>
              <ProgressBar progress={(currentQ + 1) / questions.length} color={colors.primary} />
            </Surface>

            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text style={styles.questionText}>{question.question}</Text>
              </Card.Content>
            </Card>

            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === question.correctAnswer;

              const optionMode = showFeedback
                ? isCorrect
                  ? "contained"
                  : isSelected
                    ? "contained"
                    : "outlined"
                : "outlined";

              const buttonColor = showFeedback
                ? isCorrect
                  ? "#059669"
                  : isSelected
                    ? "#C0272D"
                    : undefined
                : undefined;

              return (
                <Button
                  key={idx}
                  mode={optionMode}
                  style={styles.optionButton}
                  contentStyle={styles.optionContent}
                  labelStyle={[
                    styles.optionLabel,
                    { color: showFeedback && (isCorrect || isSelected) ? "#FFFFFF" : colors.foreground },
                  ]}
                  buttonColor={buttonColor}
                  icon={() => (
                    <Text style={{ color: showFeedback && (isCorrect || isSelected) ? "#FFFFFF" : colors.primary, fontFamily: fonts.black }}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  )}
                  onPress={() => handleSelectAnswer(idx)}
                  disabled={showFeedback}
                >
                  {opt}
                </Button>
              );
            })}

            {showFeedback && question.explanation && (
              <Card style={styles.explainCard} mode="contained">
                <Card.Content>
                  <Text style={styles.explainTitle}>PENJELASAN</Text>
                  <Text style={styles.explainText}>{question.explanation}</Text>
                </Card.Content>
              </Card>
            )}

            {showFeedback && (
              <Button
                mode="contained"
                onPress={handleNext}
                disabled={submitting}
                icon={currentQ < questions.length - 1 ? "arrow-right" : "chart-box-outline"}
                labelStyle={{ fontFamily: fonts.bold }}
              >
                {submitting
                  ? "Memproses..."
                  : currentQ < questions.length - 1
                    ? "Soal Berikutnya"
                    : "Lihat Hasil"}
              </Button>
            )}
          </>
        )}

        {phase === "result" && quizResult && (
          <>
            <Card style={styles.card} mode="elevated">
              <Card.Content style={{ alignItems: "center", gap: 6 }}>
                <AvatarIcon passed={quizResult.passed} />
                <Text style={styles.resultTitle}>{quizResult.passed ? "Selamat!" : "Hampir!"}</Text>
                <Text style={styles.resultScore}>{quizResult.score}/{quizResult.total}</Text>
                <Text style={styles.resultSub}>
                  {quizResult.passed
                    ? "Kamu lulus kuis ini dengan hasil bagus."
                    : "Pelajari lagi materinya, lalu coba ulang untuk hasil lebih baik."}
                </Text>
              </Card.Content>
            </Card>

            <View style={styles.statsRow}>
              <Card style={styles.statCard} mode="outlined">
                <Card.Content>
                  <Text style={[styles.statValue, { color: "#D97706" }]}>+{quizResult.xpEarned}</Text>
                  <Text style={styles.statLabel}>XP Didapat</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard} mode="outlined">
                <Card.Content>
                  <Text style={[styles.statValue, { color: quizResult.passed ? "#059669" : colors.primary }]}> 
                    {Math.round((quizResult.score / quizResult.total) * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>Akurasi</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard} mode="outlined">
                <Card.Content>
                  <Text style={[styles.statValue, { color: quizResult.passed ? "#059669" : colors.primary }]}> 
                    {quizResult.passed ? "Lulus" : "Ulangi"}
                  </Text>
                  <Text style={styles.statLabel}>Status</Text>
                </Card.Content>
              </Card>
            </View>

            <Button
              mode="contained"
              icon="arrow-left"
              onPress={() => router.back()}
              labelStyle={{ fontFamily: fonts.bold }}
            >
              Kembali ke Daftar Kuis
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function AvatarIcon({ passed }: { passed: boolean }) {
  return (
    <View
      style={{
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: passed ? "#ECFDF5" : "#FFF0F0",
      }}
    >
      <Ionicons name={passed ? "trophy" : "refresh-circle"} size={48} color={passed ? "#059669" : "#C0272D"} />
    </View>
  );
}
