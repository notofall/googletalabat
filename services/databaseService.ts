
import { Project, MaterialRequest, Supplier, Item, PurchaseOrder, ProjectBOQ, Receipt, POStatus, RequestStatus, User } from '../types';

/**
 * API Client Layer
 * يربط الواجهة الأمامية بالخادم الخلفي (Backend)
 */

const API_BASE_URL = '/api'; // في البيئة الحقيقية قد يكون http://localhost:3000/api أو متغير بيئة

// دالة مساعدة لإجراء طلبات الشبكة
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // إرسال معرف المستخدم الحالي للمصادقة البسيطة (يمكن استبداله بـ JWT Token)
  const userStr = sessionStorage.getItem('proc_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    headers['X-User-ID'] = user.id; 
  }

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // محاولة قراءة رسالة الخطأ من الخادم
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    // إذا كان الرد فارغاً (مثل 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed [${method} ${endpoint}]:`, error);
    throw error;
  }
}

export const dbService = {
  // --- المصادقة والمستخدمين ---

  isSystemInitialized: async (): Promise<boolean> => {
    return apiCall<boolean>('/system/init-status');
  },

  registerSystemAdmin: async (name: string, email: string, password: string): Promise<User> => {
    return apiCall<User>('/auth/register-admin', 'POST', { name, email, password });
  },

  authenticateUser: async (email: string, password: string): Promise<User | null> => {
    try {
      return await apiCall<User>('/auth/login', 'POST', { email, password });
    } catch (e) {
      return null;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    return apiCall<User[]>('/users');
  },

  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    return apiCall<User>('/users', 'POST', user);
  },

  updateUserPermissions: async (userId: string, updates: Partial<User>) => {
    await apiCall(`/users/${userId}/permissions`, 'PATCH', updates);
    return true;
  },

  // --- البيانات الأساسية (Master Data) ---

  // المشاريع
  getProjects: async (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return apiCall<Project[]>(`/projects${query}`);
  },

  createProject: async (p: Project) => {
    await apiCall('/projects', 'POST', p);
    return true;
  },

  deleteProject: async (id: string) => {
    await apiCall(`/projects/${id}`, 'DELETE');
    return true;
  },

  // الموردين
  getSuppliers: async () => {
    return apiCall<Supplier[]>('/suppliers');
  },

  createSupplier: async (s: Supplier) => {
    await apiCall('/suppliers', 'POST', s);
    return true;
  },

  deleteSupplier: async (id: string) => {
    await apiCall(`/suppliers/${id}`, 'DELETE');
    return true;
  },

  // الكتالوج
  getCatalogItems: async () => {
    return apiCall<Item[]>('/items');
  },

  createCatalogItem: async (i: Item) => {
    await apiCall('/items', 'POST', i);
    return true;
  },

  deleteCatalogItem: async (id: string) => {
    await apiCall(`/items/${id}`, 'DELETE');
    return true;
  },

  getProjectBOQ: async (projectId: string) => {
    return apiCall<ProjectBOQ[]>(`/projects/${projectId}/boq`);
  },

  // --- العمليات (Transactions) ---

  // طلبات المواد
  getAllMaterialRequests: async () => {
    return apiCall<MaterialRequest[]>('/material-requests');
  },

  createMaterialRequest: async (req: MaterialRequest) => {
    await apiCall('/material-requests', 'POST', req);
    return true;
  },

  updateMaterialRequestStatus: async (id: string, status: RequestStatus) => {
    await apiCall(`/material-requests/${id}/status`, 'PATCH', { status });
    return true;
  },

  // أوامر الشراء
  getAllPOs: async () => {
    return apiCall<PurchaseOrder[]>('/purchase-orders');
  },

  getPendingPOs: async () => {
    // يمكن تصفية البيانات في الخادم عبر Query Params
    return apiCall<PurchaseOrder[]>('/purchase-orders?status=PENDING_APPROVAL');
  },

  getPOById: async (id: string) => {
    return apiCall<PurchaseOrder>(`/purchase-orders/${id}`);
  },

  createPurchaseOrder: async (po: PurchaseOrder) => {
    await apiCall('/purchase-orders', 'POST', po);
    return true;
  },

  updatePO: async (po: PurchaseOrder) => {
    await apiCall(`/purchase-orders/${po.id}`, 'PUT', po);
    return true;
  },

  approvePO: async (poId: string, approverId: string) => {
    await apiCall(`/purchase-orders/${poId}/approve`, 'POST', { approverId });
    return true;
  },

  // الاستلام والمخزون
  createReceipt: async (receiptData: Receipt) => {
    await apiCall('/receipts', 'POST', receiptData);
    return true;
  },

  getReceiptsHistory: async () => {
    return apiCall<Receipt[]>('/receipts');
  }
};
