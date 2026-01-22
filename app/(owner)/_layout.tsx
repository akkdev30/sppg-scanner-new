// app/(owner)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

// Custom Drawer Content
function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeRoute, setActiveRoute] = useState("dashboard");

  const menuItems = [
    {
      key: "dashboard",
      title: "Dashboard",
      icon: "speedometer",
      route: "/(owner)/dashboard",
    },
    {
      key: "monitoring",
      title: "Real-time Monitoring",
      icon: "desktop",
      route: "/(owner)/monitoring",
    },
    {
      key: "reports",
      title: "Analytics Reports",
      icon: "document-text",
      route: "/(owner)/reports",
    },
    {
      key: "users",
      title: "User Management",
      icon: "people",
      route: "/(owner)/users",
    },
    {
      key: "sppg",
      title: "SPPG Management",
      icon: "business",
      route: "/(owner)/sppg",
    },
    {
      key: "schools",
      title: "School Management",
      icon: "school",
      route: "/(owner)/schools",
    },
    {
      key: "audit",
      title: "Audit Logs",
      icon: "list",
      route: "/(owner)/audit",
    },
    {
      key: "settings",
      title: "System Settings",
      icon: "settings",
      route: "/(owner)/settings",
    },
  ];

  const handleLogout = () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.userAvatar}>
          <Ionicons name="shield" size={32} color="#2563EB" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name || "Owner"}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#059669" />
            <Text style={styles.roleText}>OWNER</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.menuItem,
              activeRoute === item.key && styles.menuItemActive,
            ]}
            onPress={() => {
              setActiveRoute(item.key);
              router.push(item.route as any);
              props.navigation.closeDrawer();
            }}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={activeRoute === item.key ? "#2563EB" : "#6B7280"}
              style={styles.menuIcon}
            />
            <Text
              style={[
                styles.menuText,
                activeRoute === item.key && styles.menuTextActive,
              ]}
            >
              {item.title}
            </Text>
            {activeRoute === item.key && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Drawer Footer */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v2.1.0 • Owner Portal</Text>
      </View>
    </View>
  );
}

export default function OwnerLayout() {
  const { user, isLoading } = useAuth();

  // Cek role user
  if (isLoading) {
    return null;
  }

  if (user?.role !== "owner") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: "white",
          width: 280,
        },
        headerStyle: {
          backgroundColor: "white",
        },
        headerTintColor: "#111827",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 16,
        },
        drawerActiveTintColor: "#2563EB",
        drawerInactiveTintColor: "#6B7280",
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Dashboard Owner",
          drawerLabel: "Dashboard",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="monitoring"
        options={{
          title: "Real-time Monitoring",
          drawerLabel: "Monitoring",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="reports/index"
        options={{
          title: "Analytics Reports",
          drawerLabel: "Reports",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="users/index"
        options={{
          title: "User Management",
          drawerLabel: "Users",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="sppg"
        options={{
          title: "SPPG Management",
          drawerLabel: "SPPG",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="schools"
        options={{
          title: "School Management",
          drawerLabel: "Schools",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="audit"
        options={{
          title: "Audit Logs",
          drawerLabel: "Audit",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "System Settings",
          drawerLabel: "Settings",
          headerShown: true,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#059669",
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: "#EFF6FF",
  },
  menuIcon: {
    width: 24,
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  menuTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  activeIndicator: {
    width: 4,
    height: 24,
    backgroundColor: "#2563EB",
    borderRadius: 2,
    position: "absolute",
    right: 12,
  },
  drawerFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
  versionText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
