// app/scanner.tsx

import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

// Interface untuk data hasil scan
interface ScanResult {
  success: boolean;
  message: string;
  data: {
    qr_code: {
      id: string;
      is_used: boolean;
      used_at: string;
      scanned_at: string;
    };
    distribution: {
      id: string;
      school: {
        id: string;
        name: string;
        address: string;
      };
      menu: {
        id: string;
        menu_code: string;
        menu_name: string;
        scheduled_date: string;
        sppg: {
          sppg_code: string;
          sppg_name: string;
          phone_number: string;
        };
      };
      allocated_portion: number;
      current_received_portion: number;
      received_status: string;
      received_condition: string;
    };
  };
}

// Interface untuk laporan masalah
interface ProblemReport {
  distribution_id: string;
  problem_type: string;
  description: string;
  evidence_images: string[];
}

// Interface untuk status penerimaan
interface ReceiveStatusUpdate {
  received_status: "pending" | "accepted" | "rejected";
  received_portion?: number;
  received_condition?: string;
  received_notes?: string;
}

const API_URL = process.env.API_URL_SERVER;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [scanData, setScanData] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // State untuk form
  const [receivedStatus, setReceivedStatus] = useState<
    "pending" | "accepted" | "rejected"
  >("accepted");
  const [receivedPortion, setReceivedPortion] = useState<string>("");
  const [receivedCondition, setReceivedCondition] = useState<string>("normal");
  const [receivedNotes, setReceivedNotes] = useState<string>("");

  // State untuk laporan masalah
  const [showProblemReport, setShowProblemReport] = useState<boolean>(false);
  const [problemType, setProblemType] = useState<string>("quality_issue");
  const [problemDescription, setProblemDescription] = useState<string>("");
  const [submittingStatus, setSubmittingStatus] = useState<boolean>(false);

  const { user, logout, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult): void => {
    setScanned(true);
    setScanData(data);
    handleScanQRCode(data);
  };

  const handleScanQRCode = async (qrCodeData: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/pic/scan`,
        {
          qr_code_data: qrCodeData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setScanResult(response.data);
        setShowResult(true);

        // Set default values
        if (response.data.data?.distribution) {
          const dist = response.data.data.distribution;
          setReceivedPortion(dist.allocated_portion.toString());
          setReceivedCondition(dist.received_condition || "normal");
        }
      } else {
        Alert.alert("Error", response.data.error || "QR code tidak valid");
        resetScanner();
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Gagal memproses QR code",
      );
      resetScanner();
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = (): void => {
    setScanned(false);
    setScanData("");
    setShowResult(false);
    setScanResult(null);
    setReceivedStatus("accepted");
    setReceivedPortion("");
    setReceivedCondition("normal");
    setReceivedNotes("");
    setShowProblemReport(false);
    setProblemType("quality_issue");
    setProblemDescription("");
  };

  const handleConfirmReceipt = async (): Promise<void> => {
    if (!scanResult?.data?.distribution?.id) {
      Alert.alert("Error", "Data distribusi tidak ditemukan");
      return;
    }

    setSubmittingStatus(true);
    try {
      const updateData: ReceiveStatusUpdate = {
        received_status: receivedStatus,
        received_notes: receivedNotes,
      };

      if (receivedPortion) {
        updateData.received_portion = parseInt(receivedPortion);
      }

      if (receivedCondition) {
        updateData.received_condition = receivedCondition;
      }

      const response = await axios.put(
        `${API_URL}/pic/distribution/${scanResult.data.distribution.id}/status`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Alert.alert("Berhasil!", "Status penerimaan berhasil diperbarui", [
          {
            text: "OK",
            onPress: resetScanner,
          },
        ]);
      }
    } catch (error: any) {
      console.error("Update status error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Gagal memperbarui status",
      );
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleReportProblem = async (): Promise<void> => {
    if (!scanResult?.data?.distribution?.id) {
      Alert.alert("Error", "Data distribusi tidak ditemukan");
      return;
    }

    if (!problemDescription.trim()) {
      Alert.alert("Error", "Deskripsi masalah harus diisi");
      return;
    }

    setSubmittingStatus(true);
    try {
      const problemReport: ProblemReport = {
        distribution_id: scanResult.data.distribution.id,
        problem_type: problemType,
        description: problemDescription,
        evidence_images: [], // Implement upload image if needed
      };

      const response = await axios.post(
        `${API_URL}/pic/problems/report`,
        problemReport,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Alert.alert("Berhasil!", "Laporan masalah berhasil dibuat", [
          {
            text: "OK",
            onPress: resetScanner,
          },
        ]);
      }
    } catch (error: any) {
      console.error("Report problem error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Gagal membuat laporan",
      );
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#2563EB" />
        <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.permissionText}>
          Aplikasi memerlukan akses kamera untuk scan QR code
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Izinkan Akses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Scanner PIC Sekolah</Text>
            <Text style={styles.headerSubtitle}>
              {user?.full_name || user?.username} • PIC Sekolah
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {!showResult && (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            {/* Scanner Overlay */}
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
              <View style={styles.instructionContainer}>
                <Ionicons name="qr-code-outline" size={32} color="white" />
                <Text style={styles.instructionText}>
                  Arahkan kamera ke QR code distribusi
                </Text>
                <Text style={styles.instructionSubtext}>
                  Format QR code distribusi makanan sekolah
                </Text>
              </View>
            </View>
          </CameraView>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingMessage}>Memproses QR code...</Text>
          </View>
        )}
      </View>

      {/* Scan Result Modal */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hasil Scan QR Code</Text>
              <TouchableOpacity onPress={resetScanner}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.resultScroll}>
              {/* Status Scan */}
              <View style={styles.scanStatusCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#10B981"
                  style={styles.statusIcon}
                />
                <View>
                  <Text style={styles.scanStatusTitle}>Scan Berhasil</Text>
                  <Text style={styles.scanStatusSubtitle}>
                    QR code valid dan terverifikasi
                  </Text>
                </View>
              </View>

              {/* Menu Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informasi Menu</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kode Menu</Text>
                    <Text style={styles.infoValue}>
                      {scanResult?.data?.distribution?.menu?.menu_code}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nama Menu</Text>
                    <Text style={styles.infoValue}>
                      {scanResult?.data?.distribution?.menu?.menu_name}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tanggal</Text>
                    <Text style={styles.infoValue}>
                      {scanResult?.data?.distribution?.menu?.scheduled_date &&
                        formatDate(
                          scanResult.data.distribution.menu.scheduled_date,
                        )}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Penyedia (SPPG)</Text>
                    <Text style={styles.infoValue}>
                      {scanResult?.data?.distribution?.menu?.sppg?.sppg_name}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Distribution Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Distribusi</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sekolah</Text>
                    <Text style={styles.infoValue}>
                      {scanResult?.data?.distribution?.school?.name}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Alokasi Porsi</Text>
                    <Text style={styles.infoValue}>
                      {scanResult?.data?.distribution?.allocated_portion} porsi
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status Terima</Text>
                    <Text
                      style={[
                        styles.statusBadge,
                        scanResult?.data?.distribution?.received_status ===
                        "accepted"
                          ? styles.statusSuccess
                          : scanResult?.data?.distribution?.received_status ===
                              "rejected"
                            ? styles.statusError
                            : styles.statusWarning,
                      ]}
                    >
                      {scanResult?.data?.distribution?.received_status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Status Update Form */}
              {!showProblemReport ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Konfirmasi Penerimaan</Text>

                  {/* Status Selection */}
                  <View style={styles.radioGroup}>
                    {["accepted", "rejected"].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.radioButton,
                          receivedStatus === status && styles.radioButtonActive,
                          status === "rejected" && styles.radioButtonRejected,
                        ]}
                        onPress={() => setReceivedStatus(status as any)}
                      >
                        <Ionicons
                          name={
                            status === "accepted"
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={20}
                          color={
                            receivedStatus === status
                              ? status === "accepted"
                                ? "#10B981"
                                : "#EF4444"
                              : "#6B7280"
                          }
                        />
                        <Text
                          style={[
                            styles.radioText,
                            receivedStatus === status && styles.radioTextActive,
                          ]}
                        >
                          {status === "accepted" ? "Terima" : "Tolak"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Additional Fields for Accepted */}
                  {receivedStatus === "accepted" && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                          Jumlah Porsi Diterima *
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Masukkan jumlah porsi"
                          value={receivedPortion}
                          onChangeText={setReceivedPortion}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Kondisi Makanan</Text>
                        <View style={styles.radioGroupHorizontal}>
                          {["normal", "slightly_damaged", "damaged"].map(
                            (condition) => (
                              <TouchableOpacity
                                key={condition}
                                style={[
                                  styles.conditionButton,
                                  receivedCondition === condition &&
                                    styles.conditionButtonActive,
                                ]}
                                onPress={() => setReceivedCondition(condition)}
                              >
                                <Text
                                  style={[
                                    styles.conditionText,
                                    receivedCondition === condition &&
                                      styles.conditionTextActive,
                                  ]}
                                >
                                  {condition === "normal"
                                    ? "Normal"
                                    : condition === "slightly_damaged"
                                      ? "Sedikit Rusak"
                                      : "Rusak"}
                                </Text>
                              </TouchableOpacity>
                            ),
                          )}
                        </View>
                      </View>
                    </>
                  )}

                  {/* Notes for All Status */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Catatan</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Tambahkan catatan (opsional)"
                      value={receivedNotes}
                      onChangeText={setReceivedNotes}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Problem Report Link */}
                  <TouchableOpacity
                    style={styles.problemReportLink}
                    onPress={() => setShowProblemReport(true)}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={18}
                      color="#F59E0B"
                    />
                    <Text style={styles.problemReportText}>
                      Laporkan masalah pada makanan
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                /* Problem Report Form */
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TouchableOpacity
                      onPress={() => setShowProblemReport(false)}
                      style={styles.backButton}
                    >
                      <Ionicons name="arrow-back" size={20} color="#2563EB" />
                      <Text style={styles.backButtonText}>Kembali</Text>
                    </TouchableOpacity>
                    <Text style={styles.sectionTitle}>Laporan Masalah</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Jenis Masalah *</Text>
                    <View style={styles.problemTypeGrid}>
                      {[
                        { id: "quality_issue", label: "Kualitas Rendah" },
                        { id: "contamination", label: "Kontaminasi" },
                        { id: "shortage", label: "Kekurangan Porsi" },
                        { id: "damaged_packaging", label: "Kemasan Rusak" },
                        { id: "expired", label: "Kedaluwarsa" },
                        { id: "other", label: "Lainnya" },
                      ].map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.problemTypeButton,
                            problemType === type.id &&
                              styles.problemTypeButtonActive,
                          ]}
                          onPress={() => setProblemType(type.id)}
                        >
                          <Text
                            style={[
                              styles.problemTypeText,
                              problemType === type.id &&
                                styles.problemTypeTextActive,
                            ]}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Deskripsi Masalah *</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Jelaskan masalah secara detail..."
                      value={problemDescription}
                      onChangeText={setProblemDescription}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <TouchableOpacity style={styles.photoButton}>
                    <Ionicons name="camera-outline" size={20} color="#2563EB" />
                    <Text style={styles.photoButtonText}>
                      Tambahkan Foto Bukti
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* User Info */}
              <View style={styles.userInfoCard}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color="#2563EB"
                />
                <View style={styles.userInfoContent}>
                  <Text style={styles.userInfoName}>
                    {user?.full_name || user?.username}
                  </Text>
                  <Text style={styles.userInfoRole}>PIC Sekolah</Text>
                  <Text style={styles.userInfoTime}>
                    {new Date().toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={resetScanner}
                disabled={submittingStatus}
              >
                <Text style={styles.secondaryButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={
                  showProblemReport ? handleReportProblem : handleConfirmReceipt
                }
                disabled={submittingStatus}
              >
                {submittingStatus ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons
                      name={
                        showProblemReport ? "send-outline" : "checkmark-outline"
                      }
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.primaryButtonText}>
                      {showProblemReport
                        ? "Kirim Laporan"
                        : "Konfirmasi Penerimaan"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#6B7280",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  permissionTitle: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#2563EB",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#1D4ED8",
    padding: 10,
    borderRadius: 10,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#2563EB",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#2563EB",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#2563EB",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#2563EB",
  },
  instructionContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 40,
    alignItems: "center",
    gap: 8,
  },
  instructionText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  instructionSubtext: {
    color: "#DBEAFE",
    textAlign: "center",
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingMessage: {
    color: "white",
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "bold",
  },
  resultScroll: {
    maxHeight: "75%",
  },
  scanStatusCard: {
    backgroundColor: "#D1FAE5",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  statusIcon: {
    marginRight: 8,
  },
  scanStatusTitle: {
    color: "#065F46",
    fontSize: 16,
    fontWeight: "600",
  },
  scanStatusSubtitle: {
    color: "#047857",
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusSuccess: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  statusError: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  statusWarning: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  radioButtonActive: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  radioButtonRejected: {
    borderColor: "#EF4444",
  },
  radioText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 15,
  },
  radioTextActive: {
    color: "#065F46",
    fontWeight: "600",
  },
  radioGroupHorizontal: {
    flexDirection: "row",
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  conditionButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  conditionText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
  conditionTextActive: {
    color: "#2563EB",
    fontWeight: "500",
  },
  problemReportLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 16,
  },
  problemReportText: {
    color: "#92400E",
    fontWeight: "500",
    flex: 1,
    marginHorizontal: 8,
  },
  problemTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  problemTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  problemTypeButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  problemTypeText: {
    color: "#6B7280",
    fontSize: 14,
  },
  problemTypeTextActive: {
    color: "#2563EB",
    fontWeight: "500",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    marginTop: 16,
  },
  photoButtonText: {
    color: "#2563EB",
    fontWeight: "500",
    fontSize: 15,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  userInfoCard: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  userInfoContent: {
    flex: 1,
  },
  userInfoName: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 16,
  },
  userInfoRole: {
    color: "#2563EB",
    fontSize: 14,
    marginTop: 2,
  },
  userInfoTime: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  buttonIcon: {
    marginRight: 4,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
