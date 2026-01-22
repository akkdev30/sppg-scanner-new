// app/(auth)/login.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (): Promise<void> => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Username dan password harus diisi");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password);

      // Tampilkan success message berdasarkan role
      const roleName =
        result.user?.role === "owner"
          ? "Super Admin"
          : result.user?.role === "admin"
            ? "Admin SPPG"
            : result.user?.role === "pic"
              ? "PIC Sekolah"
              : "User";

      Alert.alert(
        "Login Berhasil",
        `Selamat datang ${result.user?.username}!\nRole: ${roleName}`,
        [{ text: "OK" }],
      );

      // Navigation akan di-handle otomatis oleh RootLayoutNav berdasarkan role user
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Terjadi kesalahan saat login";

      if (error.response) {
        // Error dari server
        const serverError = error.response.data;
        errorMessage = serverError.error || errorMessage;

        if (serverError.code === "INVALID_CREDENTIALS") {
          errorMessage = "Username atau password salah";
        } else if (serverError.code === "USER_INACTIVE") {
          errorMessage = "Akun tidak aktif";
        } else if (serverError.code === "RATE_LIMIT_EXCEEDED") {
          errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti.";
        }
      } else if (error.request) {
        // Tidak ada response dari server
        errorMessage =
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message) {
        // Error lain
        errorMessage = error.message;
      }

      Alert.alert("Login Gagal", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: "owner" | "admin" | "pic") => {
    const demoCredentials = {
      owner: { username: "admin", password: "admin123" },
      admin: { username: "admin_sppg", password: "admin123" },
      pic: { username: "pic_sekolah", password: "pic123" },
    };

    setUsername(demoCredentials[role].username);
    setPassword(demoCredentials[role].password);

    Alert.alert(
      "Demo Login",
      `Username: ${demoCredentials[role].username}\nPassword: ${demoCredentials[role].password}\n\nKlik "Masuk" untuk login.`,
      [{ text: "OK" }],
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Lupa Password?",
      "Hubungi administrator sistem untuk reset password.",
      [{ text: "OK" }],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header dengan Background */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="restaurant" size={40} color="#fff" />
              </View>
              <Text style={styles.logoText}>SPPG</Text>
            </View>
            <Text style={styles.title}>Sistem Monitoring</Text>
            <Text style={styles.subtitle}>Distribusi Makanan Sekolah</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Masuk ke Akun</Text>
              <Text style={styles.formSubtitle}>
                Silakan masuk untuk melanjutkan
              </Text>
            </View>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#6B7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="contoh: admin123"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Masuk</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* Demo Login Section */}
            <View style={styles.demoSection}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Login Demo</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.demoButtons}>
                <TouchableOpacity
                  style={[styles.demoButton, styles.ownerButton]}
                  onPress={() => handleDemoLogin("owner")}
                  disabled={loading}
                >
                  <Ionicons name="shield-outline" size={18} color="#7C3AED" />
                  <Text style={styles.demoButtonText}>Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoButton, styles.adminButton]}
                  onPress={() => handleDemoLogin("admin")}
                  disabled={loading}
                >
                  <Ionicons name="cog-outline" size={18} color="#059669" />
                  <Text style={styles.demoButtonText}>Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoButton, styles.picButton]}
                  onPress={() => handleDemoLogin("pic")}
                  disabled={loading}
                >
                  <Ionicons name="school-outline" size={18} color="#DC2626" />
                  <Text style={styles.demoButtonText}>PIC</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.demoNote}>
                Gunakan demo login untuk mencoba fitur sesuai role
              </Text>
            </View>

            {/* System Info */}
            <View style={styles.systemInfo}>
              <Text style={styles.systemInfoTitle}>SPPG System v2.1</Text>
              <Text style={styles.systemInfoText}>
                Sistem Monitoring Distribusi Makanan Sekolah
              </Text>
              <Text style={styles.systemInfoText}>
                API:{" "}
                {process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 SPPG System - Direktorat Gizi Masyarakat
            </Text>
            <Text style={styles.footerSubtext}>
              Versi 2.1.0 • {new Date().getFullYear()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563EB",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    color: "#DBEAFE",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  formSubtitle: {
    color: "#6B7280",
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#93C5FD",
    opacity: 0.8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  demoButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  demoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  ownerButton: {
    backgroundColor: "#F5F3FF",
    borderColor: "#DDD6FE",
  },
  adminButton: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  picButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  demoButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  demoNote: {
    color: "#6B7280",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  systemInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
  },
  systemInfoTitle: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  systemInfoText: {
    color: "#4B5563",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 2,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    color: "#DBEAFE",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  footerSubtext: {
    color: "#93C5FD",
    fontSize: 10,
    textAlign: "center",
  },
});
