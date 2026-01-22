// app/(owner)/index.tsx - OWNER DASHBOARD

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

// Types
interface DashboardData {
  overview_stats: {
    total_sppg: number;
    total_schools: number;
    total_users: number;
    total_menu_items: number;
  };
  real_time_stats: {
    menu_status: {
      pending: number;
      approved: number;
      rejected: number;
      production: number;
    };
    distribution_status: {
      pending: number;
      delivered: number;
      received: number;
      problematic: number;
    };
    qr_activity: {
      generated_today: number;
      used_today: number;
      total_active: number;
      unused: number;
    };
    problems_status: {
      pending: number;
      investigating: number;
      resolved: number;
      rejected: number;
    };
  };
  monitoring_stats: {
    data_tables: number;
    total_records: number;
    recent_changes: number;
    audit_logs_today: number;
  };
  top_performers: {
    sppg_efficiency: Array<{
      id: string;
      name: string;
      efficiency: number;
      menus_completed: number;
      distribution_rate: number;
    }>;
    schools_receiving: Array<{
      id: string;
      name: string;
      received_count: number;
      problem_rate: number;
      on_time_rate: number;
    }>;
    active_users: Array<{
      id: string;
      name: string;
      role: string;
      activity_count: number;
      last_active: string;
    }>;
  };
  recent_activities: Array<{
    id: string;
    type: string;
    description: string;
    table_name?: string;
    user: string;
    time: string;
    icon: string;
    color: string;
  }>;
}

// Mock data
const MOCK_DATA: DashboardData = {
  overview_stats: {
    total_sppg: 8,
    total_schools: 156,
    total_users: 187,
    total_menu_items: 345,
  },
  real_time_stats: {
    menu_status: {
      pending: 15,
      approved: 42,
      rejected: 3,
      production: 28,
    },
    distribution_status: {
      pending: 36,
      delivered: 89,
      received: 78,
      problematic: 12,
    },
    qr_activity: {
      generated_today: 245,
      used_today: 156,
      total_active: 456,
      unused: 89,
    },
    problems_status: {
      pending: 8,
      investigating: 4,
      resolved: 24,
      rejected: 2,
    },
  },
  monitoring_stats: {
    data_tables: 15,
    total_records: 14523,
    recent_changes: 156,
    audit_logs_today: 324,
  },
  top_performers: {
    sppg_efficiency: [
      {
        id: "1",
        name: "SPPG A",
        efficiency: 95.2,
        menus_completed: 45,
        distribution_rate: 98.5,
      },
      {
        id: "2",
        name: "SPPG B",
        efficiency: 92.8,
        menus_completed: 38,
        distribution_rate: 96.3,
      },
      {
        id: "3",
        name: "SPPG C",
        efficiency: 88.5,
        menus_completed: 32,
        distribution_rate: 94.7,
      },
    ],
    schools_receiving: [
      {
        id: "1",
        name: "SDN 01",
        received_count: 42,
        problem_rate: 2.4,
        on_time_rate: 98.7,
      },
      {
        id: "2",
        name: "SMP 02",
        received_count: 38,
        problem_rate: 1.8,
        on_time_rate: 99.1,
      },
      {
        id: "3",
        name: "SDN 03",
        received_count: 35,
        problem_rate: 3.2,
        on_time_rate: 97.5,
      },
    ],
    active_users: [
      {
        id: "1",
        name: "Admin A",
        role: "Admin",
        activity_count: 156,
        last_active: "10:30",
      },
      {
        id: "2",
        name: "PIC B",
        role: "PIC",
        activity_count: 132,
        last_active: "09:45",
      },
      {
        id: "3",
        name: "Owner",
        role: "Owner",
        activity_count: 89,
        last_active: "11:15",
      },
    ],
  },
  recent_activities: [
    {
      id: "1",
      type: "data_change",
      description: "Menu data updated in menus table",
      table_name: "menus",
      user: "Admin A",
      time: "10:30",
      icon: "create",
      color: "#2563EB",
    },
    {
      id: "2",
      type: "problem_reported",
      description: "New problem reported from SDN 01",
      table_name: "problem_reports",
      user: "PIC Sekolah",
      time: "09:45",
      icon: "warning",
      color: "#DC2626",
    },
    {
      id: "3",
      type: "qr_scan",
      description: "QR Code scan completed by SMP 02",
      table_name: "scan_logs",
      user: "SMP 02",
      time: "08:20",
      icon: "scan",
      color: "#059669",
    },
    {
      id: "4",
      type: "distribution_completed",
      description: "Distribution recorded as received",
      table_name: "school_menu_distribution",
      user: "SPPG B",
      time: "07:15",
      icon: "checkmark-circle",
      color: "#7C3AED",
    },
    {
      id: "5",
      type: "audit_log",
      description: "User data modified in users table",
      table_name: "users",
      user: "System",
      time: "06:30",
      icon: "shield",
      color: "#D97706",
    },
  ],
};

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(MOCK_DATA);
  const [currentTime, setCurrentTime] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Format current time
      const now = new Date();
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setCurrentTime(now.toLocaleTimeString("id-ID", timeOptions));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setDashboardData(MOCK_DATA);
    } catch (error: any) {
      console.error("Failed to load dashboard:", error);
      Alert.alert("Error", "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Auto-refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const navigateTo = (screen: string) => {
    router.push(screen as any);
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Konfirmasi Logout",
        "Apakah Anda yakin ingin logout?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              await logout();
              router.replace("/(auth)/login");
            },
          },
        ],
        { cancelable: true },
      );
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan logout");
    }
  };

  const getUserInitial = () => {
    if (!user?.full_name) return "O";
    return user.full_name.charAt(0).toUpperCase();
  };

  // Stat Card Component
  const StatCard = ({
    title,
    value,
    icon,
    color,
    onPress,
  }: {
    title: string;
    value: string;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Header with User Info */}
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>{getUserInitial()}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.full_name || "Owner Dashboard"}
            </Text>
            <Text style={styles.userRole} numberOfLines={1}>
              {user?.role ? user.role.toUpperCase() : "OWNER"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.welcomeText}>Monitoring Dashboard</Text>
            <Text style={styles.subtitleText}>
              Real-time system overview and analytics
            </Text>
          </View>
          <TouchableOpacity
            style={styles.monitorAllButton}
            onPress={() => navigateTo("/(owner)/monitoring")}
            activeOpacity={0.7}
          >
            <Ionicons name="eye" size={16} color="#2563EB" />
            <Text style={styles.monitorAllText}>Monitor All</Text>
          </TouchableOpacity>
        </View>

        {/* System Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={18} color="#374151" />
            <Text style={styles.sectionTitle}>System Overview</Text>
          </View>
          <View style={styles.overviewGrid}>
            <StatCard
              title="SPPG"
              value={dashboardData.overview_stats.total_sppg.toString()}
              icon="business"
              color="#3B82F6"
              onPress={() => navigateTo("/(owner)/monitoring/sppg_masters")}
            />
            <StatCard
              title="Schools"
              value={dashboardData.overview_stats.total_schools.toString()}
              icon="school"
              color="#8B5CF6"
              onPress={() => navigateTo("/(owner)/monitoring/schools")}
            />
            <StatCard
              title="Users"
              value={dashboardData.overview_stats.total_users.toString()}
              icon="people"
              color="#10B981"
              onPress={() => navigateTo("/(owner)/monitoring/users")}
            />
            <StatCard
              title="Menu Items"
              value={dashboardData.overview_stats.total_menu_items.toString()}
              icon="restaurant"
              color="#F59E0B"
              onPress={() => navigateTo("/(owner)/monitoring/menu_items")}
            />
          </View>
        </View>

        {/* Data Monitoring Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server" size={18} color="#374151" />
            <Text style={styles.sectionTitle}>Data Monitoring</Text>
            <TouchableOpacity
              onPress={() => navigateTo("/(owner)/monitoring")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.monitoringStats}>
            <View style={styles.monitoringStat}>
              <Ionicons name="grid-outline" size={20} color="#2563EB" />
              <Text style={styles.monitoringValue}>
                {dashboardData.monitoring_stats.data_tables}
              </Text>
              <Text style={styles.monitoringLabel}>Tables</Text>
            </View>
            <View style={styles.monitoringStat}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#7C3AED"
              />
              <Text style={styles.monitoringValue}>
                {dashboardData.monitoring_stats.total_records.toLocaleString()}
              </Text>
              <Text style={styles.monitoringLabel}>Records</Text>
            </View>
            <View style={styles.monitoringStat}>
              <Ionicons name="git-compare-outline" size={20} color="#10B981" />
              <Text style={styles.monitoringValue}>
                {dashboardData.monitoring_stats.recent_changes}
              </Text>
              <Text style={styles.monitoringLabel}>Changes</Text>
            </View>
            <View style={styles.monitoringStat}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#F59E0B"
              />
              <Text style={styles.monitoringValue}>
                {dashboardData.monitoring_stats.audit_logs_today}
              </Text>
              <Text style={styles.monitoringLabel}>Audit Logs</Text>
            </View>
          </View>
        </View>

        {/* Real-time Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse" size={18} color="#DC2626" />
            <Text style={styles.sectionTitle}>Real-time Status</Text>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.timeAgoText}>Just now</Text>
          </View>

          {/* Menu Status */}
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Menu Status</Text>
              <TouchableOpacity
                onPress={() => navigateTo("/(owner)/monitoring/menus")}
                activeOpacity={0.7}
              >
                <Text style={styles.viewDetailsText}>View →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#FEF3C7" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#D97706" }]}>
                    {dashboardData.real_time_stats.menu_status.pending}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Pending</Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#DBEAFE" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#2563EB" }]}>
                    {dashboardData.real_time_stats.menu_status.production}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Production</Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#D1FAE5" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#059669" }]}>
                    {dashboardData.real_time_stats.menu_status.approved}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Approved</Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#FEE2E2" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#DC2626" }]}>
                    {dashboardData.real_time_stats.menu_status.rejected}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          {/* Distribution Status */}
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Distribution Status</Text>
              <TouchableOpacity
                onPress={() =>
                  navigateTo("/(owner)/monitoring/school_menu_distribution")
                }
                activeOpacity={0.7}
              >
                <Text style={styles.viewDetailsText}>View →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#FEF3C7" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#D97706" }]}>
                    {dashboardData.real_time_stats.distribution_status.pending}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Pending</Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#DBEAFE" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#2563EB" }]}>
                    {
                      dashboardData.real_time_stats.distribution_status
                        .delivered
                    }
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Delivered</Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#D1FAE5" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#059669" }]}>
                    {dashboardData.real_time_stats.distribution_status.received}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Received</Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#FEE2E2" }]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#DC2626" }]}>
                    {
                      dashboardData.real_time_stats.distribution_status
                        .problematic
                    }
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Problematic</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigateTo("/(owner)/monitoring")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#EFF6FF" }]}
              >
                <Ionicons name="eye" size={20} color="#2563EB" />
              </View>
              <Text style={styles.quickActionText}>Monitor All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigateTo("/(owner)/reports")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#F0FDF4" }]}
              >
                <Ionicons name="analytics" size={20} color="#059669" />
              </View>
              <Text style={styles.quickActionText}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigateTo("/(owner)/settings")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FEFCE8" }]}
              >
                <Ionicons name="settings" size={20} color="#D97706" />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigateTo("/(owner)/export")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#F5F3FF" }]}
              >
                <Ionicons name="download" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.quickActionText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={18} color="#374151" />
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity
              onPress={() => navigateTo("/(owner)/monitoring/activity_logs")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesList}>
            {dashboardData.recent_activities.slice(0, 3).map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityItem}
                onPress={() =>
                  navigateTo(`/(owner)/monitoring/${activity.table_name}`)
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${activity.color}15` },
                  ]}
                >
                  <Ionicons
                    name={activity.icon as any}
                    size={16}
                    color={activity.color}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityDescription} numberOfLines={2}>
                    {activity.description}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityUser}>{activity.user}</Text>
                    <Text style={styles.activityTime}>• {activity.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#9CA3AF"
            />
            <Text style={styles.footerText}>
              Monitoring {dashboardData.monitoring_stats.data_tables} tables
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadDashboardData}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={14} color="#2563EB" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInitial: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
  timeText: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "white",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  monitorAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  monitorAllText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  viewAllText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  timeAgoText: {
    fontSize: 12,
    color: "#6B7280",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  monitoringStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monitoringStat: {
    alignItems: "center",
    flex: 1,
  },
  monitoringValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },
  monitoringLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusSection: {
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  viewDetailsText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statusItem: {
    width: "48%",
    alignItems: "center",
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  activitiesList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 18,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityUser: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
});
