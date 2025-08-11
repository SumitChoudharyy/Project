export interface Complaint {
  complaintId: string;
  customerId: string;
  bookingId?: string;
  title?: string;
  description: string;
  category?: ComplaintCategory;
  priority?: Priority;
  status: ComplaintStatus;
  assignedStaffId?: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  resolvedAt?: string;
  attachments?: string[];
  actions?: ComplaintAction[];
}

export interface ComplaintRequest {
  customerId: string;
  description: string;
}

export enum ComplaintStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED'
}

// Legacy interfaces for backward compatibility
export interface ComplaintLegacy {
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
  actions?: ComplaintAction[];
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

export enum ComplaintStatusLegacy {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed'
}

export enum ComplaintActionType {
  STEP = 'step',
  COMMUNICATION = 'communication',
  INTERNAL_NOTE = 'internal_note',
  STATUS_UPDATE = 'status_update'
}

export interface ComplaintAction {
  id: string;
  staffId: string;
  type: ComplaintActionType;
  message: string;
  createdAt: Date;
}