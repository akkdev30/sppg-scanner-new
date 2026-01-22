import UserModal from "@/components/admin/UserModal";
import UserCard from "@/components/owner/users/UseCard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserFilter from "../../../components/owner/users/UserFilter";
import { useAuth } from "../../../context/AuthContext";

<<<<<<< HEAD
const API_BASE_URL = "https://sppg-backend-new.vercel.app/api";
=======
const API_BASE_URL = process.env.API_URL_SERVER || "http://localhost:3000/api";
>>>>>>> 59c95239196091e77c703aa951553c963edd6ec2

/* =======================
   TYPES
======================= */
interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "owner" | "admin" | "pic";
  is_active: boolean;
  last_login_at: string;
  created_at: string;
  school_pic?: {
    id: string;
    name: string;
    school_id: string;
    school_name: string;
  };
  sppg?: {
    id: string;
    sppg_name: string;
  };
}

/* =======================
   COMPONENT
======================= */
export default function UsersManagementScreen() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");

  const roles = [
    { id: "all", label: "All Roles" },
    { id: "owner", label: "Owner" },
    { id: "admin", label: "Admin" },
    { id: "pic", label: "PIC" },
  ];

  const statuses = [
    { id: "all", label: "All Status" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  /* =======================
     LOAD USERS
  ======================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const usersRes = await fetch(`${API_BASE_URL}/dashboard/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!usersRes.ok) throw new Error("Gagal mengambil data pengguna");

      const usersJson = await usersRes.json();
      setUsers(usersJson.data || []);
    } catch (error) {
      console.error("Load users error:", error);
      Alert.alert("Error", "Gagal memuat data pengguna");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  /* =======================
     USER ACTIONS
  ======================= */
  const handleUserAction = async (userId: string, action: string) => {
    try {
      const token = await getToken();
      let endpoint = "";
      let method = "POST";

      switch (action) {
        case "activate":
          endpoint = `${API_BASE_URL}/users/${userId}/activate`;
          method = "PATCH";
          break;
        case "deactivate":
          endpoint = `${API_BASE_URL}/users/${userId}/deactivate`;
          method = "PATCH";
          break;
        case "reset_password":
          endpoint = `${API_BASE_URL}/users/${userId}/reset-password`;
          method = "POST";
          break;
        case "delete":
          endpoint = `${API_BASE_URL}/users/${userId}`;
          method = "DELETE";
          break;
        default:
          return;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Aksi gagal");
      }

      Alert.alert("Sukses", "Aksi berhasil dilakukan");
      loadUsers(); // Refresh data
    } catch (error: any) {
      console.error("User action error:", error);
      Alert.alert("Error", error.message || "Terjadi kesalahan");
    }
  };

  const confirmUserAction = () => {
    if (!selectedUser || !selectedAction) return;

    let title = "";
    let message = "";
    let destructiveAction = false;

    switch (selectedAction) {
      case "activate":
        title = "Aktifkan Pengguna";
        message = `Aktifkan pengguna ${selectedUser.full_name}?`;
        break;
      case "deactivate":
        title = "Nonaktifkan Pengguna";
        message = `Nonaktifkan pengguna ${selectedUser.full_name}?`;
        destructiveAction = true;
        break;
      case "reset_password":
        title = "Reset Password";
        message = `Reset password untuk ${selectedUser.full_name}? Password baru akan dikirim ke email.`;
        break;
      case "delete":
        title = "Hapus Pengguna";
        message = `Hapus permanen pengguna ${selectedUser.full_name}? Tindakan ini tidak dapat dibatalkan.`;
        destructiveAction = true;
        break;
    }

    Alert.alert(title, message, [
      { text: "Batal", style: "cancel" },
      {
        text: "Lanjutkan",
        style: destructiveAction ? "destructive" : "default",
        onPress: () => handleUserAction(selectedUser.id, selectedAction),
      },
    ]);

    setActionModalVisible(false);
    setSelectedUser(null);
    setSelectedAction("");
  };

  /* =======================
     FILTER
  ======================= */
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(query) ||
      user.full_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone_number.includes(query);

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data pengguna...</Text>
      </View>
    );
  }

  /* =======================
     RENDER
  ======================= */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Manajemen Pengguna</Text>
            <Text style={styles.subtitle}>
              Total: {filteredUsers.length} pengguna
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedUser(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={22} color="white" />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <UserFilter
            roles={roles}
            statuses={statuses}
            selectedRole={filterRole}
            selectedStatus={filterStatus}
            onSelectRole={setFilterRole}
            onSelectStatus={setFilterStatus}
            userCount={filteredUsers.length}
          />
        </View>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Tidak ada pengguna ditemukan</Text>
            <Text style={styles.emptySubtext}>
              Ubah filter atau tambah pengguna baru
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={() => {
                setSelectedUser(user);
                setModalVisible(true);
              }}
              onViewDetails={() =>
                router.push(`/(owner)/users/${user.id}` as any)
              }
              onAction={(action) => {
                setSelectedUser(user);
                setSelectedAction(action);
                setActionModalVisible(true);
              }}
            />
          ))
        )}

        {/* User Modal */}
        <UserModal
          visible={modalVisible}
          user={selectedUser}
          onClose={() => {
            setModalVisible(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            setModalVisible(false);
            loadUsers();
          }}
        />

        {/* Action Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={actionModalVisible}
          onRequestClose={() => setActionModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActionModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Konfirmasi Aksi</Text>
              <Text style={styles.modalText}>
                Apakah Anda yakin ingin melanjutkan aksi ini?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setActionModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmUserAction}
                >
                  <Text style={styles.confirmButtonText}>Lanjutkan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =======================
   STYLES
======================= */
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
    fontSize: 14,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  confirmButton: {
    backgroundColor: "#2563EB",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
