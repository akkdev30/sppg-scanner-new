// components/admin/SchoolStatsCard.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SchoolStatsCardProps {
  totalSchools: number;
  totalStudents: number;
  activeSPPG: number;
}

export default function SchoolStatsCard({
  totalSchools,
  totalStudents,
  activeSPPG,
}: SchoolStatsCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="school" size={24} color="#2563EB" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{totalSchools}</Text>
            <Text style={styles.statLabel}>Total Sekolah</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
            <Ionicons name="people" size={24} color="#10B981" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Total Siswa</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="business" size={24} color="#EF4444" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{activeSPPG}</Text>
            <Text style={styles.statLabel}>SPPG Aktif</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
});
