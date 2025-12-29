
// Defines the possible statuses for a work item.
export type Status = 'UNDER PROCESSING' | 'Approved' | 'Rejected' | 'Waiting Delivery' | 'PAID ONLY' | 'PENDING' | string;

// Defines the structure of a work item.
export interface WorkItem {
  id?: string; // ID is now optional and will be a string from Firestore
  dateOfWork: string; // Storing date as ISO string
  workBy: string;
  workOfType: string;
  status: Status;
  customerName: string;
  passportNumber: string;
  trackingNumber: string;
  mobileWhatsappNumber: string;
  dayCount: number;
  salesPrice: number;
  advance: number;
  due: number;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: string;
  customerCalled?: boolean;
  fingerprintDate?: string; // New field for fingerprint appointments
}

// Defines the structure of a reminder item.
export interface Reminder {
    id?: string;
    title: string;
    note?: string;
    reminderDate: string; // ISO date string
    isCompleted: boolean;
    createdAt: string; // ISO datetime string
    workItemId?: string; // Optional link to a work item
}

// Defines the structure for a work type configuration, including an optional tracking URL.
export interface WorkTypeConfig {
  name: string;
  trackingUrl?: string;
}