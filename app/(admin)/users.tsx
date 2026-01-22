// app/(admin)/users.tsx

import UserDetailModal from "@/components/admin/UserDetailModal";
import UserList from "@/components/admin/UserList";
import UserModal from "@/components/admin/UserModal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
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

const API_URL =
  process.env.API_URL_SERVER || "https://sppg-backend-new.vercel.app/api";

export default function UserManagementScreen() {
  const { user: currentUser, getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [schoolPICList, setSchoolPICList] = useState<SchoolPICOption[]>([]);
  const [isLoadingPIC, setIsLoadingPIC] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<UserItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [filterRole, setFilterRole] = useState<"admin">("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

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
      if (data.success) {
        setUserList(data.data || []);
      } else {
        Alert.alert("Error", data.error || "Gagal memuat data pengguna");
      }
    } catch (error) {
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
  };

  const handleCreate = () => {
    setEditItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: UserItem) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const handleViewDetail = (item: UserItem) => {
    setSelectedUser(item);
    setDetailModalVisible(true);
  };

  const handleDeactivate = async (id: string, username: string) => {
    if (id === currentUser?.id) {
      Alert.alert("Error", "Anda tidak dapat menonaktifkan akun Anda sendiri");
      return;
    }

    Alert.alert(
      "Nonaktifkan User",
      `Apakah Anda yakin ingin menonaktifkan user ${username}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Nonaktifkan",
          style: "destructive",
          onPress: () => toggleUserStatus(id, false),
        },
      ],
    );
  };

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
      });

      const data = await res.json();

      if (data.success) {
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
        setModalVisible(false);
        loadUsers();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan user");
      }
    } catch (error) {
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
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data pengguna...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

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
                ]}
                onPress={() => setFilterRole(role as any)}
              >
                <Text
                  style={[
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

      <UserDetailModal
        visible={detailModalVisible}
        user={selectedUser}
        onClose={() => setDetailModalVisible(false)}
      />
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
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  addButton: {
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
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  statCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 100,
    alignItems: "center",
    marginRight: 12,
  },
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
  },
  content: {
    flex: 1,
  },
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
  },
});
