// Defines the possible statuses for a work item.
export type Status = 'UNDER PROCESSING' | 'Approved' | 'Rejected' | 'Waiting Delivery' | 'PAID ONLY' | string;

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
}