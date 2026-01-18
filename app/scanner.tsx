// app/scanner.tsx
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
import { useAuth } from "../context/AuthContext";

interface ScanData {
  type: string;
  data: string;
}

interface ScanMetadata {
  menu?: string;
  max_consumption?: number;
  pic_name?: string;
  notes?: string;
}

const API_URL = "https://sppg-backend.vercel.app/api"; // Ganti dengan URL backend Anda

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Form data untuk metadata
  const [scanType, setScanType] = useState<string>("terima");
  const [menu, setMenu] = useState<string>("");
  const [maxConsumption, setMaxConsumption] = useState<string>("");
  const [picName, setPicName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { user, logout, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({
    type,
    data,
  }: BarcodeScanningResult): void => {
    setScanned(true);
    setScanData({ type, data });
    setShowResult(true);

    // Reset form
    setScanType("terima");
    setMenu("");
    setMaxConsumption("");
    setPicName("");
    setNotes("");
  };

  const resetScanner = (): void => {
    setScanned(false);
    setScanData(null);
    setShowResult(false);
    setScanType("terima");
    setMenu("");
    setMaxConsumption("");
    setPicName("");
    setNotes("");
  };

  const handleSave = async (): Promise<void> => {
    if (!scanData?.data) {
      Alert.alert("Error", "Tidak ada data barcode");
      return;
    }

    setLoading(true);
    try {
      // Prepare metadata
      const metadata: ScanMetadata = {};
      if (menu) metadata.menu = menu;
      if (maxConsumption) metadata.max_consumption = parseInt(maxConsumption);
      if (picName) metadata.pic_name = picName;
      if (notes) metadata.notes = notes;

      // Send to backend
      const response = await axios.post(
        `${API_URL}/scan`,
        {
          barcode: scanData.data,
          scan_type: scanType,
          scanner_id: `mobile:${user?.id}`,
          location: user?.sppg_zone || "Unknown",
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Alert.alert(
          "Berhasil!",
          response.data.message || "Data berhasil disimpan",
          [
            {
              text: "OK",
              onPress: resetScanner,
            },
          ],
        );
      } else {
        throw new Error(response.data.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Save scan error:", error);

      let errorMessage = "Terjadi kesalahan saat menyimpan";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
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
        <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.permissionText}>
          Aplikasi memerlukan akses kamera untuk scan barcode
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
            <Text style={styles.headerTitle}>Scanner SPPG</Text>
            <Text style={styles.headerSubtitle}>
              {user?.name} • {user?.sppg_zone}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "code128", "code39", "ean13", "ean8"],
          }}
        >
          {/* Scanner Overlay */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Arahkan kamera ke barcode SPPG
              </Text>
              <Text style={styles.instructionSubtext}>
                Format: SPPG-ZONE-SCHOOL_CODE
              </Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Scan Result Modal */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hasil Scan</Text>

            <ScrollView style={styles.resultScroll}>
              {/* Barcode Info */}
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Barcode</Text>
                <Text style={styles.resultValue}>{scanData?.data}</Text>
              </View>

              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Type</Text>
                <Text style={styles.resultValue}>{scanData?.type}</Text>
              </View>

              {/* Scan Type Selection */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Tipe Scan *</Text>
                <View style={styles.radioGroup}>
                  {["terima", "produksi", "distribusi"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.radioButton,
                        scanType === type && styles.radioButtonActive,
                      ]}
                      onPress={() => setScanType(type)}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          scanType === type && styles.radioTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Optional Metadata */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>
                  Informasi Tambahan (Opsional)
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Menu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Nasi Goreng"
                    value={menu}
                    onChangeText={setMenu}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Konsumsi Maksimal</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: 100"
                    value={maxConsumption}
                    onChangeText={setMaxConsumption}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PIC Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama penanggung jawab"
                    value={picName}
                    onChangeText={setPicName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Catatan</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tambahkan catatan..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* User Info */}
              <View style={styles.userInfoBox}>
                <Text style={styles.userInfoLabel}>Scanned by</Text>
                <Text style={styles.userInfoName}>{user?.name}</Text>
                <Text style={styles.userInfoZone}>
                  Zone: {user?.sppg_zone || "N/A"}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={resetScanner}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryButtonText}>Simpan</Text>
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  permissionText: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#2563EB",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "500",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 288,
    height: 288,
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 24,
    opacity: 0.5,
  },
  instructionContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  instructionText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  instructionSubtext: {
    color: "#DBEAFE",
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
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
    padding: 24,
    maxHeight: "90%",
  },
  modalTitle: {
    color: "#1F2937",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultScroll: {
    maxHeight: "75%",
  },
  resultBox: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 4,
  },
  resultValue: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 14,
  },
  formSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 8,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  radioButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  radioText: {
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 14,
  },
  radioTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  userInfoBox: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  userInfoLabel: {
    color: "#1E40AF",
    fontSize: 12,
    marginBottom: 4,
  },
  userInfoName: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 16,
  },
  userInfoZone: {
    color: "#2563EB",
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
