// app/(owner)/_layout.tsx

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
import { useAuth } from "../../context/AuthContext";

// Components
import { SafeAreaView } from "react-native-safe-area-context";
import StatCard from "../../components/admin/StatCard";

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

// Mock data berdasarkan struktur database yang lengkap
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
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(MOCK_DATA);
  const [currentDate, setCurrentDate] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Format current date
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setCurrentDate(today.toLocaleDateString("id-ID", options));

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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="speedometer" size={48} color="#2563EB" />
        <Text style={styles.loadingText}>Memuat Dashboard Monitoring...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Monitoring Dashboard</Text>
            <Text style={styles.subtitleText}>{currentDate}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.monitoringBtn}
              onPress={() => navigateTo("/(owner)/monitoring")}
            >
              <Ionicons name="desktop" size={16} color="#2563EB" />
              <Text style={styles.monitoringBtnText}>Monitor All Data</Text>
            </TouchableOpacity>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>REAL-TIME</Text>
            </View>
          </View>
        </View>

        {/* Quick Overview Stats */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.overviewGrid}>
            <TouchableOpacity
              style={styles.overviewCard}
              onPress={() => navigateTo("/(owner)/sppg")}
            >
              <View style={styles.overviewIconContainer}>
                <Ionicons name="business" size={20} color="#2563EB" />
              </View>
              <Text style={styles.overviewNumber}>
                {dashboardData.overview_stats.total_sppg}
              </Text>
              <Text style={styles.overviewLabel}>SPPG</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.overviewCard}
              onPress={() => navigateTo("/(owner)/schools")}
            >
              <View style={styles.overviewIconContainer}>
                <Ionicons name="school" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.overviewNumber}>
                {dashboardData.overview_stats.total_schools}
              </Text>
              <Text style={styles.overviewLabel}>Sekolah</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.overviewCard}
              onPress={() => navigateTo("/(owner)/users")}
            >
              <View style={styles.overviewIconContainer}>
                <Ionicons name="people" size={20} color="#059669" />
              </View>
              <Text style={styles.overviewNumber}>
                {dashboardData.overview_stats.total_users}
              </Text>
              <Text style={styles.overviewLabel}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.overviewCard}
              onPress={() => navigateTo("/(owner)/monitoring")}
            >
              <View style={styles.overviewIconContainer}>
                <Ionicons name="menu" size={20} color="#D97706" />
              </View>
              <Text style={styles.overviewNumber}>
                {dashboardData.overview_stats.total_menu_items}
              </Text>
              <Text style={styles.overviewLabel}>Menu Items</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monitoring Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Data Monitoring</Text>
            <TouchableOpacity onPress={() => navigateTo("/(owner)/monitoring")}>
              <Text style={styles.viewAllText}>View Details →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monitoringStats}>
            <TouchableOpacity
              style={styles.monitoringStatCard}
              onPress={() => navigateTo("/(owner)/monitoring")}
            >
              <Ionicons name="grid" size={24} color="#2563EB" />
              <Text style={styles.monitoringStatNumber}>
                {dashboardData.monitoring_stats.data_tables}
              </Text>
              <Text style={styles.monitoringStatLabel}>Data Tables</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monitoringStatCard}
              onPress={() => navigateTo("/(owner)/audit/logs")}
            >
              <Ionicons name="server" size={24} color="#7C3AED" />
              <Text style={styles.monitoringStatNumber}>
                {dashboardData.monitoring_stats.total_records.toLocaleString()}
              </Text>
              <Text style={styles.monitoringStatLabel}>Total Records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monitoringStatCard}
              onPress={() => navigateTo("/(owner)/audit/history")}
            >
              <Ionicons name="git-compare" size={24} color="#059669" />
              <Text style={styles.monitoringStatNumber}>
                {dashboardData.monitoring_stats.recent_changes}
              </Text>
              <Text style={styles.monitoringStatLabel}>Recent Changes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Real-time Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse" size={18} color="#DC2626" />
            <Text style={styles.sectionTitle}>Real-time Status</Text>
            <Ionicons name="time" size={14} color="#6B7280" />
            <Text style={styles.timeAgoText}>Updated just now</Text>
          </View>

          {/* Menu Status */}
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>Menu Status</Text>
              <TouchableOpacity
                onPress={() => navigateTo("/(owner)/monitoring/menus")}
              >
                <Text style={styles.viewDetailsText}>View →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Pending"
                value={dashboardData.real_time_stats.menu_status.pending.toString()}
                icon="time"
                color="#D97706"
              />
              <StatCard
                title="In Production"
                value={dashboardData.real_time_stats.menu_status.production.toString()}
                icon="build"
                color="#2563EB"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Approved"
                value={dashboardData.real_time_stats.menu_status.approved.toString()}
                icon="checkmark-circle"
                color="#059669"
              />
              <StatCard
                title="Rejected"
                value={dashboardData.real_time_stats.menu_status.rejected.toString()}
                icon="close-circle"
                color="#DC2626"
              />
            </View>
          </View>

          {/* Distribution Status */}
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>Distribution Status</Text>
              <TouchableOpacity
                onPress={() =>
                  navigateTo("/(owner)/monitoring/school_menu_distribution")
                }
              >
                <Text style={styles.viewDetailsText}>View →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Pending"
                value={dashboardData.real_time_stats.distribution_status.pending.toString()}
                icon="hourglass"
                color="#D97706"
              />
              <StatCard
                title="Delivered"
                value={dashboardData.real_time_stats.distribution_status.delivered.toString()}
                icon="car"
                color="#2563EB"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Received"
                value={dashboardData.real_time_stats.distribution_status.received.toString()}
                icon="checkmark-done"
                color="#059669"
              />
              <StatCard
                title="Problematic"
                value={dashboardData.real_time_stats.distribution_status.problematic.toString()}
                icon="warning"
                color="#DC2626"
              />
            </View>
          </View>

          {/* QR Code Activity */}
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>QR Code Activity</Text>
              <TouchableOpacity
                onPress={() => navigateTo("/(owner)/monitoring/qr_codes")}
              >
                <Text style={styles.viewDetailsText}>Monitor →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Generated Today"
                value={dashboardData.real_time_stats.qr_activity.generated_today.toString()}
                icon="qr-code"
                color="#7C3AED"
              />
              <StatCard
                title="Used Today"
                value={dashboardData.real_time_stats.qr_activity.used_today.toString()}
                icon="checkmark-circle"
                color="#059669"
              />
            </View>
            <View style={styles.qrMetrics}>
              <View style={styles.qrMetric}>
                <Text style={styles.qrMetricLabel}>QR Usage Rate</Text>
                <Text style={styles.qrMetricValue}>
                  {Math.round(
                    (dashboardData.real_time_stats.qr_activity.used_today /
                      dashboardData.real_time_stats.qr_activity
                        .generated_today) *
                      100,
                  )}
                  %
                </Text>
              </View>
              <View style={styles.qrMetric}>
                <Text style={styles.qrMetricLabel}>Active QR Codes</Text>
                <Text style={styles.qrMetricValue}>
                  {dashboardData.real_time_stats.qr_activity.total_active}
                </Text>
              </View>
            </View>
          </View>

          {/* Problem Reports */}
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>Problem Reports</Text>
              <TouchableOpacity
                onPress={() =>
                  navigateTo("/(owner)/monitoring/problem_reports")
                }
              >
                <Text style={styles.viewDetailsText}>View →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.problemStats}>
              <View style={styles.problemStat}>
                <View
                  style={[styles.problemIcon, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="time" size={16} color="#D97706" />
                </View>
                <Text style={styles.problemNumber}>
                  {dashboardData.real_time_stats.problems_status.pending}
                </Text>
                <Text style={styles.problemLabel}>Pending</Text>
              </View>
              <View style={styles.problemStat}>
                <View
                  style={[styles.problemIcon, { backgroundColor: "#DBEAFE" }]}
                >
                  <Ionicons name="search" size={16} color="#2563EB" />
                </View>
                <Text style={styles.problemNumber}>
                  {dashboardData.real_time_stats.problems_status.investigating}
                </Text>
                <Text style={styles.problemLabel}>Investigating</Text>
              </View>
              <View style={styles.problemStat}>
                <View
                  style={[styles.problemIcon, { backgroundColor: "#D1FAE5" }]}
                >
                  <Ionicons name="checkmark" size={16} color="#059669" />
                </View>
                <Text style={styles.problemNumber}>
                  {dashboardData.real_time_stats.problems_status.resolved}
                </Text>
                <Text style={styles.problemLabel}>Resolved</Text>
              </View>
              <View style={styles.problemStat}>
                <View
                  style={[styles.problemIcon, { backgroundColor: "#FEE2E2" }]}
                >
                  <Ionicons name="close" size={16} color="#DC2626" />
                </View>
                <Text style={styles.problemNumber}>
                  {dashboardData.real_time_stats.problems_status.rejected}
                </Text>
                <Text style={styles.problemLabel}>Rejected</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={18} color="#059669" />
            <Text style={styles.sectionTitle}>Top Performers</Text>
            <TouchableOpacity
              onPress={() => navigateTo("/(owner)/reports/sppg-performance")}
            >
              <Text style={styles.viewAllText}>Compare →</Text>
            </TouchableOpacity>
          </View>

          {/* SPPG Performance */}
          <View style={styles.performerSection}>
            <Text style={styles.performerTitle}>SPPG Efficiency</Text>
            {dashboardData.top_performers.sppg_efficiency.map((sppg, index) => (
              <TouchableOpacity
                key={sppg.id}
                style={styles.performerItem}
                onPress={() => navigateTo(`/(owner)/sppg?view=${sppg.id}`)}
              >
                <View style={styles.performerRank}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{sppg.name}</Text>
                  <Text style={styles.performerDetails}>
                    {sppg.menus_completed} menus • {sppg.distribution_rate}%
                    rate
                  </Text>
                </View>
                <View style={styles.performerMetric}>
                  <Text style={styles.metricValue}>{sppg.efficiency}%</Text>
                  <Text style={styles.metricLabel}>Efficiency</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Schools Performance */}
          <View style={styles.performerSection}>
            <Text style={styles.performerTitle}>Top Receiving Schools</Text>
            {dashboardData.top_performers.schools_receiving.map(
              (school, index) => (
                <TouchableOpacity
                  key={school.id}
                  style={styles.performerItem}
                  onPress={() =>
                    navigateTo(`/(owner)/schools?view=${school.id}`)
                  }
                >
                  <View style={styles.performerRank}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.performerInfo}>
                    <Text style={styles.performerName}>{school.name}</Text>
                    <Text style={styles.performerDetails}>
                      {school.received_count} received • {school.problem_rate}%
                      problem rate
                    </Text>
                  </View>
                  <View style={styles.performerMetric}>
                    <Text style={styles.metricValue}>
                      {school.on_time_rate}%
                    </Text>
                    <Text style={styles.metricLabel}>On Time</Text>
                  </View>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={() => navigateTo("/(owner)/audit")}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {dashboardData.recent_activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityItem}
                onPress={() => navigateTo("/(owner)/audit/logs")}
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
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  <View style={styles.activityMeta}>
                    {activity.table_name && (
                      <Text style={styles.activityTable}>
                        {activity.table_name}
                      </Text>
                    )}
                    <Text style={styles.activityUser}>{activity.user}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigateTo("/(owner)/monitoring")}
          >
            <Ionicons name="desktop" size={20} color="#2563EB" />
            <Text style={styles.quickActionText}>Monitor All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigateTo("/(owner)/export/json")}
          >
            <Ionicons name="download" size={20} color="#059669" />
            <Text style={styles.quickActionText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigateTo("/(owner)/reports/period")}
          >
            <Ionicons name="analytics" size={20} color="#7C3AED" />
            <Text style={styles.quickActionText}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Ionicons name="information-circle" size={14} color="#6B7280" />
            <Text style={styles.footerText}>
              Monitoring {dashboardData.monitoring_stats.data_tables} tables
              with{" "}
              {dashboardData.monitoring_stats.total_records.toLocaleString()}{" "}
              records
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadDashboardData}
          >
            <Ionicons name="refresh" size={14} color="#2563EB" />
            <Text style={styles.refreshText}>Refresh Data</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: "white",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitleText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  headerActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  monitoringBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  monitoringBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#DC2626",
  },
  overviewSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 8,
  },
  overviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  overviewNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  timeAgoText: {
    fontSize: 11,
    color: "#6B7280",
  },
  monitoringStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  monitoringStatCard: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  monitoringStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },
  monitoringStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  subSection: {
    marginBottom: 24,
  },
  subSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  viewDetailsText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  qrMetrics: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  qrMetric: {
    flex: 1,
    alignItems: "center",
  },
  qrMetricLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  qrMetricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  problemStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
  },
  problemStat: {
    alignItems: "center",
    flex: 1,
  },
  problemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  problemNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  problemLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  performerSection: {
    marginBottom: 20,
  },
  performerTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  performerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  performerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  performerDetails: {
    fontSize: 11,
    color: "#6B7280",
  },
  performerMetric: {
    alignItems: "flex-end",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
  },
  metricLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  activitiesList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
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
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityTable: {
    fontSize: 10,
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activityUser: {
    fontSize: 10,
    color: "#6B7280",
  },
  activityTime: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickActionText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 8,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
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
    fontSize: 11,
    color: "#9CA3AF",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  refreshText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
});
