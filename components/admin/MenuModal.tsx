// components/admin/MenuModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SPPGSelectorModal from "./SPPGSelectorModal";

interface MenuItem {
  id: string;
  menu_name: string;
  production_portion: number;
  received_portion: number;
  production_time: string;
  menu_condition: "normal" | "problematic";
  sppg_id: string;
}

interface SPPGItem {
  id: string;
  sppg_name: string;
  address?: string;
  phone_number?: string;
  created_at: string;
}

interface MenuModalProps {
  visible: boolean;
  editItem: MenuItem | null;
  sppgList: SPPGItem[];
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export default function MenuModal({
  visible,
  editItem,
  sppgList,
  onClose,
  onSubmit,
}: MenuModalProps) {
  const [formData, setFormData] = useState({
    menu_name: "",
    production_portion: "0",
    received_portion: "0",
    production_time: new Date().toISOString().split("T")[0] + "T10:00",
    menu_condition: "normal" as "normal" | "problematic",
    sppg_id: "",
    sppg_name: "",
  });

  const [showSPPGModal, setShowSPPGModal] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editItem) {
        const selectedSPPG = sppgList.find((s) => s.id === editItem.sppg_id);
        setFormData({
          menu_name: editItem.menu_name,
          production_portion: editItem.production_portion.toString(),
          received_portion: editItem.received_portion.toString(),
          production_time: editItem.production_time,
          menu_condition: editItem.menu_condition,
          sppg_id: editItem.sppg_id,
          sppg_name: selectedSPPG?.sppg_name || "",
        });
      } else {
        const defaultSPPG = sppgList[0];
        setFormData({
          menu_name: "",
          production_portion: "0",
          received_portion: "0",
          production_time: new Date().toISOString().split("T")[0] + "T10:00",
          menu_condition: "normal",
          sppg_id: defaultSPPG?.id || "",
          sppg_name: defaultSPPG?.sppg_name || "",
        });
      }
    }
  }, [visible, editItem, sppgList]);

  const handleSubmit = () => {
    if (!formData.menu_name.trim()) {
      Alert.alert("Error", "Nama menu harus diisi");
      return;
    }

    if (!formData.sppg_id) {
      Alert.alert("Error", "SPPG harus dipilih");
      return;
    }

    if (parseInt(formData.production_portion) < 0) {
      Alert.alert("Error", "Porsi produksi tidak valid");
      return;
    }

    // Hapus sppg_name sebelum submit
    const { sppg_name, ...submitData } = formData;
    onSubmit({
      ...submitData,
      production_portion: parseInt(formData.production_portion),
      received_portion: parseInt(formData.received_portion),
    });
  };

  const handleSelectSPPG = (id: string) => {
    const selectedSPPG = sppgList.find((s) => s.id === id);
    setFormData({
      ...formData,
      sppg_id: id,
      sppg_name: selectedSPPG?.sppg_name || "",
    });
  };

  const getSelectedSPPG = () => {
    return sppgList.find((s) => s.id === formData.sppg_id);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="restaurant" size={20} color="#2563EB" />
                </View>
                <Text style={styles.modalTitle}>
                  {editItem ? "Edit Menu" : "Tambah Menu Baru"}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Nama Menu */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Nama Menu <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.menu_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, menu_name: text })
                  }
                  placeholder="Contoh: Nasi Goreng Sayur"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* SPPG Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  SPPG <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.sppgPicker}
                  onPress={() => setShowSPPGModal(true)}
                >
                  <View style={styles.sppgPickerContent}>
                    <View style={styles.sppgPickerLeft}>
                      <View style={styles.sppgIcon}>
                        <Ionicons name="business" size={20} color="#6B7280" />
                      </View>
                      <View style={styles.sppgInfo}>
                        <Text style={styles.sppgPickerTitle}>
                          {formData.sppg_name || "Pilih SPPG"}
                        </Text>
                        {formData.sppg_name && getSelectedSPPG()?.address && (
                          <Text style={styles.sppgPickerSubtitle}>
                            {getSelectedSPPG()?.address}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>
                {!formData.sppg_id && (
                  <Text style={styles.helpText}>Klik untuk memilih SPPG</Text>
                )}
              </View>

              {/* Porsi */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>
                    Porsi Produksi <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.production_portion}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        production_portion: text.replace(/[^0-9]/g, ""),
                      })
                    }
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Porsi Diterima</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.received_portion}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        received_portion: text.replace(/[^0-9]/g, ""),
                      })
                    }
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Waktu Produksi */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Waktu Produksi <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.formInputWithIcon}
                    value={formData.production_time}
                    onChangeText={(text) =>
                      setFormData({ ...formData, production_time: text })
                    }
                    placeholder="YYYY-MM-DDTHH:mm"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <Text style={styles.helpText}>
                  Format: {new Date().toISOString().split("T")[0]}T10:00
                </Text>
              </View>

              {/* Status Menu */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status Menu</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioCard,
                      formData.menu_condition === "normal" &&
                        styles.radioCardActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, menu_condition: "normal" })
                    }
                  >
                    <View style={styles.radioIconContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={
                          formData.menu_condition === "normal"
                            ? "#059669"
                            : "#D1D5DB"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.radioLabel,
                        formData.menu_condition === "normal" &&
                          styles.radioLabelActive,
                      ]}
                    >
                      Normal
                    </Text>
                    <Text style={styles.radioDescription}>
                      Menu dalam kondisi baik
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioCard,
                      formData.menu_condition === "problematic" &&
                        styles.radioCardActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        menu_condition: "problematic",
                      })
                    }
                  >
                    <View style={styles.radioIconContainer}>
                      <Ionicons
                        name="warning"
                        size={24}
                        color={
                          formData.menu_condition === "problematic"
                            ? "#DC2626"
                            : "#D1D5DB"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.radioLabel,
                        formData.menu_condition === "problematic" &&
                          styles.radioLabelActive,
                      ]}
                    >
                      Bermasalah
                    </Text>
                    <Text style={styles.radioDescription}>
                      Ada kendala pada menu
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.submitButtonText}>
                  {editItem ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SPPG Selector Modal */}
      <SPPGSelectorModal
        visible={showSPPGModal}
        sppgList={sppgList.map((s) => ({
          id: s.id,
          sppg_name: s.sppg_name,
          address: s.address,
        }))}
        selectedId={formData.sppg_id}
        onSelect={handleSelectSPPG}
        onClose={() => setShowSPPGModal(false)}
      />
    </>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  formInputWithIcon: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  // Styles untuk SPPG Picker
  sppgPicker: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  sppgPickerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sppgPickerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sppgIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sppgInfo: {
    flex: 1,
  },
  sppgPickerTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  sppgPickerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 12,
  },
  radioCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  radioCardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  radioIconContainer: {
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  radioLabelActive: {
    color: "#111827",
  },
  radioDescription: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    gap: 6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
