// app/index.tsx

import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay untuk memastikan semuanya sudah ter-load
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading indicator
  if (isLoading || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat aplikasi...</Text>
          <Text style={styles.loadingSubtext}>SPPG Monitoring System</Text>
        </View>
      </View>
    );
  }

  // Redirect ke layout utama
  // Navigation akan dihandle oleh app/_layout.tsx
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  loadingSubtext: {
    color: "#DBEAFE",
    fontSize: 14,
    marginTop: 8,
  },
});
