// app/_layout.tsx

import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthProvider, useAuth, useUserRole } from "../context/AuthContext";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isOwner, isAdmin, isPic } = useUserRole();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Hide splash screen when auth is initialized
    if (!isLoading) {
      SplashScreen.hideAsync();
      setIsNavigationReady(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isNavigationReady || isLoading) return;

    const currentSegment = segments[0];
    console.log("Navigation debug:", {
      isAuthenticated,
      currentSegment,
      userRole: user?.role,
      isLoading,
    });

    // Jika belum login dan tidak berada di auth group
    if (!isAuthenticated) {
      if (currentSegment !== "(auth)") {
        console.log("Redirecting to login: Not authenticated");
        router.replace("/(auth)/login");
      }
      return;
    }

    // Jika sudah login
    if (isAuthenticated && user) {
      // Jika sedang di auth group, redirect berdasarkan role
      if (currentSegment === "(auth)") {
        if (isOwner) {
          console.log("Redirecting owner to dashboard");
          router.replace("/(owner)/dashboard");
        } else if (isAdmin) {
          console.log("Redirecting admin to dashboard");
          router.replace("/(admin)/dashboard");
        } else if (isPic) {
          console.log("Redirecting PIC to dashboard");
          router.replace("/(pic)/dashboard");
        }
        return;
      }

      // Validasi route berdasarkan role
      const isValidRouteForRole = () => {
        if (isOwner && currentSegment === "(owner)") return true;
        if (isAdmin && currentSegment === "(admin)") return true;
        if (isPic && currentSegment === "(pic)") return true;

        // Owner bisa akses semua
        if (isOwner) return true;

        return false;
      };

      // Redirect jika route tidak valid untuk role
      if (!isValidRouteForRole()) {
        console.log(`Invalid route for role ${user.role}, redirecting...`);

        if (isOwner) {
          router.replace("/(owner)/dashboard");
        } else if (isAdmin) {
          router.replace("/(admin)/dashboard");
        } else if (isPic) {
          router.replace("/(pic)/dashboard");
        }
      }
    }
  }, [isAuthenticated, segments, isLoading, isNavigationReady, user]);

  // Show loading screen
  if (isLoading || !isNavigationReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#2563EB",
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", marginTop: 16, fontSize: 16 }}>
          Memuat aplikasi...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#2563EB" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth Group - Tidak butuh authentication */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />

        {/* Owner Group - Hanya untuk role owner */}
        <Stack.Screen
          name="(owner)"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        {/* Admin Group - Hanya untuk role admin */}
        <Stack.Screen
          name="(admin)"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        {/* PIC Group - Hanya untuk role pic */}
        <Stack.Screen
          name="(pic)"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        {/* Common Screens - Bisa diakses semua role (jika dibutuhkan) */}
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            title: "Profil",
            headerStyle: { backgroundColor: "#2563EB" },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: { fontWeight: "bold" },
            animation: "slide_from_right",
          }}
        />

        {/* Error/NotFound Screen */}
        <Stack.Screen
          name="error"
          options={{
            headerShown: true,
            title: "Error",
            animation: "fade",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
