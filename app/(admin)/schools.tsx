// app/(admin)/schools.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
    sppg_name: "", // Untuk tampilan di form
    address: "",
    total_students: "0",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        throw new Error("Token tidak tersedia");
      }

      // Load SPPG list
      await loadSPPGList(token);

      // Load schools
      await loadSchoolsList(token);
    } catch (error: any) {
      console.error("Load error:", error);
      Alert.alert("Error", error.message || "Gagal memuat data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadSPPGList = async (token: string) => {
    try {
      // Coba beberapa endpoint yang mungkin
      const endpoints = [
        `${API_URL}/dashboard/admin/sppg`,
        `${API_URL}/admin/sppg`,
        `${API_URL}/sppg/list`,
      ];

      let sppgData: any[] = [];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          });

          if (res.ok) {
            const data = await res.json();
            console.log(`SPPG endpoint ${endpoint}:`, data);

            if (data.success) {
              // Handle berbagai struktur response
              if (Array.isArray(data.data)) {
                sppgData = data.data;
              } else if (Array.isArray(data.data?.sppg_list)) {
                sppgData = data.data.sppg_list;
              } else if (Array.isArray(data.sppg_list)) {
                sppgData = data.sppg_list;
              } else if (Array.isArray(data)) {
                sppgData = data;
              }

              if (sppgData.length > 0) break;
            }
          }
        } catch (e) {
          console.log(`Endpoint ${endpoint} failed:`, e);
          continue;
        }
      }

      // Format SPPG data
      const formattedSPPG = sppgData.map((item: any) => ({
        id: item.id || item._id || item.sppg_id || "",
        sppg_name: item.sppg_name || item.name || "",
        address: item.address || "",
      }));

      console.log("Formatted SPPG list:", formattedSPPG);
      setSppgList(formattedSPPG);

      // Jika tidak ada data dari API, gunakan mock data untuk development
      if (formattedSPPG.length === 0) {
        const mockSPPG: SPPGItem[] = [
          { id: "1", sppg_name: "SPPG Pusat", address: "Jl. Pusat No. 1" },
          { id: "2", sppg_name: "SPPG Utara", address: "Jl. Utara No. 2" },
          { id: "3", sppg_name: "SPPG Selatan", address: "Jl. Selatan No. 3" },
        ];
        setSppgList(mockSPPG);
        console.log("Using mock SPPG data");
      }
    } catch (error) {
      console.error("Load SPPG list error:", error);
      // Fallback to mock data
      const mockSPPG: SPPGItem[] = [
        { id: "1", sppg_name: "SPPG Pusat", address: "Jl. Pusat No. 1" },
        { id: "2", sppg_name: "SPPG Utara", address: "Jl. Utara No. 2" },
        { id: "3", sppg_name: "SPPG Selatan", address: "Jl. Selatan No. 3" },
      ];
      setSppgList(mockSPPG);
    }
  };

  const loadSchoolsList = async (token: string) => {
    try {
      // Coba beberapa endpoint yang mungkin
      const endpoints = [
        `${API_URL}/dashboard/admin/schools`,
        `${API_URL}/admin/schools`,
        `${API_URL}/schools/list`,
      ];

      let schoolsData: any[] = [];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          });

          if (res.ok) {
            const data = await res.json();
            console.log(`Schools endpoint ${endpoint}:`, data);

            if (data.success) {
              // Handle berbagai struktur response
              if (Array.isArray(data.data)) {
                schoolsData = data.data;
              } else if (Array.isArray(data.data?.schools)) {
                schoolsData = data.data.schools;
              } else if (Array.isArray(data.schools)) {
                schoolsData = data.schools;
              } else if (Array.isArray(data)) {
                schoolsData = data;
              }

              if (schoolsData.length > 0) break;
            }
          }
        } catch (e) {
          console.log(`Endpoint ${endpoint} failed:`, e);
          continue;
        }
      }

      // Format schools data
      const formattedSchools = schoolsData.map((item: any) => ({
        id: item.id || item._id || item.school_id || "",
        school_code: item.school_code || item.code || "",
        name: item.name || item.school_name || "",
        sppg_id: item.sppg_id || item.sppg?.id || "",
        sppg_name: item.sppg_name || item.sppg?.sppg_name || "",
        address: item.address || "",
        total_students: item.total_students || item.students_count || 0,
      }));

      console.log("Formatted schools list:", formattedSchools);
      setSchoolList(formattedSchools);

      // Jika tidak ada data dari API, gunakan mock data untuk development
      if (formattedSchools.length === 0) {
        const mockSchools: SchoolItem[] = [
          {
            id: "1",
            school_code: "SCH-001",
            name: "Sekolah ABC",
            sppg_id: "1",
            sppg_name: "SPPG Pusat",
            address: "Jl. Sekolah No. 1",
            total_students: 500,
          },
          {
            id: "2",
            school_code: "SCH-002",
            name: "Sekolah XYZ",
            sppg_id: "2",
            sppg_name: "SPPG Utara",
            address: "Jl. Sekolah No. 2",
            total_students: 300,
          },
        ];
        setSchoolList(mockSchools);
        console.log("Using mock schools data");
      }
    } catch (error) {
      console.error("Load schools error:", error);
      // Fallback to mock data
      const mockSchools: SchoolItem[] = [
        {
          id: "1",
          school_code: "SCH-001",
          name: "Sekolah ABC",
          sppg_id: "1",
          sppg_name: "SPPG Pusat",
          address: "Jl. Sekolah No. 1",
          total_students: 500,
        },
        {
          id: "2",
          school_code: "SCH-002",
          name: "Sekolah XYZ",
          sppg_id: "2",
          sppg_name: "SPPG Utara",
          address: "Jl. Sekolah No. 2",
          total_students: 300,
        },
      ];
      setSchoolList(mockSchools);
    }
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      school_code: "",
      name: "",
      sppg_id: sppgList[0]?.id || "",
      sppg_name: sppgList[0]?.sppg_name || "",
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
      sppg_name: item.sppg_name || "",
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
      const token = await getToken();
      const res = await fetch(`${API_URL}/dashboard/admin/schools/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
    if (!formData.school_code.trim()) {
      Alert.alert("Error", "Kode sekolah harus diisi");
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert("Error", "Nama sekolah harus diisi");
      return;
    }

    if (!formData.sppg_id) {
      Alert.alert("Error", "SPPG harus dipilih");
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert("Error", "Alamat harus diisi");
      return;
    }

    try {
      const token = await getToken();
      const endpoint = editItem
        ? `${API_URL}/dashboard/admin/schools/${editItem.id}`
        : `${API_URL}/dashboard/admin/schools`;

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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
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
    const selectedSPPG = sppgList.find((sppg) => sppg.id === id);
    setFormData({
      ...formData,
      sppg_id: id,
      sppg_name: selectedSPPG?.sppg_name || "",
    });
    setSppgSelectorVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data sekolah...</Text>
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
            onRefresh={onRefresh}
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
