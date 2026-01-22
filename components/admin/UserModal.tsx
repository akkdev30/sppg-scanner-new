// components/admin/UserModal.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SchoolPICSelectorModal from "../admin/SchoolPICSelectorModal";

// Tambahkan tipe role yang lebih lengkap
type UserRole = "admin";

interface UserItem {
  id: string;
  username: string;
  role: UserRole;
  full_name?: string;
  email?: string;
  phone_number?: string;
  school_pic_id?: string;
  school_pic_name?: string; // Untuk tampilan nama PIC
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SPPGOption {
  id: string;
  sppg_code: string;
  sppg_name: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

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

interface UserModalProps {
  visible: boolean;
  editItem: UserItem | null;
  sppgList: SPPGOption[];
  schoolPICList: SchoolPICOption[]; // Data PIC sekolah
  isLoadingPIC?: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isSubmitting?: boolean;
}

export default function UserModal({
  visible,
  editItem,
  sppgList,
  schoolPICList,
  isLoadingPIC = false,
  onClose,
  onSubmit,
  isSubmitting = false,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "pic" as UserRole,
    full_name: "",
    email: "",
    phone_number: "",
    school_pic_id: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSPPGModal, setShowSPPGModal] = useState(false);
  const [showSchoolPICModal, setShowSchoolPICModal] = useState(false);

  // Reset form dan error saat modal ditutup
  useEffect(() => {
    if (!visible) {
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        role: "admin",
        full_name: "",
        email: "",
        phone_number: "",
        school_pic_id: "",
        is_active: true,
      });
      setErrors({});
      return;
    }

    if (editItem) {
      setFormData((prev) => ({
        ...prev,
        username: editItem.username || "",
        role: editItem.role || "pic",
        full_name: editItem.full_name || "",
        email: editItem.email || "",
        phone_number: editItem.phone_number || "",
        school_pic_id: editItem.school_pic_id || "",
        is_active: editItem.is_active ?? true,
        password: "",
        confirmPassword: "",
      }));
    }
  }, [visible, editItem]);

  // Validasi real-time untuk username
  useEffect(() => {
    if (formData.username) {
      const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
      if (!usernameRegex.test(formData.username)) {
        setErrors((prev) => ({
          ...prev,
          username: "Username 3-50 karakter (huruf, angka, ., _, -)",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.username;
          return newErrors;
        });
      }
    }
  }, [formData.username]);

  // Validasi real-time untuk email
  useEffect(() => {
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrors((prev) => ({
          ...prev,
          email: "Format email tidak valid",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  }, [formData.email]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    } else if (!/^[a-zA-Z0-9._-]{3,50}$/.test(formData.username)) {
      newErrors.username = "Username 3-50 karakter (huruf, angka, ., _, -)";
    }

    // Password validation for new user
    if (!editItem) {
      if (!formData.password) {
        newErrors.password = "Password wajib diisi";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi password wajib diisi";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    }

    // Password validation for edit (if password is provided)
    if (editItem && formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi password wajib diisi";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    }

    // Role-specific validation
    if (formData.role === "admin" && !formData.school_pic_id) {
      newErrors.school_pic_id = "PIC sekolah wajib dipilih untuk role PIC";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Validasi Gagal", "Periksa kembali data yang diisi", [
        { text: "OK" },
      ]);
      return;
    }

    const payload: any = {
      username: formData.username.trim(),
      role: formData.role,
      full_name: formData.full_name.trim() || null,
      email: formData.email.trim() || null,
      phone_number: formData.phone_number.trim() || null,
      school_pic_id: formData.role === "admin" ? formData.school_pic_id : null,
      is_active: formData.is_active,
    };

    // Hanya kirim password jika diisi (untuk edit) atau untuk user baru
    if (!editItem || formData.password) {
      payload.password = formData.password;
    }

    // Jika edit, tambahkan ID
    if (editItem) {
      payload.id = editItem.id;
    }

    onSubmit(payload);
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      // Reset school_pic_id jika role bukan admin
      ...(role !== "admin" && { school_pic_id: "" }),
    }));
  };

  const selectedSchoolPIC = schoolPICList.find(
    (p) => p.id === formData.school_pic_id,
  );
  const showPasswordFields = !editItem || formData.password;

  return (
    <>
      <Modal transparent visible={visible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <Text style={styles.title}>
                  {editItem ? "Edit User" : "Tambah User Baru"}
                </Text>
                <Text style={styles.subtitle}>
                  {editItem
                    ? "Perbarui data user"
                    : "Buat akun user baru untuk sistem"}
                </Text>
              </View>

              {/* Username */}
              <Input
                label="Username *"
                value={formData.username}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, username: v })
                }
                error={errors.username}
                autoCapitalize="none"
                editable={!editItem} // Username tidak bisa diedit saat edit
                placeholder="min. 3 karakter, tanpa spasi"
              />

              {/* Password Fields */}
              {showPasswordFields && (
                <>
                  <Input
                    label={editItem ? "Password Baru (opsional)" : "Password *"}
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(v: string) =>
                      setFormData({ ...formData, password: v })
                    }
                    error={errors.password}
                    placeholder={
                      editItem
                        ? "Kosongkan jika tidak berubah"
                        : "Minimal 6 karakter"
                    }
                  />

                  <Input
                    label="Konfirmasi Password"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(v: string) =>
                      setFormData({ ...formData, confirmPassword: v })
                    }
                    error={errors.confirmPassword}
                    placeholder="Ulangi password di atas"
                  />
                </>
              )}

              {/* Personal Info */}
              <Input
                label="Nama Lengkap"
                value={formData.full_name}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, full_name: v })
                }
                placeholder="Nama lengkap user"
              />

              <Input
                label="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, email: v })
                }
                error={errors.email}
                autoCapitalize="none"
                placeholder="email@contoh.com"
              />

              <Input
                label="No. Telepon"
                keyboardType="phone-pad"
                value={formData.phone_number}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, phone_number: v })
                }
                placeholder="0812-3456-7890"
              />

              {/* Role Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Role User</Text>
                <View style={styles.roleContainer}>
                  {(["pic", "operator", "admin"] as UserRole[]).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        formData.role === role && styles.roleButtonActive,
                      ]}
                      onPress={() => handleRoleChange(role)}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          formData.role === role && styles.roleButtonTextActive,
                        ]}
                      >
                        {role.toUpperCase()}
                      </Text>
                      {role === "admin" && (
                        <Text style={styles.roleDescription}>
                          Administrator
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* School PIC Selection (only for PIC role) */}
              {formData.role === "admin" && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    PIC Sekolah *
                    {isLoadingPIC && (
                      <ActivityIndicator
                        size="small"
                        color="#2563EB"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      errors.school_pic_id && styles.selectorButtonError,
                    ]}
                    onPress={() => setShowSchoolPICModal(true)}
                    disabled={isLoadingPIC}
                  >
                    {selectedSchoolPIC ? (
                      <View style={styles.selectedItem}>
                        <Text style={styles.selectedItemName}>
                          {selectedSchoolPIC.name}
                        </Text>
                        <Text style={styles.selectedItemInfo}>
                          {selectedSchoolPIC.school_name} •{" "}
                          {selectedSchoolPIC.position}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.selectorPlaceholder}>
                        {isLoadingPIC
                          ? "Memuat data PIC..."
                          : "Pilih PIC Sekolah"}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {errors.school_pic_id && (
                    <Text style={styles.errorText}>{errors.school_pic_id}</Text>
                  )}
                  <Text style={styles.helperText}>
                    PIC (Person In Charge) yang bertanggung jawab di sekolah
                  </Text>
                </View>
              )}

              {/* Status Switch */}
              <View style={styles.statusSection}>
                <View style={styles.switchContainer}>
                  <View>
                    <Text style={styles.switchLabel}>Status Akun</Text>
                    <Text style={styles.switchDescription}>
                      {formData.is_active ? "Aktif" : "Nonaktif"}
                    </Text>
                  </View>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(v) =>
                      setFormData({ ...formData, is_active: v })
                    }
                    trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <Text style={styles.statusHelper}>
                  User {formData.is_active ? "dapat" : "tidak dapat"} login dan
                  mengakses sistem
                </Text>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editItem ? "Perbarui" : "Simpan"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* School PIC Selector Modal */}
      <SchoolPICSelectorModal
        visible={showSchoolPICModal}
        schoolPICList={schoolPICList}
        selectedId={formData.school_pic_id}
        onSelect={(id) => {
          setFormData({ ...formData, school_pic_id: id });
          setShowSchoolPICModal(false);
        }}
        onClose={() => setShowSchoolPICModal(false)}
      />
    </>
  );
}

/* ===== Input Component ===== */
function Input({ label, error, helperText, ...props }: any) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          error && styles.inputError,
          props.editable === false && styles.inputDisabled,
        ]}
        placeholderTextColor="#9CA3AF"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    maxHeight: "90%",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  roleButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  roleButtonTextActive: {
    color: "#2563EB",
  },
  roleDescription: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  selectorButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectorButtonError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  selectorPlaceholder: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  selectedItem: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  selectedItemInfo: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  switchDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statusHelper: {
    fontSize: 12,
    color: "#6B7280",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
