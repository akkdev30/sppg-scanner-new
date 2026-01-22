// app/+not-found.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth, useUserRole } from "../context/AuthContext";

export default function NotFoundScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isOwner, isAdmin, isPic } = useUserRole();

  const handleGoBack = () => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    // Redirect ke dashboard sesuai role
    if (isOwner) {
      router.replace("/(owner)");
    } else if (isAdmin) {
      router.replace("/(admin)");
    } else if (isPic) {
      router.replace("/(pic)");
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={100} color="#EF4444" />

        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Halaman Tidak Ditemukan</Text>
        <Text style={styles.description}>
          Maaf, halaman yang Anda cari tidak ditemukan atau Anda tidak memiliki
          akses ke halaman ini.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGoBack}>
          <Ionicons name="home" size={20} color="white" />
          <Text style={styles.buttonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
  },
  title: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginTop: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
