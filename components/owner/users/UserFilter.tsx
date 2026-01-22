// components/owner/users/UserFilter.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FilterOption {
  id: string;
  label: string;
  color: string;
}

interface UserFilterProps {
  roles: FilterOption[];
  statuses: FilterOption[];
  selectedRole: string;
  selectedStatus: string;
  onSelectRole: (roleId: string) => void;
  onSelectStatus: (statusId: string) => void;
  userCount: number;
}

export default function UserFilter({
  roles,
  statuses,
  selectedRole,
  selectedStatus,
  onSelectRole,
  onSelectStatus,
  userCount,
}: UserFilterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <Text style={styles.countText}>{userCount} users</Text>
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Role</Text>
          <View style={styles.filterButtons}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.filterButton,
                  selectedRole === role.id && styles.filterButtonActive,
                  selectedRole === role.id && { borderColor: role.color },
                ]}
                onPress={() => onSelectRole(role.id)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedRole === role.id && styles.filterButtonTextActive,
                    selectedRole === role.id && { color: role.color },
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.filterButtons}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.filterButton,
                  selectedStatus === status.id && styles.filterButtonActive,
                  selectedStatus === status.id && { borderColor: status.color },
                ]}
                onPress={() => onSelectStatus(status.id)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedStatus === status.id &&
                      styles.filterButtonTextActive,
                    selectedStatus === status.id && { color: status.color },
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {(selectedRole !== "all" || selectedStatus !== "all") && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            onSelectRole("all");
            onSelectStatus("all");
          }}
        >
          <Ionicons name="close-circle" size={14} color="#6B7280" />
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  countText: {
    fontSize: 12,
    color: "#6B7280",
  },
  filtersRow: {
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: "white",
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    fontWeight: "600",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
