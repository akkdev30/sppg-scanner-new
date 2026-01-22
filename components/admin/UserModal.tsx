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
import SPPGSelectorModal from "./SPPGSelectorModal";
import SchoolSelectorModal from "./SchoolSelectorModal";

interface UserItem {
  id: string;
  username: string;
  role: "admin" | "pic" | "user" | "school_admin" | "school_user";
  full_name?: string;
  email?: string;
  phone_number?: string;
  school_pic_id?: string;
  is_active: boolean;
}

interface SPPGOption {
  id: string;
  sppg_name: string;
  address?: string;
}

interface SchoolOption {
  id: string;
  name: string;
  school_code: string;
  sppg_id?: string;
}

interface UserModalProps {
  visible: boolean;
  editItem: UserItem | null;
  sppgList: SPPGOption[];
  schoolList: SchoolOption[];
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void> | void; // Ubah menjadi async
}

export default function UserModal({
  visible,
  editItem,
  sppgList = [],
  schoolList = [],
  onClose,
  onSubmit,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "pic" as "admin" | "pic" | "user" | "school_admin" | "school_user",
    full_name: "",
    email: "",
    phone_number: "",
    school_id: "",
    position: "",
    is_active: true,
  });

  const [showSPPGModal, setShowSPPGModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State untuk loading
  const [selectedSppgId, setSelectedSppgId] = useState<string>("");

  // Reset form ketika modal dibuka/tutup
  useEffect(() => {
    if (!visible) {
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        role: "pic",
        full_name: "",
        email: "",
        phone_number: "",
        school_id: "",
        position: "",
        is_active: true,
      });
      setLoading(false);
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
        school_id: "", // Tidak bisa edit school_id untuk user yang sudah ada
        position: "", // Position dari data PIC, tapi untuk edit bisa berbeda
        is_active: editItem.is_active ?? true,
        password: "",
        confirmPassword: "",
      }));
    }
  }, [visible, editItem]);

  // Role yang membutuhkan sekolah
  const rolesRequiringSchool = ["pic", "school_admin", "school_user"];

  const handleSubmit = async () => {
    if (loading) return; // Mencegah submit berulang

    const username = formData.username.trim();
    const password = formData.password.trim();
    const confirm = formData.confirmPassword.trim();

    // Validasi required fields
    if (!username) {
      Alert.alert("Error", "Username wajib diisi");
      return;
    }

    // Validasi format username
    const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
    if (!usernameRegex.test(username)) {
      Alert.alert(
        "Error",
        "Username harus 3-50 karakter, hanya boleh mengandung huruf, angka, titik (.), garis bawah (_), dan tanda minus (-)",
      );
      return;
    }

    // Validasi password untuk create user
    if (!editItem) {
      if (!password) {
        Alert.alert("Error", "Password wajib diisi");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
      }
      if (password !== confirm) {
        Alert.alert("Error", "Password tidak cocok");
        return;
      }
    }

    // Validasi password untuk edit user (jika diisi)
    if (editItem && password) {
      if (password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
      }
      if (password !== confirm) {
        Alert.alert("Error", "Password tidak cocok");
        return;
      }
    }

    // Validasi email jika diisi
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert("Error", "Format email tidak valid");
        return;
      }
    }

    // Validasi school_id untuk role yang butuh sekolah
    if (rolesRequiringSchool.includes(formData.role) && !formData.school_id) {
      Alert.alert("Error", "Sekolah wajib dipilih untuk role ini");
      return;
    }

    // Validasi position untuk PIC (opsional)
    const position = formData.position.trim() || formData.role;

    // Prepare payload sesuai dengan backend
    const payload: any = {
      username: username,
      role: formData.role,
      full_name: formData.full_name.trim() || null,
      email: formData.email.trim() || null,
      phone_number: formData.phone_number.trim() || null,
      is_active: formData.is_active,
    };

    // Jika create user baru atau edit dengan password baru
    if (!editItem || password) {
      payload.password = password;
    }

    // Untuk role yang butuh sekolah, tambahkan school_id
    if (rolesRequiringSchool.includes(formData.role)) {
      payload.school_id = formData.school_id;
      payload.position = position;
    }

    // Untuk edit user, kita tidak bisa mengubah school_id
    // karena sudah ada school_pic_id yang terhubung
    if (editItem && editItem.school_pic_id) {
      // Hapus school_id dari payload karena tidak bisa diubah
      delete payload.school_id;
      delete payload.position;
    }

    try {
      setLoading(true); // Mulai loading

      // Jika onSubmit mengembalikan Promise, tunggu sampai selesai
      if (typeof onSubmit === "function") {
        const result = onSubmit(payload);
        if (result && typeof result.then === "function") {
          await result;
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error handling sudah dilakukan di parent component
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  // Get selected school
  const selectedSchool = schoolList.find((s) => s.id === formData.school_id);

  // Filter schools berdasarkan SPPG jika ada filter
  const filteredSchools = selectedSppgId
    ? schoolList.filter((school) => school.sppg_id === selectedSppgId)
    : schoolList;

  return (
    <>
      <Modal transparent visible={visible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>
                {editItem ? "Edit User" : "Tambah User Baru"}
              </Text>

              {/* Username */}
              <Input
                label="Username *"
                value={formData.username}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, username: v })
                }
                placeholder="minimal 3 karakter, hanya huruf/angka/._-"
                editable={!editItem && !loading}
              />

              {/* Password */}
              <View style={styles.passwordContainer}>
                <Input
                  label={`Password ${editItem ? "(opsional)" : "*"}`}
                  secure={!showPassword}
                  value={formData.password}
                  onChangeText={(v: string) =>
                    setFormData({ ...formData, password: v })
                  }
                  placeholder="Minimal 6 karakter"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => !loading && setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.showPasswordText,
                      loading && styles.disabledText,
                    ]}
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              {(formData.password || !editItem) && (
                <View style={styles.passwordContainer}>
                  <Input
                    label="Konfirmasi Password"
                    secure={!showConfirmPassword}
                    value={formData.confirmPassword}
                    onChangeText={(v: string) =>
                      setFormData({ ...formData, confirmPassword: v })
                    }
                    placeholder="Ulangi password"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.showPasswordButton}
                    onPress={() =>
                      !loading && setShowConfirmPassword(!showConfirmPassword)
                    }
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.showPasswordText,
                        loading && styles.disabledText,
                      ]}
                    >
                      {showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Full Name */}
              <Input
                label="Nama Lengkap"
                value={formData.full_name}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, full_name: v })
                }
                placeholder="Nama lengkap pengguna"
                editable={!loading}
              />

              {/* Email */}
              <Input
                label="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, email: v })
                }
                placeholder="email@contoh.com"
                autoCapitalize="none"
                editable={!loading}
              />

              {/* Phone Number */}
              <Input
                label="No. Telepon"
                keyboardType="phone-pad"
                value={formData.phone_number}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, phone_number: v })
                }
                placeholder="081234567890"
                editable={!loading}
              />

              {/* Role Selection */}
              <View style={styles.roleRow}>
                <Text style={styles.label}>Role *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.roleContainer}>
                    {["admin", "pic"].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.roleBtn,
                          formData.role === r && styles.roleActive,
                          loading && styles.disabledButton,
                        ]}
                        onPress={() =>
                          !loading &&
                          setFormData({ ...formData, role: r as any })
                        }
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            loading && styles.disabledText,
                          ]}
                        >
                          {r.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* School Selection for roles that require school */}
              {rolesRequiringSchool.includes(formData.role) && (
                <>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Sekolah *</Text>
                    <TouchableOpacity
                      style={[
                        styles.selectorInput,
                        loading && styles.disabledInput,
                      ]}
                      onPress={() => !loading && setShowSchoolModal(true)}
                      disabled={loading}
                    >
                      <Text
                        style={
                          selectedSchool
                            ? styles.selectorTextSelected
                            : styles.selectorTextPlaceholder
                        }
                      >
                        {selectedSchool
                          ? `${selectedSchool.name} (${selectedSchool.school_code})`
                          : "Pilih Sekolah"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Position for PIC */}
                  {formData.role === "pic" && (
                    <Input
                      label="Jabatan"
                      value={formData.position}
                      onChangeText={(v: string) =>
                        setFormData({ ...formData, position: v })
                      }
                      placeholder="Contoh: Kepala Sekolah, Guru, dll"
                      editable={!loading}
                    />
                  )}

                  {/* Filter by SPPG */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>
                      Filter berdasarkan SPPG (Opsional)
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.selectorInput,
                        loading && styles.disabledInput,
                      ]}
                      onPress={() => !loading && setShowSPPGModal(true)}
                      disabled={loading}
                    >
                      <Text
                        style={
                          selectedSppgId
                            ? styles.selectorTextSelected
                            : styles.selectorTextPlaceholder
                        }
                      >
                        {selectedSppgId
                          ? sppgList.find((s) => s.id === selectedSppgId)
                              ?.sppg_name
                          : "Pilih SPPG untuk filter"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Active Status */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Status Akun</Text>
                <View style={styles.switchContainer}>
                  <Text
                    style={[
                      styles.switchStatus,
                      loading && styles.disabledText,
                    ]}
                  >
                    {formData.is_active ? "Aktif" : "Nonaktif"}
                  </Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(v) =>
                      !loading && setFormData({ ...formData, is_active: v })
                    }
                    trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
                    thumbColor="#FFFFFF"
                    disabled={loading}
                  />
                </View>
              </View>

              {/* Info untuk edit mode */}
              {editItem && editItem.school_pic_id && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Note:</Text> User ini sudah
                    terhubung dengan PIC sekolah. Data sekolah tidak dapat
                    diubah.
                  </Text>
                </View>
              )}

              {/* Loading indicator */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text style={styles.loadingText}>
                    {editItem ? "Mengupdate user..." : "Membuat user baru..."}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.cancel, loading && styles.disabledButton]}
                disabled={loading}
              >
                <Text
                  style={[styles.cancelText, loading && styles.disabledText]}
                >
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submit, loading && styles.disabledSubmit]}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.submitLoading}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.submitText}>
                      {editItem ? "Updating..." : "Creating..."}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.submitText}>
                    {editItem ? "Update" : "Simpan"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modals for selection */}
      <SPPGSelectorModal
        visible={showSPPGModal}
        sppgList={sppgList}
        selectedId={selectedSppgId}
        onSelect={(id) => {
          setSelectedSppgId(id);
          setShowSPPGModal(false);
        }}
        onClose={() => setShowSPPGModal(false)}
      />

      <SchoolSelectorModal
        visible={showSchoolModal}
        schoolList={filteredSchools}
        selectedId={formData.school_id}
        onSelect={(id) => {
          setFormData({ ...formData, school_id: id });
          setShowSchoolModal(false);
        }}
        onClose={() => setShowSchoolModal(false)}
      />
    </>
  );
}

/* ===== Input Helper Component ===== */
function Input({ label, secure, editable = true, ...props }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...props}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, !editable && styles.disabledInput]}
        placeholderTextColor="#9CA3AF"
        editable={editable}
      />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    maxHeight: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  passwordContainer: {
    marginBottom: 16,
  },
  showPasswordButton: {
    position: "absolute",
    right: 16,
    top: 40,
    paddingVertical: 4,
  },
  showPasswordText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },
  roleRow: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  roleActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  selectorInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
    minHeight: 52,
  },
  selectorTextSelected: {
    fontSize: 16,
    color: "#111827",
  },
  selectorTextPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  switchRow: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  switchStatus: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  infoBox: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoLabel: {
    fontWeight: "700",
    color: "#92400E",
  },
  infoText: {
    fontSize: 14,
    color: "#92400E",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  submit: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  submitLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInput: {
    opacity: 0.5,
    backgroundColor: "#F3F4F6",
  },
  disabledSubmit: {
    backgroundColor: "#93C5FD",
  },
  disabledText: {
    opacity: 0.5,
  },
});
