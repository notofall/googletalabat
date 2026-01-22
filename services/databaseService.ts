
import { User, Project, MaterialRequest, PurchaseOrder, Supplier, Item } from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
  const userStr = sessionStorage.getItem('proc_user');
  const token = userStr ? JSON.parse(userStr).access_token : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    sessionStorage.removeItem('proc_user');
    window.location.reload();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API Error');
  }
  return res.json();
};

export const dbService = {
  // Auth
  authenticateUser: async (username: string, password?: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password || '');
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    const userRes = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    });
    const user = await userRes.json();
    return { ...user, access_token: data.access_token };
  },

  isSystemInitialized: async () => true, 
  registerSystemAdmin: async (name: string, email: string) => { throw new Error("Use CLI for Admin creation in Prod"); },

  // Master Data
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createProject: async (p: any) => handleResponse(await fetch(`${API_URL}/projects`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(p) })),
  getSuppliers: async (): Promise<Supplier[]> => handleResponse(await fetch(`${API_URL}/suppliers`, { headers: getHeaders() })),
  createSupplier: async (s: any) => handleResponse(await fetch(`${API_URL}/suppliers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(s) })),
  getCatalogItems: async (): Promise<Item[]> => handleResponse(await fetch(`${API_URL}/items`, { headers: getHeaders() })),
  createItem: async (i: any) => handleResponse(await fetch(`${API_URL}/items`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(i) })),
  getAllUsers: async (): Promise<User[]> => handleResponse(await fetch(`${API_URL}/users`, { headers: getHeaders() })),
  createUser: async (user: any) => handleResponse(await fetch(`${API_URL}/users`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(user) })),
  updateUserPermissions: async (userId: string, permissions: any) => {}, 

  // Procurement Lifecycle
  getAllMaterialRequests: async (): Promise<MaterialRequest[]> => handleResponse(await fetch(`${API_URL}/material-requests`, { headers: getHeaders() })),
  createMaterialRequest: async (req: any) => handleResponse(await fetch(`${API_URL}/material-requests`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(req) })),

  // RFQ & Quotes
  getRFQs: async () => handleResponse(await fetch(`${API_URL}/rfqs`, { headers: getHeaders() })),
  createRFQ: async (rfq: any) => handleResponse(await fetch(`${API_URL}/rfqs`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(rfq) })),
  getQuotations: async () => handleResponse(await fetch(`${API_URL}/quotations`, { headers: getHeaders() })),
  createQuotation: async (q: any) => handleResponse(await fetch(`${API_URL}/quotations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(q) })),

  // POs
  getAllPOs: async (): Promise<PurchaseOrder[]> => handleResponse(await fetch(`${API_URL}/purchase-orders`, { headers: getHeaders() })),
  getPendingPOs: async (): Promise<PurchaseOrder[]> => {
    const pos = await dbService.getAllPOs();
    return pos.filter((p: any) => p.status === 'PENDING_APPROVAL');
  },
  createPurchaseOrder: async (po: any) => handleResponse(await fetch(`${API_URL}/purchase-orders`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(po) })),
  approvePO: async (id: string) => {
    const res = await fetch(`${API_URL}/purchase-orders/${id}/approve`, { method: 'PUT', headers: getHeaders() });
    return res.ok;
  },

  // Receipts
  getReceiptsHistory: async () => handleResponse(await fetch(`${API_URL}/receipts`, { headers: getHeaders() })),
  createReceipt: async (rec: any) => {
    const res = await fetch(`${API_URL}/receipts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(rec) });
    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.detail || "Validation Failed");
    }
    return res.ok;
  },

  // Invoices
  getInvoices: async () => handleResponse(await fetch(`${API_URL}/invoices`, { headers: getHeaders() })),
  createInvoice: async (inv: any) => handleResponse(await fetch(`${API_URL}/invoices`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(inv) })),
  matchInvoice: async (id: string) => handleResponse(await fetch(`${API_URL}/invoices/${id}/match`, { method: 'POST', headers: getHeaders() })),

  // Utils
  getProjectBOQ: async (projectId: string) => handleResponse(await fetch(`${API_URL}/projects/${projectId}/boq`, { headers: getHeaders() })),
  getSystemSettings: async () => ({ companyName: 'Enterprise', currency: 'SAR' }),
  updateSystemSettings: async (settings: any) => {},
  getReportConfig: async () => ({ showSupplierRating: true, showBudgetVariance: true, showAuditStamp: true, showRequesterIdentity: true, defaultPeriodDays: 30 }),
  updateReportConfig: async (config: any) => {},
  getSystemLogs: async () => [],
  logAction: async () => {},
  exportFullBackup: async () => {},
  importBackup: async (data: string) => {},
};
