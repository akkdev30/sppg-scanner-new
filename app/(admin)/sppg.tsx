// app/(admin)/sppg.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import CRUDModal from "../../components/admin/CRUDModal";
import SPPGList from "../../components/admin/SPPGList";
import { useAuth } from "../../context/AuthContext";

interface SPPGItem {
  id: string;
  sppg_name: string;
  address: string;
  phone_number?: string;
  created_at: string;
}

const API_URL = "https://sppg-backend-new.vercel.app/api";

export default function SPPGManagementScreen() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sppgList, setSppgList] = useState<SPPGItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<SPPGItem | null>(null);
  const [formData, setFormData] = useState({
    sppg_name: "",
    address: "",
    phone_number: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_URL}/dashboard/admin/sppg`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        // Format data sesuai dengan yang dibutuhkan
        const formattedData = responseData.data.map((item: any) => ({
          id: item.id || item._id || item.sppg_id,
          sppg_name: item.sppg_name,
          address: item.address,
          phone_number: item.phone_number,
          created_at: item.created_at || new Date().toISOString(),
        }));

        setSppgList(formattedData);
      } else {
        throw new Error(responseData.error || "Failed to load SPPG data");
      }
    } catch (error: any) {
      console.error("Load error:", error);
      Alert.alert("Error", error.message || "Gagal memuat data SPPG");

      // Fallback: coba ambil data dari endpoint lama jika endpoint baru gagal
      try {
        const token = await getToken();
        const fallbackRes = await fetch(`${API_URL}/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success && fallbackData.data.sppg_list) {
            setSppgList(fallbackData.data.sppg_list);
          }
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({ sppg_name: "", address: "", phone_number: "" });
    setModalVisible(true);
  };

  const handleEdit = (item: SPPGItem) => {
    setEditItem(item);
    setFormData({
      sppg_name: item.sppg_name,
      address: item.address,
      phone_number: item.phone_number || "",
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Hapus SPPG", `Apakah Anda yakin ingin menghapus ${name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteItem(id),
      },
    ]);
  };

  const deleteItem = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/admin/sppg/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("Berhasil", "SPPG berhasil dihapus");
        loadData();
      } else {
        Alert.alert("Error", data.error || "Gagal menghapus SPPG");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menghapus SPPG");
    }
  };

  const handleSubmit = async () => {
    // Validasi form
    if (!formData.sppg_name.trim()) {
      Alert.alert("Error", "Nama SPPG harus diisi");
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert("Error", "Alamat harus diisi");
      return;
    }

    try {
      const token = await getToken();
      const endpoint = editItem
        ? `${API_URL}/admin/sppg/${editItem.id}`
        : `${API_URL}/admin/sppg`;

      const res = await fetch(endpoint, {
        method: editItem ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert(
          "Berhasil",
          editItem ? "SPPG berhasil diupdate" : "SPPG berhasil dibuat",
        );
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan SPPG");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan SPPG");
    }
  };

  const formFields = [
    {
      name: "sppg_name",
      label: "Nama SPPG",
      type: "text" as const,
      placeholder: "Masukkan nama SPPG",
      required: true,
    },
    {
      name: "address",
      label: "Alamat",
      type: "textarea" as const,
      placeholder: "Masukkan alamat SPPG",
      required: true,
    },
    {
      name: "phone_number",
      label: "Nomor Telepon",
      type: "phone" as const,
      placeholder: "Masukkan nomor telepon (opsional)",
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <SPPGList
          data={sppgList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </ScrollView>

      <CRUDModal
        visible={modalVisible}
        title={editItem ? "Edit SPPG" : "Tambah SPPG"}
        fields={formFields}
        formData={formData}
        onFieldChange={(name, value) =>
          setFormData({ ...formData, [name]: value })
        }
        onSubmit={handleSubmit}
        onCancel={() => setModalVisible(false)}
        isEdit={!!editItem}
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
  content: {
    flex: 1,
    padding: 16,
  },
});
