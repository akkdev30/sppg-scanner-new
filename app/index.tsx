// App.tsx
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginScreen from "./(auth)/login";
import DashboardScreen from "./dashboard";
import ScannerScreen from "./scanner";

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Belum login -> Login Screen
  if (!user) {
    return <LoginScreen />;
  }

  // Admin -> Dashboard
  if (user.role === "admin") {
    return <DashboardScreen />;
  }

  // Role lain -> Scanner
  return <ScannerScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
