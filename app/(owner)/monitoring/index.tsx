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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { AVAILABLE_TABLES } from "./config";

// Filter options berdasarkan kategori tabel
const FILTER_OPTIONS = [
  { id: "all", label: "Semua Tabel", color: "#6B7280", icon: "grid" },
  {
    id: "master",
    label: "Data Master",
    tables: [
      "users",
      "sppg_masters",
      "schools",
      "school_pics",
      "menu_categories",
      "menu_items",
    ],
    color: "#3B82F6",
    icon: "layers",
  },
  {
    id: "operational",
    label: "Operasional",
    tables: ["menus", "menu_details", "school_menu_distribution"],
    color: "#10B981",
    icon: "construct",
  },
  {
    id: "tracking",
    label: "Tracking & QR",
    tables: ["qr_codes", "scan_logs"],
    color: "#8B5CF6",
    icon: "scan",
  },
  {
    id: "reports",
    label: "Pelaporan",
    tables: ["problem_reports"],
    color: "#EF4444",
    icon: "document-text",
  },
  {
    id: "audit",
    label: "Audit & Logs",
    tables: ["activity_logs", "monitoring_logs"],
    color: "#F59E0B",
    icon: "shield-checkmark",
  },
];

export default function MonitoringScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
      // Simulasi API call untuk mendapatkan statistik
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const stats: Record<
        string,
        { count: number; lastUpdated: string; loading: boolean }
      > = {};
      AVAILABLE_TABLES.forEach((table) => {
        stats[table.id] = {
          count: Math.floor(Math.random() * 1000) + 100,
          lastUpdated: new Date(
            Date.now() - Math.random() * 86400000,
          ).toISOString(),
          loading: false,
        };
      });
      setTableStats(stats);
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
  const filteredTables = AVAILABLE_TABLES.filter((table) => {
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
            activeOpacity={0.7}
          >
            <Ionicons
              name={filter.icon as any}
              size={14}
              color={selectedFilter === filter.id ? "white" : filter.color}
              style={styles.filterChipIcon}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive,
              ]}
              numberOfLines={1}
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
    item: (typeof AVAILABLE_TABLES)[0];
  }) => {
    const stats = tableStats[item.id];

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
            <Ionicons name={item.icon as any} size={22} color={item.color} />
          </View>
          <View style={styles.tableInfo}>
            <Text style={styles.tableName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.tableDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View style={styles.tableActions}>
            {stats?.loading ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Text style={styles.tableCount}>
                {stats?.count?.toLocaleString() || "0"}
              </Text>
            )}
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </View>
        </View>

        <View style={styles.tableFooter}>
          <View style={styles.footerStats}>
            <View style={styles.footerStat}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.footerStatText}>
                {stats?.lastUpdated
                  ? new Date(stats.lastUpdated).toLocaleDateString("id-ID")
                  : "-"}
              </Text>
            </View>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Lihat Detail</Text>
          </View>
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

  const getUserInitial = () => {
    if (!user?.full_name) return "U";
    return user.full_name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header User Info */}
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>{getUserInitial()}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.full_name || "Owner"}
            </Text>
            <Text style={styles.userRole} numberOfLines={1}>
              {user?.role ? user.role.toUpperCase() : "OWNER"}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Header */}
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
          <Ionicons name="filter" size={18} color="#2563EB" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSummary}>
        <View style={styles.statBox}>
          <View style={styles.statIconContainer}>
            <Ionicons name="grid-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statNumber}>{filteredTables.length}</Text>
          <Text style={styles.statLabel}>Tabel</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <View style={styles.statIconContainer}>
            <Ionicons name="document-text-outline" size={20} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>
            {loading ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              calculateTotalRecords().toLocaleString()
            )}
          </Text>
          <Text style={styles.statLabel}>Data</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <View style={styles.statIconContainer}>
            <Ionicons name="stats-chart-outline" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statNumber}>{AVAILABLE_TABLES.length}</Text>
          <Text style={styles.statLabel}>Kategori</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#6B7280"
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
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

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
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>
                Tabel Monitoring ({filteredTables.length})
              </Text>
            </View>
          }
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
              <View>
                <Text style={styles.modalTitle}>Filter Kategori</Text>
                <Text style={styles.modalSubtitle}>Pilih kategori tabel</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
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
                        { backgroundColor: filter.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={filter.icon as any}
                        size={18}
                        color={filter.color}
                      />
                    </View>
                    <View style={styles.modalOptionTextContainer}>
                      <Text
                        style={[
                          styles.modalOptionText,
                          selectedFilter === filter.id &&
                            styles.modalOptionTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                      <Text style={styles.modalOptionCount}>
                        {filter.tables
                          ? filter.tables.length
                          : AVAILABLE_TABLES.length}{" "}
                        tabel
                      </Text>
                    </View>
                  </View>
                  {selectedFilter === filter.id && (
                    <View style={styles.modalOptionCheck}>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={filter.color}
                      />
                    </View>
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
                <Ionicons name="refresh-outline" size={18} color="#DC2626" />
                <Text style={styles.resetButtonText}>Reset Filter</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInitial: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
  statsSummary: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#F3F4F6",
    alignSelf: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  filterContentContainer: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 36,
  },
  filterChipActive: {
    borderColor: "transparent",
  },
  filterChipIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  tableCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tableIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tableInfo: {
    flex: 1,
    marginRight: 12,
  },
  tableName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  tableDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  tableActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 50,
    textAlign: "center",
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerStatText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  viewButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
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
    paddingTop: 60,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  modalBody: {
    padding: 24,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionActive: {
    borderBottomColor: "transparent",
  },
  modalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 2,
  },
  modalOptionTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  modalOptionCount: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  modalOptionCheck: {
    marginLeft: 12,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 8,
    gap: 10,
  },
  resetButtonText: {
    fontSize: 15,
    color: "#DC2626",
    fontWeight: "600",
  },
});
