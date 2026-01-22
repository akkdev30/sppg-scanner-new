// app/(owner)/monitoring/index.tsx

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
import { useAuth } from "../../../context/AuthContext";
import { TABLE_CONFIGS } from "./config";

// Tabel yang tersedia sesuai dengan TABLE_CONFIGS
const MONITORING_TABLES = [
  {
    id: "users",
    name: "Users",
    description: "Data pengguna sistem dengan berbagai role",
    icon: "people",
    color: "#3B82F6",
  },
  {
    id: "sppg_masters",
    name: "SPPG Masters",
    description: "Data penyedia makanan (Supplier/Pusat Produksi)",
    icon: "business",
    color: "#10B981",
  },
  {
    id: "schools",
    name: "Schools",
    description: "Data sekolah penerima distribusi",
    icon: "school",
    color: "#8B5CF6",
  },
  {
    id: "menus",
    name: "Menus",
    description: "Jadwal produksi menu harian",
    icon: "calendar",
    color: "#F59E0B",
  },
  {
    id: "school_menu_distribution",
    name: "Distribution",
    description: "Alokasi dan penerimaan menu ke sekolah",
    icon: "car",
    color: "#EF4444",
  },
  {
    id: "problem_reports",
    name: "Problem Reports",
    description: "Laporan masalah dalam distribusi",
    icon: "warning",
    color: "#DC2626",
  },
  {
    id: "qr_codes",
    name: "QR Codes",
    description: "Kode QR untuk verifikasi distribusi",
    icon: "qr-code",
    color: "#6366F1",
  },
];

// Filter options berdasarkan kategori tabel
const FILTER_OPTIONS = [
  { id: "all", label: "Semua Tabel", color: "#6B7280" },
  {
    id: "master",
    label: "Data Master",
    tables: ["users", "sppg_masters", "schools"],
    color: "#3B82F6",
  },
  {
    id: "operational",
    label: "Operasional",
    tables: ["menus", "school_menu_distribution"],
    color: "#10B981",
  },
  {
    id: "tracking",
    label: "Tracking & QR",
    tables: ["qr_codes"],
    color: "#8B5CF6",
  },
  {
    id: "reports",
    label: "Pelaporan",
    tables: ["problem_reports"],
    color: "#EF4444",
  },
];

export default function MonitoringScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tableStats, setTableStats] = useState<
    Record<string, { count: number; lastUpdated: string; loading: boolean }>
  >({});

  // Fetch statistik tabel
  useEffect(() => {
    fetchTableStats();
  }, []);

  const fetchTableStats = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      // Fetch total records untuk setiap tabel
      const statsPromises = MONITORING_TABLES.map(async (table) => {
        try {
          const response = await fetch(
            `${process.env.API_URL_SERVER}/api/owner/monitoring/stats?table_name=${table.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!response.ok) {
            console.warn(
              `Failed to fetch stats for ${table.id}:`,
              response.status,
            );
            return { tableId: table.id, count: 0, success: false };
          }

          const result = await response.json();
          return {
            tableId: table.id,
            count: result.data?.total_records || 0,
            lastUpdated: result.data?.last_updated || new Date().toISOString(),
            success: true,
          };
        } catch (error) {
          console.error(`Error fetching stats for ${table.id}:`, error);
          return { tableId: table.id, count: 0, success: false };
        }
      });

      const results = await Promise.all(statsPromises);
      const newStats: Record<
        string,
        { count: number; lastUpdated: string; loading: boolean }
      > = {};

      results.forEach((result) => {
        newStats[result.tableId] = {
          count: result.count,
          lastUpdated: result.lastUpdated,
          loading: !result.success,
        };
      });

      setTableStats(newStats);
    } catch (error: any) {
      console.error("Error fetching table stats:", error);
      Alert.alert("Error", "Gagal memuat statistik tabel");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTableStats();
    setRefreshing(false);
  };

  // Filter tables berdasarkan search dan filter
  const filteredTables = MONITORING_TABLES.filter((table) => {
    const matchesSearch =
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;

    const filterOption = FILTER_OPTIONS.find((f) => f.id === selectedFilter);
    return matchesSearch && filterOption?.tables?.includes(table.id);
  });

  const handleTablePress = (tableId: string) => {
    // Navigasi ke detail monitoring untuk tabel tertentu
    router.push(`/(owner)/monitoring/${tableId}`);
  };

  const renderFilterChips = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContentContainer}
      >
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
              selectedFilter === filter.id && { backgroundColor: filter.color },
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderTableCard = ({
    item,
  }: {
    item: (typeof MONITORING_TABLES)[0];
  }) => {
    const stats = tableStats[item.id];
    const config = TABLE_CONFIGS[item.id as keyof typeof TABLE_CONFIGS];

    return (
      <TouchableOpacity
        style={styles.tableCard}
        onPress={() => handleTablePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.tableHeader}>
          <View
            style={[
              styles.tableIconContainer,
              { backgroundColor: `${item.color}15` },
            ]}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={styles.tableInfo}>
            <Text style={styles.tableName}>{item.name}</Text>
            <Text style={styles.tableDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.tableStats}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={14} color="#6B7280" />
            <Text style={styles.statText}>
              {stats?.loading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                `${(stats?.count || 0).toLocaleString()} records`
              )}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="grid" size={14} color="#6B7280" />
            <Text style={styles.statText}>
              {config?.columns?.length || 6} columns
            </Text>
          </View>
          {stats?.lastUpdated && (
            <View style={styles.statItem}>
              <Ionicons name="time" size={14} color="#6B7280" />
              <Text style={styles.statText}>
                {new Date(stats.lastUpdated).toLocaleDateString("id-ID")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tableFooter}>
          <Text style={styles.viewDetailsText}>Monitor Data →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const calculateTotalRecords = () => {
    return Object.values(tableStats).reduce(
      (sum, stat) => sum + (stat?.count || 0),
      0,
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Data Monitoring</Text>
          <Text style={styles.subtitle}>
            Monitor seluruh data dalam sistem secara real-time
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options" size={20} color="#2563EB" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari tabel monitoring..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Stats Summary */}
      <View style={styles.statsSummary}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredTables.length}</Text>
          <Text style={styles.statLabel}>Tabel Tersedia</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {loading ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              calculateTotalRecords().toLocaleString()
            )}
          </Text>
          <Text style={styles.statLabel}>Total Records</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{MONITORING_TABLES.length}</Text>
          <Text style={styles.statLabel}>Jenis Tabel</Text>
        </View>
      </View>

      {/* Tables List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat data monitoring...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTables}
          renderItem={renderTableCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Tidak ada tabel ditemukan</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : "Coba ubah filter untuk melihat lebih banyak tabel"}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Data Monitoring</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {FILTER_OPTIONS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.modalOption,
                    selectedFilter === filter.id && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedFilter(filter.id);
                    setShowFilterModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalOptionContent}>
                    <View
                      style={[
                        styles.modalOptionIcon,
                        { backgroundColor: filter.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedFilter === filter.id &&
                          styles.modalOptionTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </View>
                  {selectedFilter === filter.id && (
                    <Ionicons name="checkmark" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedFilter("all");
                  setSearchQuery("");
                  setShowFilterModal(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color="#DC2626" />
                <Text style={styles.resetButtonText}>Reset Semua Filter</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
  },
  filterContentContainer: {
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#2563EB",
  },
  filterChipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "white",
  },
  statsSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    alignItems: "center",
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    height: 32,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tableCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tableIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  tableDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  tableStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: "#6B7280",
  },
  tableFooter: {
    alignItems: "flex-end",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalBody: {
    padding: 24,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalOptionIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOptionActive: {
    borderBottomColor: "#2563EB",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  modalOptionTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "600",
  },
});
