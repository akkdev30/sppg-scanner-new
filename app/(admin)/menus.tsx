import MenuList from "@/components/admin/MenuList";
import MenuModal from "@/components/admin/MenuModal";
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

interface MenuItem {
  id: string;
  menu_name: string;
  production_portion: number;
  received_portion: number;
  production_time: string;
  menu_condition: "normal" | "problematic";
  sppg_id: string;
  sppg_name?: string;
}

interface SPPGItem {
  id: string;
  sppg_name: string;
  address: string;
  phone_number?: string;
}

const API_URL = "https://sppg-backend-new.vercel.app/api";

export default function MenuManagementScreen() {
  const { user, getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [sppgList, setSppgList] = useState<SPPGItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadMenus(), loadSPPG()]);
    } catch (error) {
      console.error("Load data error:", error);
      Alert.alert("Error", "Gagal memuat data");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const loadSPPG = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data.sppg_list) {
          setSppgList(data.data.sppg_list);
        }
      }
    } catch (error) {
      console.error("Load SPPG error:", error);
    }
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
    Alert.alert("Hapus Menu", `Apakah Anda yakin ingin menghapus ${name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteMenu(id),
      },
    ]);
  };

  const deleteMenu = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/dashboard/menus/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert("Berhasil", "Menu berhasil dihapus");
        loadData();
      } else {
        Alert.alert("Error", data.error || "Gagal menghapus menu");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menghapus menu");
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const endpoint = editItem
        ? `${API_URL}/dashboard/menus/${editItem.id}`
        : `${API_URL}/dashboard/menus`;

      const body = {
        ...formData,
        production_portion: parseInt(formData.production_portion),
        received_portion: parseInt(formData.received_portion),
      };

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
          editItem ? "Menu berhasil diupdate" : "Menu berhasil ditambahkan",
        );
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan menu");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan menu");
    }
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manajemen Menu</Text>
          <Text style={styles.headerSubtitle}>Kelola menu makanan harian</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color="white" />
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
              loadData();
            }}
            colors={["#2563EB"]}
          />
        }
      >
        <MenuList
          menuList={menuList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </ScrollView>

      {/* Modal */}
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
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  header: {
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
  content: {
    flex: 1,
  },
});
