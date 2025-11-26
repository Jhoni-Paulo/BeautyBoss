
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED'
}

export interface Service {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  durationMinutes: number; // Mapped from duration_minutes
  color: string;
}

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  avatarUrl: string; // Mapped from avatar_url
  totalVisits?: number; // Calculated on frontend for now
  lastVisit?: string; // Calculated on frontend
  notes?: string;
  requiresDeposit?: boolean; // Mapped from requires_deposit
}

export interface Appointment {
  id: string;
  user_id?: string;
  clientId?: string; // Mapped from client_id (Now Optional)
  serviceId?: string; // Mapped from service_id (Now Optional)
  customDuration?: number; // Mapped from custom_duration (New)
  date: string; // ISO Date string
  status: AppointmentStatus;
  notes?: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  description: string;
  category: string;
}

export interface DepositConfig {
  enabled: boolean;
  percentage: number;
  scope: 'ALL' | 'NEW' | 'SPECIFIC';
}

export interface UserConfig {
  businessName: string; // Mapped from business_name
  businessPhone?: string; // Mapped from phone (New)
  startHour: number; // start_hour
  endHour: number; // end_hour
  depositConfig?: DepositConfig;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

// Helper types for UI
export type PageView = 'DASHBOARD' | 'SCHEDULE' | 'CLIENTS' | 'FINANCE' | 'SETTINGS' | 'PUBLIC_BOOKING';