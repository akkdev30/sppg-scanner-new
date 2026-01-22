import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserItem {
  id: string;
  username: string;
  role: "admin" | "pic";
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

interface UserDetailModalProps {
  visible: boolean;
  user: UserItem | null;
  onClose: () => void;
}

export default function UserDetailModal({
  visible,
  user,
  onClose,
}: UserDetailModalProps) {
  if (!user) return null;

  const getRoleIcon = (role: string) => {
    return role === "admin" ? "shield-checkmark" : "person";
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "#2563EB" : "#7C3AED";
  };

  const getRoleBgColor = (role: string) => {
    return role === "admin" ? "#EFF6FF" : "#F3E8FF";
  };

  const getRoleDescription = (role: string) => {
    return role === "admin"
      ? "Memiliki akses penuh ke semua fitur dan data sistem"
      : "Dapat mengelola data operasional dan menu harian";
  };

  const getActivityStatus = (lastLogin?: string) => {
    if (!lastLogin) {
      return {
        text: "Belum pernah login",
        color: "#9CA3AF",
        icon: "time-outline",
      };
    }

    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceLogin === 0) {
      return {
        text: "Aktif hari ini",
        color: "#10B981",
        icon: "checkmark-circle",
      };
    }
    if (daysSinceLogin === 1) {
      return {
        text: "Aktif kemarin",
        color: "#F59E0B",
        icon: "time",
      };
    }
    if (daysSinceLogin <= 7) {
      return {
        text: `Terakhir aktif ${daysSinceLogin} hari lalu`,
        color: "#F59E0B",
        icon: "time",
      };
    }
    return {
      text: "Tidak aktif dalam 7 hari terakhir",
      color: "#EF4444",
      icon: "close-circle",
    };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const activityStatus = getActivityStatus(user.last_login_at);
  const createdDate = formatDateTime(user.created_at);
  const updatedDate = formatDateTime(user.updated_at);
  const lastLoginDate = user.last_login_at
    ? formatDateTime(user.last_login_at)
    : null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* User Avatar & Basic Info */}
            <View style={styles.profileSection}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: getRoleBgColor(user.role) },
                ]}
              >
                <Ionicons
                  name={getRoleIcon(user.role)}
                  size={48}
                  color={getRoleColor(user.role)}
                />
              </View>

              <Text style={styles.username}>{user.username}</Text>

              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleBgColor(user.role) },
                ]}
              >
                <Ionicons
                  name={getRoleIcon(user.role)}
                  size={16}
                  color={getRoleColor(user.role)}
                />
                <Text
                  style={[styles.roleText, { color: getRoleColor(user.role) }]}
                >
                  {user.role === "admin"
                    ? "Administrator"
                    : "PIC (Person In Charge)"}
                </Text>
              </View>

              <Text style={styles.roleDescription}>
                {getRoleDescription(user.role)}
              </Text>
            </View>

            {/* Activity Status */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons
                  name={activityStatus.icon as any}
                  size={24}
                  color={activityStatus.color}
                />
                <View style={styles.statusHeaderText}>
                  <Text style={styles.statusTitle}>Status Aktivitas</Text>
                  <Text
                    style={[styles.statusText, { color: activityStatus.color }]}
                  >
                    {activityStatus.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* Account Information */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informasi Akun</Text>

              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#2563EB"
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Tanggal Dibuat</Text>
                    <Text style={styles.infoValue}>{createdDate.date}</Text>
                    <Text style={styles.infoTime}>{createdDate.time}</Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="sync-outline" size={20} color="#10B981" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Terakhir Diupdate</Text>
                    <Text style={styles.infoValue}>{updatedDate.date}</Text>
                    <Text style={styles.infoTime}>{updatedDate.time}</Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="log-in-outline" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Login Terakhir</Text>
                    {lastLoginDate ? (
                      <>
                        <Text style={styles.infoValue}>
                          {lastLoginDate.date}
                        </Text>
                        <Text style={styles.infoTime}>
                          {lastLoginDate.time}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.infoValueEmpty}>
                        Belum pernah login
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Permissions */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Hak Akses</Text>
              <View style={styles.permissionCard}>
                {user.role === "admin" ? (
                  <>
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Kelola semua pengguna"
                    />
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Kelola SPPG dan sekolah"
                    />
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Kelola menu dan data operasional"
                    />
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Akses laporan dan analitik lengkap"
                    />
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Konfigurasi sistem"
                    />
                  </>
                ) : (
                  <>
                    <PermissionItem
                      icon="close-circle"
                      color="#EF4444"
                      text="Kelola pengguna"
                      disabled
                    />
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Kelola menu harian"
                    />
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Lihat data sekolah dan SPPG"
                    />
                    <PermissionItem
                      icon="checkmark-circle"
                      color="#10B981"
                      text="Akses laporan dasar"
                    />
                    <PermissionItem
                      icon="close-circle"
                      color="#EF4444"
                      text="Konfigurasi sistem"
                      disabled
                    />
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.closeButtonFooter}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const PermissionItem = ({
  icon,
  color,
  text,
  disabled = false,
}: {
  icon: string;
  color: string;
  text: string;
  disabled?: boolean;
}) => (
  <View style={styles.permissionItem}>
    <Ionicons name={icon as any} size={20} color={color} />
    <Text
      style={[styles.permissionText, disabled && styles.permissionTextDisabled]}
    >
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    width: "100%",
    maxHeight: "90%",
    maxWidth: 500,
  },
  modalHeader: {
    padding: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  roleDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusHeaderText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  infoItem: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  infoTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  infoValueEmpty: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  permissionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  permissionText: {
    fontSize: 14,
    color: "#374151",
  },
  permissionTextDisabled: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  closeButtonFooter: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
