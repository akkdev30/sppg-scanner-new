import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItem {
  id: string;
  menu_code: string;
  menu_name: string;
  sppg_id: string;
  production_portion: number;
  production_time: string;
  scheduled_date: string;
  notes?: string;
  status: string;
  condition: "normal" | "problematic";
}

interface SPPGItem {
  id: string;
  sppg_name: string;
  address?: string;
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
    menu_code: "",
    menu_name: "",
    sppg_id: "",
    production_portion: "0",
    production_time: new Date().toISOString(),
    scheduled_date: new Date().toISOString().split("T")[0],
    notes: "",
    condition: "normal" as "normal" | "problematic",
  });

  const [showSPPGModal, setShowSPPGModal] = useState(false);
  const [showProductionTimePicker, setShowProductionTimePicker] =
    useState(false);
  const [showScheduledDatePicker, setShowScheduledDatePicker] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setErrors({}); // Reset errors when modal opens

      if (editItem) {
        setFormData({
          menu_code: editItem.menu_code,
          menu_name: editItem.menu_name,
          sppg_id: editItem.sppg_id,
          production_portion: editItem.production_portion.toString(),
          production_time: editItem.production_time,
          scheduled_date: editItem.scheduled_date,
          notes: editItem.notes || "",
          condition: editItem.condition,
        });
      } else {
        // Generate menu code for new item
        const date = new Date();
        const randomStr = Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase();
        const menuCode = `MENU-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}-${randomStr}`;

        const defaultSPPG = sppgList[0];
        setFormData({
          menu_code: menuCode,
          menu_name: "",
          sppg_id: defaultSPPG?.id || "",
          production_portion: "0",
          production_time: new Date().toISOString(),
          scheduled_date: new Date().toISOString().split("T")[0],
          notes: "",
          condition: "normal",
        });
      }
    }
  }, [visible, editItem, sppgList]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.menu_code.trim()) {
      newErrors.menu_code = "Kode menu harus diisi";
    }

    if (!formData.menu_name.trim()) {
      newErrors.menu_name = "Nama menu harus diisi";
    } else if (formData.menu_name.trim().length < 3) {
      newErrors.menu_name = "Nama menu minimal 3 karakter";
    }

    if (!formData.sppg_id) {
      newErrors.sppg_id = "SPPG harus dipilih";
    }

    const productionPortion = parseInt(formData.production_portion);
    if (isNaN(productionPortion)) {
      newErrors.production_portion = "Porsi produksi harus angka";
    } else if (productionPortion < 0) {
      newErrors.production_portion = "Porsi produksi tidak valid";
    } else if (productionPortion > 10000) {
      newErrors.production_portion = "Porsi produksi maksimal 10.000";
    }

    if (!formData.production_time) {
      newErrors.production_time = "Waktu produksi harus diisi";
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = "Tanggal penjadwalan harus diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (formLoading) return;

    if (!validateForm()) {
      return;
    }

    setFormLoading(true);

    try {
      // Format data sesuai backend
      const submitData = {
        menu_code: formData.menu_code.trim(),
        menu_name: formData.menu_name.trim(),
        sppg_id: formData.sppg_id,
        production_portion: parseInt(formData.production_portion),
        production_time: formData.production_time,
        scheduled_date: formData.scheduled_date,
        notes: formData.notes.trim() || null,
        condition: formData.condition,
      };

      onSubmit(submitData);
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSelectSPPG = (id: string) => {
    setFormData({
      ...formData,
      sppg_id: id,
    });
    setErrors({ ...errors, sppg_id: "" });
    setShowSPPGModal(false);
  };

  const handleProductionTimeChange = (event: any, selectedDate?: Date) => {
    setShowProductionTimePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        production_time: selectedDate.toISOString(),
      });
      setErrors({ ...errors, production_time: "" });
    }
  };

  const handleScheduledDateChange = (event: any, selectedDate?: Date) => {
    setShowScheduledDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        scheduled_date: selectedDate.toISOString().split("T")[0],
      });
      setErrors({ ...errors, scheduled_date: "" });
    }
  };

  const getSelectedSPPG = () => {
    return sppgList.find((s) => s.id === formData.sppg_id);
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  if (!visible) return null;

  return (
    <>
      <Modal transparent visible={visible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={formLoading ? undefined : onClose}
            />
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editItem ? "Edit Menu" : "Tambah Menu Baru"}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  disabled={formLoading}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Menu Code */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Kode Menu <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={formData.menu_code}
                    onChangeText={(v) => handleInputChange("menu_code", v)}
                    placeholder="Generate otomatis"
                    style={[
                      styles.input,
                      errors.menu_code && styles.inputError,
                      formLoading && styles.disabledInput,
                    ]}
                    placeholderTextColor="#9CA3AF"
                    editable={!formLoading && !editItem}
                    autoCapitalize="characters"
                  />
                  {errors.menu_code && (
                    <Text style={styles.errorText}>{errors.menu_code}</Text>
                  )}
                </View>

                {/* Menu Name */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Nama Menu <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={formData.menu_name}
                    onChangeText={(v) => handleInputChange("menu_name", v)}
                    placeholder="Contoh: Nasi Goreng Sayur"
                    style={[
                      styles.input,
                      errors.menu_name && styles.inputError,
                      formLoading && styles.disabledInput,
                    ]}
                    placeholderTextColor="#9CA3AF"
                    editable={!formLoading}
                  />
                  {errors.menu_name && (
                    <Text style={styles.errorText}>{errors.menu_name}</Text>
                  )}
                </View>

                {/* SPPG Picker */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    SPPG <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectorInput,
                      errors.sppg_id && styles.inputError,
                      formLoading && styles.disabledInput,
                    ]}
                    onPress={() => !formLoading && setShowSPPGModal(true)}
                    disabled={formLoading}
                  >
                    <View style={styles.selectorContent}>
                      <Text
                        style={
                          getSelectedSPPG()
                            ? styles.selectorTextSelected
                            : styles.selectorTextPlaceholder
                        }
                        numberOfLines={1}
                      >
                        {getSelectedSPPG()?.sppg_name || "Pilih SPPG"}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </View>
                  </TouchableOpacity>
                  {errors.sppg_id && (
                    <Text style={styles.errorText}>{errors.sppg_id}</Text>
                  )}
                </View>

                {/* Production Portion */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Porsi Produksi <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={formData.production_portion}
                    onChangeText={(v) =>
                      handleInputChange(
                        "production_portion",
                        v.replace(/[^0-9]/g, ""),
                      )
                    }
                    placeholder="0"
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      errors.production_portion && styles.inputError,
                      formLoading && styles.disabledInput,
                    ]}
                    placeholderTextColor="#9CA3AF"
                    editable={!formLoading}
                  />
                  {errors.production_portion && (
                    <Text style={styles.errorText}>
                      {errors.production_portion}
                    </Text>
                  )}
                </View>

                {/* Production Time */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Waktu Produksi <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectorInput,
                      errors.production_time && styles.inputError,
                      formLoading && styles.disabledInput,
                    ]}
                    onPress={() =>
                      !formLoading && setShowProductionTimePicker(true)
                    }
                    disabled={formLoading}
                  >
                    <View style={styles.selectorContent}>
                      <Text style={styles.selectorTextSelected}>
                        {formatDateTime(formData.production_time)}
                      </Text>
                      <Ionicons name="time-outline" size={20} color="#6B7280" />
                    </View>
                  </TouchableOpacity>
                  {errors.production_time && (
                    <Text style={styles.errorText}>
                      {errors.production_time}
                    </Text>
                  )}
                </View>

                {/* Scheduled Date */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Tanggal Penjadwalan <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectorInput,
                      errors.scheduled_date && styles.inputError,
                      formLoading && styles.disabledInput,
                    ]}
                    onPress={() =>
                      !formLoading && setShowScheduledDatePicker(true)
                    }
                    disabled={formLoading}
                  >
                    <View style={styles.selectorContent}>
                      <Text style={styles.selectorTextSelected}>
                        {formatDate(formData.scheduled_date)}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#6B7280"
                      />
                    </View>
                  </TouchableOpacity>
                  {errors.scheduled_date && (
                    <Text style={styles.errorText}>
                      {errors.scheduled_date}
                    </Text>
                  )}
                </View>

                {/* Notes */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
                  <TextInput
                    value={formData.notes}
                    onChangeText={(v) => handleInputChange("notes", v)}
                    placeholder="Tambahkan catatan jika perlu"
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.textArea,
                      formLoading && styles.disabledInput,
                    ]}
                    placeholderTextColor="#9CA3AF"
                    editable={!formLoading}
                  />
                </View>

                {/* Condition */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Kondisi Menu</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        formData.condition === "normal" &&
                          styles.radioButtonActive,
                      ]}
                      onPress={() =>
                        !formLoading &&
                        setFormData({ ...formData, condition: "normal" })
                      }
                      disabled={formLoading}
                    >
                      <View style={styles.radioIconContainer}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={
                            formData.condition === "normal"
                              ? "#059669"
                              : "#D1D5DB"
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.radioText,
                          formData.condition === "normal" &&
                            styles.radioTextActive,
                        ]}
                      >
                        Normal
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        formData.condition === "problematic" &&
                          styles.radioButtonActive,
                      ]}
                      onPress={() =>
                        !formLoading &&
                        setFormData({ ...formData, condition: "problematic" })
                      }
                      disabled={formLoading}
                    >
                      <View style={styles.radioIconContainer}>
                        <Ionicons
                          name="warning"
                          size={20}
                          color={
                            formData.condition === "problematic"
                              ? "#DC2626"
                              : "#D1D5DB"
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.radioText,
                          formData.condition === "problematic" &&
                            styles.radioTextActive,
                        ]}
                      >
                        Bermasalah
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Footer Buttons */}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.cancelButton,
                    formLoading && styles.disabledButton,
                  ]}
                  disabled={formLoading}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[
                    styles.submitButton,
                    formLoading && styles.disabledSubmit,
                  ]}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editItem ? "Update Menu" : "Simpan Menu"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SPPG Selector Modal */}
      <Modal transparent visible={showSPPGModal} animationType="slide">
        <View style={styles.sppgModalOverlay}>
          <View style={styles.sppgModalContent}>
            <View style={styles.sppgModalHeader}>
              <Text style={styles.sppgModalTitle}>Pilih SPPG</Text>
              <TouchableOpacity
                style={styles.sppgCloseButton}
                onPress={() => setShowSPPGModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sppgListContainer}>
              {sppgList.map((sppg) => (
                <TouchableOpacity
                  key={sppg.id}
                  style={[
                    styles.sppgItem,
                    formData.sppg_id === sppg.id && styles.sppgItemActive,
                  ]}
                  onPress={() => handleSelectSPPG(sppg.id)}
                >
                  <View style={styles.sppgItemContent}>
                    <Text
                      style={[
                        styles.sppgItemText,
                        formData.sppg_id === sppg.id &&
                          styles.sppgItemTextActive,
                      ]}
                    >
                      {sppg.sppg_name}
                    </Text>
                    {sppg.address && (
                      <Text style={styles.sppgItemSubtext}>{sppg.address}</Text>
                    )}
                  </View>
                  {formData.sppg_id === sppg.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#2563EB"
                    />
                  )}
                </TouchableOpacity>
              ))}
              {sppgList.length === 0 && (
                <View style={styles.noDataContainer}>
                  <Ionicons name="business-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.noDataText}>Tidak ada data SPPG</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showProductionTimePicker && (
        <DateTimePicker
          value={new Date(formData.production_time)}
          mode="time"
          display="spinner"
          onChange={handleProductionTimeChange}
        />
      )}

      {showScheduledDatePicker && (
        <DateTimePicker
          value={new Date(formData.scheduled_date)}
          mode="date"
          display="spinner"
          onChange={handleScheduledDateChange}
          minimumDate={new Date()}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 100,
  },
  selectorInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorTextSelected: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
  },
  selectorTextPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
    flex: 1,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 12,
  },
  radioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  radioButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  radioIconContainer: {
    width: 24,
    alignItems: "center",
  },
  radioText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  radioTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1.5,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: "#F3F4F6",
  },
  disabledSubmit: {
    backgroundColor: "#93C5FD",
    shadowOpacity: 0.1,
  },

  // SPPG Modal Styles
  sppgModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sppgModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  sppgModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sppgModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sppgCloseButton: {
    padding: 4,
  },
  sppgListContainer: {
    paddingHorizontal: 16,
  },
  sppgItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  sppgItemActive: {
    backgroundColor: "#EFF6FF",
  },
  sppgItemContent: {
    flex: 1,
    marginRight: 12,
  },
  sppgItemText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  sppgItemTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  sppgItemSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  noDataText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
});
