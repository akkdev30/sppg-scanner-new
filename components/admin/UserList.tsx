// components/admin/UserList.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Update interface sesuai dengan database
interface UserItem {
  id: string;
  username: string;
  role: "admin" | "pic" | "operator" | "super_admin";
  full_name?: string;
  email?: string;
  phone_number?: string;
  school_pic_id?: string;
  school_pic_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  created_by?: string;
}

interface UserListProps {
  userList: UserItem[];
  currentUserId: string;
  onEdit: (id: string, item: UserItem) => void;
  onDeactivate: (id: string, username: string) => void;
  onActivate: (id: string, username: string) => void;
  onViewDetail: (item: UserItem) => void;
}

export default function UserList({
  userList,
  currentUserId,
  onEdit,
  onDeactivate,
  onActivate,
  onViewDetail,
}: UserListProps) {
  // Helper functions
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "shield-checkmark";
      case "super_admin":
        return "shield";
      case "pic":
        return "school";
      case "operator":
        return "construct";
      default:
        return "person";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#2563EB";
      case "super_admin":
        return "#DC2626";
      case "pic":
        return "#7C3AED";
      case "operator":
        return "#059669";
      default:
        return "#6B7280";
    }
  };

  const getRoleBgColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#EFF6FF";
      case "super_admin":
        return "#FEF2F2";
      case "pic":
        return "#F3E8FF";
      case "operator":
        return "#D1FAE5";
      default:
        return "#F3F4F6";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "super_admin":
        return "Super Admin";
      case "pic":
        return "PIC Sekolah";
      case "operator":
        return "Operator SPPG";
      default:
        return "User";
    }
  };

  const getActivityStatus = (lastLogin?: string) => {
    if (!lastLogin) return "Belum pernah login";
    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLogin === 0) return "Aktif hari ini";
    if (daysSinceLogin === 1) return "Aktif kemarin";
    if (daysSinceLogin <= 7) return `Aktif ${daysSinceLogin} hari lalu`;
    return "Sudah lama tidak aktif";
  };

  const getActivityColor = (lastLogin?: string) => {
    if (!lastLogin) return "#9CA3AF";
    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLogin <= 1) return "#10B981";
    if (daysSinceLogin <= 7) return "#F59E0B";
    return "#EF4444";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderUserCard = ({ item }: { item: UserItem }) => {
    const isCurrentUser = item.id === currentUserId;

    return (
      <TouchableOpacity
        style={[
          styles.userCard,
          isCurrentUser && styles.currentUserCard,
          !item.is_active && styles.inactiveCard,
        ]}
        onPress={() => onViewDetail(item)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          {/* Avatar/Icon */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: getRoleBgColor(item.role) },
                !item.is_active && styles.inactiveAvatar,
              ]}
            >
              <Ionicons
                name={getRoleIcon(item.role)}
                size={24}
                color={getRoleColor(item.role)}
              />
            </View>

            {/* Status Badge */}
            {!item.is_active && (
              <View style={styles.inactiveStatusBadge}>
                <Text style={styles.inactiveStatusText}>NONAKTIF</Text>
              </View>
            )}
            {isCurrentUser && (
              <View style={styles.currentUserBadge}>
                <Text style={styles.currentUserText}>ANDA</Text>
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <View style={styles.nameContainer}>
                <Text
                  style={[
                    styles.username,
                    !item.is_active && styles.inactiveText,
                  ]}
                >
                  {item.username}
                </Text>
                {item.full_name && (
                  <Text style={styles.fullName}>{item.full_name}</Text>
                )}
              </View>

              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleBgColor(item.role) },
                ]}
              >
                <Text
                  style={[styles.roleText, { color: getRoleColor(item.role) }]}
                >
                  {getRoleLabel(item.role)}
                </Text>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.contactInfo}>
              {item.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={12} color="#6B7280" />
                  <Text style={styles.contactText} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              )}
              {item.phone_number && (
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={12} color="#6B7280" />
                  <Text style={styles.contactText}>{item.phone_number}</Text>
                </View>
              )}
            </View>

            {/* Activity Status */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getActivityColor(item.last_login_at) },
                ]}
              />
              <Text style={styles.statusText}>
                {getActivityStatus(item.last_login_at)}
              </Text>
              <Text style={styles.lastLoginText}>
                • Login: {formatDate(item.last_login_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* School PIC Info (if applicable) */}
        {item.role === "pic" && item.school_pic_name && (
          <View style={styles.schoolInfo}>
            <Ionicons name="school-outline" size={14} color="#6B7280" />
            <Text style={styles.schoolText} numberOfLines={1}>
              {item.school_pic_name}
            </Text>
          </View>
        )}

        <View style={styles.cardDivider} />

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={12} color="#6B7280" />
              <Text style={styles.infoText}>
                Dibuat: {formatDate(item.created_at)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.infoText}>
                Diupdate: {formatDate(item.updated_at)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            {/* Detail Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onViewDetail(item)}
            >
              <Ionicons name="eye-outline" size={18} color="#6B7280" />
            </TouchableOpacity>

            {/* Edit Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCurrentUser && styles.actionButtonDisabled,
              ]}
              onPress={() => onEdit(item)}
              disabled={isCurrentUser}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={isCurrentUser ? "#D1D5DB" : "#2563EB"}
              />
            </TouchableOpacity>

            {/* Activate/Deactivate Button */}
            {!isCurrentUser && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (item.is_active) {
                    onDeactivate(item.id, item.username);
                  } else {
                    onActivate(item.id, item.username);
                  }
                }}
              >
                <Ionicons
                  name={
                    item.is_active ? "lock-closed-outline" : "lock-open-outline"
                  }
                  size={18}
                  color={item.is_active ? "#F59E0B" : "#10B981"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={userList}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Tidak ada pengguna</Text>
            <Text style={styles.emptySubtitle}>
              Pengguna yang sesuai filter tidak ditemukan
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  inactiveCard: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveAvatar: {
    opacity: 0.6,
  },
  inactiveStatusBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveStatusText: {
    fontSize: 8,
    fontWeight: "700",
    color: "white",
  },
  currentUserBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#2563EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentUserText: {
    fontSize: 8,
    fontWeight: "700",
    color: "white",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  fullName: {
    fontSize: 13,
    color: "#6B7280",
  },
  inactiveText: {
    color: "#9CA3AF",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  contactInfo: {
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  contactText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    marginRight: 6,
  },
  lastLoginText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  schoolInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  schoolText: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    flex: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 11,
    color: "#6B7280",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
