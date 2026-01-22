// app/(admin)/_layout.tsx

import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
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
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={60} color="#2563EB" />
        </View>
        <Text style={styles.userName}>{user?.username || "Admin"}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === "admin" ? "Administrator" : "PIC"}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.drawerItems}>
        <DrawerItem
          label="Dashboard"
          icon={({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate("index")}
          labelStyle={styles.drawerLabel}
          activeBackgroundColor="#EFF6FF"
          activeTintColor="#2563EB"
          inactiveTintColor="#6B7280"
          focused={props.state.index === 0}
        />

        <DrawerItem
          label="SPPG"
          icon={({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate("sppg")}
          labelStyle={styles.drawerLabel}
          activeBackgroundColor="#EFF6FF"
          activeTintColor="#2563EB"
          inactiveTintColor="#6B7280"
          focused={props.state.index === 1}
        />

        <DrawerItem
          label="Sekolah"
          icon={({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate("schools")}
          labelStyle={styles.drawerLabel}
          activeBackgroundColor="#EFF6FF"
          activeTintColor="#2563EB"
          inactiveTintColor="#6B7280"
          focused={props.state.index === 2}
        />

        <DrawerItem
          label="Menu"
          icon={({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate("menus")}
          labelStyle={styles.drawerLabel}
          activeBackgroundColor="#EFF6FF"
          activeTintColor="#2563EB"
          inactiveTintColor="#6B7280"
          focused={props.state.index === 3}
        />

        <DrawerItem
          label="Users"
          icon={({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate("users")}
          labelStyle={styles.drawerLabel}
          activeBackgroundColor="#EFF6FF"
          activeTintColor="#2563EB"
          inactiveTintColor="#6B7280"
          focused={props.state.index === 4}
        />

        {/* Divider */}
        <View style={styles.divider} />

        <DrawerItem
          label="Profil"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )}
          onPress={() => router.push("/profile")}
          labelStyle={styles.drawerLabel}
          activeBackgroundColor="#EFF6FF"
          activeTintColor="#2563EB"
          inactiveTintColor="#6B7280"
        />

        <DrawerItem
          label="Pengaturan"
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          onPress={() => router.push("/settings")}
          labelStyle={styles.drawerLabel}
          activeBackgroundColor="#EFF6FF"
          activeTintColor="#2563EB"
          inactiveTintColor="#6B7280"
        />
      </View>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={handleLogout}
          labelStyle={styles.drawerLabel}
          activeTintColor="#EF4444"
          inactiveTintColor="#EF4444"
        />

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SPPG Management v1.0.0</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

export default function AdminLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#2563EB",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        drawerStyle: {
          width: 280,
          backgroundColor: "#fff",
        },
        drawerType: "slide",
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard Admin",
          headerTitle: "Dashboard",
        }}
      />
      <Drawer.Screen
        name="sppg"
        options={{
          drawerLabel: "SPPG",
          title: "Manajemen SPPG",
          headerTitle: "SPPG",
        }}
      />
      <Drawer.Screen
        name="schools"
        options={{
          drawerLabel: "Sekolah",
          title: "Manajemen Sekolah",
          headerTitle: "Sekolah",
        }}
      />
      <Drawer.Screen
        name="menus"
        options={{
          drawerLabel: "Menu",
          title: "Manajemen Menu",
          headerTitle: "Menu",
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          drawerLabel: "Users",
          title: "Manajemen Users",
          headerTitle: "Users",
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  drawerItems: {
    flex: 1,
    paddingTop: 8,
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    paddingBottom: 20,
  },
  versionContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "center",
  },
  versionText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
});
