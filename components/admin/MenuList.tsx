import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItem {
  id: string;
  menu_name: string;
  production_portion: number;
  received_portion: number;
  production_time: string;
  menu_condition: "normal" | "problematic";
  sppg_name?: string;
}

interface MenuListProps {
  menuList: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string, name: string) => void;
}

export default function MenuList({
  menuList,
  onEdit,
  onDelete,
}: MenuListProps) {
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuCard}>
      <View style={styles.menuHeader}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuName}>{item.menu_name}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.menu_condition === "problematic" ? "#FEE2E2" : "#D1FAE5",
              },
            ]}
          >
            <Ionicons
              name={
                item.menu_condition === "problematic"
                  ? "warning"
                  : "checkmark-circle"
              }
              size={12}
              color={
                item.menu_condition === "problematic" ? "#DC2626" : "#059669"
              }
            />
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.menu_condition === "problematic"
                      ? "#DC2626"
                      : "#059669",
                },
              ]}
            >
              {item.menu_condition === "problematic" ? "Bermasalah" : "Normal"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {new Date(item.production_time).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {item.sppg_name && (
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.sppg_name}</Text>
          </View>
        )}

        <View style={styles.portionRow}>
          <View style={styles.portionCard}>
            <Text style={styles.portionLabel}>Produksi</Text>
            <Text style={styles.portionValue}>{item.production_portion}</Text>
            <Text style={styles.portionUnit}>porsi</Text>
          </View>

          <View style={styles.portionDivider} />

          <View style={styles.portionCard}>
            <Text style={styles.portionLabel}>Diterima</Text>
            <Text style={styles.portionValue}>{item.received_portion}</Text>
            <Text style={styles.portionUnit}>porsi</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(item)}
        >
          <Ionicons name="pencil" size={18} color="#2563EB" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(item.id, item.menu_name)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{menuList.length}</Text>
          <Text style={styles.statLabel}>Total Menu</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#059669" }]}>
            {menuList.filter((m) => m.menu_condition === "normal").length}
          </Text>
          <Text style={styles.statLabel}>Normal</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#DC2626" }]}>
            {menuList.filter((m) => m.menu_condition === "problematic").length}
          </Text>
          <Text style={styles.statLabel}>Bermasalah</Text>
        </View>
      </View>

      <FlatList
        data={menuList}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Belum ada menu</Text>
            <Text style={styles.emptySubtitle}>
              Tambahkan menu pertama Anda
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  menuCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuHeader: {
    marginBottom: 12,
  },
  menuTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  menuName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  menuDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#6B7280",
  },
  portionRow: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  portionCard: {
    flex: 1,
    alignItems: "center",
  },
  portionDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  portionLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  portionValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  portionUnit: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  menuActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: "#EFF6FF",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});
