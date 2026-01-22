import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
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

interface UserListProps {
  userList: UserItem[];
  currentUserId: string;
  onEdit: (item: UserItem) => void;
  onDelete: (id: string, username: string) => void;
  onViewDetail: (item: UserItem) => void;
}

export default function UserList({
  userList,
  currentUserId,
  onEdit,
  onDelete,
  onViewDetail,
}: UserListProps) {
  const getRoleIcon = (role: string) => {
    return role === "admin" ? "shield-checkmark" : "person";
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "#2563EB" : "#7C3AED";
  };

  const getRoleBgColor = (role: string) => {
    return role === "admin" ? "#EFF6FF" : "#F3E8FF";
  };

  const getStatusColor = (lastLogin?: string) => {
    if (!lastLogin) return "#9CA3AF";
    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLogin <= 1) return "#10B981";
    if (daysSinceLogin <= 7) return "#F59E0B";
    return "#EF4444";
  };

  const getActivityStatus = (lastLogin?: string) => {
    if (!lastLogin) return "Belum pernah login";
    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLogin === 0) return "Aktif hari ini";
    if (daysSinceLogin === 1) return "Aktif kemarin";
    if (daysSinceLogin <= 7) return `Aktif ${daysSinceLogin} hari lalu`;
    return "Tidak aktif";
  };

  const renderUserCard = ({ item }: { item: UserItem }) => {
    const isCurrentUser = item.id === currentUserId;

    return (
      <TouchableOpacity
        style={[styles.userCard, isCurrentUser && styles.currentUserCard]}
        onPress={() => onViewDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: getRoleBgColor(item.role) },
              ]}
            >
              <Ionicons
                name={getRoleIcon(item.role)}
                size={24}
                color={getRoleColor(item.role)}
              />
            </View>
            {isCurrentUser && (
              <View style={styles.currentUserBadge}>
                <Text style={styles.currentUserText}>Anda</Text>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.username}>{item.username}</Text>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleBgColor(item.role) },
                ]}
              >
                <Text
                  style={[styles.roleText, { color: getRoleColor(item.role) }]}
                >
                  {item.role === "admin" ? "Admin" : "PIC"}
                </Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.last_login_at) },
                ]}
              />
              <Text style={styles.statusText}>
                {getActivityStatus(item.last_login_at)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              Dibuat {new Date(item.created_at).toLocaleDateString("id-ID")}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="create-outline" size={20} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                isCurrentUser && styles.actionButtonDisabled,
              ]}
              onPress={() => onDelete(item.id, item.username)}
              disabled={isCurrentUser}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={isCurrentUser ? "#D1D5DB" : "#EF4444"}
              />
            </TouchableOpacity>
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
    fontSize: 9,
    fontWeight: "600",
    color: "white",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: "#6B7280",
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
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
