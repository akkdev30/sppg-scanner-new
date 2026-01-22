// components/owner/modals/SchoolSelectorModal.tsx
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SchoolOption {
  id: string;
  name: string;
  school_code: string;
  sppg_id?: string;
}

interface SchoolSelectorModalProps {
  visible: boolean;
  schoolList: SchoolOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function SchoolSelectorModal({
  visible,
  schoolList,
  selectedId,
  onSelect,
  onClose,
}: SchoolSelectorModalProps) {
  const renderSchoolItem = ({ item }: { item: SchoolOption }) => (
    <TouchableOpacity
      style={[
        styles.schoolItem,
        selectedId === item.id && styles.selectedSchool,
      ]}
      onPress={() => onSelect(item.id)}
    >
      <View style={styles.schoolInfo}>
        <Text style={styles.schoolName}>{item.name}</Text>
        <Text style={styles.schoolCode}>{item.school_code}</Text>
      </View>
      {selectedId === item.id && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Pilih Sekolah</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {schoolList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Tidak ada sekolah yang tersedia
              </Text>
            </View>
          ) : (
            <FlatList
              data={schoolList}
              renderItem={renderSchoolItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    fontSize: 20,
    color: "#6B7280",
    padding: 4,
  },
  listContent: {
    padding: 20,
  },
  schoolItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedSchool: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  schoolCode: {
    fontSize: 14,
    color: "#6B7280",
  },
  checkmark: {
    fontSize: 18,
    color: "#2563EB",
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
