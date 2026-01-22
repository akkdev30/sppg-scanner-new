// components/owner/users/UserCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "owner" | "admin" | "pic";
  is_active: boolean;
  last_login_at: string;
  school_pic?: {
    id: string;
    name: string;
    school_id: string;
    school_name: string;
  };
  sppg?: {
    id: string;
    sppg_name: string;
  };
  stats?: {
    total_activities: number;
    total_distributions: number;
    total_scans: number;
  };
}

interface UserCardProps {
  user: User;
  onEdit: () => void;
  onViewDetails: () => void;
  onAction: (action: string) => void;
}

export default function UserCard({
  user,
  onEdit,
  onViewDetails,
  onAction,
}: UserCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "#DC2626";
      case "admin":
        return "#2563EB";
      case "pic":
        return "#7C3AED";
      default:
        return "#6B7280";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return "shield";
      case "admin":
        return "settings";
      case "pic":
        return "school";
      default:
        return "person";
    }
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${Math.floor(diffHours / 24)}d ago`;
    }
  };

  const handleActionPress = (action: string) => {
    setMenuVisible(false);
    onAction(action);
  };

  const actionMenuItems = [
    {
      id: "activate",
      label: "Activate",
      icon: "checkmark-circle",
      color: "#059669",
      show: !user.is_active,
    },
    {
      id: "deactivate",
      label: "Deactivate",
      icon: "close-circle",
      color: "#DC2626",
      show: user.is_active,
    },
    {
      id: "reset_password",
      label: "Reset Password",
      icon: "key",
      color: "#D97706",
      show: true,
    },
    {
      id: "delete",
      label: "Delete",
      icon: "trash",
      color: "#DC2626",
      show: true,
    },
  ];

  return (
    <View style={styles.card}>
      {/* User Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: `${getRoleColor(user.role)}20` },
            ]}
          >
            <Ionicons
              name={getRoleIcon(user.role)}
              size={20}
              color={getRoleColor(user.role)}
            />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {user.full_name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  user.is_active ? styles.activeBadge : styles.inactiveBadge,
                ]}
              >
                <Ionicons
                  name={user.is_active ? "checkmark-circle" : "close-circle"}
                  size={8}
                  color={user.is_active ? "#059669" : "#DC2626"}
                />
                <Text
                  style={[
                    styles.statusText,
                    user.is_active ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  {user.is_active ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
            </View>
            <Text style={styles.username}>@{user.username}</Text>
            <View style={styles.roleBadge}>
              <Text
                style={[styles.roleText, { color: getRoleColor(user.role) }]}
              >
                {user.role.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Menu */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.actionMenu}>
              {actionMenuItems
                .filter((item) => item.show)
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.actionMenuItem}
                    onPress={() => handleActionPress(item.id)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={16}
                      color={item.color}
                    />
                    <Text
                      style={[styles.actionMenuText, { color: item.color }]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={12} color="#6B7280" />
          <Text style={styles.contactText}>{user.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call" size={12} color="#6B7280" />
          <Text style={styles.contactText}>{user.phone_number}</Text>
        </View>
      </View>

      {/* Assigned Info */}
      {user.role === "admin" && user.sppg && (
        <View style={styles.assignedInfo}>
          <Ionicons name="business" size={12} color="#2563EB" />
          <Text style={styles.assignedText}>SPPG: {user.sppg.sppg_name}</Text>
        </View>
      )}

      {user.role === "pic" && user.school_pic && (
        <View style={styles.assignedInfo}>
          <Ionicons name="school" size={12} color="#7C3AED" />
          <Text style={styles.assignedText}>
            School: {user.school_pic.school_name}
          </Text>
        </View>
      )}

      {/* Stats & Actions */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          {user.stats && (
            <>
              <View style={styles.stat}>
                <Ionicons name="stats-chart" size={12} color="#2563EB" />
                <Text style={styles.statText}>
                  {user.stats.total_activities}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="cube" size={12} color="#059669" />
                <Text style={styles.statText}>
                  {user.stats.total_distributions}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="scan" size={12} color="#7C3AED" />
                <Text style={styles.statText}>{user.stats.total_scans}</Text>
              </View>
            </>
          )}
          <View style={styles.lastLogin}>
            <Ionicons name="time" size={10} color="#9CA3AF" />
            <Text style={styles.lastLoginText}>
              {formatLastLogin(user.last_login_at)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Ionicons name="pencil" size={14} color="#2563EB" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={onViewDetails}
          >
            <Ionicons name="eye" size={14} color="#6B7280" />
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  activeBadge: {
    backgroundColor: "#D1FAE5",
  },
  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "600",
  },
  activeText: {
    color: "#059669",
  },
  inactiveText: {
    color: "#DC2626",
  },
  username: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: "600",
  },
  actionContainer: {
    position: "relative",
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionMenu: {
    position: "absolute",
    top: 36,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 4,
    minWidth: 160,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  actionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderRadius: 4,
  },
  actionMenuText: {
    fontSize: 12,
    fontWeight: "500",
  },
  contactInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: "#6B7280",
  },
  assignedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  assignedText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  lastLogin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  lastLoginText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "500",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
});
