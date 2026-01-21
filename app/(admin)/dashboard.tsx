// AdminDashboardScreen.tsx (diperbarui dengan CRUD User)

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

interface DashboardStats {
  totalSPPG: number;
  totalSchools: number;
  totalMenus: number;
  totalQRScans: number;
  todayScans: number;
  problematicMenus: number;
  totalUsers: number;
}

interface SPPGItem {
  id: string;
  sppg_name: string;
  address: string;
  phone_number?: string;
  created_at: string;
}

interface SchoolItem {
  id: string;
  school_code: string;
  name: string;
  sppg_name?: string;
  address: string;
  total_students: number;
}

interface MenuItem {
  id: string;
  menu_name: string;
  production_portion: number;
  received_portion: number;
  production_time: string;
  menu_condition: "normal" | "problematic";
  sppg_name?: string;
}

interface UserItem {
  id: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

const API_URL = "https://niftiest-longanamous-dreama.ngrok-free.dev/api";

export default function AdminDashboardScreen() {
  const { user, logout, getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSPPG: 0,
    totalSchools: 0,
    totalMenus: 0,
    totalQRScans: 0,
    todayScans: 0,
    problematicMenus: 0,
    totalUsers: 0,
  });

  const [activeTab, setActiveTab] = useState<
    "overview" | "sppg" | "schools" | "menus" | "users"
  >("overview");
  const [sppgList, setSppgList] = useState<SPPGItem[]>([]);
  const [schoolList, setSchoolList] = useState<SchoolItem[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "sppg" | "school" | "menu" | "user" | null
  >(null);
  const [editItem, setEditItem] = useState<any>(null);

  // Form states
  const [sppgForm, setSppgForm] = useState({
    sppg_name: "",
    address: "",
    phone_number: "",
  });

  const [schoolForm, setSchoolForm] = useState({
    school_code: "",
    name: "",
    sppg_id: "",
    address: "",
    total_students: "0",
  });

  const [menuForm, setMenuForm] = useState({
    menu_name: "",
    production_portion: "0",
    received_portion: "0",
    production_time: new Date().toISOString().split("T")[0] + "T10:00",
    menu_condition: "normal" as "normal" | "problematic",
    sppg_id: "",
  });

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "pic" as "admin" | "pic",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats from dashboard endpoint
      const statsRes = await fetch(`${API_URL}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          const data = statsData.data;
          setStats({
            totalSPPG: data.total_sppg || 0,
            totalSchools: data.total_schools || 0,
            totalMenus: data.total_menus_today || 0,
            totalQRScans: data.total_scans_today || 0,
            todayScans: data.total_scans_today || 0,
            problematicMenus: data.problematic_menus_today || 0,
            totalUsers: 0, // Will be loaded separately
          });

          // Load SPPG list if available
          if (data.sppg_list) {
            setSppgList(
              data.sppg_list.map((s: any) => ({
                id: s.id,
                sppg_name: s.sppg_name,
                address: s.address,
                phone_number: s.phone_number,
                created_at: s.created_at,
              })),
            );
          }
        }
      }

      // Load schools
      await loadSchools();

      // Load menus
      await loadMenus();

      // Load users
      await loadUsers();
    } catch (error) {
      console.error("Load dashboard error:", error);
      Alert.alert("Error", "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadSchools = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/schools`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSchoolList(data.data || []);
        }
      }
    } catch (error) {
      console.error("Load schools error:", error);
    }
  };

  const loadMenus = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/menus/today`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMenuList(data.data || []);
        }
      }
    } catch (error) {
      console.error("Load menus error:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUserList(data.data || []);
          // Update user count in stats
          setStats((prev) => ({ ...prev, totalUsers: data.data.length || 0 }));
        }
      }
    } catch (error) {
      console.error("Load users error:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleCreate = (type: "sppg" | "school" | "menu" | "user") => {
    setModalType(type);
    setEditItem(null);

    // Reset form based on type
    if (type === "sppg") {
      setSppgForm({ sppg_name: "", address: "", phone_number: "" });
    } else if (type === "school") {
      setSchoolForm({
        school_code: "",
        name: "",
        sppg_id: sppgList[0]?.id || "",
        address: "",
        total_students: "0",
      });
    } else if (type === "menu") {
      setMenuForm({
        menu_name: "",
        production_portion: "0",
        received_portion: "0",
        production_time: new Date().toISOString().split("T")[0] + "T10:00",
        menu_condition: "normal",
        sppg_id: sppgList[0]?.id || "",
      });
    } else if (type === "user") {
      setUserForm({
        username: "",
        password: "",
        confirmPassword: "",
        role: "pic",
      });
    }

    setModalVisible(true);
  };

  const handleEdit = (type: "sppg" | "school" | "menu" | "user", item: any) => {
    setModalType(type);
    setEditItem(item);

    if (type === "sppg") {
      setSppgForm({
        sppg_name: item.sppg_name,
        address: item.address,
        phone_number: item.phone_number || "",
      });
    } else if (type === "school") {
      setSchoolForm({
        school_code: item.school_code,
        name: item.name,
        sppg_id: item.sppg_id,
        address: item.address,
        total_students: item.total_students.toString(),
      });
    } else if (type === "menu") {
      setMenuForm({
        menu_name: item.menu_name,
        production_portion: item.production_portion.toString(),
        received_portion: item.received_portion.toString(),
        production_time: item.production_time,
        menu_condition: item.menu_condition,
        sppg_id: item.sppg_id,
      });
    } else if (type === "user") {
      setUserForm({
        username: item.username,
        password: "",
        confirmPassword: "",
        role: item.role as "admin" | "pic",
      });
    }

    setModalVisible(true);
  };

  const handleDelete = (
    type: "sppg" | "school" | "menu" | "user",
    id: string,
    name: string,
  ) => {
    Alert.alert("Hapus Data", `Apakah Anda yakin ingin menghapus ${name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteItem(type, id),
      },
    ]);
  };

  const deleteItem = async (
    type: "sppg" | "school" | "menu" | "user",
    id: string,
  ) => {
    try {
      let endpoint = "";
      let basePath = "";

      if (type === "user") {
        endpoint = `${API_URL}/auth/users/${id}`;
      } else {
        basePath =
          type === "sppg"
            ? "dashboard/sppg"
            : type === "school"
              ? "dashboard/schools"
              : "dashboard/menus";
        endpoint = `${API_URL}/${basePath}/${id}`;
      }

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert("Berhasil", "Data berhasil dihapus");
        loadDashboardData();
      } else {
        Alert.alert("Error", data.error || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menghapus data");
    }
  };

  const handleSubmit = async () => {
    if (!modalType) return;

    try {
      let endpoint = "";
      let method = editItem ? "PUT" : "POST";
      let body: any = {};

      if (modalType === "sppg") {
        endpoint = `${API_URL}/dashboard/sppg`;
        body = sppgForm;
        if (editItem) endpoint += `/${editItem.id}`;
      } else if (modalType === "school") {
        endpoint = `${API_URL}/dashboard/schools`;
        body = {
          ...schoolForm,
          total_students: parseInt(schoolForm.total_students),
        };
        if (editItem) endpoint += `/${editItem.id}`;
      } else if (modalType === "menu") {
        endpoint = `${API_URL}/dashboard/menus`;
        body = {
          ...menuForm,
          production_portion: parseInt(menuForm.production_portion),
          received_portion: parseInt(menuForm.received_portion),
        };
        if (editItem) endpoint += `/${editItem.id}`;
      } else if (modalType === "user") {
        endpoint = `${API_URL}/auth/${editItem ? `users/${editItem.id}` : "register"}`;

        if (editItem) {
          // For update, only send username and role if changed
          body = {
            username: userForm.username,
            role: userForm.role,
          };
        } else {
          // For create, validate password
          if (userForm.password !== userForm.confirmPassword) {
            Alert.alert("Error", "Password tidak cocok");
            return;
          }
          if (userForm.password.length < 6) {
            Alert.alert("Error", "Password minimal 6 karakter");
            return;
          }
          body = {
            username: userForm.username,
            password: userForm.password,
            role: userForm.role,
          };
        }
      }

      const res = await fetch(endpoint, {
        method,
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
          editItem ? "Data berhasil diupdate" : "Data berhasil dibuat",
        );
        setModalVisible(false);
        loadDashboardData();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan data");
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total SPPG"
          value={stats.totalSPPG}
          icon="business"
          color="#3B82F6"
        />
        <StatCard
          title="Total Sekolah"
          value={stats.totalSchools}
          icon="school"
          color="#10B981"
        />
        <StatCard
          title="Menu Hari Ini"
          value={stats.totalMenus}
          icon="restaurant"
          color="#8B5CF6"
        />
        <StatCard
          title="Scan QR"
          value={stats.todayScans}
          icon="qr-code"
          color="#F59E0B"
        />
        <StatCard
          title="Total User"
          value={stats.totalUsers}
          icon="people"
          color="#EC4899"
        />
        <StatCard
          title="Menu Bermasalah"
          value={stats.problematicMenus}
          icon="warning"
          color="#EF4444"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: "#3B82F6" }]}
            onPress={() => handleCreate("sppg")}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.quickActionText}>Tambah SPPG</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: "#10B981" }]}
            onPress={() => handleCreate("school")}
          >
            <Ionicons name="school" size={24} color="white" />
            <Text style={styles.quickActionText}>Tambah Sekolah</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: "#8B5CF6" }]}
            onPress={() => handleCreate("menu")}
          >
            <Ionicons name="restaurant" size={24} color="white" />
            <Text style={styles.quickActionText}>Tambah Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: "#EC4899" }]}
            onPress={() => handleCreate("user")}
          >
            <Ionicons name="person-add" size={24} color="white" />
            <Text style={styles.quickActionText}>Tambah User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
        <View style={styles.activityList}>
          {menuList.slice(0, 5).map((menu) => (
            <View key={menu.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name={
                    menu.menu_condition === "problematic"
                      ? "warning"
                      : "checkmark-circle"
                  }
                  size={20}
                  color={
                    menu.menu_condition === "problematic"
                      ? "#EF4444"
                      : "#10B981"
                  }
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{menu.menu_name}</Text>
                <Text style={styles.activitySubtitle}>
                  {menu.sppg_name} •{" "}
                  {new Date(menu.production_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Text style={styles.activityTime}>
                {menu.production_portion} porsi
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderSPPG = () => (
    <View style={styles.tabContent}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Daftar SPPG</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleCreate("sppg")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sppgList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{item.sppg_name}</Text>
              <Text style={styles.listItemSubtitle}>{item.address}</Text>
              {item.phone_number && (
                <Text style={styles.listItemDetail}>
                  📞 {item.phone_number}
                </Text>
              )}
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit("sppg", item)}
              >
                <Ionicons name="pencil" size={18} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete("sppg", item.id, item.sppg_name)}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="business" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data SPPG</Text>
          </View>
        }
      />
    </View>
  );

  const renderSchools = () => (
    <View style={styles.tabContent}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Daftar Sekolah</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleCreate("school")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={schoolList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{item.name}</Text>
              <Text style={styles.listItemSubtitle}>{item.school_code}</Text>
              <Text style={styles.listItemDetail}>{item.address}</Text>
              <Text style={styles.listItemDetail}>
                👨‍🎓 {item.total_students} siswa
              </Text>
              {item.sppg_name && (
                <Text style={styles.listItemDetail}>🏢 {item.sppg_name}</Text>
              )}
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit("school", item)}
              >
                <Ionicons name="pencil" size={18} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete("school", item.id, item.name)}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="school" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data sekolah</Text>
          </View>
        }
      />
    </View>
  );

  const renderMenus = () => (
    <View style={styles.tabContent}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Daftar Menu Hari Ini</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleCreate("menu")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{item.menu_name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.menu_condition === "problematic"
                          ? "#FEE2E2"
                          : "#D1FAE5",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.menu_condition === "problematic"
                            ? "#DC2626"
                            : "#059669",
                      },
                    ]}
                  >
                    {item.menu_condition === "problematic"
                      ? "Bermasalah"
                      : "Normal"}
                  </Text>
                </View>
              </View>
              <Text style={styles.listItemSubtitle}>
                ⏰{" "}
                {new Date(item.production_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {item.sppg_name && ` • 🏢 ${item.sppg_name}`}
              </Text>
              <Text style={styles.listItemDetail}>
                📦 {item.production_portion} porsi produksi •{" "}
                {item.received_portion} porsi diterima
              </Text>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit("menu", item)}
              >
                <Ionicons name="pencil" size={18} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete("menu", item.id, item.menu_name)}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data menu hari ini</Text>
          </View>
        }
      />
    </View>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Daftar User</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleCreate("user")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{item.username}</Text>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        item.role === "admin" ? "#DBEAFE" : "#F3E8FF",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      {
                        color: item.role === "admin" ? "#1E40AF" : "#7C3AED",
                      },
                    ]}
                  >
                    {item.role === "admin" ? "Admin" : "PIC"}
                  </Text>
                </View>
              </View>
              <Text style={styles.listItemSubtitle}>
                Dibuat: {new Date(item.created_at).toLocaleDateString()}
              </Text>
              {item.last_login_at && (
                <Text style={styles.listItemDetail}>
                  Terakhir login:{" "}
                  {new Date(item.last_login_at).toLocaleString()}
                </Text>
              )}
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit("user", item)}
              >
                <Ionicons name="pencil" size={18} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete("user", item.id, item.username)}
                disabled={item.id === user?.id} // Disable delete for current user
              >
                <Ionicons
                  name="trash"
                  size={18}
                  color={item.id === user?.id ? "#9CA3AF" : "#EF4444"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data user</Text>
          </View>
        }
      />
    </View>
  );

  const renderModal = () => {
    if (!modalType) return null;

    const title = editItem ? `Edit ${modalType}` : `Tambah ${modalType}`;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {modalType === "sppg" && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Nama SPPG *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={sppgForm.sppg_name}
                      onChangeText={(text) =>
                        setSppgForm({ ...sppgForm, sppg_name: text })
                      }
                      placeholder="Masukkan nama SPPG"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Alamat *</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={sppgForm.address}
                      onChangeText={(text) =>
                        setSppgForm({ ...sppgForm, address: text })
                      }
                      placeholder="Masukkan alamat SPPG"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Nomor Telepon</Text>
                    <TextInput
                      style={styles.formInput}
                      value={sppgForm.phone_number}
                      onChangeText={(text) =>
                        setSppgForm({ ...sppgForm, phone_number: text })
                      }
                      placeholder="Masukkan nomor telepon"
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}

              {modalType === "school" && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Kode Sekolah *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={schoolForm.school_code}
                      onChangeText={(text) =>
                        setSchoolForm({ ...schoolForm, school_code: text })
                      }
                      placeholder="Misal: SCH001"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Nama Sekolah *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={schoolForm.name}
                      onChangeText={(text) =>
                        setSchoolForm({ ...schoolForm, name: text })
                      }
                      placeholder="Masukkan nama sekolah"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>SPPG *</Text>
                    <View style={styles.formInput}>
                      <Text>
                        {sppgList.find((s) => s.id === schoolForm.sppg_id)
                          ?.sppg_name || "Pilih SPPG"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Alamat</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={schoolForm.address}
                      onChangeText={(text) =>
                        setSchoolForm({ ...schoolForm, address: text })
                      }
                      placeholder="Masukkan alamat sekolah"
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Jumlah Siswa</Text>
                    <TextInput
                      style={styles.formInput}
                      value={schoolForm.total_students}
                      onChangeText={(text) =>
                        setSchoolForm({ ...schoolForm, total_students: text })
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}

              {modalType === "menu" && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Nama Menu *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={menuForm.menu_name}
                      onChangeText={(text) =>
                        setMenuForm({ ...menuForm, menu_name: text })
                      }
                      placeholder="Misal: Nasi Goreng Sayur"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>SPPG *</Text>
                    <View style={styles.formInput}>
                      <Text>
                        {sppgList.find((s) => s.id === menuForm.sppg_id)
                          ?.sppg_name || "Pilih SPPG"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Porsi Produksi *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={menuForm.production_portion}
                      onChangeText={(text) =>
                        setMenuForm({ ...menuForm, production_portion: text })
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Waktu Produksi *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={menuForm.production_time}
                      onChangeText={(text) =>
                        setMenuForm({ ...menuForm, production_time: text })
                      }
                      placeholder="YYYY-MM-DDTHH:mm"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Status Menu</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() =>
                          setMenuForm({ ...menuForm, menu_condition: "normal" })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {menuForm.menu_condition === "normal" && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>Normal</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() =>
                          setMenuForm({
                            ...menuForm,
                            menu_condition: "problematic",
                          })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {menuForm.menu_condition === "problematic" && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>Bermasalah</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {modalType === "user" && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Username *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={userForm.username}
                      onChangeText={(text) =>
                        setUserForm({ ...userForm, username: text })
                      }
                      placeholder="Masukkan username"
                      autoCapitalize="none"
                    />
                  </View>

                  {!editItem && (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Password *</Text>
                        <TextInput
                          style={styles.formInput}
                          value={userForm.password}
                          onChangeText={(text) =>
                            setUserForm({ ...userForm, password: text })
                          }
                          placeholder="Masukkan password"
                          secureTextEntry
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>
                          Konfirmasi Password *
                        </Text>
                        <TextInput
                          style={styles.formInput}
                          value={userForm.confirmPassword}
                          onChangeText={(text) =>
                            setUserForm({ ...userForm, confirmPassword: text })
                          }
                          placeholder="Konfirmasi password"
                          secureTextEntry
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Role *</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() =>
                          setUserForm({ ...userForm, role: "admin" })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {userForm.role === "admin" && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>Admin</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() =>
                          setUserForm({ ...userForm, role: "pic" })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {userForm.role === "pic" && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>PIC</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editItem ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Dashboard Admin</Text>
            <Text style={styles.headerSubtitle}>
              Selamat datang, {user?.username}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "overview" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("overview")}
          >
            <Ionicons
              name="grid"
              size={20}
              color={activeTab === "overview" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "sppg" && styles.activeTab]}
            onPress={() => setActiveTab("sppg")}
          >
            <Ionicons
              name="business"
              size={20}
              color={activeTab === "sppg" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "sppg" && styles.activeTabText,
              ]}
            >
              SPPG
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "schools" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("schools")}
          >
            <Ionicons
              name="school"
              size={20}
              color={activeTab === "schools" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "schools" && styles.activeTabText,
              ]}
            >
              Sekolah
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "menus" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("menus")}
          >
            <Ionicons
              name="restaurant"
              size={20}
              color={activeTab === "menus" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "menus" && styles.activeTabText,
              ]}
            >
              Menu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "users" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("users")}
          >
            <Ionicons
              name="people"
              size={20}
              color={activeTab === "users" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "users" && styles.activeTabText,
              ]}
            >
              Users
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboardData();
            }}
            colors={["#2563EB"]}
          />
        }
      >
        {activeTab === "overview" && renderOverview()}
        {activeTab === "sppg" && renderSPPG()}
        {activeTab === "schools" && renderSchools()}
        {activeTab === "menus" && renderMenus()}
        {activeTab === "users" && renderUsers()}
      </ScrollView>

      {/* Modal for CRUD */}
      {renderModal()}
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
    paddingTop: 48,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabNavigation: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#2563EB",
  },
  tabText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#2563EB",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
  },
  activityList: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  activityTime: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  listItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  listItemContent: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  listItemDetail: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
  },
  listItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  radioLabel: {
    fontSize: 14,
    color: "#374151",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});
