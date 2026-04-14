// Enums matching Prisma schema
export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  SUPERIOR = 'SUPERIOR',
  PIC = 'PIC',
}

export enum PipelineStatus {
  NEW_LEAD = 'NEW_LEAD',
  CONTACTED = 'CONTACTED',
  IN_DISCUSSION = 'IN_DISCUSSION',
  PITCHING = 'PITCHING',
  NEGOTIATION = 'NEGOTIATION',
  ON_HOLD = 'ON_HOLD',
  DEAL = 'DEAL',
  LOST = 'LOST',
}

export enum ActivityType {
  CALL = 'CALL',
  CHAT = 'CHAT',
  VISIT = 'VISIT',
}

// Entity interfaces
export interface User {
  id: string;
  nama: string;
  employeeId: string;
  phoneNumber: string;
  role: Role;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TipeLead {
  id: string;
  nama: string;
  createdAt: string;
  createdBy: string;
}

export interface Lead {
  id: string;
  namaEo: string;
  tipeId: string;
  alamat: string;
  speciality: string | null;
  linkSosmed: string | null;
  lastActivityDate: string | null;
  lastActivityType: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tipe?: TipeLead;
  contacts?: ContactPerson[];
  assignments?: Assignment[];
  statuses?: LeadStatus[];
  activities?: Activity[];
}

export interface ContactPerson {
  id: string;
  leadId: string;
  nama: string;
  noTelp: string;
  jabatan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  leadId: string;
  picId: string;
  isActive: boolean;
  assignedAt: string;
  reassignedAt: string | null;
  reassignedNotes: string | null;
  assignedBy: string;
  pic?: User;
}

export interface LeadStatus {
  id: string;
  leadId: string;
  status: PipelineStatus;
  updatedAt: string;
  updatedBy: string;
  updater?: User;
}

export interface Activity {
  id: string;
  leadId: string;
  createdBy: string;
  activityType: ActivityType;
  notes: string;
  nextFollowUpDate: string;
  evidencePath: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: User;
}

export interface AuditTrail {
  id: string;
  entityName: string;
  entityId: string;
  changedBy: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  changeTime: string;
  changer?: User;
}

// Generic paginated result
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface AuthUser {
  userId: string;
  role: Role;
  employeeId: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
