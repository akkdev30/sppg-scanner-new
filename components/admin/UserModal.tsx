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

interface UserItem {
  id: string;
  username: string;
  role: "admin" | "pic";
}

interface UserModalProps {
  visible: boolean;
  editItem: UserItem | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export default function UserModal({
  visible,
  editItem,
  onClose,
  onSubmit,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "pic" as "admin" | "pic",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editItem) {
        setFormData({
          username: editItem.username,
          password: "",
          confirmPassword: "",
          role: editItem.role,
        });
      } else {
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          role: "pic",
        });
      }
    }
  }, [visible, editItem]);

  const handleSubmit = () => {
    if (!formData.username.trim()) {
      Alert.alert("Error", "Username harus diisi");
      return;
    }

    if (formData.username.length < 3) {
      Alert.alert("Error", "Username minimal 3 karakter");
      return;
    }

    if (!editItem) {
      if (!formData.password) {
        Alert.alert("Error", "Password harus diisi");
        return;
      }
      if (formData.password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("Error", "Password tidak cocok");
        return;
      }
    }

    if (editItem && formData.password) {
      if (formData.password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("Error", "Password tidak cocok");
        return;
      }
    }

    onSubmit(formData);
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {editItem ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editItem
                    ? "Perbarui informasi pengguna"
                    : "Buat akun pengguna baru"}
                </Text>
              </View>
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
            {/* Username */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.formInputWithIcon}
                  value={formData.username}
                  onChangeText={(text) =>
                    setFormData({ ...formData, username: text })
                  }
                  placeholder="Masukkan username"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.helpText}>
                Username minimal 3 karakter, tanpa spasi
              </Text>
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Password {!editItem && <Text style={styles.required}>*</Text>}
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  style={styles.formInputWithIcon}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  placeholder={
                    editItem
                      ? "Kosongkan jika tidak ingin mengubah"
                      : "Masukkan password"
                  }
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Password minimal 6 karakter</Text>
            </View>

            {/* Confirm Password */}
            {(!editItem || formData.password) && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Konfirmasi Password{" "}
                  {!editItem && <Text style={styles.required}>*</Text>}
                </Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#6B7280"
                  />
                  <TextInput
                    style={styles.formInputWithIcon}
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, confirmPassword: text })
                    }
                    placeholder="Ulangi password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Role Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Role Pengguna <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.roleDescription}>
                Pilih peran pengguna dalam sistem
              </Text>

              <View style={styles.roleCards}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    formData.role === "admin" && styles.roleCardActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "admin" })}
                >
                  <View
                    style={[
                      styles.roleIconContainer,
                      formData.role === "admin" &&
                        styles.roleIconContainerActive,
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={28}
                      color={formData.role === "admin" ? "#2563EB" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.roleTitle,
                      formData.role === "admin" && styles.roleTitleActive,
                    ]}
                  >
                    Admin
                  </Text>
                  <Text style={styles.roleSubtitle}>
                    Akses penuh ke semua fitur sistem
                  </Text>
                  {formData.role === "admin" && (
                    <View style={styles.checkmark}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#2563EB"
                      />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    formData.role === "pic" && styles.roleCardActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "pic" })}
                >
                  <View
                    style={[
                      styles.roleIconContainer,
                      formData.role === "pic" && styles.roleIconContainerActive,
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={28}
                      color={formData.role === "pic" ? "#7C3AED" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.roleTitle,
                      formData.role === "pic" && styles.roleTitleActive,
                    ]}
                  >
                    PIC
                  </Text>
                  <Text style={styles.roleSubtitle}>
                    Penanggung jawab operasional
                  </Text>
                  {formData.role === "pic" && (
                    <View style={styles.checkmark}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#7C3AED"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2563EB" />
              <Text style={styles.infoText}>
                {formData.role === "admin"
                  ? "Admin dapat mengelola semua data, pengguna, dan pengaturan sistem"
                  : "PIC dapat mengelola data operasional seperti menu dan sekolah"}
              </Text>
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
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.submitButtonText}>
                {editItem ? "Update" : "Tambah Pengguna"}
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
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
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
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
  eyeIcon: {
    padding: 4,
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  roleDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  roleCards: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    position: "relative",
  },
  roleCardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  roleIconContainerActive: {
    backgroundColor: "white",
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  roleTitleActive: {
    color: "#111827",
  },
  roleSubtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 14,
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 4,
    marginBottom: 40,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 16,
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
