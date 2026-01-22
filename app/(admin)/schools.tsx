// app/(admin)/schools.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import SchoolFormModal from "../../components/admin/SchoolFormModal";
import SchoolList from "../../components/admin/SchoolList";
import SPPGSelectorModal from "../../components/admin/SPPGSelectorModal";
import { useAuth } from "../../context/AuthContext";

interface SchoolItem {
  id: string;
  school_code: string;
  name: string;
  sppg_name?: string;
  sppg_id: string;
  address: string;
  total_students: number;
}

interface SPPGItem {
  id: string;
  sppg_name: string;
  address?: string;
}

const API_URL = "https://sppg-backend-new.vercel.app/api";

export default function SchoolsManagementScreen() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schoolList, setSchoolList] = useState<SchoolItem[]>([]);
  const [sppgList, setSppgList] = useState<SPPGItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [sppgSelectorVisible, setSppgSelectorVisible] = useState(false);
  const [editItem, setEditItem] = useState<SchoolItem | null>(null);
  const [formData, setFormData] = useState({
    school_code: "",
    name: "",
    sppg_id: "",
    address: "",
    total_students: "0",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load SPPG list first
      const sppgRes = await fetch(`${API_URL}/dashboard/admin/sppg`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (sppgRes.ok) {
        const sppgData = await sppgRes.json();
        if (sppgData.success && sppgData.data.sppg_list) {
          setSppgList(sppgData.data.sppg_list);
        }
      }

      // Load schools
      const schoolRes = await fetch(`${API_URL}/dashboard/schools`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (schoolRes.ok) {
        const schoolData = await schoolRes.json();
        if (schoolData.success) {
          setSchoolList(schoolData.data || []);
        }
      }
    } catch (error) {
      console.error("Load error:", error);
      Alert.alert("Error", "Gagal memuat data sekolah");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      school_code: "",
      name: "",
      sppg_id: sppgList[0]?.id || "",
      address: "",
      total_students: "0",
    });
    setModalVisible(true);
  };

  const handleEdit = (item: SchoolItem) => {
    setEditItem(item);
    setFormData({
      school_code: item.school_code,
      name: item.name,
      sppg_id: item.sppg_id,
      address: item.address,
      total_students: item.total_students.toString(),
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Hapus Sekolah", `Apakah Anda yakin ingin menghapus ${name}?`, [
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
      const res = await fetch(`${API_URL}/dashboard/schools/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("Berhasil", "Sekolah berhasil dihapus");
        loadData();
      } else {
        Alert.alert("Error", data.error || "Gagal menghapus sekolah");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menghapus sekolah");
    }
  };

  const handleSubmit = async () => {
    // Validasi
    if (!formData.school_code || !formData.name || !formData.sppg_id) {
      Alert.alert("Error", "Harap lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      const endpoint = editItem
        ? `${API_URL}/dashboard/schools/${editItem.id}`
        : `${API_URL}/dashboard/schools`;

      const body = {
        school_code: formData.school_code,
        name: formData.name,
        sppg_id: formData.sppg_id,
        address: formData.address,
        total_students: parseInt(formData.total_students) || 0,
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
          editItem ? "Sekolah berhasil diupdate" : "Sekolah berhasil dibuat",
        );
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert("Error", data.error || "Gagal menyimpan sekolah");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan sekolah");
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSelectSPPG = (id: string) => {
    setFormData({ ...formData, sppg_id: id });
  };

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
        <SchoolList
          data={schoolList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </ScrollView>

      <SchoolFormModal
        visible={modalVisible}
        isEdit={!!editItem}
        formData={formData}
        sppgList={sppgList}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={() => setModalVisible(false)}
        onSelectSPPG={() => setSppgSelectorVisible(true)}
      />

      <SPPGSelectorModal
        visible={sppgSelectorVisible}
        sppgList={sppgList}
        selectedId={formData.sppg_id}
        onSelect={handleSelectSPPG}
        onClose={() => setSppgSelectorVisible(false)}
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
