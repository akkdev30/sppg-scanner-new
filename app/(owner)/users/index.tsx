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
import StatCard from "../../../components/admin/StatCard";
import UserFilter from "../../../components/owner/users/UserFilter";
import { useAuth } from "../../../context/AuthContext";

const API_BASE_URL = process.env.API_URL_SERVER || "http://localhost:3000/api";

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

interface UserStats {
  total_users: number;
  active_users: number;
  by_role: {
    owner: number;
    admin: number;
    pic: number;
  };
  last_24h_active: number;
  avg_activities_per_user: number;
}

/* =======================
   COMPONENT
======================= */
export default function UsersManagementScreen() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

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
     LOAD USERS + STATS
  ======================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/users/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok) throw new Error("Gagal mengambil users");
      if (!statsRes.ok) throw new Error("Gagal mengambil statistik");

      const usersJson = await usersRes.json();
      const statsJson = await statsRes.json();

      setUsers(usersJson.data);
      setStats(statsJson.data);
    } catch (error) {
      console.error(error);
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
  const activateUser = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/users/${id}/activate`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Activate gagal");
  };

  const deactivateUser = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/users/${id}/deactivate`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Deactivate gagal");
  };

  const resetPassword = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Reset password gagal");
  };

  const deleteUser = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Delete user gagal");
  };

  const confirmUserAction = async () => {
    if (!selectedUser) return;

    try {
      switch (selectedAction) {
        case "activate":
          await activateUser(selectedUser.id);
          break;
        case "deactivate":
          await deactivateUser(selectedUser.id);
          break;
        case "reset_password":
          await resetPassword(selectedUser.id);
          break;
        case "delete":
          await deleteUser(selectedUser.id);
          break;
      }

      Alert.alert("Success", "Aksi berhasil");
      loadUsers();
    } catch (err) {
      Alert.alert("Error", "Aksi gagal");
    } finally {
      setActionModalVisible(false);
      setSelectedUser(null);
      setSelectedAction("");
    }
  };

  /* =======================
     FILTER
  ======================= */
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.username.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);

    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "inactive" && !u.is_active);

    return matchSearch && matchRole && matchStatus;
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Memuat data...</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} />
          </TouchableOpacity>
        </View>

        {stats && (
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.total_users.toString()}
            />
            <StatCard
              title="Active Users"
              value={stats.active_users.toString()}
            />
          </View>
        )}

        <UserFilter
          roles={roles}
          statuses={statuses}
          selectedRole={filterRole}
          selectedStatus={filterStatus}
          onSelectRole={setFilterRole}
          onSelectStatus={setFilterStatus}
          userCount={filteredUsers.length}
        />

        {filteredUsers.map((user) => (
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
        ))}

        <UserModal
          visible={modalVisible}
          user={selectedUser}
          onClose={() => setModalVisible(false)}
          onSave={() => {
            setModalVisible(false);
            loadUsers();
          }}
        />

        <Modal transparent visible={actionModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text>Konfirmasi aksi?</Text>
              <TouchableOpacity onPress={confirmUserAction}>
                <Text>Ya</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =======================
   STYLES (dipersingkat)
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  statsGrid: { flexDirection: "row", gap: 12, padding: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
  },
});
