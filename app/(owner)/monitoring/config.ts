import { StyleSheet } from "react-native";

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
  type?: 'select' | 'date' | 'boolean' | 'search';
};

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
      { key: "email", label: "Email", width: 180 },
      { 
        key: "role", 
        label: "Role", 
        width: 100,
        render: (value) => (
          <Text style={[styles.roleBadge, { backgroundColor: getRoleColor(value) }]}>
            {value?.toUpperCase() || "USER"}
          </Text>
        ),
      },
      {
        key: "is_active",
        label: "Status",
        width: 80,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: value ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            {value ? "Active" : "Inactive"}
          </Text>
        ),
      },
      {
        key: "last_login",
        label: "Last Login",
        width: 140,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {value ? new Date(value).toLocaleDateString("id-ID") : "Never"}
          </Text>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
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
          { value: "school_pic", label: "School PIC" },
          { value: "sppg_pic", label: "SPPG PIC" },
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
    searchableColumns: ["sppg_code", "sppg_name", "email", "phone_number", "address"],
    columns: [
      { key: "sppg_code", label: "SPPG Code", width: 120 },
      { key: "sppg_name", label: "SPPG Name", width: 180 },
      { key: "address", label: "Address", width: 200 },
      { key: "phone_number", label: "Phone", width: 120 },
      { key: "email", label: "Email", width: 180 },
      {
        key: "is_active",
        label: "Status",
        width: 80,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: value ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            {value ? "Active" : "Inactive"}
          </Text>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
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
    },
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
    searchableColumns: ["school_code", "name", "address", "phone_number"],
    columns: [
      { key: "school_code", label: "School Code", width: 120 },
      { key: "name", label: "School Name", width: 200 },
      { key: "address", label: "Address", width: 220 },
      { key: "phone_number", label: "Phone", width: 120 },
      { key: "total_students", label: "Students", width: 100 },
      {
        key: "is_active",
        label: "Status",
        width: 80,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: value ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            {value ? "Active" : "Inactive"}
          </Text>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
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
    searchableColumns: ["menu_code", "menu_name", "notes", "description"],
    columns: [
      { key: "menu_code", label: "Menu Code", width: 120 },
      { key: "menu_name", label: "Menu Name", width: 180 },
      {
        key: "scheduled_date",
        label: "Date",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: 100,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: getMenuStatusColor(value) },
            ]}
          >
            {value?.toUpperCase()}
          </Text>
        ),
      },
      { key: "production_portion", label: "Portion", width: 100 },
      { key: "sppg_name", label: "SPPG", width: 120 },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
      },
    ],
    filters: {
      status: {
        label: "Status",
        type: "select",
        options: [
          { value: "draft", label: "Draft" },
          { value: "scheduled", label: "Scheduled" },
          { value: "production", label: "Production" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
      sppg_id: {
        label: "SPPG",
        type: "select",
        options: [], // Will be populated dynamically
      },
      scheduled_date: {
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
  school_menu_distribution: {
    displayName: "Distribution",
    icon: "car",
    description: "Alokasi dan penerimaan menu ke sekolah",
    searchableColumns: ["notes", "received_notes", "school_name", "menu_name"],
    columns: [
      { key: "id", label: "ID", width: 80 },
      { key: "school_name", label: "School", width: 150 },
      { key: "menu_name", label: "Menu", width: 150 },
      { key: "allocated_portion", label: "Allocated", width: 100 },
      { key: "received_portion", label: "Received", width: 100 },
      {
        key: "received_status",
        label: "Status",
        width: 120,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: getDistributionStatusColor(value) },
            ]}
          >
            {value?.toUpperCase()}
          </Text>
        ),
      },
      {
        key: "received_at",
        label: "Received At",
        width: 140,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {value ? new Date(value).toLocaleDateString("id-ID") : "-"}
          </Text>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
      },
    ],
    filters: {
      received_status: {
        label: "Status",
        type: "select",
        options: [
          { value: "pending", label: "Pending" },
          { value: "allocated", label: "Allocated" },
          { value: "delivered", label: "Delivered" },
          { value: "received", label: "Received" },
          { value: "rejected", label: "Rejected" },
        ],
      },
      school_id: {
        label: "School",
        type: "select",
        options: [], // Will be populated dynamically
      },
      menu_id: {
        label: "Menu",
        type: "select",
        options: [], // Will be populated dynamically
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
    searchableColumns: ["problem_type", "description", "resolution_notes", "reported_by"],
    columns: [
      { key: "problem_type", label: "Type", width: 120 },
      {
        key: "status",
        label: "Status",
        width: 120,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: getReportStatusColor(value) },
            ]}
          >
            {value?.toUpperCase()}
          </Text>
        ),
      },
      { key: "description", label: "Description", width: 200 },
      { key: "reported_by", label: "Reported By", width: 120 },
      {
        key: "created_at",
        label: "Reported",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
      },
      {
        key: "resolved_at",
        label: "Resolved",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {value ? new Date(value).toLocaleDateString("id-ID") : "-"}
          </Text>
        ),
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
          { value: "closed", label: "Closed" },
        ],
      },
      problem_type: {
        label: "Problem Type",
        type: "select",
        options: [
          { value: "quality", label: "Quality Issue" },
          { value: "quantity", label: "Quantity Issue" },
          { value: "delivery", label: "Delivery Issue" },
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
      { key: "reference_type", label: "Reference Type", width: 120 },
      { key: "reference_id", label: "Reference ID", width: 100 },
      {
        key: "is_used",
        label: "Used",
        width: 80,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: value ? "#FEE2E2" : "#D1FAE5" },
            ]}
          >
            {value ? "Yes" : "No"}
          </Text>
        ),
      },
      {
        key: "generated_at",
        label: "Generated",
        width: 140,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
      },
      {
        key: "used_at",
        label: "Used At",
        width: 140,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {value ? new Date(value).toLocaleDateString("id-ID") : "-"}
          </Text>
        ),
      },
      {
        key: "expires_at",
        label: "Expires",
        width: 140,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
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
      reference_type: {
        label: "Reference Type",
        type: "select",
        options: [
          { value: "distribution", label: "Distribution" },
          { value: "menu", label: "Menu" },
          { value: "school", label: "School" },
        ],
      },
    },
    actions: {
      view: true,
      export: true,
    },
  },
  // Tabel tambahan yang mungkin dibutuhkan
  menu_items: {
    displayName: "Menu Items",
    icon: "restaurant",
    description: "Item menu makanan yang tersedia",
    searchableColumns: ["item_name", "description", "category"],
    columns: [
      { key: "item_code", label: "Item Code", width: 120 },
      { key: "item_name", label: "Item Name", width: 180 },
      { key: "category", label: "Category", width: 120 },
      { key: "unit", label: "Unit", width: 80 },
      {
        key: "is_active",
        label: "Status",
        width: 80,
        render: (value: any) => (
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: value ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            {value ? "Active" : "Inactive"}
          </Text>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        width: 120,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleDateString("id-ID")}
          </Text>
        ),
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
      category: {
        label: "Category",
        type: "select",
        options: [], // Will be populated dynamically
      },
    },
    actions: {
      view: true,
      edit: true,
      export: true,
    },
  },
  activity_logs: {
    displayName: "Activity Logs",
    icon: "analytics",
    description: "Log aktivitas pengguna dalam sistem",
    searchableColumns: ["action", "description", "user_name", "ip_address"],
    columns: [
      { key: "action", label: "Action", width: 120 },
      { key: "description", label: "Description", width: 200 },
      { key: "user_name", label: "User", width: 120 },
      { key: "ip_address", label: "IP Address", width: 120 },
      {
        key: "created_at",
        label: "Timestamp",
        width: 160,
        render: (value: any) => (
          <Text style={styles.cellText}>
            {new Date(value).toLocaleString("id-ID")}
          </Text>
        ),
      },
    ],
    filters: {
      action: {
        label: "Action Type",
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
        options: [], // Will be populated dynamically
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

// Helper functions untuk styling
const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    owner: "#8B5CF6",
    admin: "#3B82F6",
    pic: "#10B981",
    school_pic: "#F59E0B",
    sppg_pic: "#EF4444",
  };
  return colors[role?.toLowerCase()] || "#6B7280";
};

const getMenuStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "#F3F4F6",
    scheduled: "#DBEAFE",
    production: "#E0F2FE",
    completed: "#D1FAE5",
    cancelled: "#FEE2E2",
  };
  return colors[status?.toLowerCase()] || "#F3F4F6";
};

const getDistributionStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#FEF3C7",
    allocated: "#DBEAFE",
    delivered: "#E0F2FE",
    received: "#D1FAE5",
    rejected: "#FEE2E2",
  };
  return colors[status?.toLowerCase()] || "#F3F4F6";
};

const getReportStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#FEF3C7",
    investigating: "#DBEAFE",
    resolved: "#D1FAE5",
    closed: "#E5E7EB",
  };
  return colors[status?.toLowerCase()] || "#F3F4F6";
};

// Export helper functions
export const StatusColors = {
  getRoleColor,
  getMenuStatusColor,
  getDistributionStatusColor,
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

// Untuk import di komponen React, kita perlu membuat Text component tersedia
import { Text } from "react-native";

// Export default config
export default TABLE_CONFIGS;

// Export fungsi untuk mendapatkan config berdasarkan table name
export const getTableConfig = (tableName: string) => {
  return TABLE_CONFIGS[tableName] || {
    displayName: tableName,
    icon: "grid",
    description: "Data monitoring table",
    searchableColumns: [],
    columns: [],
    actions: { view: true },
  };
};

// Export list tabel yang tersedia untuk halaman index
export const AVAILABLE_TABLES = Object.keys(TABLE_CONFIGS).map((key) => ({
  id: key,
  name: TABLE_CONFIGS[key].displayName,
  description: TABLE_CONFIGS[key].description,
  icon: TABLE_CONFIGS[key].icon,
  color: getTableColor(key),
}));

const getTableColor = (tableId: string) => {
  const colors: Record<string, string> = {
    users: "#3B82F6",
    sppg_masters: "#10B981",
    schools: "#8B5CF6",
    menus: "#F59E0B",
    school_menu_distribution: "#EF4444",
    problem_reports: "#DC2626",
    qr_codes: "#6366F1",
    menu_items: "#EC4899",
    activity_logs: "#14B8A6",
  };
  return colors[tableId] || "#6B7280";
};

// Export tipe untuk TypeScript
export type TableConfigType = typeof TABLE_CONFIGS;
export type TableName = keyof TableConfigType;