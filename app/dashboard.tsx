// app/dashboard.tsx
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

interface Stats {
  totalScans: number;
  todayScans: number;
  activeUsers: number;
  zones: number;
}

interface MonitoringItem {
  id: string;
  "NAMA SPPG": string;
  "NAMA SEKOLAH": string;
  TANGGAL: string;
  "JAM TERIMA": string;
  "JAM PRODUKSI": string;
  "MAX. KONSUMSI": string;
  MENU: string;
  "NAMA PIC": string;
  "KET.": string;
  STATUS: string;
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon: string;
}

const API_URL = "https://sppg-backend.vercel.app/api";

export default function DashboardScreen() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats>({
    totalScans: 0,
    todayScans: 0,
    activeUsers: 0,
    zones: 0,
  });
  const [monitoring, setMonitoring] = useState<MonitoringItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Load stats
      try {
        const statsResponse = await axios.get(
          `${API_URL}/monitoring/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
      } catch (error) {
        console.log("Stats endpoint not available, using default values");
      }

      // Load today's monitoring
      try {
        const monitoringResponse = await axios.get(
          `${API_URL}/monitoring/today`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (monitoringResponse.data.success) {
          setMonitoring(monitoringResponse.data.data);
        }
      } catch (error) {
        console.error("Load monitoring error:", error);
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statCardContent}>
        <View style={styles.statCardText}>
          <Text style={styles.statCardTitle}>{title}</Text>
          <Text style={styles.statCardValue}>{value}</Text>
        </View>
        <View style={styles.statCardIcon}>
          <Text style={styles.statCardIconText}>{icon}</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "menunggu":
        return "#EAB308";
      case "diterima":
        return "#3B82F6";
      case "produksi":
        return "#8B5CF6";
      case "distribusi":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Welcome, {user?.name || "User"}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userInfoLabel}>
            {user?.role?.toUpperCase() || "USER"}
          </Text>
          {user?.sppg_zone && (
            <Text style={styles.userInfoZone}>{user.sppg_zone}</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          {/* Statistics */}
          <Text style={styles.sectionTitle}>Statistik Hari Ini</Text>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statWrapper}>
                <StatCard
                  title="Total Scan"
                  value={stats.totalScans}
                  color="#3B82F6"
                  icon="📊"
                />
              </View>
              <View style={styles.statWrapper}>
                <StatCard
                  title="Scan Hari Ini"
                  value={stats.todayScans}
                  color="#10B981"
                  icon="✓"
                />
              </View>
            </View>
          )}

          {/* Scan Barcode Button */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push("/scanner")}
          >
            <View style={styles.scanButtonIcon}>
              <Text style={styles.scanButtonIconText}>📷</Text>
            </View>
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </TouchableOpacity>

          {/* Monitoring List */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Monitoring Hari Ini
          </Text>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : monitoring.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>
                Belum ada data monitoring hari ini
              </Text>
            </View>
          ) : (
            <View style={styles.monitoringList}>
              {monitoring.map((item, index) => (
                <View key={item.id || index} style={styles.monitoringCard}>
                  {/* Header */}
                  <View style={styles.monitoringHeader}>
                    <View style={styles.monitoringHeaderLeft}>
                      <Text style={styles.monitoringSchool}>
                        {item["NAMA SEKOLAH"]}
                      </Text>
                      <Text style={styles.monitoringZone}>
                        {item["NAMA SPPG"]}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.STATUS) },
                      ]}
                    >
                      <Text style={styles.statusText}>{item.STATUS}</Text>
                    </View>
                  </View>

                  {/* Times */}
                  <View style={styles.monitoringTimes}>
                    <View style={styles.timeItem}>
                      <Text style={styles.timeLabel}>Jam Terima</Text>
                      <Text style={styles.timeValue}>
                        {item["JAM TERIMA"] || "-"}
                      </Text>
                    </View>
                    <View style={styles.timeItem}>
                      <Text style={styles.timeLabel}>Jam Produksi</Text>
                      <Text style={styles.timeValue}>
                        {item["JAM PRODUKSI"] || "-"}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  {(item.MENU || item["NAMA PIC"] || item["MAX. KONSUMSI"]) && (
                    <View style={styles.monitoringDetails}>
                      {item.MENU && (
                        <Text style={styles.detailText}>Menu: {item.MENU}</Text>
                      )}
                      {item["MAX. KONSUMSI"] && (
                        <Text style={styles.detailText}>
                          Max Konsumsi: {item["MAX. KONSUMSI"]}
                        </Text>
                      )}
                      {item["NAMA PIC"] && (
                        <Text style={styles.detailText}>
                          PIC: {item["NAMA PIC"]}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Notes */}
                  {item["KET."] && item["KET."] !== "-" && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Catatan:</Text>
                      <Text style={styles.notesText}>{item["KET."]}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#2563EB",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "500",
  },
  userInfo: {
    backgroundColor: "rgba(29, 78, 216, 0.5)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfoLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  userInfoZone: {
    color: "#DBEAFE",
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statWrapper: {
    flex: 1,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
  },
  statCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statCardText: {
    flex: 1,
  },
  statCardTitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  statCardValue: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  statCardIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardIconText: {
    fontSize: 24,
  },
  scanButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonIcon: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  scanButtonIconText: {
    fontSize: 28,
  },
  scanButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  monitoringList: {
    gap: 12,
  },
  monitoringCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monitoringHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  monitoringHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  monitoringSchool: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  monitoringZone: {
    color: "#6B7280",
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  monitoringTimes: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
  },
  monitoringDetails: {
    gap: 6,
    marginBottom: 8,
  },
  detailText: {
    color: "#4B5563",
    fontSize: 14,
  },
  notesContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  notesLabel: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    color: "#78350F",
    fontSize: 13,
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
});
