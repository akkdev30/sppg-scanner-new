import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Text, View } from "react-native";

// Komponen kustom untuk Drawer Content
function CustomDrawerContent(props: any) {
  const router = useRouter();

  const menuItems = [
    {
      key: "index",
      title: "Dashboard Monitoring",
      icon: "speedometer",
      onPress: () => router.push("/owner/monitoring/"),
    },
    {
      key: "activity_logs",
      title: "Log Aktivitas",
      icon: "list",
      onPress: () => router.push("/owner/monitoring/activity_logs"),
    },
    {
      key: "scan_logs",
      title: "Log Scan",
      icon: "scan",
      onPress: () => router.push("/owner/monitoring/scan_logs"),
    },
    {
      key: "problem_reports",
      title: "Laporan Masalah",
      icon: "warning",
      onPress: () => router.push("/owner/monitoring/problem_reports"),
    },
    {
      key: "monitoring_logs",
      title: "Log Monitoring",
      icon: "document-text",
      onPress: () => router.push("/owner/monitoring/monitoring_logs"),
    },
    {
      key: "back_to_owner",
      title: "Kembali ke Owner",
      icon: "arrow-back",
      onPress: () => router.push("/owner/"),
    },
  ];

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu Monitoring</Text>
        <Text style={styles.drawerSubtitle}>Owner Panel</Text>
      </View>

      {menuItems.map((item) => (
        <DrawerItem
          key={item.key}
          label={item.title}
          icon={({ color, size }) => (
            <Ionicons name={item.icon as any} size={size} color={color} />
          )}
          onPress={item.onPress}
        />
      ))}
    </DrawerContentScrollView>
  );
}

export default function MonitoringLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: "Monitoring System",
        drawerActiveTintColor: "#2196f3",
        drawerInactiveTintColor: "#666",
        drawerStyle: {
          backgroundColor: "#f9f9f9",
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard Monitoring",
        }}
      />
      <Drawer.Screen
        name="activity_logs"
        options={{
          drawerLabel: "Log Aktivitas",
          title: "Log Aktivitas",
        }}
      />
      <Drawer.Screen
        name="scan_logs"
        options={{
          drawerLabel: "Log Scan",
          title: "Log Scan",
        }}
      />
      <Drawer.Screen
        name="problem_reports"
        options={{
          drawerLabel: "Laporan Masalah",
          title: "Laporan Masalah",
        }}
      />
      <Drawer.Screen
        name="monitoring_logs"
        options={{
          drawerLabel: "Log Monitoring",
          title: "Log Monitoring",
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  drawerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
