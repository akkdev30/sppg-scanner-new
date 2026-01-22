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

    const inAuthGroup = segments[0] === "(auth)";
    const inOwnerGroup = segments[0] === "(owner)";
    const inAdminGroup = segments[0] === "(admin)";
    const inPicGroup = segments[0] === "(pic)";

    console.log("Navigation debug:", {
      isAuthenticated,
      segments,
      userRole: user?.role,
      isLoading,
      groups: { inAuthGroup, inOwnerGroup, inAdminGroup, inPicGroup },
    });

    // 1. Jika belum login
    if (!isAuthenticated) {
      // Redirect ke login jika tidak berada di auth group
      if (!inAuthGroup) {
        console.log("Redirecting to login: Not authenticated");
        router.replace("/(auth)/login");
      }
      return;
    }

    // 2. Jika sudah login
    if (isAuthenticated && user) {
      // Redirect dari auth group ke dashboard sesuai role
      if (inAuthGroup) {
        console.log("User logged in, redirecting from auth to dashboard");
        redirectToDashboard();
        return;
      }

      // Validasi akses berdasarkan role
      const hasValidAccess = validateRoleAccess(
        inOwnerGroup,
        inAdminGroup,
        inPicGroup,
      );

      if (!hasValidAccess) {
        console.log(`Invalid route for role ${user.role}, redirecting...`);
        redirectToDashboard();
      }
    }
  }, [isAuthenticated, segments, isLoading, isNavigationReady, user]);

  // Helper function untuk redirect ke dashboard sesuai role
  const redirectToDashboard = () => {
    if (isOwner) {
      console.log("Redirecting to owner dashboard");
      router.replace("/(owner)");
    } else if (isAdmin) {
      console.log("Redirecting to admin dashboard");
      router.replace("/(admin)");
    } else if (isPic) {
      console.log("Redirecting to pic dashboard");
      router.replace("/(pic)");
    } else {
      // Fallback ke login jika role tidak dikenali
      console.log("Unknown role, redirecting to login");
      router.replace("/(auth)/login");
    }
  };

  // Helper function untuk validasi akses berdasarkan role
  const validateRoleAccess = (
    inOwnerGroup: boolean,
    inAdminGroup: boolean,
    inPicGroup: boolean,
  ): boolean => {
    // Owner bisa akses semua group
    if (isOwner) {
      return true;
    }

    // Admin hanya bisa akses admin group
    if (isAdmin) {
      return inAdminGroup;
    }

    // PIC hanya bisa akses pic group
    if (isPic) {
      return inPicGroup;
    }

    return false;
  };

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
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {/* Auth Group - Public access */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />

        {/* Owner Group - Only for owner role */}
        <Stack.Screen
          name="(owner)"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        {/* Admin Group - Only for admin role */}
        <Stack.Screen
          name="(admin)"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        {/* PIC Group - Only for pic role */}
        <Stack.Screen
          name="(pic)"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        {/* Profile Screen - Accessible by all authenticated users */}
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

        {/* Settings Screen - Accessible by all authenticated users */}
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: "Pengaturan",
            headerStyle: { backgroundColor: "#2563EB" },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: { fontWeight: "bold" },
            animation: "slide_from_right",
          }}
        />

        {/* Error/NotFound Screen */}
        <Stack.Screen
          name="+not-found"
          options={{
            headerShown: true,
            title: "Halaman Tidak Ditemukan",
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
