
import { UserRole, RequestStatus, POStatus } from './types';

export const ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.SUPERVISOR]: 'مشرف موقع',
  [UserRole.ENGINEER]: 'مهندس مشروع',
  [UserRole.QUANTITY_SURVEYOR]: 'مهندس كميات',
  [UserRole.PROCUREMENT_MANAGER]: 'مدير مشتريات',
  [UserRole.GENERAL_MANAGER]: 'المدير العام',
  [UserRole.ADMIN]: 'مدير النظام'
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.DRAFT]: 'مسودة',
  [RequestStatus.PENDING_TECHNICAL]: 'بانتظار التعميد الفني',
  [RequestStatus.APPROVED_TECHNICAL]: 'معمد فنياً',
  [RequestStatus.IN_PROCUREMENT]: 'في مرحلة المشتريات',
  [RequestStatus.COMPLETED]: 'مكتمل',
  [RequestStatus.REJECTED]: 'مرفوض'
};

export const PO_STATUS_LABELS: Record<POStatus, string> = {
  [POStatus.PENDING_APPROVAL]: 'بانتظار موافقة المدير العام',
  [POStatus.APPROVED]: 'تمت الموافقة',
  [POStatus.SENT_TO_SUPPLIER]: 'مرسل للمورد',
  [POStatus.PARTIALLY_RECEIVED]: 'مستلم جزئياً',
  [POStatus.RECEIVED]: 'تم الاستلام',
  [POStatus.CANCELLED]: 'ملغي'
};

export const DEFAULT_PROCUREMENT_LIMIT = 50000; // ريال سعودي
