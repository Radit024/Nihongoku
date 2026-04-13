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
  const { login } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Harap isi email dan password.");
      return;
    }
    setError("");
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await new Promise((r) => setTimeout(r, 800));

    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    login(name || "Gakusei", email);
    setIsLoading(false);
    router.replace("/(tabs)");
  };

  const handleGoogleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    login("Gakusei Demo", "demo@nihongoku.jp");
    router.replace("/(tabs)");
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
    forgotBtn: {
      alignSelf: "flex-end",
      paddingVertical: 4,
    },
    forgotText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "500" as const,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 13,
      textAlign: "center",
    },
    loginBtn: {
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
    loginBtnDisabled: {
      opacity: 0.7,
    },
    loginBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700" as const,
      letterSpacing: 0.5,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 18,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.mutedForeground,
      fontSize: 13,
    },
    googleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderRadius: colors.radius,
      height: 52,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    googleBtnText: {
      color: colors.foreground,
      fontSize: 15,
      fontWeight: "600" as const,
    },
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
      gap: 4,
    },
    registerText: {
      color: colors.mutedForeground,
      fontSize: 14,
    },
    registerLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700" as const,
    },
  });

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topDecoration}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>に</Text>
            </View>
            <Text style={styles.appName}>NIKU</Text>
            <Text style={styles.appSubtitle}>NIHONGOKU</Text>
            <Text style={styles.tagline}>Belajar Bahasa Jepang dengan Mudah</Text>
          </View>

          <View style={styles.formSection}>
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
                testID="email-input"
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
                testID="password-input"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Pressable style={styles.forgotBtn} onPress={() => {}}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              testID="login-btn"
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.loginBtnText}>Masuk</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.googleBtn} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={styles.googleBtnText}>Masuk dengan Google</Text>
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun?</Text>
            <Pressable onPress={() => {}}>
              <Text style={styles.registerLink}>Daftar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
