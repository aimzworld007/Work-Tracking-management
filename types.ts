// Defines the possible statuses for a work item.
export type Status = 'UNDER PROCESSING' | 'Approved' | 'Rejected' | 'Waiting Delivery' | string;

// Defines the structure of a work item.
export interface WorkItem {
  id?: string; // ID is now optional and will be a string from Firestore
  dateOfWork: string; // Storing date as a string in 'YYYY-MM-DD' format
  workBy: string;
  workOfType: string;
  status: Status;
  customerName: string;
  passportNumber: string;
  trackingNumber: string;
  mobileWhatsappNumber: string;
  dayCount: number;
  isArchived: boolean;
}