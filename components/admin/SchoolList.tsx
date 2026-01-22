// components/admin/SchoolList.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SchoolItem {
  id: string;
  school_code: string;
  name: string;
  sppg_name?: string;
  sppg_id?: string;
  address: string;
  total_students: number;
}

interface SchoolListProps {
  data: SchoolItem[];
  onEdit: (item: SchoolItem) => void;
  onDelete: (id: string, name: string) => void;
  onAdd: () => void;
}

export default function SchoolList({
  data,
  onEdit,
  onDelete,
  onAdd,
}: SchoolListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Daftar Sekolah</Text>
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
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{item.name}</Text>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.school_code}</Text>
                </View>
              </View>

              <Text style={styles.listItemSubtitle}>{item.address}</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="people" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {item.total_students} siswa
                  </Text>
                </View>

                {item.sppg_name && (
                  <View style={styles.infoItem}>
                    <Ionicons name="business" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>{item.sppg_name}</Text>
                  </View>
                )}
              </View>
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
                onPress={() => onDelete(item.id, item.name)}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="school" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data sekolah</Text>
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
    alignItems: "flex-start",
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
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  codeBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
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
