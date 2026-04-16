import { MD3LightTheme, type MD3Theme } from "react-native-paper";

import colors from "@/constants/colors";

const palette = colors.light;

export const materialTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: colors.radius,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    onPrimary: palette.primaryForeground,
    primaryContainer: "#FFE0E0",
    onPrimaryContainer: palette.primary,
    secondary: palette.accent,
    onSecondary: palette.primaryForeground,
    secondaryContainer: "#F6E8DA",
    onSecondaryContainer: palette.foreground,
    tertiary: "#5B6FB2",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#DFE4FF",
    onTertiaryContainer: "#25305D",
    error: palette.destructive,
    onError: palette.destructiveForeground,
    errorContainer: "#FFE1DE",
    onErrorContainer: "#410E0B",
    background: palette.background,
    onBackground: palette.foreground,
    surface: palette.card,
    onSurface: palette.foreground,
    surfaceVariant: palette.muted,
    onSurfaceVariant: palette.mutedForeground,
    outline: palette.border,
    outlineVariant: "#E9DED6",
    shadow: "#000000",
    scrim: "rgba(0,0,0,0.4)",
    inverseSurface: "#2B2A2F",
    inverseOnSurface: "#F5EFF4",
    inversePrimary: "#FFB3B3",
    elevation: {
      level0: "transparent",
      level1: "#FFF9F8",
      level2: "#FFF4F3",
      level3: "#FFEDEC",
      level4: "#FFE8E7",
      level5: "#FFE2E1",
    },
    surfaceDisabled: "rgba(28,35,64,0.08)",
    onSurfaceDisabled: "rgba(28,35,64,0.34)",
    backdrop: "rgba(28,35,64,0.32)",
  },
};
