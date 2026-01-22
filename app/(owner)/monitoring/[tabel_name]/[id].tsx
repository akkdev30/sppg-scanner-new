// app/(owner)/monitoring/[table_name]/[id].tsx

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../../context/AuthContext";

export default function RecordDetailScreen() {
  const router = useRouter();
  const { table_name, id } = useLocalSearchParams<{
    table_name: string;
    id: string;
  }>();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [relatedData, setRelatedData] = useState<any[]>([]);

  useEffect(() => {
    loadRecordDetail();
  }, []);

  const loadRecordDetail = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      // Fetch record detail
      const response = await fetch(
        `${process.env.API_URL_SERVER}/api/dashboard/owner/monitoring/data/${table_name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        const foundRecord = result.data.records?.find((r: any) => r.id === id);
        if (foundRecord) {
          setRecord(foundRecord);
        } else {
          throw new Error("Record not found");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memuat detail data");
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return "-";

    // Format dates
    if (key.includes("_at") || key.includes("_date")) {
      return new Date(value).toLocaleString("id-ID");
    }

    // Format booleans
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Format JSON
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return value.toString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat detail data...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#DC2626" />
        <Text style={styles.errorTitle}>Data tidak ditemukan</Text>
        <Text style={styles.errorText}>
          Data yang Anda cari tidak tersedia atau telah dihapus
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
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

        <Text style={styles.title}>Record Details</Text>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Record Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Basic Information</Text>
            <Text style={styles.recordId}>ID: {record.id}</Text>
          </View>

          <View style={styles.infoGrid}>
            {Object.entries(record)
              .filter(
                ([key]) => !["id", "created_at", "updated_at"].includes(key),
              )
              .slice(0, 6)
              .map(([key, value]) => (
                <View key={key} style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {key.replace(/_/g, " ").toUpperCase()}
                  </Text>
                  <Text style={styles.infoValue} numberOfLines={2}>
                    {formatValue(key, value)}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Additional Details</Text>

          {Object.entries(record)
            .filter(
              ([key]) =>
                !["id", "created_at", "updated_at"].includes(key) &&
                !Object.keys(record).slice(0, 6).includes(key),
            )
            .map(([key, value]) => (
              <View key={key} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{key.replace(/_/g, " ")}</Text>
                <Text style={styles.detailValue}>
                  {formatValue(key, value)}
                </Text>
              </View>
            ))}
        </View>

        {/* Metadata */}
        <View style={styles.metadataCard}>
          <Text style={styles.metadataTitle}>Metadata</Text>

          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Created At</Text>
              <Text style={styles.metadataValue}>
                {formatValue("created_at", record.created_at)}
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Updated At</Text>
              <Text style={styles.metadataValue}>
                {formatValue(
                  "updated_at",
                  record.updated_at || record.created_at,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Related Data (jika ada) */}
        {relatedData.length > 0 && (
          <View style={styles.relatedCard}>
            <Text style={styles.relatedTitle}>Related Data</Text>
            {relatedData.map((item, index) => (
              <View key={index} style={styles.relatedItem}>
                <Text style={styles.relatedText}>{JSON.stringify(item)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButtonSecondary}>
              <Ionicons name="create" size={18} color="#2563EB" />
              <Text style={styles.actionButtonTextSecondary}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonSecondary}>
              <Ionicons name="trash" size={18} color="#DC2626" />
              <Text
                style={[styles.actionButtonTextSecondary, { color: "#DC2626" }]}
              >
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonSecondary}>
              <Ionicons name="share" size={18} color="#059669" />
              <Text
                style={[styles.actionButtonTextSecondary, { color: "#059669" }]}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  actionButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  recordId: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoItem: {
    width: "48%",
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  metadataCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  relatedCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  relatedItem: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedText: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    gap: 6,
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
});
