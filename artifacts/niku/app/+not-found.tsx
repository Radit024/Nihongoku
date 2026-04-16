import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { useColors } from "@/hooks/useColors";
import { fonts } from "@/constants/fonts";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={{ alignItems: "center", gap: 10 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Halaman tidak ditemukan</Text>
            <Text style={{ color: colors.mutedForeground }}>Rute yang kamu buka tidak tersedia.</Text>
            <Link href="/" asChild>
              <Button mode="contained" icon="home-outline">Kembali ke Beranda</Button>
            </Link>
          </Card.Content>
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
  },
});
