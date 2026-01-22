// components/admin/SPPGSelectorModal.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SPPGOption {
  id: string;
  sppg_name: string;
  address?: string;
}

interface SPPGSelectorModalProps {
  visible: boolean;
  sppgList: SPPGOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function SPPGSelectorModal({
  visible,
  sppgList,
  selectedId,
  onSelect,
  onClose,
}: SPPGSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredList = sppgList.filter((sppg) =>
    sppg.sppg_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih SPPG</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari SPPG..."
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  item.id === selectedId && styles.selectedItem,
                ]}
                onPress={() => handleSelect(item.id)}
              >
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.sppg_name}</Text>
                  {item.address && (
                    <Text style={styles.itemSubtitle}>{item.address}</Text>
                  )}
                </View>
                {item.id === selectedId && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>
                  {searchQuery ? "SPPG tidak ditemukan" : "Belum ada data SPPG"}
                </Text>
              </View>
            }
            style={styles.listContainer}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  selectedItem: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
});
