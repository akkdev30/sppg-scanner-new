import MenuModal from "@/components/admin/MenuModal";
import { Ionicons } from "@expo/vector-icons";
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

interface MenuItem {
  id: string;
  menu_code: string;
  menu_name: string;
  production_portion: number;
  production_time: string;
  scheduled_date: string;
  status: "pending" | "approved" | "rejected";
  condition: "normal" | "problematic";
  sppg_id: string;
  sppg_name?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface SPPGItem {
  id: string;
  sppg_name: string;
  address?: string;
}

const API_URL = "https://sppg-backend-new.vercel.app/api/dashboard/admin";

export default function MenuManagementScreen() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [sppgList, setSppgList] = useState<SPPGItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [filterSppg, setFilterSppg] = useState<string>("all");

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

  const loadMenus = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/menus`);
      const data = await response.json();

      if (data.success) {
        setMenuList(data.data || []);
      } else {
        Alert.alert("Error", data.error || "Gagal memuat data menu");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memuat data menu");
    }
  };

  const loadSPPG = async () => {
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

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMenus(), loadSPPG()]);
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
    loadMenus().finally(() => setRefreshing(false));
  };

  const handleCreate = () => {
    setEditItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Hapus Menu",
      `Apakah Anda yakin ingin menghapus menu "${name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => confirmDeleteMenu(id),
        },
      ],
    );
  };

  const confirmDeleteMenu = async (id: string) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/menus/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Berhasil", "Menu berhasil dihapus");
        loadMenus();
      } else {
        Alert.alert("Error", data.error || "Gagal menghapus menu");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal menghapus menu");
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const endpoint = editItem
        ? `${API_URL}/menus/${editItem.id}`
        : `${API_URL}/menus`;

      const method = editItem ? "PUT" : "POST";

      // Format data sesuai backend
      const payload = {
        menu_code: formData.menu_code,
        menu_name: formData.menu_name,
        sppg_id: formData.sppg_id,
        production_portion: parseInt(formData.production_portion) || 0,
        production_time: formData.production_time,
        scheduled_date: formData.scheduled_date,
        notes: formData.notes || null,
        // Untuk create, tambahkan created_by
        ...(!editItem && { created_by: "current-user-id" }), // Ganti dengan user ID asli
      };

      const response = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Berhasil", data.message || "Menu berhasil disimpan");
        setModalVisible(false);
        loadMenus();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan menu");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan menu");
    }
  };

  const handleApprove = async (
    id: string,
    status: "accepted" | "rejected",
    rejectedReason?: string,
  ) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/menus/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          status,
          ...(status === "rejected" && { rejected_reason: rejectedReason }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Berhasil",
          data.message || "Status menu berhasil diperbarui",
        );
        loadMenus();
      } else {
        Alert.alert("Error", data.error || "Gagal memperbarui status menu");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memperbarui status menu");
    }
  };

  const filteredMenus = menuList.filter((menu) => {
    // Filter by status
    if (filterStatus !== "all" && menu.status !== filterStatus) return false;

    // Filter by SPPG
    if (filterSppg !== "all" && menu.sppg_id !== filterSppg) return false;

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#059669";
      case "pending":
        return "#F59E0B";
      case "rejected":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  const getConditionColor = (condition: string) => {
    return condition === "normal" ? "#059669" : "#DC2626";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manajemen Menu</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter Status:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "all" && styles.filterActive,
            ]}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === "all" && styles.filterTextActive,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "pending" && styles.filterActive,
            ]}
            onPress={() => setFilterStatus("pending")}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === "pending" && styles.filterTextActive,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "approved" && styles.filterActive,
            ]}
            onPress={() => setFilterStatus("approved")}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === "approved" && styles.filterTextActive,
              ]}
            >
              Disetujui
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "rejected" && styles.filterActive,
            ]}
            onPress={() => setFilterStatus("rejected")}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === "rejected" && styles.filterTextActive,
              ]}
            >
              Ditolak
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={[styles.filterLabel, { marginTop: 12 }]}>
          Filter SPPG:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterSppg === "all" && styles.filterActive,
            ]}
            onPress={() => setFilterSppg("all")}
          >
            <Text
              style={[
                styles.filterText,
                filterSppg === "all" && styles.filterTextActive,
              ]}
            >
              Semua SPPG
            </Text>
          </TouchableOpacity>
          {sppgList.map((sppg) => (
            <TouchableOpacity
              key={sppg.id}
              style={[
                styles.filterButton,
                filterSppg === sppg.id && styles.filterActive,
              ]}
              onPress={() => setFilterSppg(sppg.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterSppg === sppg.id && styles.filterTextActive,
                ]}
              >
                {sppg.sppg_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
          />
        }
      >
        {filteredMenus.map((menu) => (
          <View key={menu.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.menuCode}>{menu.menu_code}</Text>
                <Text style={styles.menuName}>{menu.menu_name}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(menu.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {menu.status === "approved"
                    ? "DISETUJUI"
                    : menu.status === "pending"
                      ? "PENDING"
                      : "DITOLAK"}
                </Text>
              </View>
            </View>

            <View style={styles.menuInfoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="restaurant-outline"
                    size={18}
                    color="#4F46E5"
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Porsi</Text>
                  <Text style={styles.infoValue}>
                    {menu.production_portion} porsi
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time-outline" size={18} color="#4F46E5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Waktu</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(menu.production_time)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tanggal</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(menu.scheduled_date)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="business-outline" size={18} color="#4F46E5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>SPPG</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {menu.sppg_name || menu.sppg_id}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Kondisi:</Text>
                <View
                  style={[
                    styles.conditionBadge,
                    { backgroundColor: getConditionColor(menu.condition) },
                  ]}
                >
                  <Text style={styles.conditionText}>
                    {menu.condition === "normal" ? "NORMAL" : "BERMASALAH"}
                  </Text>
                </View>
              </View>

              {menu.notes && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Catatan:</Text>
                  <Text style={styles.metaValue} numberOfLines={2}>
                    {menu.notes}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              {menu.status === "pending" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApprove(menu.id, "approved")}
                  >
                    <View style={styles.actionBtnContent}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#059669"
                      />
                      <Text
                        style={[styles.actionBtnText, { color: "#059669" }]}
                      >
                        Setujui
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => {
                      Alert.prompt(
                        "Alasan Penolakan",
                        "Masukkan alasan penolakan:",
                        [
                          { text: "Batal", style: "cancel" },
                          {
                            text: "Tolak",
                            onPress: (reason) =>
                              handleApprove(menu.id, "rejected", reason),
                          },
                        ],
                        "plain-text",
                      );
                    }}
                  >
                    <View style={styles.actionBtnContent}>
                      <Ionicons name="close-circle" size={16} color="#DC2626" />
                      <Text
                        style={[styles.actionBtnText, { color: "#DC2626" }]}
                      >
                        Tolak
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => handleEdit(menu)}
              >
                <View style={styles.actionBtnContent}>
                  <Ionicons name="create-outline" size={16} color="#2563EB" />
                  <Text style={[styles.actionBtnText, { color: "#2563EB" }]}>
                    Edit
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(menu.id, menu.menu_name)}
              >
                <View style={styles.actionBtnContent}>
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  <Text style={[styles.actionBtnText, { color: "#DC2626" }]}>
                    Hapus
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.detailBtn]}
                onPress={() => {
                  /* Navigate to detail */
                }}
              >
                <View style={styles.actionBtnContent}>
                  <Ionicons name="eye-outline" size={16} color="#7C3AED" />
                  <Text style={[styles.actionBtnText, { color: "#7C3AED" }]}>
                    Detail
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredMenus.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>
              {filterStatus === "all" && filterSppg === "all"
                ? "Belum ada data menu"
                : "Tidak ada menu dengan filter yang dipilih"}
            </Text>
          </View>
        )}
      </ScrollView>

      <MenuModal
        visible={modalVisible}
        editItem={editItem}
        sppgList={sppgList}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
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
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: "row",
    paddingBottom: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
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
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  menuCode: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  menuName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 85,
    alignItems: "center",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  menuInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: "45%",
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  metaContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    minWidth: 70,
  },
  metaValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
    marginLeft: 8,
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: "row",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
  },
  actionBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  approveBtn: {
    backgroundColor: "#D1FAE5",
  },
  rejectBtn: {
    backgroundColor: "#FEE2E2",
  },
  editBtn: {
    backgroundColor: "#DBEAFE",
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
  },
  detailBtn: {
    backgroundColor: "#F3E8FF",
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
    fontWeight: "500",
  },
});
