
from .models import User, PurchaseOrder
from fastapi import HTTPException

class ProcurementService:
    @staticmethod
    def can_approve_po(user: User, po: PurchaseOrder):
        # BL-001 Implementation in Server
        if user.role in ["ADMIN", "GENERAL_MANAGER"]:
            return True
        
        if user.role in ["SUPERVISOR", "ENGINEER"]:
            raise HTTPException(status_code=403, detail="ليس لديك صلاحية التعميد المالي")
            
        if po.total_amount <= user.approval_limit:
            return True
            
        raise HTTPException(
            status_code=403, 
            detail=f"المبلغ ({po.total_amount}) يتجاوز حد صلاحيتك ({user.approval_limit})"
        )

    @staticmethod
    def validate_receipt_qty(item_remaining: float, input_qty: float):
        # BL-002 Implementation
        if input_qty > item_remaining:
            raise HTTPException(status_code=400, detail="الكمية المستلمة تتجاوز المتبقي في الطلب")
        return True
