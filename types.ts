
export enum UserRole {
  SUPERVISOR = 'SUPERVISOR',
  ENGINEER = 'ENGINEER',
  QUANTITY_SURVEYOR = 'QUANTITY_SURVEYOR',
  PROCUREMENT_MANAGER = 'PROCUREMENT_MANAGER',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approvalLimit?: number;
  canEditPOPrices?: boolean; // صلاحية تعديل الأسعار بعد الإصدار
}

export interface Project {
  id: string;
  name: string;
  code: string;
  budget: number;
  spent: number;
  status: string;
  levelsCount: number;
  assignedUserIds: string[];
  scheduledQuantities: ProjectItemQuantity[];
}

export interface ProjectItemQuantity {
  itemId: string;
  totalQuantity: number;
  receivedQuantity: number;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  unit: string;
  categoryId: string;
  basePrice: number;
  aliases: string[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  rating: number;
}

export enum RequestStatus {
  DRAFT = 'DRAFT',
  PENDING_TECHNICAL = 'PENDING_TECHNICAL',
  APPROVED_TECHNICAL = 'APPROVED_TECHNICAL',
  IN_PROCUREMENT = 'IN_PROCUREMENT',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum POStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT_TO_SUPPLIER = 'SENT_TO_SUPPLIER',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export interface MaterialRequest {
  id: string;
  projectId: string;
  requesterId: string;
  status: RequestStatus;
  createdAt: string;
  items: {
    itemId: string;
    quantity: number;
    notes?: string;
    aliasUsed?: string;
  }[];
}
