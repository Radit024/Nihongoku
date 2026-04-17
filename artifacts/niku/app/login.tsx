import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import { fonts } from "@/constants/fonts";

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

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    blob1: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.primary,
      opacity: 0.07,
      top: -60,
      right: -60,
    },
    blob2: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.accent,
      opacity: 0.1,
      bottom: 120,
      left: -50,
    },
    blob3: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.sakura,
      opacity: 0.15,
      top: 200,
      right: 20,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
      paddingBottom: insets.bottom + 40,
    },
    topDecoration: {
      alignItems: "center",
      marginBottom: 40,
    },
    logoCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 14,
    },
    logoText: {
      fontSize: 34,
      fontWeight: "800" as const,
      color: colors.primaryForeground,
      fontFamily: fonts.black,
    },
    appName: {
      fontSize: 36,
      fontFamily: fonts.black,
      color: colors.primary,
      letterSpacing: 6,
    },
    appSubtitle: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
      color: colors.mutedForeground,
      marginTop: 2,
      letterSpacing: 3,
    },
    tagline: {
      fontSize: 15,
      fontFamily: fonts.regular,
      color: colors.foreground,
      marginTop: 10,
      opacity: 0.65,
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 6,
      gap: 12,
      marginBottom: 8,
    },
    formLabel: {
      fontSize: 18,
      fontFamily: fonts.extraBold,
      color: colors.foreground,
      marginBottom: 4,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 14,
      height: 52,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      backgroundColor: "#FFF5F5",
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontFamily: fonts.semiBold,
      color: colors.foreground,
      borderWidth: 0,
      outlineWidth: 0,
      outlineColor: "transparent",
    },
    roleRow: {
      flexDirection: "row",
      gap: 10,
    },
    roleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 48,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    roleBtnActive: {
      borderColor: colors.primary,
      backgroundColor: "#FFF0F0",
    },
    roleBtnText: {
      fontSize: 14,
      fontFamily: fonts.bold,
      color: colors.mutedForeground,
    },
    roleBtnTextActive: {
      color: colors.primary,
    },
    errorBox: {
      backgroundColor: "#FFF0F0",
      borderRadius: 12,
      padding: 10,
      borderLeftWidth: 3,
      borderLeftColor: colors.destructive,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 13,
      fontFamily: fonts.semiBold,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 18,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 10,
    },
    submitBtnDisabled: {
      opacity: 0.7,
    },
    submitBtnText: {
      color: colors.primaryForeground,
      fontSize: 17,
      fontFamily: fonts.extraBold,
      letterSpacing: 0.5,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      gap: 4,
    },
    switchText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: fonts.regular,
    },
    switchLink: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: fonts.extraBold,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topDecoration}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>{"\u306B"}</Text>
            </View>
            <Text style={styles.appName}>NIKU</Text>
            <Text style={styles.appSubtitle}>NIHONGOKU</Text>
            <Text style={styles.tagline}>Belajar Bahasa Jepang dengan Mudah</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formLabel}>{isRegister ? "Buat Akun" : "Masuk"}</Text>

            {isRegister && (
              <>
                <View style={[styles.inputWrapper, nameFocused && styles.inputWrapperFocused]}>
                  <Ionicons name="person-outline" size={18} color={nameFocused ? colors.primary : colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nama Lengkap"
                    placeholderTextColor={colors.mutedForeground}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>

                <View style={styles.roleRow}>
                  <Pressable
                    style={[styles.roleBtn, role === "mahasiswa" && styles.roleBtnActive]}
                    onPress={() => setRole("mahasiswa")}
                  >
                    <Ionicons name="school-outline" size={18} color={role === "mahasiswa" ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.roleBtnText, role === "mahasiswa" && styles.roleBtnTextActive]}>Mahasiswa</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.roleBtn, role === "dosen" && styles.roleBtnActive]}
                    onPress={() => setRole("dosen")}
                  >
                    <Ionicons name="briefcase-outline" size={18} color={role === "dosen" ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.roleBtnText, role === "dosen" && styles.roleBtnTextActive]}>Dosen</Text>
                  </Pressable>
                </View>
              </>
            )}

            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
              <Ionicons name="mail-outline" size={18} color={emailFocused ? colors.primary : colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color={passwordFocused ? colors.primary : colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.submitBtnText}>{isRegister ? "Daftar Sekarang" : "Masuk"}</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{isRegister ? "Sudah punya akun?" : "Belum punya akun?"}</Text>
            <Pressable onPress={() => { setIsRegister(!isRegister); setError(""); }}>
              <Text style={styles.switchLink}>{isRegister ? "Masuk" : "Daftar"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
