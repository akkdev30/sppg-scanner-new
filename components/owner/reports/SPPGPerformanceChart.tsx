// components/owner/reports/SPPGPerformanceChart.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface SPPGPerformanceData {
  id: string;
  sppg_name: string;
  total_distributions: number;
  completed_distributions: number;
  efficiency_rate: number;
  avg_response_time: number;
  problems_reported: number;
  ranking: number;
}

interface SPPGPerformanceChartProps {
  data: SPPGPerformanceData[];
}

export default function SPPGPerformanceChart({
  data,
}: SPPGPerformanceChartProps) {
  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1:
        return "#FBBF24";
      case 2:
        return "#9CA3AF";
      case 3:
        return "#D97706";
      default:
        return "#6B7280";
    }
  };

  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return "trophy";
      case 2:
        return "medal";
      case 3:
        return "ribbon";
      default:
        return "star";
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {data.map((item) => (
          <View key={item.id} style={styles.sppgCard}>
            <View style={styles.sppgHeader}>
              <View style={styles.rankingBadge}>
                <Ionicons
                  name={getRankingIcon(item.ranking)}
                  size={14}
                  color={getRankingColor(item.ranking)}
                />
                <Text style={styles.rankingText}>#{item.ranking}</Text>
              </View>
              <Text style={styles.sppgName} numberOfLines={1}>
                {item.sppg_name}
              </Text>
            </View>

            <View style={styles.efficiencyBar}>
              <View
                style={[
                  styles.efficiencyFill,
                  { width: `${item.efficiency_rate}%` },
                ]}
              />
              <Text style={styles.efficiencyText}>{item.efficiency_rate}%</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Distribusi</Text>
                <Text style={styles.metricValue}>
                  {item.completed_distributions}/{item.total_distributions}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Response</Text>
                <Text style={styles.metricValue}>
                  {item.avg_response_time}ms
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Problems</Text>
                <Text
                  style={[
                    styles.metricValue,
                    item.problems_reported > 5 && styles.problemText,
                  ]}
                >
                  {item.problems_reported}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 16,
  },
  sppgCard: {
    width: 180,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sppgHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  rankingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rankingText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  sppgName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  efficiencyBar: {
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  efficiencyFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 12,
  },
  efficiencyText: {
    position: "absolute",
    right: 8,
    top: 4,
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metric: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  problemText: {
    color: "#DC2626",
  },
});
