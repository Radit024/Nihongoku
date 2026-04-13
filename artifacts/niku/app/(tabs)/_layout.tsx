import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export default function TabLayout() {
  const colors = useColors();
  const { user } = useAppContext();
  const isAndroid = Platform.OS === "android";
  const isDosen = user?.role === "dosen";

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
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="materi"
        options={{
          title: "Materi",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          href: isDosen ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cloud-upload" : "cloud-upload-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kuis"
        options={{
          title: "Kuis",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "help-circle" : "help-circle-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
