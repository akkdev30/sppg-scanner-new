<<<<<<< HEAD
=======
// app/(admin)/users.tsx

import UserDetailModal from "@/components/admin/UserDetailModal";
import UserList from "@/components/admin/UserList";
import UserModal from "@/components/admin/UserModal";
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

// Definisikan tipe yang lengkap sesuai database
interface UserItem {
  id: string;
  username: string;
<<<<<<< HEAD
  role: "admin" | "pic" | "user" | "school_admin" | "school_user";
  full_name?: string;
  email?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
=======
  role: "admin";
  full_name?: string;
  email?: string;
  phone_number?: string;
  school_pic_id?: string;
  school_pic_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  created_by?: string;
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
}

interface SPPGOption {
  id: string;
<<<<<<< HEAD
  sppg_name: string;
  address?: string;
}

interface SchoolOption {
  id: string;
  name: string;
  school_code: string;
  sppg_id?: string;
}
=======
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

const API_URL =
  process.env.API_URL_SERVER || "https://sppg-backend-new.vercel.app/api";
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2

export default function UserManagementScreen() {
  const { user: currentUser, getToken } = useAuth();
  const API_URL = "https://sppg-backend-new.vercel.app/api/dashboard/admin";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userList, setUserList] = useState<UserItem[]>([]);
<<<<<<< HEAD
  const [sppgList, setSppgList] = useState<SPPGOption[]>([]);
  const [schoolList, setSchoolList] = useState<SchoolOption[]>([]);
=======
  const [schoolPICList, setSchoolPICList] = useState<SchoolPICOption[]>([]);
  const [isLoadingPIC, setIsLoadingPIC] = useState(false);
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<UserItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
<<<<<<< HEAD
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
  const [formLoading, setFormLoading] = useState(false);
  const [selectedSppgId, setSelectedSppgId] = useState<string>("");
  const [filterRole, setFilterRole] = useState<
    "all" | "admin" | "pic" | "user" | "school_admin" | "school_user"
  >("all");

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };
=======
  const [filterRole, setFilterRole] = useState<"admin">("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUsers(), loadSchoolPICList()]);
    } catch (error) {
      console.error("Load initial data error:", error);
      Alert.alert("Error", "Gagal memuat data awal");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
<<<<<<< HEAD
      const response = await fetchWithAuth(`${API_URL}/users`);
      const data = await response.json();
=======
      const token = await getToken();
      const res = await fetch(`${API_URL}/dashboard/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
      if (data.success) {
        setUserList(data.data || []);
      } else {
        Alert.alert("Error", data.error || "Gagal memuat data pengguna");
      }
    } catch (error) {
<<<<<<< HEAD
      Alert.alert("Error", "Gagal memuat data pengguna");
    }
  };

  const loadSPPGList = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/sppg`);
      const data = await response.json();
      if (data.success) {
        setSppgList(data.data || []);
      }
    } catch (error) {
      console.error("Error loading SPPG:", error);
    }
  };

  const loadSchoolList = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/schools`);
      const data = await response.json();
      if (data.success) {
        setSchoolList(data.data || []);
      }
    } catch (error) {
      console.error("Error loading schools:", error);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadSPPGList(), loadSchoolList()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers().finally(() => setRefreshing(false));
=======
      console.error("Load users error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Gagal memuat data pengguna",
      );
    }
  };

  const loadSchoolPICList = async () => {
    try {
      setIsLoadingPIC(true);
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/dashboard/admin/school-pics?is_active=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSchoolPICList(data.data || []);
      }
    } catch (error) {
      console.error("Load school PIC error:", error);
      Alert.alert("Error", "Gagal memuat data PIC sekolah");
    } finally {
      setIsLoadingPIC(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([loadUsers(), loadSchoolPICList()]).finally(() =>
      setRefreshing(false),
    );
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  };

  const handleCreate = () => {
    setEditItem(null);
    resetForm();
    setModalVisible(true);
  };

  const handleEdit = (item: UserItem) => {
    setEditItem(item);
    setFormData({
      username: item.username,
      password: "",
      confirmPassword: "",
      role: item.role,
      full_name: item.full_name || "",
      email: item.email || "",
      phone_number: item.phone_number || "",
      school_id: "",
      position: "",
      is_active: item.is_active,
    });
    setModalVisible(true);
  };

  const handleViewDetail = (item: UserItem) => {
    setSelectedUser(item);
    setDetailModalVisible(true);
  };

  const handleDeactivate = async (id: string, username: string) => {
    if (id === currentUser?.id) {
<<<<<<< HEAD
      Alert.alert("Error", "Anda tidak dapat menghapus akun sendiri");
=======
      Alert.alert("Error", "Anda tidak dapat menonaktifkan akun Anda sendiri");
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
      return;
    }

    Alert.alert(
<<<<<<< HEAD
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus user "${username}"?`,
=======
      "Nonaktifkan User",
      `Apakah Anda yakin ingin menonaktifkan user ${username}?`,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Nonaktifkan",
          style: "destructive",
<<<<<<< HEAD
          onPress: () => confirmDeleteUser(id),
=======
          onPress: () => toggleUserStatus(id, false),
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
        },
      ],
    );
  };

<<<<<<< HEAD
  const confirmDeleteUser = async (id: string) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Berhasil", data.message || "User berhasil dihapus");
        loadUsers();
      } else {
        Alert.alert("Error", data.error || "Gagal menghapus user");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal menghapus user");
    }
  };

  const resetForm = () => {
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
    setSelectedSppgId("");
  };

  const rolesRequiringSchool = ["pic", "school_admin", "school_user"];

  const handleSubmit = async () => {
    if (formLoading) return;

    if (!formData.username.trim()) {
      Alert.alert("Error", "Username wajib diisi");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
    if (!usernameRegex.test(formData.username)) {
      Alert.alert(
        "Error",
        "Username harus 3-50 karakter, hanya boleh mengandung huruf, angka, titik (.), garis bawah (_), dan tanda minus (-)",
      );
      return;
    }

    if (!editItem) {
      if (!formData.password) {
        Alert.alert("Error", "Password wajib diisi");
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert("Error", "Format email tidak valid");
      return;
    }

    if (rolesRequiringSchool.includes(formData.role) && !formData.school_id) {
      Alert.alert("Error", "Sekolah wajib dipilih untuk role ini");
      return;
    }

    const payload: any = {
      username: formData.username.trim(),
      role: formData.role,
      full_name: formData.full_name.trim() || null,
      email: formData.email.trim() || null,
      phone_number: formData.phone_number.trim() || null,
      is_active: formData.is_active,
    };

    if (!editItem || formData.password) {
      payload.password = formData.password;
    }

    if (rolesRequiringSchool.includes(formData.role)) {
      payload.school_id = formData.school_id;
      payload.position = formData.position.trim() || formData.role;
    }

    if (editItem && editItem.school_pic_id) {
      delete payload.school_id;
      delete payload.position;
    }

    setFormLoading(true);

    try {
      const endpoint = editItem
        ? `${API_URL}/users/${editItem.id}`
        : `${API_URL}/users`;
      const method = editItem ? "PUT" : "POST";
      const response = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload),
=======
  const handleActivate = async (id: string, username: string) => {
    Alert.alert(
      "Aktifkan User",
      `Apakah Anda yakin ingin mengaktifkan kembali user ${username}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Aktifkan",
          onPress: () => toggleUserStatus(id, true),
        },
      ],
    );
  };

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/dashboard/admin/users/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
      });
      const data = await response.json();
      if (data.success) {
<<<<<<< HEAD
        Alert.alert("Berhasil", data.message || "User berhasil disimpan");
=======
        Alert.alert(
          "Berhasil",
          `User berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
        );
        loadUsers();
      } else {
        Alert.alert(
          "Error",
          data.error ||
            `Gagal ${isActive ? "mengaktifkan" : "menonaktifkan"} user`,
        );
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengubah status user");
    }
  };

  const handleSubmit = async (formData: any) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const token = await getToken();

      const endpoint = editItem
        ? `${API_URL}/dashboard/admin/users/${editItem.id}`
        : `${API_URL}/dashboard/admin/users`;

      const method = editItem ? "PUT" : "POST";

      // Siapkan payload sesuai dengan API createUser yang sudah diperbaiki
      const payload: any = {
        username: formData.username.trim(),
        role: formData.role,
        full_name: formData.full_name?.trim() || null,
        email: formData.email?.trim() || null,
        phone_number: formData.phone_number?.trim() || null,
        school_pic_id: formData.role === "pic" ? formData.school_pic_id : null,
        is_active: formData.is_active,
      };

      // Hanya tambahkan password jika ada (untuk create) atau diisi (untuk edit)
      if (!editItem || formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert(
          "Berhasil",
          editItem ? "User berhasil diperbarui" : "User berhasil dibuat",
        );
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
        setModalVisible(false);
        loadUsers();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan user");
      }
    } catch (error) {
<<<<<<< HEAD
      Alert.alert("Error", "Gagal menyimpan user");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUsers =
    filterRole === "all"
      ? userList
      : userList.filter((u) => u.role === filterRole);
  const filteredSchools = selectedSppgId
    ? schoolList.filter((school) => school.sppg_id === selectedSppgId)
    : schoolList;
  const selectedSchool = schoolList.find((s) => s.id === formData.school_id);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#DC2626";
      case "pic":
        return "#059669";
      case "school_admin":
        return "#7C3AED";
      case "school_user":
        return "#EA580C";
      case "user":
        return "#2563EB";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
=======
      console.error("Submit error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan user");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter dan pencarian
  const filteredUsers = userList.filter((user) => {
    const matchesRole = user.role === filterRole;
    const matchesSearch =
      searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showInactive ? true : user.is_active;

    return matchesRole && matchesSearch && matchesStatus;
  });

  // Hitung statistik
  const activeUsersCount = userList.filter((u) => u.is_active).length;
  const inactiveUsersCount = userList.length - activeUsersCount;
  const roleCounts = {
    admin: userList.filter((u) => u.role === "admin" && u.is_active).length,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
<<<<<<< HEAD
        <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="person-add" size={20} color="white" />
=======
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Manajemen User</Text>
            <Text style={styles.headerSubtitle}>
              {userList.length} user • {activeUsersCount} aktif •{" "}
              {inactiveUsersCount} nonaktif
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="person-add-outline" size={22} color="white" />
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

<<<<<<< HEAD
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterRole === "all" && styles.filterActive,
            ]}
            onPress={() => setFilterRole("all")}
          >
            <Text
              style={[
                styles.filterText,
                filterRole === "all" && styles.filterTextActive,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>
          {["admin", "pic", "user", "school_admin", "school_user"].map(
            (role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.filterButton,
                  filterRole === role && styles.filterActive,
=======
      {/* Stats Overview */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userList.length}</Text>
          <Text style={styles.statLabel}>Total User</Text>
        </View>
        <View style={[styles.statCard, styles.statCardActive]}>
          <Text style={[styles.statValue, styles.statValueActive]}>
            {activeUsersCount}
          </Text>
          <Text style={[styles.statLabel, styles.statLabelActive]}>Aktif</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{roleCounts.admin}</Text>
          <Text style={styles.statLabel}>Admin</Text>
        </View>
      </ScrollView>

      {/* Search and Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari user..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.roleFilterContainer}
          >
            {["all", "admin", "pic", "operator"].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleFilterButton,
                  filterRole === role && styles.roleFilterButtonActive,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
                ]}
                onPress={() => setFilterRole(role as any)}
              >
                <Text
                  style={[
<<<<<<< HEAD
                    styles.filterText,
                    filterRole === role && styles.filterTextActive,
                  ]}
                >
                  {role === "school_admin"
                    ? "SCHOOL ADMIN"
                    : role === "school_user"
                      ? "SCHOOL USER"
                      : role.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
=======
                    styles.roleFilterText,
                    filterRole === role && styles.roleFilterTextActive,
                  ]}
                >
                  {role === "all" ? "Semua" : role}
                </Text>
                {role !== "all" && (
                  <View
                    style={[
                      styles.roleBadge,
                      filterRole === role && styles.roleBadgeActive,
                    ]}
                  >
                    <Text style={styles.roleBadgeText}>
                      {roleCounts[role as keyof typeof roleCounts] || 0}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.inactiveToggle,
              showInactive && styles.inactiveToggleActive,
            ]}
            onPress={() => setShowInactive(!showInactive)}
          >
            <Ionicons
              name={showInactive ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={showInactive ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.inactiveToggleText,
                showInactive && styles.inactiveToggleTextActive,
              ]}
            >
              Nonaktif
            </Text>
          </TouchableOpacity>
        </View>
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
      </View>

      {/* User List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
<<<<<<< HEAD
        {filteredUsers.map((item) => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => handleViewDetail(item)}
            >
              <View style={styles.userHeader}>
                <View style={styles.usernameRow}>
                  <Text style={styles.username}>{item.username}</Text>
                  {!item.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveText}>NONAKTIF</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(item.role) },
                  ]}
                >
                  <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                </View>
              </View>
              {item.full_name && (
                <Text style={styles.fullName}>{item.full_name}</Text>
              )}
              {item.email && <Text style={styles.email}>{item.email}</Text>}
              <Text style={styles.date}>
                Dibuat: {formatDate(item.created_at)}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewDetail(item)}
              >
                <Ionicons name="eye-outline" size={20} color="#6B7280" />
                <Text style={styles.actionText}>Detail</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
                disabled={item.id === currentUser?.id}
              >
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={item.id === currentUser?.id ? "#9CA3AF" : "#2563EB"}
                />
                <Text
                  style={[
                    styles.actionText,
                    item.id === currentUser?.id && styles.disabledAction,
                  ]}
                >
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item.id, item.username)}
                disabled={item.id === currentUser?.id}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={item.id === currentUser?.id ? "#9CA3AF" : "#DC2626"}
                />
                <Text
                  style={[
                    styles.actionText,
                    item.id === currentUser?.id && styles.disabledAction,
                  ]}
                >
                  Hapus
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>
              {filterRole === "all"
                ? "Belum ada data pengguna"
                : `Tidak ada pengguna dengan role ${filterRole}`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* User Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editItem ? "Edit User" : "Tambah User Baru"}
              </Text>
=======
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? "User tidak ditemukan" : "Belum ada user"}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery
                ? "Coba gunakan kata kunci lain"
                : "Tambahkan user baru untuk mulai mengelola"}
            </Text>
          </View>
        ) : (
          <UserList
            userList={filteredUsers}
            currentUserId={currentUser?.id || ""}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
            onViewDetail={handleViewDetail}
          />
        )}
      </ScrollView>

      {/* Modals */}
      <UserModal
        visible={modalVisible}
        editItem={editItem}
        schoolPICList={schoolPICList}
        isLoadingPIC={isLoadingPIC}
        sppgList={[]} // Tidak digunakan di modal baru
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>Username *</Text>
                <TextInput
                  value={formData.username}
                  onChangeText={(v) =>
                    setFormData({ ...formData, username: v })
                  }
                  placeholder="minimal 3 karakter, hanya huruf/angka/._-"
                  style={[
                    styles.input,
                    !editItem && formLoading && styles.disabledInput,
                  ]}
                  placeholderTextColor="#9CA3AF"
                  editable={!formLoading}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.passwordContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Password {editItem ? "(opsional)" : "*"}
                  </Text>
                  <TextInput
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(v) =>
                      setFormData({ ...formData, password: v })
                    }
                    placeholder="Minimal 6 karakter"
                    style={[styles.input, formLoading && styles.disabledInput]}
                    placeholderTextColor="#9CA3AF"
                    editable={!formLoading}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => !formLoading && setShowPassword(!showPassword)}
                  disabled={formLoading}
                >
                  <Text
                    style={[
                      styles.showPasswordText,
                      formLoading && styles.disabledText,
                    ]}
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </Text>
                </TouchableOpacity>
              </View>

              {(formData.password || !editItem) && (
                <View style={styles.passwordContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Konfirmasi Password</Text>
                    <TextInput
                      secureTextEntry={!showConfirmPassword}
                      value={formData.confirmPassword}
                      onChangeText={(v) =>
                        setFormData({ ...formData, confirmPassword: v })
                      }
                      placeholder="Ulangi password"
                      style={[
                        styles.input,
                        formLoading && styles.disabledInput,
                      ]}
                      placeholderTextColor="#9CA3AF"
                      editable={!formLoading}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.showPasswordButton}
                    onPress={() =>
                      !formLoading &&
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    disabled={formLoading}
                  >
                    <Text
                      style={[
                        styles.showPasswordText,
                        formLoading && styles.disabledText,
                      ]}
                    >
                      {showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <TextInput
                  value={formData.full_name}
                  onChangeText={(v) =>
                    setFormData({ ...formData, full_name: v })
                  }
                  placeholder="Nama lengkap pengguna"
                  style={[styles.input, formLoading && styles.disabledInput]}
                  placeholderTextColor="#9CA3AF"
                  editable={!formLoading}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(v) => setFormData({ ...formData, email: v })}
                  placeholder="email@contoh.com"
                  style={[styles.input, formLoading && styles.disabledInput]}
                  placeholderTextColor="#9CA3AF"
                  editable={!formLoading}
                  autoCapitalize="none"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>No. Telepon</Text>
                <TextInput
                  keyboardType="phone-pad"
                  value={formData.phone_number}
                  onChangeText={(v) =>
                    setFormData({ ...formData, phone_number: v })
                  }
                  placeholder="081234567890"
                  style={[styles.input, formLoading && styles.disabledInput]}
                  placeholderTextColor="#9CA3AF"
                  editable={!formLoading}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={styles.label}>Role *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.roleContainer}>
                    {[
                      "admin",
                      "pic",
                      "user",
                      "school_admin",
                      "school_user",
                    ].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.roleBtn,
                          formData.role === r && styles.roleActive,
                          formLoading && styles.disabledButton,
                        ]}
                        onPress={() =>
                          !formLoading &&
                          setFormData({ ...formData, role: r as any })
                        }
                        disabled={formLoading}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            formLoading && styles.disabledText,
                          ]}
                        >
                          {r.toUpperCase().replace("_", " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {rolesRequiringSchool.includes(formData.role) && (
                <>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Sekolah *</Text>
                    <TouchableOpacity
                      style={[
                        styles.selectorInput,
                        formLoading && styles.disabledInput,
                      ]}
                      onPress={() => !formLoading && setShowSchoolModal(true)}
                      disabled={formLoading}
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

                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.inputLabel}>Jabatan</Text>
                    <TextInput
                      value={formData.position}
                      onChangeText={(v) =>
                        setFormData({ ...formData, position: v })
                      }
                      placeholder={
                        formData.role === "pic"
                          ? "Contoh: Kepala Sekolah, Guru, dll"
                          : "Posisi/jabatan"
                      }
                      style={[
                        styles.input,
                        formLoading && styles.disabledInput,
                      ]}
                      placeholderTextColor="#9CA3AF"
                      editable={!formLoading}
                    />
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>
                      Filter berdasarkan SPPG (Opsional)
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.selectorInput,
                        formLoading && styles.disabledInput,
                      ]}
                      onPress={() => !formLoading && setShowSPPGModal(true)}
                      disabled={formLoading}
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

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Status Akun</Text>
                <View style={styles.switchContainer}>
                  <Text
                    style={[
                      styles.switchStatus,
                      formLoading && styles.disabledText,
                    ]}
                  >
                    {formData.is_active ? "Aktif" : "Nonaktif"}
                  </Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(v) =>
                      !formLoading && setFormData({ ...formData, is_active: v })
                    }
                    trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
                    thumbColor="#FFFFFF"
                    disabled={formLoading}
                  />
                </View>
              </View>

              {editItem && editItem.school_pic_id && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Note:</Text> User ini sudah
                    terhubung dengan PIC sekolah. Data sekolah tidak dapat
                    diubah.
                  </Text>
                </View>
              )}

              {formLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text style={styles.loadingText}>
                    {editItem ? "Mengupdate user..." : "Membuat user baru..."}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.cancel, formLoading && styles.disabledButton]}
                disabled={formLoading}
              >
                <Text
                  style={[
                    styles.cancelText,
                    formLoading && styles.disabledText,
                  ]}
                >
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submit, formLoading && styles.disabledSubmit]}
                disabled={formLoading}
              >
                {formLoading ? (
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

      {/* SPPG Selector Modal */}
      <Modal transparent visible={showSPPGModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "60%" }]}>
            <Text style={styles.modalTitle}>Pilih SPPG</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.selectorItem}
                onPress={() => {
                  setSelectedSppgId("");
                  setShowSPPGModal(false);
                }}
              >
                <Text style={styles.selectorItemText}>Semua SPPG</Text>
              </TouchableOpacity>
              {sppgList.map((sppg) => (
                <TouchableOpacity
                  key={sppg.id}
                  style={[
                    styles.selectorItem,
                    selectedSppgId === sppg.id && styles.selectorItemActive,
                  ]}
                  onPress={() => {
                    setSelectedSppgId(sppg.id);
                    setShowSPPGModal(false);
                  }}
                >
                  <Text style={styles.selectorItemText}>{sppg.sppg_name}</Text>
                  {sppg.address && (
                    <Text style={styles.selectorItemSubtext}>
                      {sppg.address}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSPPGModal(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* School Selector Modal */}
      <Modal transparent visible={showSchoolModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "70%" }]}>
            <Text style={styles.modalTitle}>Pilih Sekolah</Text>
            <ScrollView>
              {filteredSchools.map((school) => (
                <TouchableOpacity
                  key={school.id}
                  style={[
                    styles.selectorItem,
                    formData.school_id === school.id &&
                      styles.selectorItemActive,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, school_id: school.id });
                    setShowSchoolModal(false);
                  }}
                >
                  <Text style={styles.selectorItemText}>{school.name}</Text>
                  <Text style={styles.selectorItemSubtext}>
                    Kode: {school.school_code}
                    {school.sppg_id &&
                      ` • SPPG: ${sppgList.find((s) => s.id === school.sppg_id)?.sppg_name || "Unknown"}`}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredSchools.length === 0 && (
                <Text style={styles.noDataText}>
                  {selectedSppgId
                    ? "Tidak ada sekolah untuk SPPG ini"
                    : "Tidak ada data sekolah"}
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSchoolModal(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Detail Modal */}
      <Modal transparent visible={detailModalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "60%" }]}>
            {selectedUser && (
              <>
                <Text style={styles.modalTitle}>Detail User</Text>
                <ScrollView>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Username:</Text>
                    <Text style={styles.detailValue}>
                      {selectedUser.username}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Role:</Text>
                    <Text style={styles.detailValue}>
                      {selectedUser.role.toUpperCase()}
                    </Text>
                  </View>
                  {selectedUser.full_name && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Nama Lengkap:</Text>
                      <Text style={styles.detailValue}>
                        {selectedUser.full_name}
                      </Text>
                    </View>
                  )}
                  {selectedUser.email && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>
                        {selectedUser.email}
                      </Text>
                    </View>
                  )}
                  {selectedUser.phone_number && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>No. Telepon:</Text>
                      <Text style={styles.detailValue}>
                        {selectedUser.phone_number}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: selectedUser.is_active
                            ? "#D1FAE5"
                            : "#FEE2E2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: selectedUser.is_active
                              ? "#065F46"
                              : "#991B1B",
                          },
                        ]}
                      >
                        {selectedUser.is_active ? "AKTIF" : "NONAKTIF"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Dibuat:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedUser.created_at)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Terakhir Update:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedUser.updated_at)}
                    </Text>
                  </View>
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Tutup</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },
  header: {
    backgroundColor: "white",
<<<<<<< HEAD
    padding: 20,
    paddingTop: 24,
=======
    paddingHorizontal: 20,
    paddingVertical: 16,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
<<<<<<< HEAD
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 22,
=======
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
<<<<<<< HEAD
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: "white",
=======
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
<<<<<<< HEAD
  filterScrollContent: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
    minHeight: 40,
    justifyContent: "center",
=======
  statCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 100,
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
    alignItems: "center",
    marginRight: 12,
  },
<<<<<<< HEAD
  filterActive: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "600",
=======
  statCardActive: {
    backgroundColor: "#EFF6FF",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  statValueActive: {
    color: "#2563EB",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  statLabelActive: {
    color: "#2563EB",
  },
  filterSection: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#111827",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roleFilterContainer: {
    flex: 1,
  },
  roleFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  roleFilterButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
    borderWidth: 1,
  },
  roleFilterText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  roleFilterTextActive: {
    color: "#2563EB",
  },
  roleBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  roleBadgeActive: {
    backgroundColor: "#2563EB",
  },
  roleBadgeText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "600",
  },
  inactiveToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  inactiveToggleActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
    borderWidth: 1,
  },
  inactiveToggleText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  inactiveToggleTextActive: {
    color: "#2563EB",
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  },
  content: {
    flex: 1,
  },
<<<<<<< HEAD
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginRight: 10,
  },
  inactiveBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
  },
  fullName: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "500",
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  actionButton: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  actionText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    fontWeight: "500",
  },
  disabledAction: {
    color: "#9CA3AF",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    marginTop: 20,
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  showPasswordButton: {
    position: "absolute",
    right: 16,
    paddingVertical: 4,
  },
  showPasswordText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  roleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  roleActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  selectorInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
    minHeight: 54,
  },
  selectorTextSelected: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
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
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  switchLabel: {
    fontSize: 15,
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
    borderLeftWidth: 5,
    borderLeftColor: "#F59E0B",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  infoLabel: {
    fontWeight: "700",
    color: "#92400E",
  },
  infoText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    zIndex: 1000,
  },
  footer: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 20,
    borderTopWidth: 1.5,
    borderTopColor: "#F3F4F6",
  },
  cancel: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1.5,
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
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    shadowOpacity: 0.1,
  },
  disabledText: {
    opacity: 0.5,
  },
  // Selector Modal Styles
  selectorItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectorItemActive: {
    backgroundColor: "#EFF6FF",
  },
  selectorItemText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  selectorItemSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noDataText: {
    textAlign: "center",
    color: "#6B7280",
    padding: 24,
    fontSize: 15,
  },
  // Detail Modal Styles
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
=======
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2
  },
});
