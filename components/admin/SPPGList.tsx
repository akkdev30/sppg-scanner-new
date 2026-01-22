// components/admin/SPPGList.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SPPGItem {
  id: string;
  sppg_name: string;
  address: string;
  phone_number?: string;
  created_at: string;
}

interface SPPGListProps {
  data: SPPGItem[];
  onEdit: (item: SPPGItem) => void;
  onDelete: (id: string, name: string) => void;
  onAdd: () => void;
}

export default function SPPGList({
  data,
  onEdit,
  onDelete,
  onAdd,
}: SPPGListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Daftar SPPG</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{item.sppg_name}</Text>
              <Text style={styles.listItemSubtitle}>{item.address}</Text>
              {item.phone_number && (
                <Text style={styles.listItemDetail}>
                  📞 {item.phone_number}
                </Text>
              )}
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(item)}
              >
                <Ionicons name="pencil" size={18} color="#2563EB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(item.id, item.sppg_name)}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="business" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data SPPG</Text>
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
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  listItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  listItemDetail: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  listItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
});
