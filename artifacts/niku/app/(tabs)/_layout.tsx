import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: IoniconName;
  iconFocused: IoniconName;
}[] = [
  { name: "index", title: "Beranda", icon: "home-outline", iconFocused: "home" },
  { name: "materi", title: "Materi", icon: "book-outline", iconFocused: "book" },
  { name: "kuis", title: "Kuis", icon: "help-circle-outline", iconFocused: "help-circle" },
  { name: "progress", title: "Progress", icon: "bar-chart-outline", iconFocused: "bar-chart" },
];

export default function TabLayout() {
  const colors = useColors();
  const isAndroid = Platform.OS === "android";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: isAndroid ? 8 : 0,
          height: Platform.OS === "web" ? 84 : 60,
          paddingBottom: Platform.OS === "web" ? 16 : 4,
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.background },
            ]}
          />
        ),
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
