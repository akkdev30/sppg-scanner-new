// app/(owner)/monitoring/config.ts

import React from "react";
import { StyleSheet, Text } from "react-native";

// Column config type
export type TableColumn = {
  key: string;
  label: string;
  width: number;
  render?: (value: any, item?: any) => React.ReactNode;
};

// Filter config type
export type TableFilter = {
  label: string;
  options: Array<{ value: any; label: string }>;
  type?: "select" | "date" | "boolean" | "search" | "number";
};

// Helper functions untuk styling
const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    owner: "#8B5CF6",
    admin: "#3B82F6",
    pic: "#10B981",
  };
  return colors[role?.toLowerCase()] || "#6B7280";
};

const getMenuStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#FEF3C7",
    approved: "#D1FAE5",
    rejected: "#FEE2E2",
    production: "#DBEAFE",
    completed: "#BBF7D0",
  };
  return colors[status?.toLowerCase()] || "#F3F4F6";
};

const getMenuConditionColor = (condition: string) => {
  const colors: Record<string, string> = {
    normal: "#D1FAE5",
    special: "#DBEAFE",
    emergency: "#FEE2E2",
  };
  return colors[condition?.toLowerCase()] || "#F3F4F6";
};

const getDistributionStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#FEF3C7",
    delivered: "#DBEAFE",
    received: "#D1FAE5",
    rejected: "#FEE2E2",
  };
  return colors[status?.toLowerCase()] || "#F3F4F6";
};

const getDistributionConditionColor = (condition: string) => {
  const colors: Record<string, string> = {
    normal: "#D1FAE5",
    damaged: "#FEE2E2",
    shortage: "#FEF3C7",
  };
  return colors[condition?.toLowerCase()] || "#F3F4F6";
};

const getReportStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#FEF3C7",
    investigating: "#DBEAFE",
    resolved: "#D1FAE5",
    rejected: "#FEE2E2",
  };
  return colors[status?.toLowerCase()] || "#F3F4F6";
};

// Export helper functions
export const StatusColors = {
  getRoleColor,
  getMenuStatusColor,
  getMenuConditionColor,
  getDistributionStatusColor,
  getDistributionConditionColor,
  getReportStatusColor,
};

// Styles untuk render function
const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: "500",
    color: "#374151",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: "500",
    color: "white",
  },
  cellText: {
    fontSize: 12,
    color: "#374151",
  },
});

// Render function helpers
const renderRoleBadge = (value: any) => (
  <Text style={[styles.roleBadge, { backgroundColor: getRoleColor(value) }]}>
    {value?.toUpperCase() || "USER"}
  </Text>
);

const renderStatusBadge = (value: any, backgroundColor: string) => (
  <Text style={[styles.statusBadge, { backgroundColor }]}>
    {value ? "Active" : "Inactive"}
  </Text>
);

const renderDate = (value: any) => (
  <Text style={styles.cellText}>
    {value ? new Date(value).toLocaleDateString("id-ID") : "Never"}
  </Text>
);

const renderCreatedAt = (value: any) => (
  <Text style={styles.cellText}>
    {new Date(value).toLocaleDateString("id-ID")}
  </Text>
);

const renderMenuStatus = (value: any) => (
  <Text
    style={[styles.statusBadge, { backgroundColor: getMenuStatusColor(value) }]}
  >
    {value?.toUpperCase() || "PENDING"}
  </Text>
);

const renderMenuCondition = (value: any) => (
  <Text
    style={[
      styles.statusBadge,
      { backgroundColor: getMenuConditionColor(value) },
    ]}
  >
    {value?.toUpperCase() || "NORMAL"}
  </Text>
);

const renderProductionTime = (value: any) => (
  <Text style={styles.cellText}>
    {value
      ? new Date(value).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-"}
  </Text>
);

const renderDistributionStatus = (value: any) => (
  <Text
    style={[
      styles.statusBadge,
      { backgroundColor: getDistributionStatusColor(value) },
    ]}
  >
    {value?.toUpperCase() || "PENDING"}
  </Text>
);

const renderDistributionCondition = (value: any) => (
  <Text
    style={[
      styles.statusBadge,
      { backgroundColor: getDistributionConditionColor(value) },
    ]}
  >
    {value?.toUpperCase() || "NORMAL"}
  </Text>
);

const renderReceivedAt = (value: any) => (
  <Text style={styles.cellText}>
    {value ? new Date(value).toLocaleDateString("id-ID") : "-"}
  </Text>
);

const renderReportStatus = (value: any) => (
  <Text
    style={[
      styles.statusBadge,
      { backgroundColor: getReportStatusColor(value) },
    ]}
  >
    {value?.toUpperCase()}
  </Text>
);

const renderUsedBadge = (value: any) => (
  <Text
    style={[
      styles.statusBadge,
      { backgroundColor: value ? "#FEE2E2" : "#D1FAE5" },
    ]}
  >
    {value ? "Yes" : "No"}
  </Text>
);

const renderDateTime = (value: any) => (
  <Text style={styles.cellText}>{new Date(value).toLocaleString("id-ID")}</Text>
);

const renderTextCell = (value: any) => (
  <Text style={styles.cellText}>{value || "N/A"}</Text>
);

// Config untuk setiap tabel
export const TABLE_CONFIGS: {
  [key: string]: {
    displayName: string;
    icon: string;
    description: string;
    searchableColumns: string[];
    columns: TableColumn[];
    filters?: {
      [key: string]: TableFilter;
    };
    actions?: {
      view?: boolean;
      edit?: boolean;
      delete?: boolean;
      export?: boolean;
    };
  };
} = {
  users: {
    displayName: "Users",
    icon: "people",
    description: "Data pengguna sistem dengan berbagai role",
    searchableColumns: ["username", "full_name", "email", "phone_number"],
    columns: [
      { key: "username", label: "Username", width: 120 },
      { key: "full_name", label: "Full Name", width: 150 },
      { key: "email", label: "Email", width: 150 },
      { key: "phone_number", label: "Phone", width: 120 },
      {
        key: "role",
        label: "Role",
        width: 100,
        render: renderRoleBadge,
      },
      {
        key: "is_active",
        label: "Status",
        width: 80,
        render: (value: any) =>
          renderStatusBadge(value, value ? "#D1FAE5" : "#FEE2E2"),
      },
      {
        key: "last_login_at",
        label: "Last Login",
        width: 120,
        render: renderDate,
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: renderCreatedAt,
      },
    ],
    filters: {
      role: {
        label: "Role",
        type: "select",
        options: [
          { value: "owner", label: "Owner" },
          { value: "admin", label: "Admin" },
          { value: "pic", label: "PIC" },
        ],
      },
      is_active: {
        label: "Status",
        type: "boolean",
        options: [
          { value: true, label: "Active" },
          { value: false, label: "Inactive" },
        ],
      },
    },
    actions: {
      view: true,
      edit: true,
      delete: true,
      export: true,
    },
  },
  sppg_masters: {
    displayName: "SPPG Masters",
    icon: "business",
    description: "Data penyedia makanan (Supplier/Pusat Produksi)",
    searchableColumns: [
      "sppg_code",
      "sppg_name",
      "email",
      "phone_number",
      "address",
    ],
    columns: [
      { key: "sppg_code", label: "SPPG Code", width: 120 },
      { key: "sppg_name", label: "SPPG Name", width: 150 },
      { key: "address", label: "Address", width: 180 },
      { key: "phone_number", label: "Phone", width: 120 },
      { key: "email", label: "Email", width: 150 },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: renderCreatedAt,
      },
      {
        key: "updated_at",
        label: "Updated",
        width: 120,
        render: renderCreatedAt,
      },
    ],
    filters: {},
    actions: {
      view: true,
      edit: true,
      export: true,
    },
  },
  schools: {
    displayName: "Schools",
    icon: "school",
    description: "Data sekolah penerima distribusi",
    searchableColumns: ["school_code", "name", "address"],
    columns: [
      { key: "school_code", label: "School Code", width: 120 },
      { key: "name", label: "School Name", width: 180 },
      { key: "address", label: "Address", width: 200 },
      { key: "total_students", label: "Students", width: 100 },
      {
        key: "sppg_name",
        label: "SPPG",
        width: 120,
        render: renderTextCell,
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: renderCreatedAt,
      },
    ],
    filters: {
      sppg_id: {
        label: "SPPG",
        type: "select",
        options: [], // Akan diisi dinamis
      },
    },
    actions: {
      view: true,
      edit: true,
      export: true,
    },
  },
  school_pics: {
    displayName: "School PICs",
    icon: "person",
    description: "Penanggung jawab sekolah",
    searchableColumns: ["name", "email", "phone_number", "position"],
    columns: [
      { key: "name", label: "Name", width: 150 },
      { key: "school_name", label: "School", width: 150 },
      { key: "position", label: "Position", width: 120 },
      { key: "phone_number", label: "Phone", width: 120 },
      { key: "email", label: "Email", width: 150 },
      {
        key: "is_active",
        label: "Status",
        width: 80,
        render: (value: any) =>
          renderStatusBadge(value, value ? "#D1FAE5" : "#FEE2E2"),
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: renderCreatedAt,
      },
    ],
    filters: {
      is_active: {
        label: "Status",
        type: "boolean",
        options: [
          { value: true, label: "Active" },
          { value: false, label: "Inactive" },
        ],
      },
      school_id: {
        label: "School",
        type: "select",
        options: [], // Akan diisi dinamis
      },
    },
    actions: {
      view: true,
      edit: true,
      export: true,
    },
  },
  menus: {
    displayName: "Menus",
    icon: "calendar",
    description: "Jadwal produksi menu harian",
    searchableColumns: ["menu_code", "menu_name", "notes"],
    columns: [
      { key: "menu_code", label: "Menu Code", width: 120 },
      { key: "menu_name", label: "Menu Name", width: 150 },
      { key: "sppg_name", label: "SPPG", width: 120 },
      {
        key: "scheduled_date",
        label: "Scheduled Date",
        width: 120,
        render: renderCreatedAt,
      },
      {
        key: "production_time",
        label: "Production Time",
        width: 120,
        render: renderProductionTime,
      },
      { key: "production_portion", label: "Portion", width: 100 },
      {
        key: "status",
        label: "Status",
        width: 100,
        render: renderMenuStatus,
      },
      {
        key: "condition",
        label: "Condition",
        width: 100,
        render: renderMenuCondition,
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: renderCreatedAt,
      },
    ],
    filters: {
      status: {
        label: "Status",
        type: "select",
        options: [
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "production", label: "Production" },
          { value: "completed", label: "Completed" },
        ],
      },
      condition: {
        label: "Condition",
        type: "select",
        options: [
          { value: "normal", label: "Normal" },
          { value: "special", label: "Special" },
          { value: "emergency", label: "Emergency" },
        ],
      },
      sppg_id: {
        label: "SPPG",
        type: "select",
        options: [], // Akan diisi dinamis
      },
      scheduled_date: {
        label: "Date Range",
        type: "date",
        options: [],
      },
    },
    actions: {
      view: true,
      edit: true,
      export: true,
    },
  },
  school_menu_distribution: {
    displayName: "Distribution",
    icon: "car",
    description: "Alokasi dan penerimaan menu ke sekolah",
    searchableColumns: ["menu_name", "school_name", "received_notes"],
    columns: [
      { key: "id", label: "ID", width: 80 },
      { key: "menu_name", label: "Menu", width: 150 },
      { key: "school_name", label: "School", width: 150 },
      { key: "allocated_portion", label: "Allocated", width: 100 },
      { key: "received_portion", label: "Received", width: 100 },
      {
        key: "received_status",
        label: "Status",
        width: 100,
        render: renderDistributionStatus,
      },
      {
        key: "received_condition",
        label: "Condition",
        width: 100,
        render: renderDistributionCondition,
      },
      {
        key: "received_at",
        label: "Received At",
        width: 140,
        render: renderReceivedAt,
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: renderCreatedAt,
      },
    ],
    filters: {
      received_status: {
        label: "Status",
        type: "select",
        options: [
          { value: "pending", label: "Pending" },
          { value: "delivered", label: "Delivered" },
          { value: "received", label: "Received" },
          { value: "rejected", label: "Rejected" },
        ],
      },
      received_condition: {
        label: "Condition",
        type: "select",
        options: [
          { value: "normal", label: "Normal" },
          { value: "damaged", label: "Damaged" },
          { value: "shortage", label: "Shortage" },
        ],
      },
      menu_id: {
        label: "Menu",
        type: "select",
        options: [], // Akan diisi dinamis
      },
      school_id: {
        label: "School",
        type: "select",
        options: [], // Akan diisi dinamis
      },
    },
    actions: {
      view: true,
      export: true,
    },
  },
  problem_reports: {
    displayName: "Problem Reports",
    icon: "warning",
    description: "Laporan masalah dalam distribusi",
    searchableColumns: [
      "problem_type",
      "description",
      "resolution_notes",
      "reported_by_name",
    ],
    columns: [
      { key: "problem_type", label: "Type", width: 120 },
      {
        key: "status",
        label: "Status",
        width: 120,
        render: renderReportStatus,
      },
      { key: "description", label: "Description", width: 200 },
      { key: "reported_by_name", label: "Reported By", width: 120 },
      {
        key: "created_at",
        label: "Reported",
        width: 120,
        render: renderCreatedAt,
      },
      {
        key: "resolved_at",
        label: "Resolved",
        width: 120,
        render: renderReceivedAt,
      },
    ],
    filters: {
      status: {
        label: "Status",
        type: "select",
        options: [
          { value: "pending", label: "Pending" },
          { value: "investigating", label: "Investigating" },
          { value: "resolved", label: "Resolved" },
          { value: "rejected", label: "Rejected" },
        ],
      },
      problem_type: {
        label: "Problem Type",
        type: "select",
        options: [
          { value: "quality", label: "Quality" },
          { value: "quantity", label: "Quantity" },
          { value: "delivery", label: "Delivery" },
          { value: "other", label: "Other" },
        ],
      },
    },
    actions: {
      view: true,
      edit: true,
      export: true,
    },
  },
  qr_codes: {
    displayName: "QR Codes",
    icon: "qr-code",
    description: "Kode QR untuk verifikasi distribusi",
    searchableColumns: ["qr_code_data", "reference_type", "reference_id"],
    columns: [
      { key: "qr_code_data", label: "QR Data", width: 180 },
      {
        key: "school_menu_distribution_id",
        label: "Distribution ID",
        width: 100,
      },
      {
        key: "is_used",
        label: "Used",
        width: 80,
        render: renderUsedBadge,
      },
      {
        key: "generated_at",
        label: "Generated",
        width: 140,
        render: renderCreatedAt,
      },
      {
        key: "used_at",
        label: "Used At",
        width: 140,
        render: renderReceivedAt,
      },
      {
        key: "expires_at",
        label: "Expires",
        width: 140,
        render: renderReceivedAt,
      },
    ],
    filters: {
      is_used: {
        label: "Usage Status",
        type: "boolean",
        options: [
          { value: true, label: "Used" },
          { value: false, label: "Unused" },
        ],
      },
    },
    actions: {
      view: true,
      export: true,
    },
  },
  scan_logs: {
    displayName: "Scan Logs",
    icon: "scan",
    description: "Log pemindaian QR code",
    searchableColumns: ["scanned_by_name", "device_info"],
    columns: [
      { key: "qr_code_data", label: "QR Code", width: 150 },
      { key: "scanned_by_name", label: "Scanned By", width: 120 },
      {
        key: "scanned_at",
        label: "Scanned At",
        width: 140,
        render: renderDateTime,
      },
      {
        key: "created_at",
        label: "Created",
        width: 140,
        render: renderCreatedAt,
      },
    ],
    filters: {
      date_range: {
        label: "Date Range",
        type: "date",
        options: [],
      },
    },
    actions: {
      view: true,
      export: true,
    },
  },
  activity_logs: {
    displayName: "Activity Logs",
    icon: "analytics",
    description: "Log aktivitas pengguna dalam sistem",
    searchableColumns: [
      "activity_type",
      "description",
      "user_name",
      "ip_address",
    ],
    columns: [
      { key: "user_name", label: "User", width: 120 },
      { key: "activity_type", label: "Activity Type", width: 120 },
      { key: "description", label: "Description", width: 200 },
      { key: "ip_address", label: "IP Address", width: 120 },
      {
        key: "created_at",
        label: "Timestamp",
        width: 160,
        render: renderDateTime,
      },
    ],
    filters: {
      activity_type: {
        label: "Activity Type",
        type: "select",
        options: [
          { value: "login", label: "Login" },
          { value: "logout", label: "Logout" },
          { value: "create", label: "Create" },
          { value: "update", label: "Update" },
          { value: "delete", label: "Delete" },
          { value: "view", label: "View" },
        ],
      },
      user_id: {
        label: "User",
        type: "select",
        options: [], // Akan diisi dinamis
      },
      date_range: {
        label: "Date Range",
        type: "date",
        options: [],
      },
    },
    actions: {
      view: true,
      export: true,
    },
  },
  monitoring_logs: {
    displayName: "Monitoring Logs",
    icon: "shield-checkmark",
    description: "Log perubahan data",
    searchableColumns: ["table_name", "action_type", "performed_by_name"],
    columns: [
      { key: "action_type", label: "Action", width: 100 },
      { key: "table_name", label: "Table", width: 120 },
      { key: "record_id", label: "Record ID", width: 100 },
      { key: "performed_by_name", label: "Performed By", width: 120 },
      { key: "ip_address", label: "IP Address", width: 120 },
      {
        key: "performed_at",
        label: "Timestamp",
        width: 160,
        render: renderDateTime,
      },
    ],
    filters: {
      action_type: {
        label: "Action Type",
        type: "select",
        options: [
          { value: "INSERT", label: "Create" },
          { value: "UPDATE", label: "Update" },
          { value: "DELETE", label: "Delete" },
        ],
      },
      table_name: {
        label: "Table Name",
        type: "select",
        options: [
          { value: "users", label: "Users" },
          { value: "sppg_masters", label: "SPPG Masters" },
          { value: "schools", label: "Schools" },
          { value: "menus", label: "Menus" },
          { value: "school_menu_distribution", label: "Distribution" },
        ],
      },
      date_range: {
        label: "Date Range",
        type: "date",
        options: [],
      },
    },
    actions: {
      view: true,
      export: true,
    },
  },
};

const getTableColor = (tableId: string) => {
  const colors: Record<string, string> = {
    users: "#3B82F6",
    sppg_masters: "#10B981",
    schools: "#8B5CF6",
    school_pics: "#F59E0B",
    menus: "#F97316",
    school_menu_distribution: "#EF4444",
    problem_reports: "#DC2626",
    qr_codes: "#6366F1",
    scan_logs: "#06B6D4",
    activity_logs: "#0EA5E9",
    monitoring_logs: "#84CC16",
  };
  return colors[tableId] || "#6B7280";
};

// Export list tabel yang tersedia untuk halaman index
export const AVAILABLE_TABLES = Object.entries(TABLE_CONFIGS).map(
  ([id, config]) => ({
    id,
    name: config.displayName,
    description: config.description,
    icon: config.icon,
    color: getTableColor(id),
  }),
);

// Export fungsi untuk mendapatkan config berdasarkan table name
export const getTableConfig = (tableName: string) => {
  return (
    TABLE_CONFIGS[tableName] || {
      displayName: tableName,
      icon: "grid",
      description: "Data monitoring table",
      searchableColumns: [],
      columns: [],
      actions: { view: true },
    }
  );
};

// Export default config
export default TABLE_CONFIGS;
