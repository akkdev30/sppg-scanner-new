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
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

interface UserItem {
  id: string;
  username: string;
  role: "admin" | "pic";
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

const API_URL = "https://sppg-backend-new.vercel.app/api";

export default function UserManagementScreen() {
  const { user: currentUser, getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<UserItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "pic">("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/dashboard/admin/users`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUserList(data.data || []);
        }
      }
    } catch (error) {
      console.error("Load users error:", error);
      Alert.alert("Error", "Gagal memuat data pengguna");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const handleDelete = (id: string, username: string) => {
    if (id === currentUser?.id) {
      Alert.alert("Error", "Anda tidak dapat menghapus akun Anda sendiri");
      return;
    }

    Alert.alert(
      "Hapus Pengguna",
      `Apakah Anda yakin ingin menghapus pengguna ${username}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteUser(id),
        },
      ],
    );
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/dashboard/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert("Berhasil", "Pengguna berhasil dihapus");
        loadUsers();
      } else {
        Alert.alert("Error", data.error || "Gagal menghapus pengguna");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menghapus pengguna");
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const endpoint = editItem
        ? `${API_URL}/dashboard/admin/users/${editItem.id}`
        : `${API_URL}/dashboard/admin/users`;

      let body: any = {};

      if (editItem) {
        body = {
          username: formData.username,
          role: formData.role,
        };
        if (formData.password) {
          body.password = formData.password;
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          Alert.alert("Error", "Password tidak cocok");
          return;
        }
        if (formData.password.length < 6) {
          Alert.alert("Error", "Password minimal 6 karakter");
          return;
        }
        body = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
        };
      }

      const res = await fetch(endpoint, {
        method: editItem ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert(
          "Berhasil",
          editItem
            ? "Pengguna berhasil diupdate"
            : "Pengguna berhasil ditambahkan",
        );
        setModalVisible(false);
        loadUsers();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan pengguna");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan pengguna");
    }
  };

  const filteredUsers =
    filterRole === "all"
      ? userList
      : userList.filter((u) => u.role === filterRole);

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
          <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
          <Text style={styles.headerSubtitle}>
            Kelola akses pengguna sistem
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterRole === "all" && styles.filterTabActive,
          ]}
          onPress={() => setFilterRole("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              filterRole === "all" && styles.filterTabTextActive,
            ]}
          >
            Semua ({userList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterRole === "admin" && styles.filterTabActive,
          ]}
          onPress={() => setFilterRole("admin")}
        >
          <Text
            style={[
              styles.filterTabText,
              filterRole === "admin" && styles.filterTabTextActive,
            ]}
          >
            Admin ({userList.filter((u) => u.role === "admin").length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterRole === "pic" && styles.filterTabActive,
          ]}
          onPress={() => setFilterRole("pic")}
        >
          <Text
            style={[
              styles.filterTabText,
              filterRole === "pic" && styles.filterTabTextActive,
            ]}
          >
            PIC ({userList.filter((u) => u.role === "pic").length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadUsers();
            }}
            colors={["#2563EB"]}
          />
        }
      >
        <UserList
          userList={filteredUsers}
          currentUserId={currentUser?.id || ""}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
        />
      </ScrollView>

      {/* Modals */}
      <UserModal
        sppgList={sppgList}
        visible={modalVisible}
        editItem={editItem}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
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
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#EFF6FF",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#2563EB",
  },
  content: {
    flex: 1,
  },
});
