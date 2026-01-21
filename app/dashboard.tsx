// app/dashboard/owner.tsx
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useAuth } from "../context/AuthContext";

interface DashboardStats {
  totalSPPG: number;
  totalSchools: number;
  totalMenus: number;
  totalQRScans: number;
  todayScans: number;
  problematicMenus: number;
  activeZones: number;
  totalStudents: number;
}

interface ScanTrend {
  date: string;
  count: number;
}

interface ZoneDistribution {
  name: string;
  count: number;
  color: string;
}

interface MenuPerformance {
  menuName: string;
  productionPortion: number;
  receivedPortion: number;
  efficiency: number;
  problemCount: number;
}

interface RecentScan {
  id: string;
  schoolName: string;
  sppgName: string;
  menuName: string;
  scannedAt: string;
  status: string;
}

interface AlertItem {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
}

const API_URL = "https://niftiest-longanamous-dreama.ngrok-free.dev:3000/api";
const { width: screenWidth } = Dimensions.get("window");

export default function OwnerDashboardScreen() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSPPG: 0,
    totalSchools: 0,
    totalMenus: 0,
    totalQRScans: 0,
    todayScans: 0,
    problematicMenus: 0,
    activeZones: 0,
    totalStudents: 0,
  });

  const [scanTrends, setScanTrends] = useState<ScanTrend[]>([]);
  const [zoneDistribution, setZoneDistribution] = useState<ZoneDistribution[]>(
    [],
  );
  const [topMenus, setTopMenus] = useState<MenuPerformance[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (
    showLoading: boolean = true,
  ): Promise<void> => {
    try {
      if (showLoading) setLoading(true);

      // Load all dashboard data in parallel
      const [statsRes, trendsRes, zonesRes, menusRes, scansRes, alertsRes] =
        await Promise.allSettled([
          axios.get(`${API_URL}/owner/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/owner/dashboard/scan-trends?days=7`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/owner/dashboard/zone-distribution`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/owner/dashboard/menu-performance?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/owner/dashboard/recent-scans?limit=10`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/owner/dashboard/alerts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      // Process responses
      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.stats);
      }

      if (trendsRes.status === "fulfilled" && trendsRes.value.data.success) {
        setScanTrends(trendsRes.value.data.trends);
      }

      if (zonesRes.status === "fulfilled" && zonesRes.value.data.success) {
        setZoneDistribution(zonesRes.value.data.distribution);
      }

      if (menusRes.status === "fulfilled" && menusRes.value.data.success) {
        setTopMenus(menusRes.value.data.menus);
      }

      if (scansRes.status === "fulfilled" && scansRes.value.data.success) {
        setRecentScans(scansRes.value.data.scans);
      }

      if (alertsRes.status === "fulfilled" && alertsRes.value.data.success) {
        setAlerts(alertsRes.value.data.alerts);
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
      Alert.alert("Error", "Gagal memuat data dashboard");
    } finally {
      if (showLoading) setLoading(false);
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

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIcon}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value.toLocaleString()}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const AlertCard: React.FC<{ alert: AlertItem }> = ({ alert }) => {
    const getAlertColor = () => {
      switch (alert.type) {
        case "error":
          return "#EF4444";
        case "warning":
          return "#F59E0B";
        case "info":
          return "#3B82F6";
        default:
          return "#6B7280";
      }
    };

    return (
      <View style={[styles.alertCard, { borderLeftColor: getAlertColor() }]}>
        <View style={styles.alertHeader}>
          <Text style={[styles.alertTitle, { color: getAlertColor() }]}>
            {alert.title}
          </Text>
          <Text style={styles.alertTime}>
            {new Date(alert.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text style={styles.alertMessage}>{alert.message}</Text>
      </View>
    );
  };

  const QuickAction: React.FC<{
    title: string;
    icon: string;
    onPress: () => void;
    color: string;
  }> = ({ title, icon, onPress, color }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Dashboard Owner</Text>
            <Text style={styles.headerSubtitle}>
              Super Admin - Sistem Monitoring SPPG
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickStats}
        >
          <StatCard
            title="Total SPPG"
            value={stats.totalSPPG}
            icon="🏢"
            color="#3B82F6"
          />
          <StatCard
            title="Sekolah"
            value={stats.totalSchools}
            icon="🏫"
            color="#10B981"
            subtitle={`${stats.totalStudents.toLocaleString()} siswa`}
          />
          <StatCard
            title="Scan QR"
            value={stats.totalQRScans}
            icon="📱"
            color="#8B5CF6"
            subtitle={`${stats.todayScans} hari ini`}
          />
          <StatCard
            title="Menu Bermasalah"
            value={stats.problematicMenus}
            icon="⚠️"
            color="#F59E0B"
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Manage SPPG"
              icon="🏢"
              color="#3B82F6"
              onPress={() => router.push("/owner/sppg-management")}
            />
            <QuickAction
              title="Manage Schools"
              icon="🏫"
              color="#10B981"
              onPress={() => router.push("/owner/school-management")}
            />
            <QuickAction
              title="Reports"
              icon="📊"
              color="#8B5CF6"
              onPress={() => router.push("/owner/reports")}
            />
            <QuickAction
              title="Settings"
              icon="⚙️"
              color="#6B7280"
              onPress={() => router.push("/owner/settings")}
            />
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics & Trends</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" />
          ) : (
            <>
              {/* Scan Trends Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Scan Trends (7 Hari)</Text>
                {scanTrends.length > 0 ? (
                  <LineChart
                    data={{
                      labels: scanTrends.map((t) => t.date.split("-")[2]),
                      datasets: [
                        {
                          data: scanTrends.map((t) => t.count),
                        },
                      ],
                    }}
                    width={screenWidth - 48}
                    height={200}
                    chartConfig={{
                      backgroundColor: "#FFFFFF",
                      backgroundGradientFrom: "#FFFFFF",
                      backgroundGradientTo: "#FFFFFF",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <Text style={styles.noDataText}>No data available</Text>
                )}
              </View>

              {/* Zone Distribution */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Distribusi Zona</Text>
                {zoneDistribution.length > 0 ? (
                  <PieChart
                    data={zoneDistribution}
                    width={screenWidth - 48}
                    height={200}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                ) : (
                  <Text style={styles.noDataText}>No data available</Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* Recent Scans & Alerts */}
        <View style={styles.section}>
          <View style={styles.halfSection}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            {recentScans.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No recent scans</Text>
              </View>
            ) : (
              recentScans.slice(0, 5).map((scan, index) => (
                <View key={scan.id || index} style={styles.scanCard}>
                  <View style={styles.scanHeader}>
                    <Text style={styles.scanSchool}>{scan.schoolName}</Text>
                    <Text style={styles.scanTime}>
                      {new Date(scan.scannedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Text style={styles.scanMenu}>{scan.menuName}</Text>
                  <Text style={styles.scanSPPG}>{scan.sppgName}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.halfSection}>
            <Text style={styles.sectionTitle}>System Alerts</Text>
            {alerts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No alerts</Text>
              </View>
            ) : (
              alerts
                .slice(0, 3)
                .map((alert, index) => (
                  <AlertCard key={alert.id || index} alert={alert} />
                ))
            )}
          </View>
        </View>

        {/* Menu Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Menu Performance</Text>
          {topMenus.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No menu data</Text>
            </View>
          ) : (
            <View style={styles.performanceTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Menu</Text>
                <Text style={styles.tableHeaderCell}>Produksi</Text>
                <Text style={styles.tableHeaderCell}>Diterima</Text>
                <Text style={styles.tableHeaderCell}>Efisiensi</Text>
              </View>
              {topMenus.map((menu, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell} numberOfLines={1}>
                    {menu.menuName}
                  </Text>
                  <Text style={styles.tableCell}>{menu.productionPortion}</Text>
                  <Text style={styles.tableCell}>{menu.receivedPortion}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        color:
                          menu.efficiency >= 90
                            ? "#10B981"
                            : menu.efficiency >= 80
                              ? "#F59E0B"
                              : "#EF4444",
                      },
                    ]}
                  >
                    {menu.efficiency}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Export Button */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={() => router.push("/owner/export")}
      >
        <Text style={styles.exportButtonIcon}>📥</Text>
        <Text style={styles.exportButtonText}>Export Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#1F2937",
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "500",
  },
  quickStats: {
    paddingHorizontal: 16,
  },
  statCard: {
    width: 160,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statIconText: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  statTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    marginTop: 2,
  },
  statSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: 80,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  chartTitle: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
  },
  halfSection: {
    flex: 1,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  scanCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  scanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  scanSchool: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  scanTime: {
    color: "#6B7280",
    fontSize: 12,
  },
  scanMenu: {
    color: "#374151",
    fontSize: 13,
    marginBottom: 2,
  },
  scanSPPG: {
    color: "#6B7280",
    fontSize: 11,
  },
  alertCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  alertTime: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  alertMessage: {
    color: "#4B5563",
    fontSize: 12,
  },
  performanceTable: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderCell: {
    flex: 1,
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableCell: {
    flex: 1,
    color: "#4B5563",
    fontSize: 13,
  },
  exportButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exportButtonIcon: {
    color: "white",
    fontSize: 16,
    marginRight: 8,
  },
  exportButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  noDataText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    padding: 20,
  },
});
