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
<<<<<<< HEAD
import SPPGSelectorModal from "./SPPGSelectorModal";
import SchoolSelectorModal from "./SchoolSelectorModal";
=======
import SchoolPICSelectorModal from "../admin/SchoolPICSelectorModal";

// Tambahkan tipe role yang lebih lengkap
type UserRole = "admin";
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2

interface UserItem {
  id: string;
  username: string;
<<<<<<< HEAD
  role: "admin" | "pic" | "user" | "school_admin" | "school_user";
=======
  role: UserRole;
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  full_name?: string;
  email?: string;
  phone_number?: string;
  school_pic_id?: string;
<<<<<<< HEAD
  is_active: boolean;
=======
  school_pic_name?: string; // Untuk tampilan nama PIC
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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
<<<<<<< HEAD
  schoolList: SchoolOption[];
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void> | void; // Ubah menjadi async
=======
  schoolPICList: SchoolPICOption[]; // Data PIC sekolah
  isLoadingPIC?: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isSubmitting?: boolean;
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
}

export default function UserModal({
  visible,
  editItem,
<<<<<<< HEAD
  sppgList = [],
  schoolList = [],
=======
  sppgList,
  schoolPICList,
  isLoadingPIC = false,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  onClose,
  onSubmit,
  isSubmitting = false,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
<<<<<<< HEAD
    role: "pic" as "admin" | "pic" | "user" | "school_admin" | "school_user",
=======
    role: "pic" as UserRole,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    full_name: "",
    email: "",
    phone_number: "",
    school_id: "",
    position: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSPPGModal, setShowSPPGModal] = useState(false);
<<<<<<< HEAD
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State untuk loading
  const [selectedSppgId, setSelectedSppgId] = useState<string>("");

  // Reset form ketika modal dibuka/tutup
=======
  const [showSchoolPICModal, setShowSchoolPICModal] = useState(false);

  // Reset form dan error saat modal ditutup
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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
        school_id: "",
        position: "",
        is_active: true,
      });
<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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

<<<<<<< HEAD
    // Validasi password untuk edit user (jika diisi)
    if (editItem && password) {
      if (password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
=======
    // Password validation for edit (if password is provided)
    if (editItem && formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi password wajib diisi";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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
<<<<<<< HEAD
      is_active: formData.is_active,
    };

    // Jika create user baru atau edit dengan password baru
    if (!editItem || password) {
      payload.password = password;
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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

<<<<<<< HEAD
  // Get selected school
  const selectedSchool = schoolList.find((s) => s.id === formData.school_id);

  // Filter schools berdasarkan SPPG jika ada filter
  const filteredSchools = selectedSppgId
    ? schoolList.filter((school) => school.sppg_id === selectedSppgId)
    : schoolList;
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2

  return (
    <>
      <Modal transparent visible={visible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
<<<<<<< HEAD
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>
                {editItem ? "Edit User" : "Tambah User Baru"}
              </Text>
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2

              {/* Username */}
              <Input
                label="Username *"
                value={formData.username}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, username: v })
                }
<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
                    value={formData.confirmPassword}
                    onChangeText={(v: string) =>
                      setFormData({ ...formData, confirmPassword: v })
                    }
<<<<<<< HEAD
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
=======
                    error={errors.confirmPassword}
                    placeholder="Ulangi password di atas"
                  />
                </>
              )}

              {/* Personal Info */}
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
              <Input
                label="Nama Lengkap"
                value={formData.full_name}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, full_name: v })
                }
<<<<<<< HEAD
                placeholder="Nama lengkap pengguna"
                editable={!loading}
=======
                placeholder="Nama lengkap user"
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
              />

              {/* Email */}
              <Input
                label="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, email: v })
                }
<<<<<<< HEAD
                placeholder="email@contoh.com"
                autoCapitalize="none"
                editable={!loading}
=======
                error={errors.email}
                autoCapitalize="none"
                placeholder="email@contoh.com"
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
              />

              {/* Phone Number */}
              <Input
                label="No. Telepon"
                keyboardType="phone-pad"
                value={formData.phone_number}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, phone_number: v })
                }
<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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

<<<<<<< HEAD
              {/* Info untuk edit mode */}
              {editItem && editItem.school_pic_id && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Note:</Text> User ini sudah
                    terhubung dengan PIC sekolah. Data sekolah tidak dapat
                    diubah.
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
                  </Text>
                </View>
              )}

<<<<<<< HEAD
              {/* Loading indicator */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text style={styles.loadingText}>
                    {editItem ? "Mengupdate user..." : "Membuat user baru..."}
                  </Text>
                </View>
              )}
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
<<<<<<< HEAD
                style={[styles.cancel, loading && styles.disabledButton]}
                disabled={loading}
              >
                <Text
                  style={[styles.cancelText, loading && styles.disabledText]}
                >
                  Batal
                </Text>
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    maxHeight: "90%",
<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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
<<<<<<< HEAD
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
=======
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
<<<<<<< HEAD
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
=======
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    minWidth: 80,
=======
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  },
  roleButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
<<<<<<< HEAD
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  selectorInput: {
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
<<<<<<< HEAD
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
=======
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
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
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
  cancelButton: {
    flex: 1,
<<<<<<< HEAD
    paddingVertical: 16,
=======
    paddingVertical: 14,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
<<<<<<< HEAD
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  submit: {
    flex: 1,
    paddingVertical: 16,
=======
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
<<<<<<< HEAD
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
=======
  submitButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  },
});
