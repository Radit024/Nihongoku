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
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
      paddingBottom: insets.bottom + 40,
    },
    topDecoration: {
      alignItems: "center",
      marginBottom: 36,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 12,
    },
    logoText: {
      fontSize: 30,
      fontWeight: "800" as const,
      color: colors.primaryForeground,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      letterSpacing: 3,
    },
    appName: {
      fontSize: 32,
      fontWeight: "800" as const,
      color: colors.primary,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      letterSpacing: 4,
    },
    appSubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 4,
      letterSpacing: 2,
    },
    tagline: {
      fontSize: 15,
      color: colors.foreground,
      marginTop: 8,
      opacity: 0.7,
    },
    formSection: {
      gap: 14,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 14,
      height: 52,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
    },
    roleRow: {
      flexDirection: "row",
      gap: 12,
    },
    roleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 48,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    roleBtnActive: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    roleBtnText: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
    },
    roleBtnTextActive: {
      color: colors.primary,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 13,
      textAlign: "center",
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    submitBtnDisabled: {
      opacity: 0.7,
    },
    submitBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700" as const,
      letterSpacing: 0.5,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
      gap: 4,
    },
    switchText: {
      color: colors.mutedForeground,
      fontSize: 14,
    },
    switchLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700" as const,
    },
  });

  return (
    <View style={styles.container}>
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

          <View style={styles.formSection}>
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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.submitBtnText}>{isRegister ? "Daftar" : "Masuk"}</Text>
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
