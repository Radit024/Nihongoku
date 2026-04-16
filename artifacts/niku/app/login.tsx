import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "@/constants/fonts";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAppContext();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"mahasiswa" | "dosen">("mahasiswa");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (isRegister && !name.trim()) {
      setError("Harap isi nama lengkap.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("Harap isi email dan password.");
      return;
    }

    setError("");
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hero: {
      marginHorizontal: 20,
      marginTop: insets.top + (Platform.OS === "web" ? 67 : 10),
      borderRadius: 24,
      padding: 22,
      overflow: "hidden",
      gap: 10,
    },
    heroTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    heroTitle: {
      fontFamily: fonts.black,
      fontSize: 28,
      color: colors.primaryForeground,
      letterSpacing: 1,
    },
    heroSub: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.primaryForeground,
      opacity: 0.82,
      marginTop: -4,
      letterSpacing: 1.2,
    },
    heroTagline: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.primaryForeground,
      opacity: 0.9,
      lineHeight: 19,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: insets.bottom + 42,
    },
    formCard: {
      borderRadius: 24,
      backgroundColor: colors.card,
    },
    formContent: {
      gap: 12,
    },
    formLabel: {
      fontFamily: fonts.extraBold,
      fontSize: 20,
      color: colors.foreground,
    },
    segmentedWrap: {
      marginBottom: 4,
    },
    inputLabel: {
      fontFamily: fonts.bold,
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: -4,
    },
    submitBtn: {
      marginTop: 4,
    },
    switchBtn: {
      marginTop: 6,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#D54B4F", colors.primary, "#8B1D22"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <Avatar.Text
            size={56}
            label={"\u306B"}
            labelStyle={{ color: colors.primary, fontFamily: fonts.black }}
            style={{ backgroundColor: "#FFFFFF" }}
          />
          <View>
            <Text style={styles.heroTitle}>NIKU</Text>
            <Text style={styles.heroSub}>NIHONGOKU LEARNING APP</Text>
          </View>
        </View>
        <Text style={styles.heroTagline}>Belajar bahasa Jepang jadi lebih terarah, seru, dan mudah dipahami.</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card mode="elevated" style={styles.formCard}>
            <Card.Content style={styles.formContent}>
              <Text style={styles.formLabel}>{isRegister ? "Buat Akun Baru" : "Masuk ke Akun"}</Text>

              <View style={styles.segmentedWrap}>
                <SegmentedButtons
                  value={isRegister ? "register" : "login"}
                  onValueChange={(value) => {
                    setIsRegister(value === "register");
                    setError("");
                  }}
                  buttons={[
                    { value: "login", label: "Masuk" },
                    { value: "register", label: "Daftar" },
                  ]}
                />
              </View>

              {isRegister && (
                <>
                  <Text style={styles.inputLabel}>Nama Lengkap</Text>
                  <TextInput
                    mode="outlined"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholder="Masukkan nama lengkap"
                    left={<TextInput.Icon icon="account-outline" />}
                  />

                  <Text style={styles.inputLabel}>Peran</Text>
                  <SegmentedButtons
                    value={role}
                    onValueChange={(value) => setRole(value as "mahasiswa" | "dosen")}
                    buttons={[
                      { value: "mahasiswa", label: "Mahasiswa", icon: "school-outline" },
                      { value: "dosen", label: "Dosen", icon: "briefcase-outline" },
                    ]}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="nama@email.com"
                left={<TextInput.Icon icon="email-outline" />}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Minimal 6 karakter"
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off-outline" : "eye-outline"}
                    onPress={() => setShowPassword((prev) => !prev)}
                  />
                }
              />

              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>

              <Button
                mode="contained"
                style={styles.submitBtn}
                contentStyle={{ height: 48 }}
                labelStyle={{ fontFamily: fonts.extraBold, fontSize: 15 }}
                onPress={handleSubmit}
                disabled={isLoading}
                icon={isRegister ? "account-plus-outline" : "login"}
              >
                {isLoading ? "Memproses..." : isRegister ? "Daftar Sekarang" : "Masuk"}
              </Button>

              {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 6 }} />}

              <Button
                mode="text"
                compact
                style={styles.switchBtn}
                labelStyle={{ fontFamily: fonts.bold }}
                onPress={() => {
                  setIsRegister((prev) => !prev);
                  setError("");
                }}
              >
                {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
