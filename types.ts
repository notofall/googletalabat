
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
  canEditPOPrices?: boolean;
  department?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  ownerName: string;
  costCenterId: string;
  budget: number;
  spent: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'ON_HOLD';
  assignedUserIds: string[];
}

/**
 * BOQ Item for monitoring quantity limits
 */
export interface ProjectBOQ {
  itemId: string;
  totalQuantity: number;
  receivedQuantity: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'AUTH' | 'PROCUREMENT' | 'PROJECTS' | 'SYSTEM';
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
  requesterName: string;
  projectName: string;
  status: RequestStatus;
  createdAt: string;
  items: RequestItem[];
}

export interface RequestItem {
  id: string;
  itemId: string;
  name: string;
  unit: string;
  quantity: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  requestId: string;
  projectId: string;
  projectName: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  totalAmount: number;
  createdAt: string;
  items: POItem[];
}

export interface POItem {
  id: string;
  itemId: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  receivedQuantity: number;
}

export interface Receipt {
  id: string;
  poId: string;
  projectId: string;
  receivedDate: string;
  receivedBy: string;
  items: ReceiptItem[];
}

export interface ReceiptItem {
  itemId: string;
  quantity: number;
}