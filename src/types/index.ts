/**
 * ARCHITECTURE & FLOW: types/index.ts
 * 
 * The single source of truth for all data shapes in the application.
 * Every object fetched from Firestore should be cast to one of these interfaces.
 */
export type Role = "admin" | "resident" | "guard";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date | string | null;
  phone?: string;
  flatNumber?: string;
  isActive?: boolean;
}

export interface Complaint {
  id?: string;
  title: string;
  description: string;
  status: "pending" | "resolved" | "in_progress";
  reportedBy: string; // User ID
  createdAt: Date | string | null;
}

export interface Notice {
  id?: string;
  title: string;
  content: string;
  isImportant: boolean;
  postedBy: string;
  createdAt: any;
}

export interface VisitorPass {
  id: string;
  passCode: string; // 6-digit alphanumeric code
  visitorName: string;
  visitorType: 'guest' | 'delivery' | 'service';
  expectedDate: string; // YYYY-MM-DD
  generatedBy: string; // Resident UID
  status: 'active' | 'used' | 'expired';
  createdAt: any;
}

export interface GateLog {
  id: string;
  visitorName: string;
  passId?: string; // Optional if walk-in
  entryTime: any;
  exitTime?: any;
  loggedBy: string; // Guard UID
  hostId?: string; // Resident UID they are visiting
}

export interface Expense {
  id?: string;
  title: string;
  amount: number;
  date: Date | string | null;
  recordedBy: string;
}

export interface MaintenanceBill {
  id?: string;
  userId: string;
  amount: number;
  month: string; // e.g., "July 2026"
  status: "paid" | "unpaid";
  dueDate: Date | string | null;
}
