// components/owner/reports/DistributionEfficiencyChart.tsx
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

interface DailyEfficiencyData {
  date: string;
  allocated: number;
  received: number;
  efficiency: number;
}

interface DistributionEfficiencyChartProps {
  data: DailyEfficiencyData[];
}

export default function DistributionEfficiencyChart({
  data,
}: DistributionEfficiencyChartProps) {
  const { width } = Dimensions.get("window");
  const CHART_WIDTH = width - 64; // Account for padding
  const BAR_WIDTH = data.length > 0 ? (CHART_WIDTH - 32) / data.length : 0;

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxAllocated = Math.max(...data.map((d) => d.allocated));

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const allocatedHeight =
            maxAllocated > 0 ? (item.allocated / maxAllocated) * 120 : 0;
          const receivedHeight =
            maxAllocated > 0 ? (item.received / maxAllocated) * 120 : 0;

          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barsContainer}>
                <View
                  style={[styles.allocatedBar, { height: allocatedHeight }]}
                />
                <View
                  style={[styles.receivedBar, { height: receivedHeight }]}
                />
              </View>
              <View style={styles.efficiencyBadge}>
                <Text style={styles.efficiencyText}>{item.efficiency}%</Text>
              </View>
              <Text style={styles.dateLabel}>{item.date}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.allocatedColor]} />
          <Text style={styles.legendText}>Allocated</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.receivedColor]} />
          <Text style={styles.legendText}>Received</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.efficiencyColor]} />
          <Text style={styles.legendText}>Efficiency %</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    paddingHorizontal: 8,
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 120,
    marginBottom: 8,
  },
  allocatedBar: {
    width: 8,
    backgroundColor: "#2563EB",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  receivedBar: {
    width: 8,
    backgroundColor: "#059669",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  efficiencyBadge: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  efficiencyText: {
    fontSize: 8,
    color: "white",
    fontWeight: "600",
  },
  dateLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  allocatedColor: {
    backgroundColor: "#2563EB",
  },
  receivedColor: {
    backgroundColor: "#059669",
  },
  efficiencyColor: {
    backgroundColor: "#7C3AED",
  },
  legendText: {
    fontSize: 10,
    color: "#6B7280",
  },
});
