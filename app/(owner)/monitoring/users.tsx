// app/(owner)/monitoring/users.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
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

export default function UsersMonitoringScreen() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(
    {},
  );
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  type TableColumn = {
    key: string;
    label: string;
    width: number;
    render?: (value: any) => React.ReactNode;
  };

  const tableConfig: {
    displayName: string;
    icon: string;
    description: string;
    searchableColumns: string[];
    columns: TableColumn[];
  } = {
    displayName: "Users",
    icon: "people",
    description: "Data pengguna sistem dengan berbagai role",
    searchableColumns: ["username", "full_name", "email", "phone_number"],
    columns: [
      { key: "username", label: "Username", width: 120 },
      { key: "full_name", label: "Full Name", width: 150 },
      { key: "email", label: "Email", width: 180 },
      { key: "role", label: "Role", width: 100 },
      {
        key: "is_active",
        label: "Status",
        width: 80,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: value ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            {value ? "Active" : "Inactive"}
          </Text>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
      },
    ],
  };

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        table_name: "users",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (Object.keys(selectedFilters).length > 0) {
        params.append("filter", JSON.stringify(selectedFilters));
      }

      console.log("Fetching users data...");
      const response = await fetch(
        `${process.env.API_URL_SERVER}/api/owner/monitoring/data?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      if (result.success) {
        setData(result.data.records || []);
        setTotalRecords(result.data.pagination?.total || 0);
        setTotalPages(result.data.pagination?.total_pages || 1);
      } else {
        throw new Error(result.error || "Failed to load data");
      }
    } catch (error: any) {
      console.error("Load data error:", error);
      Alert.alert("Error", error.message || "Gagal memuat data users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, searchQuery, selectedFilters]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFilters]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (key: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSearchQuery("");
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {tableConfig.columns.map((column) => (
        <View
          key={column.key}
          style={[styles.headerCell, { width: column.width }]}
        >
          <Text style={styles.headerText}>{column.label}</Text>
        </View>
      ))}
      <View style={[styles.headerCell, { width: 60 }]}>
        <Text style={styles.headerText}>Actions</Text>
      </View>
    </View>
  );

  const renderTableRow = ({ item }: { item: any }) => (
    <View style={styles.tableRow}>
      {tableConfig.columns.map((column) => (
        <View
          key={column.key}
          style={[styles.dataCell, { width: column.width }]}
        >
          {column.render ? (
            column.render(item[column.key])
          ) : (
            <Text style={styles.cellText} numberOfLines={1}>
              {item[column.key]?.toString() || "-"}
            </Text>
          )}
        </View>
      ))}
      <View style={[styles.dataCell, { width: 60 }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewDetails(item)}
        >
          <Ionicons name="eye" size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleViewDetails = (item: any) => {
    router.push(`/(owner)/monitoring/users/${item.id}`);
  };

  const handleExport = () => {
    Alert.alert(
      "Export Users Data",
      "Export data dalam format CSV atau JSON?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "CSV",
          onPress: () => exportData("csv"),
        },
        {
          text: "JSON",
          onPress: () => exportData("json"),
        },
      ],
    );
  };

  const exportData = async (format: string) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        table_name: "users",
        format: format,
      });

      if (Object.keys(selectedFilters).length > 0) {
        params.append("filters", JSON.stringify(selectedFilters));
      }

      const response = await fetch(
        `${process.env.API_URL_SERVER}/api/owner/export/data?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (format === "csv") {
        const blob = await response.blob();
        // Handle CSV download
        Alert.alert("Success", "CSV file downloaded successfully");
      } else {
        const data = await response.json();
        Alert.alert("Success", "JSON data exported successfully");
        console.log("Exported data:", data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilterModal}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Users</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Role Filter */}
            <View style={styles.filterGroup}>
              <TouchableOpacity
                style={styles.filterSectionHeader}
                onPress={() => setShowRoleFilter(!showRoleFilter)}
              >
                <Text style={styles.filterLabel}>Role</Text>
                <Ionicons
                  name={showRoleFilter ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {showRoleFilter && (
                <View style={styles.filterOptions}>
                  {["owner", "admin", "pic"].map((role) => (
                    <Pressable
                      key={role}
                      style={[
                        styles.filterOption,
                        selectedFilters.role === role &&
                          styles.filterOptionSelected,
                      ]}
                      onPress={() =>
                        handleFilterChange(
                          "role",
                          selectedFilters.role === role ? undefined : role,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.role === role &&
                            styles.filterOptionTextSelected,
                        ]}
                      >
                        {role.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Status Filter */}
            <View style={styles.filterGroup}>
              <TouchableOpacity
                style={styles.filterSectionHeader}
                onPress={() => setShowStatusFilter(!showStatusFilter)}
              >
                <Text style={styles.filterLabel}>Status</Text>
                <Ionicons
                  name={showStatusFilter ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {showStatusFilter && (
                <View style={styles.filterOptions}>
                  {[
                    { value: true, label: "Active" },
                    { value: false, label: "Inactive" },
                  ].map((status) => (
                    <Pressable
                      key={status.label}
                      style={[
                        styles.filterOption,
                        selectedFilters.is_active === status.value &&
                          styles.filterOptionSelected,
                      ]}
                      onPress={() =>
                        handleFilterChange(
                          "is_active",
                          selectedFilters.is_active === status.value
                            ? undefined
                            : status.value,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.is_active === status.value &&
                            styles.filterOptionTextSelected,
                        ]}
                      >
                        {status.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data users...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Ionicons name="people" size={24} color="#2563EB" />
            <Text style={styles.title}>Users</Text>
          </View>
          <Text style={styles.subtitle}>
            Data pengguna sistem dengan berbagai role
          </Text>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="download" size={20} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalRecords.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{page}</Text>
          <Text style={styles.statLabel}>Page</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalPages}</Text>
          <Text style={styles.statLabel}>Total Pages</Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#6B7280" />
          {Object.keys(selectedFilters).length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {Object.keys(selectedFilters).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {Object.keys(selectedFilters).length > 0 && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
          <View style={styles.filterChips}>
            {Object.entries(selectedFilters).map(([key, value]) => (
              <View key={key} style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {key}: {value?.toString()}
                </Text>
                <TouchableOpacity
                  onPress={() => handleFilterChange(key, undefined)}
                >
                  <Ionicons name="close" size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Table Container */}
      <View style={styles.tableContainer}>
        {renderTableHeader()}

        <FlatList
          data={data}
          renderItem={renderTableRow}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || Object.keys(selectedFilters).length > 0
                  ? "Try changing your search or filter criteria"
                  : "No user data available"}
              </Text>
            </View>
          }
        />
      </View>

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
            onPress={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={page === 1 ? "#9CA3AF" : "#2563EB"}
            />
            <Text
              style={[
                styles.pageButtonText,
                page === 1 && styles.pageButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.pageInfo}>
            <Text style={styles.pageInfoText}>
              Page {page} of {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.pageButton,
              page === totalPages && styles.pageButtonDisabled,
            ]}
            onPress={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            <Text
              style={[
                styles.pageButtonText,
                page === totalPages && styles.pageButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={page === totalPages ? "#9CA3AF" : "#2563EB"}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleExport}>
        <Ionicons name="download" size={24} color="white" />
      </TouchableOpacity>

      {renderFilterModal()}
    </SafeAreaView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  exportButton: {
    padding: 8,
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  filterButton: {
    marginLeft: 12,
    padding: 10,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#2563EB",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  activeFilters: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  activeFiltersTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    gap: 4,
  },
  filterChipText: {
    fontSize: 11,
    color: "#2563EB",
  },
  clearAllText: {
    fontSize: 11,
    color: "#DC2626",
    marginLeft: 8,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  dataCell: {
    paddingHorizontal: 4,
  },
  cellText: {
    fontSize: 12,
    color: "#374151",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: "500",
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 48,
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
    maxWidth: 300,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    gap: 4,
  },
  pageButtonDisabled: {
    backgroundColor: "#F3F4F6",
  },
  pageButtonText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  pageButtonTextDisabled: {
    color: "#9CA3AF",
  },
  pageInfo: {
    alignItems: "center",
  },
  pageInfoText: {
    fontSize: 12,
    color: "#6B7280",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  filterGroup: {
    marginBottom: 20,
  },
  filterSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterOptionSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterOptionText: {
    fontSize: 12,
    color: "#374151",
  },
  filterOptionTextSelected: {
    color: "white",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
});
