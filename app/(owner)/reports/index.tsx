// app/(owner)/reports/index.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";

// Components
import StatCard from "../../../components/admin/StatCard";
import DistributionEfficiencyChart from "../../../components/owner/reports/DistributionEfficiencyChart";
import ExportModal from "../../../components/owner/reports/ExportModal";
import PeriodFilter from "../../../components/owner/reports/PeriodFilter";
import SPPGPerformanceChart from "../../../components/owner/reports/SPPGPerformanceChart";
import UserActivityChart from "../../../components/owner/reports/UserActivityChart";

// Types
interface ReportData {
  period: {
    start_date: string;
    end_date: string;
    label: string;
  };
  summary: {
    total_distributions: number;
    total_users: number;
    total_sppg: number;
    total_schools: number;
    avg_efficiency: number;
    problem_resolution_rate: number;
  };
  sppg_performance: {
    id: string;
    sppg_name: string;
    total_distributions: number;
    completed_distributions: number;
    efficiency_rate: number;
    avg_response_time: number;
    problems_reported: number;
    ranking: number;
  }[];
  user_activity: {
    id: string;
    username: string;
    role: string;
    total_logins: number;
    last_login: string;
    activities_count: number;
    distribution_count: number;
    scan_count: number;
  }[];
  distribution_efficiency: {
    daily: {
      date: string;
      allocated: number;
      received: number;
      efficiency: number;
    }[];
    by_sppg: {
      sppg_name: string;
      allocated: number;
      received: number;
      efficiency: number;
    }[];
    overall_efficiency: number;
  };
  top_metrics: {
    most_active_user: string;
    most_efficient_sppg: string;
    highest_growth_day: string;
    most_distributed_menu: string;
  };
}

// Mock Data
const MOCK_REPORT_DATA: ReportData = {
  period: {
    start_date: "2024-01-15",
    end_date: "2024-01-21",
    label: "Minggu Ini",
  },
  summary: {
    total_distributions: 1245,
    total_users: 156,
    total_sppg: 12,
    total_schools: 45,
    avg_efficiency: 88.5,
    problem_resolution_rate: 92.3,
  },
  sppg_performance: [
    {
      id: "1",
      sppg_name: "SPPG Pusat",
      total_distributions: 245,
      completed_distributions: 232,
      efficiency_rate: 94.7,
      avg_response_time: 45,
      problems_reported: 3,
      ranking: 1,
    },
    {
      id: "2",
      sppg_name: "SPPG Utara",
      total_distributions: 198,
      completed_distributions: 184,
      efficiency_rate: 92.9,
      avg_response_time: 52,
      problems_reported: 5,
      ranking: 2,
    },
    {
      id: "3",
      sppg_name: "SPPG Selatan",
      total_distributions: 176,
      completed_distributions: 162,
      efficiency_rate: 92.0,
      avg_response_time: 58,
      problems_reported: 8,
      ranking: 3,
    },
    {
      id: "4",
      sppg_name: "SPPG Timur",
      total_distributions: 165,
      completed_distributions: 150,
      efficiency_rate: 90.9,
      avg_response_time: 62,
      problems_reported: 6,
      ranking: 4,
    },
    {
      id: "5",
      sppg_name: "SPPG Barat",
      total_distributions: 142,
      completed_distributions: 128,
      efficiency_rate: 90.1,
      avg_response_time: 65,
      problems_reported: 9,
      ranking: 5,
    },
  ],
  user_activity: [
    {
      id: "1",
      username: "admin_utama",
      role: "admin",
      total_logins: 42,
      last_login: "2024-01-21T14:30:00",
      activities_count: 156,
      distribution_count: 89,
      scan_count: 245,
    },
    {
      id: "2",
      username: "pic_sekolah1",
      role: "pic",
      total_logins: 38,
      last_login: "2024-01-21T13:45:00",
      activities_count: 142,
      distribution_count: 45,
      scan_count: 198,
    },
    {
      id: "3",
      username: "admin_sppg",
      role: "admin",
      total_logins: 35,
      last_login: "2024-01-21T12:15:00",
      activities_count: 128,
      distribution_count: 67,
      scan_count: 176,
    },
    {
      id: "4",
      username: "pic_sekolah2",
      role: "pic",
      total_logins: 31,
      last_login: "2024-01-21T11:30:00",
      activities_count: 115,
      distribution_count: 38,
      scan_count: 165,
    },
    {
      id: "5",
      username: "pic_sekolah3",
      role: "pic",
      total_logins: 28,
      last_login: "2024-01-21T10:45:00",
      activities_count: 98,
      distribution_count: 42,
      scan_count: 142,
    },
  ],
  distribution_efficiency: {
    daily: [
      { date: "15 Jan", allocated: 165, received: 152, efficiency: 92.1 },
      { date: "16 Jan", allocated: 178, received: 168, efficiency: 94.4 },
      { date: "17 Jan", allocated: 192, received: 180, efficiency: 93.8 },
      { date: "18 Jan", allocated: 205, received: 192, efficiency: 93.7 },
      { date: "19 Jan", allocated: 188, received: 175, efficiency: 93.1 },
      { date: "20 Jan", allocated: 165, received: 154, efficiency: 93.3 },
      { date: "21 Jan", allocated: 152, received: 142, efficiency: 93.4 },
    ],
    by_sppg: [
      {
        sppg_name: "SPPG Pusat",
        allocated: 245,
        received: 232,
        efficiency: 94.7,
      },
      {
        sppg_name: "SPPG Utara",
        allocated: 198,
        received: 184,
        efficiency: 92.9,
      },
      {
        sppg_name: "SPPG Selatan",
        allocated: 176,
        received: 162,
        efficiency: 92.0,
      },
      {
        sppg_name: "SPPG Timur",
        allocated: 165,
        received: 150,
        efficiency: 90.9,
      },
      {
        sppg_name: "SPPG Barat",
        allocated: 142,
        received: 128,
        efficiency: 90.1,
      },
    ],
    overall_efficiency: 92.8,
  },
  top_metrics: {
    most_active_user: "admin_utama (156 aktivitas)",
    most_efficient_sppg: "SPPG Pusat (94.7%)",
    highest_growth_day: "16 Januari (+2.3%)",
    most_distributed_menu: "Nasi Goreng Sayur (245x)",
  },
};

export default function ReportsScreen() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>(MOCK_REPORT_DATA);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null,
  );

  const periods = [
    { id: "today", label: "Hari Ini", days: 0 },
    { id: "week", label: "Minggu Ini", days: 7 },
    { id: "month", label: "Bulan Ini", days: 30 },
    { id: "quarter", label: "Kuartal Ini", days: 90 },
    { id: "custom", label: "Kustom", days: 0 },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState(periods[1]); // Minggu Ini default

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      // TODO: Replace with actual API call
      // const response = await fetchReportData(token, selectedPeriod);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update period label based on selection
      const updatedData = {
        ...MOCK_REPORT_DATA,
        period: {
          ...MOCK_REPORT_DATA.period,
          label: selectedPeriod.label,
        },
      };
      setReportData(updatedData);
    } catch (error) {
      console.error("Failed to load report:", error);
      Alert.alert("Error", "Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateSelect = () => {
    if (startDate > endDate) {
      Alert.alert("Error", "Tanggal mulai tidak boleh setelah tanggal akhir");
      return;
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      Alert.alert("Error", "Rentang maksimal 1 tahun");
      return;
    }

    setSelectedPeriod({
      id: "custom",
      label: `${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`,
      days: diffDays,
    });
    setCustomDateModalVisible(false);
  };

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    try {
      // Prepare data for export
      const exportData = {
        report_period: reportData.period,
        generated_at: new Date().toISOString(),
        data: reportData,
      };

      let filename = "";
      let content = "";

      if (format === "csv") {
        // Simple CSV export for summary
        const csvRows = [
          ["Metric", "Value"],
          ["Periode Laporan", reportData.period.label],
          ["Total Distribusi", reportData.summary.total_distributions],
          ["Total Pengguna", reportData.summary.total_users],
          ["Total SPPG", reportData.summary.total_sppg],
          ["Total Sekolah", reportData.summary.total_schools],
          ["Efisiensi Rata-rata", `${reportData.summary.avg_efficiency}%`],
          [
            "Rate Penyelesaian Masalah",
            `${reportData.summary.problem_resolution_rate}%`,
          ],
        ];
        content = csvRows.map((row) => row.join(",")).join("\n");
        filename = `laporan-sppg-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        // For PDF/Excel, we would normally use a library
        content = JSON.stringify(exportData, null, 2);
        filename = `laporan-sppg-${new Date().toISOString().split("T")[0]}.json`;
      }

      // Save file locally
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: format === "csv" ? "text/csv" : "application/json",
          dialogTitle: `Export Laporan - ${format.toUpperCase()}`,
        });
      } else {
        Alert.alert("Success", `File exported: ${filename}`);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Gagal mengekspor laporan");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat Laporan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Comprehensive Reports</Text>
          <Text style={styles.subtitle}>Analisis & Performance Metrics</Text>
        </View>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => setExportModalVisible(true)}
        >
          <Ionicons name="download" size={18} color="#2563EB" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Period Filter */}
      <PeriodFilter
        periods={periods}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={(period) => {
          if (period.id === "custom") {
            setCustomDateModalVisible(true);
          } else {
            setSelectedPeriod(period);
          }
        }}
        currentPeriod={reportData.period.label}
      />

      {/* Summary Stats */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Summary Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Distributions"
            value={reportData.summary.total_distributions.toLocaleString()}
            icon="cube"
            color="#2563EB"
          />
          <StatCard
            title="Active Users"
            value={reportData.summary.total_users.toString()}
            icon="people"
            color="#059669"
          />
          <StatCard
            title="SPPG Active"
            value={reportData.summary.total_sppg.toString()}
            icon="business"
            color="#7C3AED"
          />
          <StatCard
            title="Schools"
            value={reportData.summary.total_schools.toString()}
            icon="school"
            color="#D97706"
          />
        </View>
        <View style={styles.efficiencyStats}>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyLabel}>Avg Efficiency</Text>
            <Text style={styles.efficiencyValue}>
              {reportData.summary.avg_efficiency}%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyLabel}>Problem Resolution</Text>
            <Text style={styles.efficiencyValue}>
              {reportData.summary.problem_resolution_rate}%
            </Text>
          </View>
        </View>
      </View>

      {/* SPPG Performance Comparison */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={18} color="#2563EB" />
          <Text style={styles.sectionTitle}>SPPG Performance Ranking</Text>
        </View>
        <SPPGPerformanceChart data={reportData.sppg_performance} />
      </View>

      {/* Distribution Efficiency */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={18} color="#2563EB" />
          <Text style={styles.sectionTitle}>Distribution Efficiency</Text>
          <View style={styles.overallEfficiencyBadge}>
            <Text style={styles.overallEfficiencyText}>
              Overall: {reportData.distribution_efficiency.overall_efficiency}%
            </Text>
          </View>
        </View>
        <DistributionEfficiencyChart
          data={reportData.distribution_efficiency.daily}
        />
      </View>

      {/* User Activity Analysis */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={18} color="#2563EB" />
          <Text style={styles.sectionTitle}>Top User Activity</Text>
          <Text style={styles.topUserText}>
            Most Active: {reportData.top_metrics.most_active_user}
          </Text>
        </View>
        <UserActivityChart data={reportData.user_activity} />
      </View>

      {/* Top Metrics */}
      <View style={styles.topMetricsSection}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.topMetricsGrid}>
          <View style={styles.topMetricCard}>
            <Ionicons name="person-circle" size={24} color="#2563EB" />
            <Text style={styles.topMetricTitle}>Most Active User</Text>
            <Text style={styles.topMetricValue}>
              {reportData.top_metrics.most_active_user}
            </Text>
          </View>
          <View style={styles.topMetricCard}>
            <Ionicons name="trophy" size={24} color="#059669" />
            <Text style={styles.topMetricTitle}>Most Efficient SPPG</Text>
            <Text style={styles.topMetricValue}>
              {reportData.top_metrics.most_efficient_sppg}
            </Text>
          </View>
          <View style={styles.topMetricCard}>
            <Ionicons name="trending-up" size={24} color="#7C3AED" />
            <Text style={styles.topMetricTitle}>Highest Growth</Text>
            <Text style={styles.topMetricValue}>
              {reportData.top_metrics.highest_growth_day}
            </Text>
          </View>
          <View style={styles.topMetricCard}>
            <Ionicons name="restaurant" size={24} color="#D97706" />
            <Text style={styles.topMetricTitle}>Top Menu</Text>
            <Text style={styles.topMetricValue}>
              {reportData.top_metrics.most_distributed_menu}
            </Text>
          </View>
        </View>
      </View>

      {/* Export Modal */}
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        onExport={handleExport}
      />

      {/* Custom Date Modal */}
      <Modal
        visible={customDateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCustomDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Periode Kustom</Text>
              <TouchableOpacity
                onPress={() => setCustomDateModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Tanggal Mulai</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker("start")}
                >
                  <Ionicons name="calendar" size={18} color="#6B7280" />
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString("id-ID")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Tanggal Akhir</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker("end")}
                >
                  <Ionicons name="calendar" size={18} color="#6B7280" />
                  <Text style={styles.dateText}>
                    {endDate.toLocaleDateString("id-ID")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={showDatePicker === "start" ? startDate : endDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    if (showDatePicker === "start") {
                      setStartDate(selectedDate);
                    } else {
                      setEndDate(selectedDate);
                    }
                  }
                  setShowDatePicker(null);
                }}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCustomDateModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleCustomDateSelect}
              >
                <Text style={styles.applyButtonText}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  summarySection: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  efficiencyStats: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  efficiencyItem: {
    flex: 1,
    alignItems: "center",
  },
  efficiencyLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  efficiencyValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  divider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  overallEfficiencyBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overallEfficiencyText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
  },
  topUserText: {
    fontSize: 11,
    color: "#6B7280",
  },
  topMetricsSection: {
    backgroundColor: "white",
    margin: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  topMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  topMetricCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  topMetricTitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  topMetricValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  datePickerContainer: {
    padding: 16,
    gap: 16,
  },
  dateInput: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#2563EB",
  },
  applyButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
});
