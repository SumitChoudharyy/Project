export interface Complaint {
  id: string;
  customerId: string;
  bookingId?: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  assignedStaffId?: string;
  createdAt: Date;
  updatedAt: Date;
  resolution?: string;
  resolvedAt?: Date;
  attachments?: string[];
}

export enum ComplaintCategory {
  ROOM = 'room',
  SERVICE = 'service',
  BILLING = 'billing',
  AMENITIES = 'amenities',
  STAFF = 'staff',
  OTHER = 'other'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ComplaintStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}