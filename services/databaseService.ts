
import { Project, MaterialRequest, Supplier, Item, PurchaseOrder, Receipt, POStatus, RequestStatus, User, UserRole, AuditLog, CostCenter, ProjectBOQ } from '../types';

const DB_KEYS = {
  USERS: 'itqan_enterprise_users',
  PROJECTS: 'itqan_enterprise_projects',
  SUPPLIERS: 'itqan_enterprise_suppliers',
  CATALOG: 'itqan_enterprise_catalog',
  REQUESTS: 'itqan_enterprise_requests',
  POS: 'itqan_enterprise_pos',
  RECEIPTS: 'itqan_enterprise_receipts',
  LOGS: 'itqan_enterprise_logs',
  COST_CENTERS: 'itqan_enterprise_cc'
};

/**
 * Enterprise Audit Logger
 */
const logAction = async (userId: string, userName: string, action: string, details: string, category: AuditLog['category']) => {
  const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    userId,
    userName,
    action,
    details,
    category,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs.slice(0, 500))); // يحتفظ بآخر 500 عملية
};

/**
 * Storage Abstraction Layer
 */
const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    if (!data || data === 'null') return defaultValue;
    try {
      return JSON.parse(data);
    } catch (e) {
      return defaultValue;
    }
  },
  set: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

/**
 * Enterprise Mock API
 */
const mockServer = {
  handleRequest: async (endpoint: string, method: string, body?: any, currentUserId?: string): Promise<any> => {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 300));

    // الحصول على المستخدم الحالي للـ Logs
    const users = storage.get<User[]>(DB_KEYS.USERS, []);
    const currentUser = users.find(u => u.id === currentUserId);

    // --- Authentication ---
    if (endpoint === '/auth/login') {
      const user = users.find(u => u.email === body.email);
      if (!user) throw new Error('بيانات الدخول غير صحيحة');
      logAction(user.id, user.name, 'تسجيل دخول', 'دخل المستخدم إلى النظام', 'AUTH');
      return user;
    }

    // --- Audit Logs ---
    if (endpoint === '/system/logs') return storage.get<AuditLog[]>(DB_KEYS.LOGS, []);

    // --- Users Management ---
    if (endpoint === '/users') {
        let allUsers = storage.get<User[]>(DB_KEYS.USERS, []);
        if (method === 'GET') return allUsers;
        if (method === 'POST') {
            const newUser = { ...body, id: `user-${Date.now()}` };
            allUsers.push(newUser);
            storage.set(DB_KEYS.USERS, allUsers);
            if (currentUser) logAction(currentUser.id, currentUser.name, 'إنشاء مستخدم', `تم إنشاء مستخدم جديد: ${body.name}`, 'SYSTEM');
            return newUser;
        }
    }
    if (endpoint.includes('/permissions') && method === 'POST') {
        const userId = endpoint.split('/')[2];
        let allUsers = storage.get<User[]>(DB_KEYS.USERS, []);
        const idx = allUsers.findIndex(u => u.id === userId);
        if (idx > -1) {
            allUsers[idx] = { ...allUsers[idx], ...body };
            storage.set(DB_KEYS.USERS, allUsers);
            if (currentUser) logAction(currentUser.id, currentUser.name, 'تعديل صلاحيات', `تعديل صلاحيات المستخدم: ${allUsers[idx].name}`, 'SYSTEM');
            return allUsers[idx];
        }
    }

    // --- Projects ---
    if (endpoint === '/projects') {
      let projects = storage.get<Project[]>(DB_KEYS.PROJECTS, []);
      if (method === 'GET') return projects;
      if (method === 'POST') {
        projects.push(body);
        storage.set(DB_KEYS.PROJECTS, projects);
        if (currentUser) logAction(currentUser.id, currentUser.name, 'إنشاء مشروع', `تم إنشاء مشروع جديد: ${body.name}`, 'PROJECTS');
        return body;
      }
    }
    if (endpoint.includes('/projects/') && method === 'DELETE') {
        const id = endpoint.split('/')[2];
        let projects = storage.get<Project[]>(DB_KEYS.PROJECTS, []);
        storage.set(DB_KEYS.PROJECTS, projects.filter(p => p.id !== id));
        return { success: true };
    }
    if (endpoint.includes('/boq') && method === 'GET') {
        // Mock BOQ retrieval
        const catalog = storage.get<Item[]>(DB_KEYS.CATALOG, []);
        return catalog.map(item => ({
            itemId: item.id,
            totalQuantity: 1000,
            receivedQuantity: 150
        } as ProjectBOQ));
    }

    // --- Material Requests ---
    if (endpoint.includes('/material-requests/') && method === 'POST' && endpoint.endsWith('/status')) {
        const id = endpoint.split('/')[2];
        let requests = storage.get<MaterialRequest[]>(DB_KEYS.REQUESTS, []);
        const idx = requests.findIndex(r => r.id === id);
        if (idx > -1) {
            requests[idx].status = body.status;
            storage.set(DB_KEYS.REQUESTS, requests);
            if (currentUser) logAction(currentUser.id, currentUser.name, 'تحديث طلب مواد', `تحديث حالة الطلب ${id} إلى ${body.status}`, 'PROCUREMENT');
            return requests[idx];
        }
    }

    // --- Purchase Orders ---
    if (endpoint === '/purchase-orders') {
      let pos = storage.get<PurchaseOrder[]>(DB_KEYS.POS, []);
      if (method === 'GET') return pos;
      if (method === 'POST') {
        pos.push(body);
        storage.set(DB_KEYS.POS, pos);
        if (currentUser) logAction(currentUser.id, currentUser.name, 'إصدار أمر شراء', `تم إصدار PO رقم ${body.id} بمبلغ ${body.totalAmount}`, 'PROCUREMENT');
        return body;
      }
    }

    if (endpoint.includes('/purchase-orders/') && method === 'PUT') {
        const id = endpoint.split('/')[2];
        let pos = storage.get<PurchaseOrder[]>(DB_KEYS.POS, []);
        const idx = pos.findIndex(p => p.id === id);
        if (idx > -1) {
            pos[idx] = body;
            storage.set(DB_KEYS.POS, pos);
            if (currentUser) logAction(currentUser.id, currentUser.name, 'تعديل أمر شراء', `تم تعديل بيانات PO رقم ${id}`, 'PROCUREMENT');
            return body;
        }
    }

    if (endpoint.includes('/approve') && method === 'POST') {
        const poId = endpoint.split('/')[2];
        let pos = storage.get<PurchaseOrder[]>(DB_KEYS.POS, []);
        const idx = pos.findIndex(p => p.id === poId);
        if (idx > -1) {
            pos[idx].status = POStatus.APPROVED;
            storage.set(DB_KEYS.POS, pos);
            if (currentUser) logAction(currentUser.id, currentUser.name, 'تعميد مالي', `تم اعتماد PO رقم ${poId}`, 'PROCUREMENT');
            return pos[idx];
        }
    }

    // --- Generic Routing for Catalog and Suppliers ---
    const simpleRoutes: Record<string, string> = {
        '/items': DB_KEYS.CATALOG,
        '/suppliers': DB_KEYS.SUPPLIERS,
        '/cost-centers': DB_KEYS.COST_CENTERS,
        '/material-requests': DB_KEYS.REQUESTS,
        '/receipts': DB_KEYS.RECEIPTS
    };

    const baseRoute = Object.keys(simpleRoutes).find(r => endpoint.startsWith(r));
    if (baseRoute) {
        let data = storage.get<any[]>(simpleRoutes[baseRoute], []);
        if (method === 'GET') return data;
        if (method === 'POST') {
            data.push(body);
            storage.set(simpleRoutes[baseRoute], data);
            return body;
        }
        if (method === 'DELETE') {
            const id = endpoint.split('/')[2];
            storage.set(simpleRoutes[baseRoute], data.filter(d => d.id !== id));
            return { success: true };
        }
    }

    return null;
  }
};

export const dbService = {
  getCurrentUserId: () => JSON.parse(sessionStorage.getItem('proc_user') || '{}').id,

  isSystemInitialized: async () => {
    const users = storage.get<User[]>(DB_KEYS.USERS, []);
    return users.some(u => u.role === UserRole.ADMIN);
  },

  registerSystemAdmin: async (name: string, email: string) => {
    const newUser = { id: 'admin-1', name, email, role: UserRole.ADMIN, canEditPOPrices: true, approvalLimit: 999999999 };
    storage.set(DB_KEYS.USERS, [newUser]);
    logAction(newUser.id, name, 'تهيئة النظام', 'تم إنشاء أول مستخدم مدير', 'SYSTEM');
    return newUser;
  },

  authenticateUser: async (email: string) => mockServer.handleRequest('/auth/login', 'POST', { email }),

  getSystemLogs: async () => (await mockServer.handleRequest('/system/logs', 'GET')) || [],

  // Projects
  getProjects: async () => (await mockServer.handleRequest('/projects', 'GET')) || [],
  createProject: async (p: Project) => mockServer.handleRequest('/projects', 'POST', p, dbService.getCurrentUserId()),
  deleteProject: async (id: string) => mockServer.handleRequest(`/projects/${id}`, 'DELETE', {}, dbService.getCurrentUserId()),
  getProjectBOQ: async (projectId: string) => (await mockServer.handleRequest(`/projects/${projectId}/boq`, 'GET')) || [],

  // Material Requests
  getAllMaterialRequests: async () => (await mockServer.handleRequest('/material-requests', 'GET')) || [],
  createMaterialRequest: async (req: MaterialRequest) => mockServer.handleRequest('/material-requests', 'POST', req, dbService.getCurrentUserId()),
  updateMaterialRequestStatus: async (id: string, status: RequestStatus) => mockServer.handleRequest(`/material-requests/${id}/status`, 'POST', { status }, dbService.getCurrentUserId()),

  // Purchase Orders
  getAllPOs: async () => (await mockServer.handleRequest('/purchase-orders', 'GET')) || [],
  getPendingPOs: async () => {
    const pos = (await dbService.getAllPOs()) || [];
    return pos.filter((p: PurchaseOrder) => [POStatus.PENDING_APPROVAL, POStatus.APPROVED, POStatus.PARTIALLY_RECEIVED, POStatus.SENT_TO_SUPPLIER].includes(p.status));
  },
  createPurchaseOrder: async (po: PurchaseOrder) => mockServer.handleRequest('/purchase-orders', 'POST', po, dbService.getCurrentUserId()),
  approvePO: async (poId: string) => mockServer.handleRequest(`/purchase-orders/${poId}/approve`, 'POST', {}, dbService.getCurrentUserId()),
  updatePO: async (po: PurchaseOrder) => mockServer.handleRequest(`/purchase-orders/${po.id}`, 'PUT', po, dbService.getCurrentUserId()),
  
  // Master Data
  getSuppliers: async () => (await mockServer.handleRequest('/suppliers', 'GET')) || [],
  createSupplier: async (s: Supplier) => mockServer.handleRequest('/suppliers', 'POST', s, dbService.getCurrentUserId()),
  deleteSupplier: async (id: string) => mockServer.handleRequest(`/suppliers/${id}`, 'DELETE', {}, dbService.getCurrentUserId()),
  
  getCatalogItems: async () => (await mockServer.handleRequest('/items', 'GET')) || [],
  createCatalogItem: async (i: Item) => mockServer.handleRequest('/items', 'POST', i, dbService.getCurrentUserId()),
  deleteCatalogItem: async (id: string) => mockServer.handleRequest(`/items/${id}`, 'DELETE', {}, dbService.getCurrentUserId()),
  
  // Receipts
  getReceiptsHistory: async () => (await mockServer.handleRequest('/receipts', 'GET')) || [],
  createReceipt: async (receipt: any) => mockServer.handleRequest('/receipts', 'POST', receipt, dbService.getCurrentUserId()),

  // Users Management
  getAllUsers: async () => (await mockServer.handleRequest('/users', 'GET')) || [],
  createUser: async (u: any) => mockServer.handleRequest('/users', 'POST', u, dbService.getCurrentUserId()),
  updateUserPermissions: async (id: string, perms: any) => mockServer.handleRequest(`/users/${id}/permissions`, 'POST', perms, dbService.getCurrentUserId()),
};
