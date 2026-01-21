
import { Project, MaterialRequest, Supplier, Item, PurchaseOrder, ProjectBOQ, Receipt, POStatus, RequestStatus, User, UserRole } from '../types';

/**
 * System Store (Simulated Database)
 * يحاكي الجداول العلائقية في الذاكرة مع استخدام LocalStorage للمستخدمين.
 */

const STORAGE_KEY_USERS = 'itqan_users_v2_db';

// --- 1. Tables Data (Mock for Business Data) ---
const ITEMS_TABLE: Item[] = [
  { id: '1', name: 'أسمنت بورتلاندي 50كجم', sku: 'CM-001', unit: 'كيس', categoryId: '1', basePrice: 22, aliases: ['أسمنت عادي'] },
  { id: '2', name: 'حديد تسليح 12 مم', sku: 'ST-012', unit: 'طن', categoryId: '2', basePrice: 2800, aliases: ['حديد سابك'] },
  { id: '3', name: 'رمل أحمر مغسول', sku: 'SN-002', unit: 'م3', categoryId: '3', basePrice: 45, aliases: ['رمل ناعم'] },
];

const PROJECTS_TABLE: Project[] = [
  { id: '1', name: 'برج التجارة العالمي', code: 'PRJ-001', budget: 2500000, spent: 1250000, status: 'ACTIVE', assignedUserIds: ['1', '2', '5', '6'] },
  { id: '2', name: 'مجمع واحة العلوم', code: 'PRJ-002', budget: 1800000, spent: 1650000, status: 'ACTIVE', assignedUserIds: ['3', '4', '5'] },
];

const BOQ_TABLE: ProjectBOQ[] = [
  { id: 'bq-1', projectId: '1', itemId: '1', itemName: 'أسمنت بورتلاندي 50كجم', unit: 'كيس', totalQuantity: 1000, receivedQuantity: 450 },
  { id: 'bq-2', projectId: '1', itemId: '2', itemName: 'حديد تسليح 12 مم', unit: 'طن', totalQuantity: 50, receivedQuantity: 20 },
  { id: 'bq-3', projectId: '2', itemId: '1', itemName: 'أسمنت بورتلاندي 50كجم', unit: 'كيس', totalQuantity: 2000, receivedQuantity: 1900 },
];

// Shared In-Memory Storage
const MATERIAL_REQUESTS_TABLE: MaterialRequest[] = [
  { 
    id: 'MR-1001', 
    projectId: '1', 
    requesterId: '2', 
    requesterName: 'مهندس الموقع', 
    projectName: 'برج التجارة العالمي', 
    status: RequestStatus.PENDING_TECHNICAL, 
    createdAt: '2024-05-18', 
    items: [{ id: 'ri-1', itemId: '1', name: 'أسمنت بورتلاندي', unit: 'كيس', quantity: 50 }] 
  }
];

const PO_TABLE: PurchaseOrder[] = [
  { 
    id: 'PO-2024-001', 
    requestId: 'MR-1001', 
    projectId: '1', 
    projectName: 'برج التجارة العالمي',
    supplierId: '1', 
    supplierName: 'مصنع الشرق للاسمنت', 
    status: POStatus.PENDING_APPROVAL, 
    totalAmount: 45000, 
    createdAt: '2024-05-20',
    items: [
       { id: 'pi-1', itemId: '1', name: 'أسمنت بورتلاندي 50كجم', unit: 'كيس', quantity: 100, price: 22, receivedQuantity: 0 },
       { id: 'pi-2', itemId: '2', name: 'حديد تسليح 12 مم', unit: 'طن', quantity: 10, price: 2800, receivedQuantity: 0 }
    ]
  }
];

const RECEIPTS_TABLE: Receipt[] = [];

// --- Helper Functions for LocalStorage ---
const getUsersFromStorage = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  return stored ? JSON.parse(stored) : [];
};

const saveUsersToStorage = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

// --- 2. Database Services ---

export const dbService = {
  // --- User Management (First Run Logic) ---
  
  isSystemInitialized: async (): Promise<boolean> => {
    const users = getUsersFromStorage();
    return users.some(u => u.role === UserRole.ADMIN);
  },

  registerSystemAdmin: async (name: string, email: string, password: string): Promise<User> => {
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name,
      email,
      role: UserRole.ADMIN,
      canEditPOPrices: true,
      approvalLimit: 999999999
    };
    
    const users = getUsersFromStorage();
    users.push(newUser);
    saveUsersToStorage(users);
    return newUser;
  },

  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    const users = getUsersFromStorage();
    if (users.find(u => u.email === user.email)) {
      throw new Error('البريد الإلكتروني مسجل مسبقاً');
    }
    const newUser = { ...user, id: `USR-${Date.now()}` };
    users.push(newUser);
    saveUsersToStorage(users);
    return newUser;
  },

  authenticateUser: async (email: string, password: string): Promise<User | null> => {
    const users = getUsersFromStorage();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  getAllUsers: async (): Promise<User[]> => {
    return getUsersFromStorage();
  },

  updateUserPermissions: async (userId: string, updates: Partial<User>) => {
    let users = getUsersFromStorage();
    users = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    saveUsersToStorage(users);
    return true;
  },

  // --- Business Data & Operations ---

  getProjects: async (userId: string) => {
    return PROJECTS_TABLE; 
  },

  getProjectBOQ: async (projectId: string) => {
    return BOQ_TABLE.filter(b => b.projectId === projectId);
  },

  // Material Requests
  getAllMaterialRequests: async () => {
    return MATERIAL_REQUESTS_TABLE;
  },

  createMaterialRequest: async (req: MaterialRequest) => {
    MATERIAL_REQUESTS_TABLE.push(req);
    return true;
  },

  updateMaterialRequestStatus: async (id: string, status: RequestStatus) => {
    const req = MATERIAL_REQUESTS_TABLE.find(r => r.id === id);
    if (req) {
      req.status = status;
      return true;
    }
    return false;
  },

  // Purchase Orders
  getPendingPOs: async () => {
    return PO_TABLE.filter(po => po.status !== POStatus.RECEIVED && po.status !== POStatus.CANCELLED);
  },
  
  getAllPOs: async () => {
    return PO_TABLE;
  },

  getPOById: async (id: string) => {
    return PO_TABLE.find(p => p.id === id);
  },

  createPurchaseOrder: async (po: PurchaseOrder) => {
    PO_TABLE.push(po);
    // Update linked Request Status
    const req = MATERIAL_REQUESTS_TABLE.find(r => r.id === po.requestId);
    if (req) req.status = RequestStatus.IN_PROCUREMENT;
    return true;
  },

  updatePO: async (po: PurchaseOrder) => {
    const index = PO_TABLE.findIndex(p => p.id === po.id);
    if (index !== -1) {
      PO_TABLE[index] = po;
      return true;
    }
    return false;
  },

  approvePO: async (poId: string, approverId: string) => {
    const po = PO_TABLE.find(p => p.id === poId);
    if (po) {
      po.status = POStatus.APPROVED;
      console.log(`[DB] PO ${poId} Approved by ${approverId}`);
      return true;
    }
    return false;
  },

  createReceipt: async (receiptData: Receipt) => {
    RECEIPTS_TABLE.push(receiptData);
    const po = PO_TABLE.find(p => p.id === receiptData.poId);
    let allItemsFullyReceived = true;

    if (po) {
      receiptData.items.forEach(recItem => {
        const poItem = po.items.find(pi => pi.itemId === recItem.itemId);
        if (poItem) {
          poItem.receivedQuantity += recItem.quantity;
          if (poItem.receivedQuantity < poItem.quantity) allItemsFullyReceived = false;
        }
        const boqItem = BOQ_TABLE.find(b => b.projectId === po.projectId && b.itemId === recItem.itemId);
        if (boqItem) {
          boqItem.receivedQuantity += recItem.quantity;
        }
      });
      po.status = allItemsFullyReceived ? POStatus.RECEIVED : POStatus.PARTIALLY_RECEIVED;
    }
    return true;
  },
  
  getReceiptsHistory: async () => {
    return RECEIPTS_TABLE;
  }
};
