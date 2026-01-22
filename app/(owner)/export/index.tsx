// app/(owner)/export/index.tsx

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";

const EXPORT_FORMATS = [
  { id: "csv", name: "CSV", icon: "document-text", color: "#059669" },
  { id: "json", name: "JSON", icon: "code", color: "#D97706" },
  { id: "excel", name: "Excel", icon: "document", color: "#2563EB" },
  { id: "pdf", name: "PDF", icon: "print", color: "#DC2626" },
];

const MONITORING_TABLES = [
  { id: "users", name: "Users", icon: "people" },
  { id: "sppg_masters", name: "SPPG Masters", icon: "business" },
  { id: "schools", name: "Schools", icon: "school" },
  { id: "menu_categories", name: "Menu Categories", icon: "fast-food" },
  { id: "menu_items", name: "Menu Items", icon: "restaurant" },
  { id: "menus", name: "Menus", icon: "calendar" },
  { id: "school_menu_distribution", name: "Distribution", icon: "car" },
  { id: "qr_codes", name: "QR Codes", icon: "qr-code" },
  { id: "scan_logs", name: "Scan Logs", icon: "scan" },
  { id: "problem_reports", name: "Problem Reports", icon: "warning" },
  { id: "school_pics", name: "School PICs", icon: "person" },
  { id: "activity_logs", name: "Activity Logs", icon: "analytics" },
  { id: "monitoring_logs", name: "Monitoring Logs", icon: "shield-checkmark" },
];

export default function ExportScreen() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState<"start" | "end">("start");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filters, setFilters] = useState("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);

  const handleExport = async () => {
    if (!selectedTable) {
      Alert.alert("Error", "Please select a table to export");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const params = new URLSearchParams({
        table_name: selectedTable,
        format: selectedFormat,
      });

      if (filters) {
        params.append("filters", filters);
      }

      if (startDate) {
        params.append("start_date", startDate.toISOString().split("T")[0]);
      }

      if (endDate) {
        params.append("end_date", endDate.toISOString().split("T")[0]);
      }

      const response = await fetch(
        `${process.env.API_URL_SERVER}/api/owner/export/data?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Export failed");

      if (selectedFormat === "csv") {
        const blob = await response.blob();
        // Handle file download
        Alert.alert("Success", "CSV file downloaded successfully");
      } else {
        const data = await response.json();
        Alert.alert("Success", "Data exported successfully");
        console.log("Exported data:", data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (dateType === "start") {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Data Export</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Export Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Configuration</Text>

          {/* Table Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Table</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowTableModal(true)}
            >
              <Text
                style={
                  selectedTable ? styles.selectText : styles.placeholderText
                }
              >
                {selectedTable
                  ? MONITORING_TABLES.find((t) => t.id === selectedTable)?.name
                  : "Choose a table..."}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Format Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Export Format</Text>
            <View style={styles.formatGrid}>
              {EXPORT_FORMATS.map((format) => (
                <TouchableOpacity
                  key={format.id}
                  style={[
                    styles.formatCard,
                    selectedFormat === format.id && styles.formatCardSelected,
                  ]}
                  onPress={() => setSelectedFormat(format.id)}
                >
                  <Ionicons
                    name={format.icon as any}
                    size={24}
                    color={
                      selectedFormat === format.id ? "white" : format.color
                    }
                  />
                  <Text
                    style={[
                      styles.formatName,
                      selectedFormat === format.id && styles.formatNameSelected,
                    ]}
                  >
                    {format.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date Range (Optional)</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setDateType("start");
                  setShowDatePicker(true);
                }}
              >
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString("id-ID")}
                </Text>
              </TouchableOpacity>

              <Text style={styles.dateSeparator}>to</Text>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setDateType("end");
                  setShowDatePicker(true);
                }}
              >
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString("id-ID")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Filters (JSON, Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={filters}
              onChangeText={setFilters}
              placeholder='{"status": "active", "role": "admin"}'
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[
              styles.exportButton,
              !selectedTable && styles.exportButtonDisabled,
            ]}
            onPress={handleExport}
            disabled={!selectedTable || loading}
          >
            {loading ? (
              <Text style={styles.exportButtonText}>Processing...</Text>
            ) : (
              <>
                <Ionicons name="download" size={20} color="white" />
                <Text style={styles.exportButtonText}>Export Data</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Note: Large exports may take several minutes to process. CSV format
            is recommended for large datasets.
          </Text>
        </View>

        {/* Recent Exports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Exports</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentExports}>
            {/* Example recent exports */}
            <View style={styles.exportItem}>
              <Ionicons name="document-text" size={20} color="#059669" />
              <View style={styles.exportInfo}>
                <Text style={styles.exportName}>users_20240115.csv</Text>
                <Text style={styles.exportMeta}>Today, 10:30 AM • 1.2 MB</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="download" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <View style={styles.exportItem}>
              <Ionicons name="code" size={20} color="#D97706" />
              <View style={styles.exportInfo}>
                <Text style={styles.exportName}>menus_20240115.json</Text>
                <Text style={styles.exportMeta}>
                  Yesterday, 14:45 PM • 890 KB
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="download" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Table Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTableModal}
        onRequestClose={() => setShowTableModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Table</Text>
              <TouchableOpacity onPress={() => setShowTableModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {MONITORING_TABLES.map((table) => (
                <Pressable
                  key={table.id}
                  style={[
                    styles.tableOption,
                    selectedTable === table.id && styles.tableOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedTable(table.id);
                    setShowTableModal(false);
                  }}
                >
                  <Ionicons
                    name={table.icon as any}
                    size={20}
                    color={selectedTable === table.id ? "#2563EB" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.tableOptionText,
                      selectedTable === table.id &&
                        styles.tableOptionTextSelected,
                    ]}
                  >
                    {table.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dateType === "start" ? startDate : endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  section: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectText: {
    fontSize: 14,
    color: "#111827",
  },
  placeholderText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  formatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  formatCard: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formatCardSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  formatName: {
    fontSize: 12,
    color: "#374151",
    marginTop: 8,
    fontWeight: "500",
  },
  formatNameSelected: {
    color: "white",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateText: {
    fontSize: 14,
    color: "#111827",
  },
  dateSeparator: {
    fontSize: 14,
    color: "#6B7280",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 100,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  exportButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  exportButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 16,
  },
  recentExports: {
    gap: 12,
  },
  exportItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  exportInfo: {
    flex: 1,
  },
  exportName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  exportMeta: {
    fontSize: 12,
    color: "#6B7280",
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
  tableOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  tableOptionSelected: {
    borderBottomColor: "#2563EB",
  },
  tableOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  tableOptionTextSelected: {
    color: "#2563EB",
    fontWeight: "500",
  },
});
