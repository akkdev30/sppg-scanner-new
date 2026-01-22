// app/(admin)/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import StatCard from "../../components/admin/StatCard";
import { useAuth } from "../../context/AuthContext";

interface DashboardStats {
  totalSPPG: number;
  totalSchools: number;
  totalMenus: number;
  totalQRScans: number;
  todayScans: number;
  problematicMenus: number;
  totalUsers: number;
}

interface MenuItem {
  id: string;
  menu_name: string;
  production_portion: number;
  received_portion: number;
  production_time: string;
  menu_condition: "normal" | "problematic";
  sppg_name?: string;
}

const API_URL = "https://sppg-backend-new.vercel.app/api";

export default function DashboardOverviewScreen() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSPPG: 0,
    totalSchools: 0,
    totalMenus: 0,
    totalQRScans: 0,
    todayScans: 0,
    problematicMenus: 0,
    totalUsers: 0,
  });
  const [recentMenus, setRecentMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const statsRes = await fetch(`${API_URL}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          const data = statsData.data;
          setStats({
            totalSPPG: data.total_sppg || 0,
            totalSchools: data.total_schools || 0,
            totalMenus: data.total_menus_today || 0,
            totalQRScans: data.total_scans_today || 0,
            todayScans: data.total_scans_today || 0,
            problematicMenus: data.problematic_menus_today || 0,
            totalUsers: 0,
          });
        }
      }

      // Load recent menus
      const menusRes = await fetch(`${API_URL}/dashboard/menus/today`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (menusRes.ok) {
        const menusData = await menusRes.json();
        if (menusData.success) {
          setRecentMenus(menusData.data.slice(0, 5) || []);
        }
      }

      // Load users count
      const usersRes = await fetch(`${API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setStats((prev) => ({
            ...prev,
            totalUsers: usersData.data.length || 0,
          }));
        }
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDashboardData();
          }}
          colors={["#2563EB"]}
        />
      }
    >
      <View style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total SPPG"
            value={stats.totalSPPG}
            icon="business"
            color="#2563EB"
          />
          <StatCard
            title="Total Sekolah"
            value={stats.totalSchools}
            icon="school"
            color="#10B981"
          />
          <StatCard
            title="Menu Hari Ini"
            value={stats.totalMenus}
            icon="restaurant"
            color="#8B5CF6"
          />
          <StatCard
            title="Scan QR"
            value={stats.todayScans}
            icon="qr-code"
            color="#F59E0B"
          />
          <StatCard
            title="Total User"
            value={stats.totalUsers}
            icon="people"
            color="#EC4899"
          />
          <StatCard
            title="Menu Bermasalah"
            value={stats.problematicMenus}
            icon="warning"
            color="#EF4444"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#2563EB" }]}
              onPress={() => router.push("/(admin)/sppg")}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.quickActionText}>Tambah SPPG</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#10B981" }]}
              onPress={() => router.push("/(admin)/schools")}
            >
              <Ionicons name="school" size={24} color="white" />
              <Text style={styles.quickActionText}>Tambah Sekolah</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#8B5CF6" }]}
              onPress={() => router.push("/(admin)/menus")}
            >
              <Ionicons name="restaurant" size={24} color="white" />
              <Text style={styles.quickActionText}>Tambah Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#EC4899" }]}
              onPress={() => router.push("/(admin)/users")}
            >
              <Ionicons name="person-add" size={24} color="white" />
              <Text style={styles.quickActionText}>Tambah User</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          <View style={styles.activityList}>
            {recentMenus.length > 0 ? (
              recentMenus.map((menu) => (
                <View key={menu.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={
                        menu.menu_condition === "problematic"
                          ? "warning"
                          : "checkmark-circle"
                      }
                      size={20}
                      color={
                        menu.menu_condition === "problematic"
                          ? "#EF4444"
                          : "#10B981"
                      }
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{menu.menu_name}</Text>
                    <Text style={styles.activitySubtitle}>
                      {menu.sppg_name} •{" "}
                      {new Date(menu.production_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {menu.production_portion} porsi
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Text style={styles.emptyText}>Belum ada aktivitas</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: "47%",
    maxWidth: "48%",
    minHeight: 120,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  activityList: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  activityTime: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  emptyActivity: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
});
