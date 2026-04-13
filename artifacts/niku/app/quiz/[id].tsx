import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { QuizQuestion } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

type Phase = "lesson" | "quiz" | "result";

function OptionButton({
  option,
  label,
  isSelected,
  isCorrect,
  isWrong,
  isAnswered,
  onPress,
}: {
  option: { id: string; text: string };
  label: string;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  isAnswered: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.96), withSpring(1));
    onPress();
  };

  const getBg = () => {
    if (isCorrect) return colors.correct;
    if (isWrong) return colors.incorrect;
    if (isSelected) return colors.primary + "20";
    return colors.card;
  };

  const getBorder = () => {
    if (isCorrect) return colors.correct;
    if (isWrong) return colors.incorrect;
    if (isSelected) return colors.primary;
    return colors.border;
  };

  const getTextColor = () => {
    if (isCorrect || isWrong) return "#FFFFFF";
    return colors.foreground;
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={isAnswered ? undefined : handlePress}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            borderRadius: 14,
            borderWidth: 2,
            backgroundColor: getBg(),
            borderColor: getBorder(),
          },
        ]}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: isCorrect || isWrong ? "rgba(255,255,255,0.25)" : colors.muted,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700" as const, color: getTextColor() }}>{label}</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 14, color: getTextColor(), fontWeight: "500" as const }}>{option.text}</Text>
        {(isCorrect || isWrong) && (
          <Ionicons
            name={isCorrect ? "checkmark-circle" : "close-circle"}
            size={20}
            color="#FFFFFF"
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { completeQuiz, lessons } = useAppContext();

  const lesson = useMemo(() => lessons.find((l) => l.id === id), [id, lessons]);
  const [phase, setPhase] = useState<Phase>("lesson");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (answered || !lesson) return;
      setSelectedId(optionId);
      setAnswered(true);

      const question = lesson.quiz[currentIdx];
      const isCorrect = optionId === question.correctOptionId;

      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCorrectCount((c) => c + 1);
        setXpEarned((x) => x + question.xpReward);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [answered, lesson, currentIdx]
  );

  const handleNext = useCallback(() => {
    if (!lesson) return;
    const isLast = currentIdx >= lesson.quiz.length - 1;

    if (isLast) {
      const totalQuestions = lesson.quiz.length;
      const finalScore = Math.round((correctCount / totalQuestions) * 100);
      const passed = finalScore >= 80;
      const bonusXP = passed ? 20 : 0;
      const totalXP = xpEarned + bonusXP;

      setScore(finalScore);
      completeQuiz(lesson.id, finalScore, passed, totalXP);
      setPhase("result");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  }, [lesson, currentIdx, correctCount, xpEarned, completeQuiz]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      paddingTop: topPad + 12,
      paddingHorizontal: 20,
      paddingBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: colors.muted,
      marginHorizontal: 20,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    lessonContent: {
      paddingHorizontal: 20,
      paddingBottom: bottomPad + 100,
    },
    lessonHero: {
      alignItems: "center",
      paddingVertical: 32,
    },
    lessonJpChar: {
      fontSize: 80,
      fontWeight: "800" as const,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      color: colors.primary,
      lineHeight: 100,
    },
    lessonCatBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.secondary + "40",
      marginTop: 8,
    },
    lessonCatText: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.primary,
    },
    lessonTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      marginTop: 16,
      textAlign: "center",
    },
    contentCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 10,
      marginTop: 20,
    },
    bulletRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 6,
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 22,
    },
    startQuizBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
      flexDirection: "row",
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    startQuizBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700" as const,
    },
    quizContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    questionHeader: {
      paddingTop: 16,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    questionNum: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: "600" as const,
    },
    xpBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FFF9EC",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    xpBadgeText: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.accent,
    },
    questionCard: {
      backgroundColor: colors.navy,
      borderRadius: colors.radius + 4,
      padding: 20,
      marginBottom: 20,
      alignItems: "center",
      gap: 8,
    },
    questionJp: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: "#FFFFFF",
      textAlign: "center",
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      lineHeight: 36,
    },
    questionRomaji: {
      fontSize: 15,
      color: "rgba(255,255,255,0.65)",
      textAlign: "center",
    },
    questionId: {
      fontSize: 13,
      color: colors.secondary,
      textAlign: "center",
      fontStyle: "italic",
    },
    optionsGap: {
      gap: 10,
    },
    explanationCard: {
      marginTop: 14,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 6,
    },
    explanationTitle: {
      fontSize: 12,
      fontWeight: "700" as const,
      color: colors.accent,
      letterSpacing: 1,
    },
    explanationText: {
      fontSize: 13,
      color: colors.foreground,
      lineHeight: 20,
    },
    nextBtn: {
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      marginBottom: bottomPad + 20,
    },
    nextBtnText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700" as const,
    },
    resultContainer: {
      flex: 1,
      paddingHorizontal: 20,
      alignItems: "center",
      paddingTop: 40,
      paddingBottom: bottomPad + 40,
    },
    resultEmoji: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    resultTitle: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      marginBottom: 8,
      textAlign: "center",
    },
    resultSub: {
      fontSize: 15,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 32,
    },
    resultScoreRow: {
      flexDirection: "row",
      gap: 20,
      marginBottom: 32,
    },
    resultScoreCard: {
      alignItems: "center",
      gap: 4,
    },
    resultScoreNum: {
      fontSize: 36,
      fontWeight: "800" as const,
      color: colors.foreground,
    },
    resultScoreLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    resultBtnsCol: {
      width: "100%",
      gap: 12,
    },
    resultPrimaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    resultPrimaryBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700" as const,
    },
    resultSecondaryBtn: {
      borderRadius: colors.radius,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    resultSecondaryBtnText: {
      color: colors.foreground,
      fontSize: 16,
      fontWeight: "600" as const,
    },
  });

  if (!lesson) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.foreground }}>Materi tidak ditemukan</Text>
      </View>
    );
  }

  if (lesson.locked) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 }]}>
        <Ionicons name="lock-closed" size={48} color={colors.mutedForeground} />
        <Text style={{ fontSize: 18, fontWeight: "700" as const, color: colors.foreground, textAlign: "center" }}>
          Materi Terkunci
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>
          Selesaikan kuis sebelumnya untuk membuka materi ini.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700" as const }}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const question: QuizQuestion = lesson.quiz[currentIdx];
  const optionLabels = ["A", "B", "C", "D"];
  const passed = score >= 80;

  if (phase === "lesson") {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={styles.headerTitle}>{lesson.categoryLabel}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.lessonContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.lessonHero}>
              <Text style={styles.lessonJpChar}>{lesson.titleJp}</Text>
              <View style={styles.lessonCatBadge}>
                <Text style={styles.lessonCatText}>{lesson.categoryLabel}</Text>
              </View>
            </View>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>

            <View style={styles.contentCard}>
              {lesson.content.map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.startQuizBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setPhase("quiz");
              }}
            >
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text style={styles.startQuizBtnText}>Mulai Kuis ({lesson.quiz.length} soal)</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  if (phase === "result") {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={styles.headerTitle}>Hasil Kuis</Text>
        </View>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: "center", width: "100%" }}>
            <View
              style={[
                styles.resultEmoji,
                { backgroundColor: passed ? colors.correct + "20" : colors.incorrect + "20" },
              ]}
            >
              <Ionicons
                name={passed ? "trophy" : "refresh-circle"}
                size={44}
                color={passed ? colors.correct : colors.incorrect}
              />
            </View>
            <Text style={styles.resultTitle}>{passed ? "Selamat!" : "Semangat!"}</Text>
            <Text style={styles.resultSub}>
              {passed
                ? "Kamu lulus! Materi selanjutnya telah dibuka."
                : `Skor minimum adalah 80. Coba lagi ya!`}
            </Text>

            <View style={styles.resultScoreRow}>
              <View style={styles.resultScoreCard}>
                <Text style={[styles.resultScoreNum, { color: passed ? colors.correct : colors.incorrect }]}>
                  {score}%
                </Text>
                <Text style={styles.resultScoreLabel}>Skor</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={styles.resultScoreCard}>
                <Text style={[styles.resultScoreNum, { color: colors.accent }]}>{xpEarned + (passed ? 20 : 0)}</Text>
                <Text style={styles.resultScoreLabel}>XP Diperoleh</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={styles.resultScoreCard}>
                <Text style={styles.resultScoreNum}>{correctCount}/{lesson.quiz.length}</Text>
                <Text style={styles.resultScoreLabel}>Benar</Text>
              </View>
            </View>

            <View style={styles.resultBtnsCol}>
              <Pressable
                style={styles.resultPrimaryBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.replace("/(tabs)/kuis");
                }}
              >
                <Text style={styles.resultPrimaryBtnText}>
                  {passed ? "Lanjut ke Kuis Berikutnya" : "Kembali ke Daftar Kuis"}
                </Text>
              </Pressable>
              <Pressable
                style={styles.resultSecondaryBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentIdx(0);
                  setSelectedId(null);
                  setAnswered(false);
                  setScore(0);
                  setXpEarned(0);
                  setCorrectCount(0);
                  setPhase("quiz");
                }}
              >
                <Text style={styles.resultSecondaryBtnText}>Ulangi Kuis Ini</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  const progress = ((currentIdx + 1) / lesson.quiz.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNum}>
            Soal {currentIdx + 1} dari {lesson.quiz.length}
          </Text>
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={12} color={colors.accent} />
            <Text style={styles.xpBadgeText}>+{question.xpReward} XP</Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(300)} key={currentIdx}>
          <View style={styles.questionCard}>
            <Text style={styles.questionJp}>{question.japanese}</Text>
            <Text style={styles.questionRomaji}>{question.romaji}</Text>
            <Text style={styles.questionId}>"{question.indonesian}"</Text>
          </View>

          <View style={styles.optionsGap}>
            {question.options.map((opt, i) => (
              <OptionButton
                key={opt.id}
                option={opt}
                label={optionLabels[i]}
                isSelected={selectedId === opt.id}
                isCorrect={answered && opt.id === question.correctOptionId}
                isWrong={answered && selectedId === opt.id && opt.id !== question.correctOptionId}
                isAnswered={answered}
                onPress={() => handleAnswer(opt.id)}
              />
            ))}
          </View>

          {answered && (
            <Animated.View entering={FadeInDown.duration(250)} style={[styles.explanationCard, { borderLeftColor: selectedId === question.correctOptionId ? colors.correct : colors.incorrect }]}>
              <Text style={styles.explanationTitle}>PENJELASAN</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </Animated.View>
          )}

          {answered && (
            <Pressable
              style={styles.nextBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleNext();
              }}
            >
              <Text style={styles.nextBtnText}>
                {currentIdx >= lesson.quiz.length - 1 ? "Lihat Hasil" : "Soal Berikutnya"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
