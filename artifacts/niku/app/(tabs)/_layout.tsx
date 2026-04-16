import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { fonts } from "@/constants/fonts";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export default function TabLayout() {
  const colors = useColors();
  const { user } = useAppContext();
  const isAndroid = Platform.OS === "android";
  const isDosen = user?.role === "dosen";

  return (
    <Tabs
      detachInactiveScreens
      screenOptions={{
        headerShown: false,
        animation: "fade",
        lazy: true,
        freezeOnBlur: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: fonts.bold,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: "#FFFDFB",
          borderTopWidth: 0,
          elevation: isAndroid ? 12 : 0,
          height: Platform.OS === "web" ? 84 : 68,
          paddingBottom: Platform.OS === "web" ? 16 : 10,
          paddingTop: 6,
          marginHorizontal: 12,
          marginBottom: 8,
          borderRadius: 20,
          position: "absolute",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#FFFDFB", borderRadius: 20 },
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
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="materi"
        options={{
          title: "Materi",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          href: isDosen ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cloud-upload" : "cloud-upload-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kuis"
        options={{
          title: "Kuis",
          href: isDosen ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "help-circle" : "help-circle-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
