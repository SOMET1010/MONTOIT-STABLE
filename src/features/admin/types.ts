/**
 * Types TypeScript pour la feature Admin
 * Administration et supervision de la plateforme
 */

/**
 * Utilisateur avec permissions administrateur
 */
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  permissions: AdminPermission[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Permission administrative
 */
export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'properties' | 'contracts' | 'payments' | 'system';
}

/**
 * Statistiques de la plateforme
 */
export interface PlatformStats {
  total_users: number;
  active_users: number;
  total_properties: number;
  active_listings: number;
  total_contracts: number;
  active_contracts: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_applications: number;
  pending_verifications: number;
  open_disputes: number;
}

/**
 * Session d'audit
 */
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Système de maintenance
 */
export interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  affected_services: string[];
  notification_sent: boolean;
  created_at: string;
}

/**
 * Configuration système
 */
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: 'general' | 'security' | 'email' | 'payment' | 'features';
  is_public: boolean;
  updated_by: string;
  updated_at: string;
}

/**
 * Alertes système
 */
export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

/**
 * Export des types pour imports
 */
export type {
  AdminUser,
  AdminPermission,
  PlatformStats,
  AuditLog,
  MaintenanceWindow,
  SystemConfig,
  SystemAlert
};