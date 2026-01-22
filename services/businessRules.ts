
import { User, UserRole, PurchaseOrder, ProjectBOQ, POItem } from '../types';
import { DEFAULT_PROCUREMENT_LIMIT } from '../constants';

/**
 * Business Logic Layer
 * هذا الملف يمثل "جدول القواعد" الموثق في النظام.
 * لا يحتوي على حالة (Stateless)، فقط منطق نقي.
 */

export const BusinessRules = {
  /**
   * BL-001: التحقق من صلاحية التعميد المالي
   * @table Security & Permissions
   */
  canApprovePO: (user: User, po: PurchaseOrder): { allowed: boolean; reason?: string } => {
    // 1. Admin & GM Rule
    if (user.role === UserRole.GENERAL_MANAGER || user.role === UserRole.ADMIN) {
      return { allowed: true };
    }

    // 2. Role Restriction
    // المشرف والمهندس لا يعمدون مالياً
    if ([UserRole.SUPERVISOR, UserRole.ENGINEER, UserRole.QUANTITY_SURVEYOR].includes(user.role)) {
      return { allowed: false, reason: "دورك الوظيفي لا يسمح بالتعميد المالي." };
    }

    // 3. Limit Rule
    const limit = user.approvalLimit || DEFAULT_PROCUREMENT_LIMIT;
    if (po.totalAmount <= limit) {
      return { allowed: true };
    }

    return { 
      allowed: false, 
      reason: `قيمة الطلب (${po.totalAmount.toLocaleString()}) تتجاوز حد صلاحيتك (${limit.toLocaleString()}). يتطلب تعميد المدير العام.` 
    };
  },

  /**
   * BL-002: منع تجاوز الاستلام للكمية المطلوبة في PO
   * @table System Logic
   */
  validateReceiptQuantity: (poItem: POItem, inputQty: number): { valid: boolean; message?: string } => {
    const remaining = poItem.quantity - poItem.receivedQuantity;
    
    if (inputQty <= 0) {
      return { valid: false, message: "الكمية يجب أن تكون أكبر من صفر." };
    }

    if (inputQty > remaining) {
      return { 
        valid: false, 
        message: `الكمية المدخلة (${inputQty}) أكبر من المتبقي في أمر الشراء (${remaining}).` 
      };
    }

    return { valid: true };
  },

  /**
   * BL-003: التحقق من رصيد الميزانية (BOQ)
   * @table Business Logic
   */
  checkBOQStatus: (boqItem: ProjectBOQ, newQty: number): { status: 'OK' | 'WARNING' | 'CRITICAL'; message?: string } => {
    const projectedTotal = boqItem.receivedQuantity + newQty;
    
    if (projectedTotal > boqItem.totalQuantity) {
      return { 
        status: 'CRITICAL', 
        message: `تجاوز خطير! الكمية الإجمالية ستصبح (${projectedTotal}) وهي أكبر من المخطط له (${boqItem.totalQuantity}).` 
      };
    }

    if (projectedTotal > (boqItem.totalQuantity * 0.9)) {
      return { 
        status: 'WARNING', 
        message: `تنبيه: اقتربت من نفاذ الكمية المجدولة لهذا البند.` 
      };
    }

    return { status: 'OK' };
  },

  /**
   * BL-004: صلاحية تعديل الأسعار
   * @table Security & Permissions
   */
  canEditPrices: (user: User, poStatus: string): boolean => {
    if (poStatus === 'CANCELLED') return false;
    // Fix: Access user.permissions.canEditPrices instead of non-existent user.canEditPOPrices
    return !!user.permissions.canEditPrices;
  }
};
