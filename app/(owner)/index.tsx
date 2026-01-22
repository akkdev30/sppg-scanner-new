// app/(owner)/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
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
  system_health: {
    database: {
      status: "healthy" | "warning" | "critical";
      response_time: number;
      tables_count: number;
      connection_count: number;
    };
    services: {
      authentication: { status: "up" | "down"; uptime: number };
      api_gateway: { status: "up" | "down"; request_count: number };
      notification: { status: "up" | "down"; queue_size: number };
    };
    last_check: string;
  };
  real_time_stats: {
    active_users: {
      total: number;
      by_role: { owner: number; admin: number; pic: number };
      last_24h_active: number;
    };
    distributions: {
      total_today: number;
      pending: number;
      in_progress: number;
      completed: number;
      problematic: number;
    };
    problems: {
      total_open: number;
      critical: number;
      warning: number;
      resolved_today: number;
    };
  };
  performance_metrics: {
    efficiency_score: number;
    distribution_efficiency: number;
    problem_resolution_rate: number;
    user_satisfaction: number;
    response_times: {
      api: number;
      database: number;
      authentication: number;
    };
    uptime: {
      last_24h: number;
      last_7d: number;
      last_30d: number;
    };
  };
}

// Mock data
const MOCK_DATA: DashboardData = {
  system_health: {
    database: {
      status: "healthy",
      response_time: 45,
      tables_count: 15,
      connection_count: 42,
    },
    services: {
      authentication: {
        status: "up",
        uptime: 99.8,
      },
      api_gateway: {
        status: "up",
        request_count: 2456,
      },
      notification: {
        status: "up",
        queue_size: 3,
      },
    },
    last_check: new Date().toISOString(),
  },
  real_time_stats: {
    active_users: {
      total: 156,
      by_role: {
        owner: 3,
        admin: 12,
        pic: 141,
      },
      last_24h_active: 89,
    },
    distributions: {
      total_today: 245,
      pending: 15,
      in_progress: 48,
      completed: 172,
      problematic: 10,
    },
    problems: {
      total_open: 8,
      critical: 2,
      warning: 4,
      resolved_today: 12,
    },
  },
  performance_metrics: {
    efficiency_score: 92.5,
    distribution_efficiency: 94.2,
    problem_resolution_rate: 88.7,
    user_satisfaction: 91.3,
    response_times: {
      api: 120,
      database: 45,
      authentication: 85,
    },
    uptime: {
      last_24h: 99.9,
      last_7d: 99.7,
      last_30d: 99.5,
    },
  },
};

export default function OwnerDashboard() {
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(MOCK_DATA);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="speedometer" size={48} color="#2563EB" />
        <Text style={styles.loadingText}>Memuat Dashboard...</Text>
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
        {/* Header with Last Updated */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>System Dashboard</Text>
            <Text style={styles.subtitleText}>
              Real-time monitoring & analytics
            </Text>
          </View>
          <View style={styles.timeBadge}>
            <Ionicons name="time" size={12} color="#6B7280" />
            <Text style={styles.timeText}>
              {new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {dashboardData.real_time_stats.active_users.total}
            </Text>
            <Text style={styles.quickStatLabel}>Active Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {dashboardData.real_time_stats.distributions.total_today}
            </Text>
            <Text style={styles.quickStatLabel}>Distributions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {dashboardData.performance_metrics.efficiency_score}%
            </Text>
            <Text style={styles.quickStatLabel}>Efficiency</Text>
          </View>
        </View>

        {/* Section 1: System Health Check */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>System Health Check</Text>
            <View
              style={[
                styles.statusBadge,
                dashboardData.system_health.database.status === "healthy" &&
                  styles.statusHealthy,
                dashboardData.system_health.database.status === "warning" &&
                  styles.statusWarning,
                dashboardData.system_health.database.status === "critical" &&
                  styles.statusCritical,
              ]}
            >
              <Text style={styles.statusText}>
                {dashboardData.system_health.database.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Response Time"
              value={`${dashboardData.system_health.database.response_time}ms`}
              icon="speedometer"
              color="#2563EB"
            />
            <StatCard
              title="Active Tables"
              value={dashboardData.system_health.database.tables_count.toString()}
              icon="grid"
              color="#7C3AED"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Connections"
              value={dashboardData.system_health.database.connection_count.toString()}
              icon="link"
              color="#059669"
            />
            <StatCard
              title="Requests"
              value={dashboardData.system_health.services.api_gateway.request_count.toLocaleString()}
              icon="stats-chart"
              color="#D97706"
            />
          </View>

          {/* Services Status */}
          <View style={styles.servicesSection}>
            <Text style={styles.servicesTitle}>Services Status</Text>
            <View style={styles.servicesGrid}>
              {[
                {
                  name: "Authentication",
                  status:
                    dashboardData.system_health.services.authentication.status,
                  uptime:
                    dashboardData.system_health.services.authentication.uptime,
                  icon: "lock-closed",
                },
                {
                  name: "API Gateway",
                  status:
                    dashboardData.system_health.services.api_gateway.status,
                  requests:
                    dashboardData.system_health.services.api_gateway
                      .request_count,
                  icon: "server",
                },
                {
                  name: "Notification",
                  status:
                    dashboardData.system_health.services.notification.status,
                  queue:
                    dashboardData.system_health.services.notification
                      .queue_size,
                  icon: "notifications",
                },
              ].map((service, index) => (
                <View key={index} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <Ionicons
                      name={service.icon as any}
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View
                      style={[
                        styles.serviceStatusDot,
                        service.status === "up"
                          ? styles.statusUp
                          : styles.statusDown,
                      ]}
                    />
                  </View>
                  <Text style={styles.serviceValue}>
                    {service.name === "Authentication" &&
                      `${service.uptime}% uptime`}
                    {service.name === "API Gateway" &&
                      `${service.requests?.toLocaleString()} req`}
                    {service.name === "Notification" &&
                      `Queue: ${service.queue}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Section 2: Real-time Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Real-time Statistics</Text>
            <Ionicons name="time" size={14} color="#6B7280" />
            <Text style={styles.timeAgoText}>Live</Text>
          </View>

          {/* Active Users */}
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Active Users</Text>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Active"
                value={dashboardData.real_time_stats.active_users.total.toString()}
                icon="people"
                color="#059669"
              />
              <StatCard
                title="24h Active"
                value={dashboardData.real_time_stats.active_users.last_24h_active.toString()}
                icon="time"
                color="#2563EB"
              />
            </View>

            {/* User Roles */}
            <View style={styles.rolesGrid}>
              <View style={styles.roleItem}>
                <View style={styles.roleIconContainer}>
                  <Ionicons name="shield" size={12} color="#059669" />
                </View>
                <Text style={styles.roleLabel}>Owner</Text>
                <Text style={styles.roleValue}>
                  {dashboardData.real_time_stats.active_users.by_role.owner}
                </Text>
              </View>
              <View style={styles.roleItem}>
                <View style={styles.roleIconContainer}>
                  <Ionicons name="settings" size={12} color="#2563EB" />
                </View>
                <Text style={styles.roleLabel}>Admin</Text>
                <Text style={styles.roleValue}>
                  {dashboardData.real_time_stats.active_users.by_role.admin}
                </Text>
              </View>
              <View style={styles.roleItem}>
                <View style={styles.roleIconContainer}>
                  <Ionicons name="school" size={12} color="#7C3AED" />
                </View>
                <Text style={styles.roleLabel}>PIC</Text>
                <Text style={styles.roleValue}>
                  {dashboardData.real_time_stats.active_users.by_role.pic}
                </Text>
              </View>
            </View>
          </View>

          {/* Distributions */}
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Today's Distributions</Text>
            <View style={styles.statsRow}>
              <StatCard
                title="Total"
                value={dashboardData.real_time_stats.distributions.total_today.toString()}
                icon="cube"
                color="#7C3AED"
              />
              <StatCard
                title="Completed"
                value={dashboardData.real_time_stats.distributions.completed.toString()}
                icon="checkmark-done"
                color="#059669"
              />
            </View>
            <View style={styles.statusBarContainer}>
              <View style={styles.statusBar}>
                <View
                  style={[
                    styles.statusBarSegment,
                    styles.statusCompleted,
                    {
                      width: `${(dashboardData.real_time_stats.distributions.completed / dashboardData.real_time_stats.distributions.total_today) * 100}%`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.statusBarSegment,
                    styles.statusInProgress,
                    {
                      width: `${(dashboardData.real_time_stats.distributions.in_progress / dashboardData.real_time_stats.distributions.total_today) * 100}%`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.statusBarSegment,
                    styles.statusProblematic,
                    {
                      width: `${(dashboardData.real_time_stats.distributions.problematic / dashboardData.real_time_stats.distributions.total_today) * 100}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.statusBarLabels}>
                <View style={styles.statusBarLabel}>
                  <View style={[styles.statusDot, styles.statusCompleted]} />
                  <Text style={styles.statusBarText}>
                    {dashboardData.real_time_stats.distributions.completed}{" "}
                    Completed
                  </Text>
                </View>
                <View style={styles.statusBarLabel}>
                  <View style={[styles.statusDot, styles.statusInProgress]} />
                  <Text style={styles.statusBarText}>
                    {dashboardData.real_time_stats.distributions.in_progress} In
                    Progress
                  </Text>
                </View>
                <View style={styles.statusBarLabel}>
                  <View style={[styles.statusDot, styles.statusProblematic]} />
                  <Text style={styles.statusBarText}>
                    {dashboardData.real_time_stats.distributions.problematic}{" "}
                    Problematic
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Problems */}
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Problem Reports</Text>
            <View style={styles.statsRow}>
              <StatCard
                title="Open Issues"
                value={dashboardData.real_time_stats.problems.total_open.toString()}
                icon="alert-circle"
                color="#DC2626"
              />
              <StatCard
                title="Resolved Today"
                value={dashboardData.real_time_stats.problems.resolved_today.toString()}
                icon="checkmark-circle"
                color="#059669"
              />
            </View>
            <View style={styles.problemsBreakdown}>
              <View style={styles.problemItem}>
                <View style={[styles.problemDot, styles.criticalDot]} />
                <Text style={styles.problemText}>
                  {dashboardData.real_time_stats.problems.critical} Critical
                </Text>
              </View>
              <View style={styles.problemItem}>
                <View style={[styles.problemDot, styles.warningDot]} />
                <Text style={styles.problemText}>
                  {dashboardData.real_time_stats.problems.warning} Warning
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Performance Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="System Efficiency"
              value={`${dashboardData.performance_metrics.efficiency_score}%`}
              icon="speedometer"
              color="#059669"
            />
            <StatCard
              title="Distribution Eff."
              value={`${dashboardData.performance_metrics.distribution_efficiency}%`}
              icon="cube"
              color="#2563EB"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Resolution Rate"
              value={`${dashboardData.performance_metrics.problem_resolution_rate}%`}
              icon="checkmark-done"
              color="#7C3AED"
            />
            <StatCard
              title="Satisfaction"
              value={`${dashboardData.performance_metrics.user_satisfaction}%`}
              icon="happy"
              color="#D97706"
            />
          </View>

          {/* Response Times */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>API Response</Text>
              <Text style={styles.metricValue}>
                {dashboardData.performance_metrics.response_times.api}ms
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Database</Text>
              <Text style={styles.metricValue}>
                {dashboardData.performance_metrics.response_times.database}ms
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Auth</Text>
              <Text style={styles.metricValue}>
                {
                  dashboardData.performance_metrics.response_times
                    .authentication
                }
                ms
              </Text>
            </View>
          </View>

          {/* Uptime */}
          <View style={styles.uptimeContainer}>
            <Text style={styles.uptimeTitle}>System Uptime</Text>
            <View style={styles.uptimeGrid}>
              {[
                {
                  label: "24h",
                  value: dashboardData.performance_metrics.uptime.last_24h,
                },
                {
                  label: "7d",
                  value: dashboardData.performance_metrics.uptime.last_7d,
                },
                {
                  label: "30d",
                  value: dashboardData.performance_metrics.uptime.last_30d,
                },
              ].map((uptime, index) => (
                <View key={index} style={styles.uptimeItem}>
                  <Text style={styles.uptimeLabel}>{uptime.label}</Text>
                  <Text style={styles.uptimeValue}>{uptime.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.lastUpdated}>
            Last updated: {new Date().toLocaleTimeString("id-ID")}
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadDashboardData}
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
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  subtitleText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#6B7280",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusHealthy: {
    backgroundColor: "#D1FAE5",
  },
  statusWarning: {
    backgroundColor: "#FEF3C7",
  },
  statusCritical: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  servicesSection: {
    marginTop: 16,
  },
  servicesTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  servicesGrid: {
    gap: 8,
  },
  serviceCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  serviceName: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  serviceStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusUp: {
    backgroundColor: "#059669",
  },
  statusDown: {
    backgroundColor: "#DC2626",
  },
  serviceValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  timeAgoText: {
    fontSize: 11,
    color: "#6B7280",
  },
  subSection: {
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  rolesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  roleItem: {
    alignItems: "center",
    flex: 1,
  },
  roleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  roleLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  roleValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  statusBarContainer: {
    marginTop: 12,
  },
  statusBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  statusBarSegment: {
    height: "100%",
  },
  statusCompleted: {
    backgroundColor: "#059669",
  },
  statusInProgress: {
    backgroundColor: "#D97706",
  },
  statusProblematic: {
    backgroundColor: "#DC2626",
  },
  statusBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusBarLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBarText: {
    fontSize: 11,
    color: "#6B7280",
  },
  problemsBreakdown: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  problemItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  problemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  criticalDot: {
    backgroundColor: "#DC2626",
  },
  warningDot: {
    backgroundColor: "#D97706",
  },
  problemText: {
    fontSize: 11,
    color: "#6B7280",
  },
  metricsGrid: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
  },
  uptimeContainer: {
    marginTop: 16,
  },
  uptimeTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  uptimeGrid: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  uptimeItem: {
    flex: 1,
    alignItems: "center",
  },
  uptimeLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  uptimeValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
  },
  lastUpdated: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "500",
  },
});
