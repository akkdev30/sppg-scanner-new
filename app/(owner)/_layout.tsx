// app/(owner)/_layout.tsx

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function OwnerLayout() {
  const { logout, user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#2563EB",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarStyle: {
          backgroundColor: "#f8f9fa",
          borderTopWidth: 1,
          borderTopColor: "#e9ecef",
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6c757d",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard Owner",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
          headerRight: () => (
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#fff"
              style={{ marginRight: 15 }}
              onPress={logout}
            />
          ),
          headerTitle: `Owner - ${user?.username || "Dashboard"}`,
        }}
      />
      <Tabs.Screen
        name="sppg"
        options={{
          title: "Kelola SPPG",
          tabBarLabel: "SPPG",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schools"
        options={{
          title: "Kelola Sekolah",
          tabBarLabel: "Sekolah",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menus"
        options={{
          title: "Kelola Menu",
          tabBarLabel: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Laporan",
          tabBarLabel: "Laporan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
