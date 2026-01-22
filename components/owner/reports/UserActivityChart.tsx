// components/owner/reports/UserActivityChart.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserActivityData {
  id: string;
  username: string;
  role: string;
  total_logins: number;
  last_login: string;
  activities_count: number;
  distribution_count: number;
  scan_count: number;
}

interface UserActivityChartProps {
  data: UserActivityData[];
}

export default function UserActivityChart({ data }: UserActivityChartProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "#DC2626";
      case "admin":
        return "#2563EB";
      case "pic":
        return "#7C3AED";
      default:
        return "#6B7280";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return "shield";
      case "admin":
        return "settings";
      case "pic":
        return "school";
      default:
        return "person";
    }
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Find max values for scaling
  const maxActivities = Math.max(...data.map((user) => user.activities_count));
  const maxDistributions = Math.max(
    ...data.map((user) => user.distribution_count),
  );
  const maxScans = Math.max(...data.map((user) => user.scan_count));

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>User</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Role</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Logins</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Last Active</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Activities</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Distributions</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Scans</Text>
        </View>
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {data.map((user, index) => (
          <TouchableOpacity key={user.id} style={styles.userRow}>
            {/* Username */}
            <View style={styles.cell}>
              <View style={styles.userInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: `${getRoleColor(user.role)}20` },
                  ]}
                >
                  <Ionicons
                    name={getRoleIcon(user.role)}
                    size={14}
                    color={getRoleColor(user.role)}
                  />
                </View>
                <Text style={styles.username} numberOfLines={1}>
                  {user.username}
                </Text>
              </View>
            </View>

            {/* Role */}
            <View style={styles.cell}>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: `${getRoleColor(user.role)}20` },
                ]}
              >
                <Text
                  style={[styles.roleText, { color: getRoleColor(user.role) }]}
                >
                  {user.role.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Total Logins */}
            <View style={styles.cell}>
              <Text style={styles.valueText}>{user.total_logins}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(user.total_logins / Math.max(...data.map((u) => u.total_logins))) * 100}%`,
                      backgroundColor: getRoleColor(user.role),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Last Login */}
            <View style={styles.cell}>
              <Text style={styles.timeText}>
                {formatLastLogin(user.last_login)}
              </Text>
              <Ionicons name="time" size={10} color="#9CA3AF" />
            </View>

            {/* Activities Count */}
            <View style={styles.cell}>
              <Text style={styles.valueText}>{user.activities_count}</Text>
              <View style={styles.activityBar}>
                <View
                  style={[
                    styles.activityFill,
                    {
                      width: `${(user.activities_count / maxActivities) * 100}%`,
                      backgroundColor: "#2563EB",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Distribution Count */}
            <View style={styles.cell}>
              <Text style={styles.valueText}>{user.distribution_count}</Text>
              <View style={styles.activityBar}>
                <View
                  style={[
                    styles.activityFill,
                    {
                      width: `${(user.distribution_count / maxDistributions) * 100}%`,
                      backgroundColor: "#059669",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Scan Count */}
            <View style={styles.cell}>
              <Text style={styles.valueText}>{user.scan_count}</Text>
              <View style={styles.activityBar}>
                <View
                  style={[
                    styles.activityFill,
                    {
                      width: `${(user.scan_count / maxScans) * 100}%`,
                      backgroundColor: "#7C3AED",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Ionicons name="people" size={16} color="#2563EB" />
          <Text style={styles.summaryLabel}>Total Users</Text>
          <Text style={styles.summaryValue}>{data.length}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="stats-chart" size={16} color="#059669" />
          <Text style={styles.summaryLabel}>Avg Activities</Text>
          <Text style={styles.summaryValue}>
            {Math.round(
              data.reduce((sum, user) => sum + user.activities_count, 0) /
                data.length,
            )}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="log-in" size={16} color="#7C3AED" />
          <Text style={styles.summaryLabel}>Avg Logins</Text>
          <Text style={styles.summaryValue}>
            {Math.round(
              data.reduce((sum, user) => sum + user.total_logins, 0) /
                data.length,
            )}
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
          <Text style={styles.legendText}>Owner</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#2563EB" }]} />
          <Text style={styles.legendText}>Admin</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#7C3AED" }]} />
          <Text style={styles.legendText}>PIC</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  scrollView: {
    maxHeight: 200,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: 11,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: "600",
  },
  valueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  progressBarContainer: {
    width: "80%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  timeText: {
    fontSize: 10,
    color: "#6B7280",
    marginRight: 2,
  },
  activityBar: {
    width: "80%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  activityFill: {
    height: "100%",
    borderRadius: 2,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: "#6B7280",
  },
});
