export type Status = string;

export interface WorkItem {
  id: number;
  dateOfWork: Date;
  workBy: string;
  workOfType: string;
  status: Status;
  customerName: string;
  trackingNumber: string;
  ppNumber: string;
  customerNumber: string;
  dayCount: number;
  notes?: string;
}