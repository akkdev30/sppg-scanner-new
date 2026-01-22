// components/admin/SchoolPICSelectorModal.js

import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SchoolPICOption {
  id: string;
  name: string;
  school_name?: string;
  school_code?: string;
  phone_number?: string;
  email?: string;
  position?: string;
  is_active: boolean;
}

interface SchoolPICSelectorModalProps {
  visible: boolean;
  schoolPICList: SchoolPICOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function SchoolPICSelectorModal({
  visible,
  schoolPICList,
  selectedId,
  onSelect,
  onClose,
}: SchoolPICSelectorModalProps) {
  const renderItem = ({ item }: { item: SchoolPICOption }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedId === item.id && styles.itemSelected,
        !item.is_active && styles.itemInactive
      ]}
      onPress={() => onSelect(item.id)}
      disabled={!item.is_active}
    >
      <View style={styles.itemContent}>
        <Text style={[
          styles.itemName,
          selectedId === item.id && styles.itemNameSelected,
          !item.is_active && styles.itemNameInactive
        ]}>
          {item.name}
        </Text>
        <Text style={styles.itemInfo}>
          {item.school_name} • {item.position}
        </Text>
        <Text style={styles.itemContact}>
          {item.phone_number} • {item.email}
        </Text>
      </View>
      {!item.is_active && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveBadgeText}>Nonaktif</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Pilih PIC Sekolah</Text>
            <Text style={styles.subtitle}>
              {schoolPICList.length} PIC tersedia
            </Text>
          </View>

          <FlatList
            data={schoolPICList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  itemInactive: {
    backgroundColor: "#F3F4F6",
    opacity: 0.7,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  itemNameSelected: {
    color: "#2563EB",
  },
  itemNameInactive: {
    color: "#6B7280",
  },
  itemInfo: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  itemContact: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  inactiveBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inactiveBadgeText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});