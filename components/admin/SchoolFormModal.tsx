// components/admin/SchoolFormModal.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SPPGOption {
  id: string;
  sppg_name: string;
}

interface SchoolFormData {
  school_code: string;
  name: string;
  sppg_id: string;
  address: string;
  total_students: string;
}

interface SchoolFormModalProps {
  visible: boolean;
  isEdit: boolean;
  formData: SchoolFormData;
  sppgList: SPPGOption[];
  onFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onSelectSPPG: () => void;
}

export default function SchoolFormModal({
  visible,
  isEdit,
  formData,
  sppgList,
  onFieldChange,
  onSubmit,
  onCancel,
  onSelectSPPG,
}: SchoolFormModalProps) {
  const selectedSPPG = sppgList.find((s) => s.id === formData.sppg_id);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Edit Sekolah" : "Tambah Sekolah"}
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Kode Sekolah *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.school_code}
                onChangeText={(text) => onFieldChange("school_code", text)}
                placeholder="Misal: SCH001"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nama Sekolah *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => onFieldChange("name", text)}
                placeholder="Masukkan nama sekolah"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>SPPG *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={onSelectSPPG}
              >
                <Text
                  style={[
                    styles.selectText,
                    !selectedSPPG && styles.placeholderText,
                  ]}
                >
                  {selectedSPPG?.sppg_name || "Pilih SPPG"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Alamat *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => onFieldChange("address", text)}
                placeholder="Masukkan alamat sekolah"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Jumlah Siswa *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.total_students}
                onChangeText={(text) => onFieldChange("total_students", text)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2563EB" />
              <Text style={styles.infoText}>
                Pastikan semua data sudah benar sebelum menyimpan
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={styles.submitButtonText}>
                {isEdit ? "Update" : "Simpan"}
              </Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: "90%",
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
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
  },
  selectInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 14,
    color: "#111827",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});
