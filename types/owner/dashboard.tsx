// types/dashboard.ts
export interface SystemHealth {
  database: {
    status: "healthy" | "warning" | "critical";
    response_time: number;
    tables_count: number;
    connection_count: number;
  };
  services: {
    authentication: {
      status: "up" | "down";
      uptime: number;
    };
    api_gateway: {
      status: "up" | "down";
      request_count: number;
    };
    notification: {
      status: "up" | "down";
      queue_size: number;
    };
  };
  last_check: string;
}

export interface RealTimeStats {
  active_users: {
    total: number;
    by_role: {
      owner: number;
      admin: number;
      pic: number;
    };
    last_24h_active: number;
  };
  distributions: {
    total_today: number;
    pending: number;
    in_progress: number;
    completed: number;
    problematic: number;
  };
  problems: {
    total_open: number;
    critical: number;
    warning: number;
    resolved_today: number;
  };
  schools: {
    total: number;
    active_today: number;
    with_distributions: number;
  };
  sppgs: {
    total: number;
    active_today: number;
    menus_today: number;
  };
}

export interface PerformanceMetrics {
  efficiency_score: number;
  distribution_efficiency: number;
  problem_resolution_rate: number;
  user_satisfaction: number;
  response_times: {
    api: number;
    database: number;
    authentication: number;
  };
  uptime: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
}

export interface DashboardData {
  system_health: SystemHealth;
  real_time_stats: RealTimeStats;
  performance_metrics: PerformanceMetrics;
  recent_activities: {
    id: string;
    user: string;
    role: string;
    activity: string;
    timestamp: string;
    details?: string;
  }[];
  alerts: {
    id: string;
    level: "critical" | "warning" | "info";
    title: string;
    message: string;
    timestamp: string;
  }[];
}
