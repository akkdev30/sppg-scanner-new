// app/(owner)/monitoring/schools.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";

export default function SchoolsMonitoringScreen() {
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

  const tableConfig = {
    displayName: "Schools",
    icon: "school",
    description: "Data sekolah penerima distribusi",
    searchableColumns: ["school_code", "name", "address"],
    columns: [
      { key: "school_code", label: "School Code", width: 120 },
      { key: "name", label: "School Name", width: 200 },
      { key: "address", label: "Address", width: 220 },
      { key: "total_students", label: "Students", width: 100 },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: string) => (
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

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        table_name: "schools",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (Object.keys(selectedFilters).length > 0) {
        params.append("filter", JSON.stringify(selectedFilters));
      }

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
      Alert.alert("Error", error.message || "Gagal memuat data sekolah");
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

  const handleExport = () => {
    Alert.alert(
      "Export Schools Data",
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
        table_name: "schools",
        format: format,
      });

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
        Alert.alert("Success", "CSV file downloaded successfully");
      } else {
        const data = await response.json();
        Alert.alert("Success", "JSON data exported successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleViewDetails = (item: any) => {
    router.push(`/(owner)/monitoring/schools/${item.id}`);
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
            <Ionicons name="school" size={24} color="#2563EB" />
            <Text style={styles.title}>Schools</Text>
          </View>
          <Text style={styles.subtitle}>Data sekolah penerima distribusi</Text>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="download" size={20} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalRecords.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Schools</Text>
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

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schools..."
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
      </View>

      {/* Table Container */}
      <View style={styles.tableContainer}>
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

        <FlatList
          data={data}
          renderItem={({ item }) => (
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
          )}
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
              <Ionicons name="school-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No schools found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Try changing your search criteria"
                  : "No school data available"}
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
    </SafeAreaView>
  );
}

// Reuse styles from previous files
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
});
