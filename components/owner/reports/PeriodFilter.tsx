// components/owner/reports/PeriodFilter.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Period {
  id: string;
  label: string;
  days: number;
}

interface PeriodFilterProps {
  periods: Period[];
  selectedPeriod: Period;
  onSelectPeriod: (period: Period) => void;
  currentPeriod: string;
}

export default function PeriodFilter({
  periods,
  selectedPeriod,
  onSelectPeriod,
  currentPeriod,
}: PeriodFilterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={16} color="#6B7280" />
        <Text style={styles.periodLabel}>Periode: {currentPeriod}</Text>
      </View>

      <View style={styles.periodsContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod.id === period.id && styles.periodButtonActive,
            ]}
            onPress={() => onSelectPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod.id === period.id &&
                  styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  periodLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  periodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  periodButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  periodButtonText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "white",
  },
});
