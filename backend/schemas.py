
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Shared ---
class ItemBase(BaseModel):
    itemId: str
    quantity: float

# --- User ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    approvalLimit: float = 0.0

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    approvalLimit: float
    class Config:
        from_attributes = True

# --- Master Data ---
class SupplierCreate(BaseModel):
    name: str
    email: Optional[str]
    contact: Optional[str]

class ItemCreate(BaseModel):
    name: str
    sku: str
    unit: str
    basePrice: float

class ProjectCreate(BaseModel):
    name: str
    code: str
    ownerName: str
    budget: float

class ProjectBOQOut(BaseModel):
    id: str
    itemId: str
    totalQuantity: float
    receivedQuantity: float
    class Config:
        from_attributes = True

# --- PR ---
class RequestItemCreate(ItemBase):
    pass

class RequestCreate(BaseModel):
    projectId: str
    items: List[RequestItemCreate]
    notes: Optional[str]

class RequestOut(BaseModel):
    id: str
    projectId: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- RFQ & Quotation ---
class RFQCreate(BaseModel):
    materialRequestId: str
    deadline: datetime

class QuotationCreate(BaseModel):
    rfqId: str
    supplierId: str
    totalAmount: float
    currency: Optional[str] = "SAR"
    validUntil: Optional[datetime] = None

class RFQOut(BaseModel):
    id: str
    status: str
    deadline: datetime
    created_at: datetime
    class Config:
        from_attributes = True

class QuotationOut(BaseModel):
    id: str
    supplier_id: str
    total_amount: float
    currency: str
    valid_until: Optional[datetime]
    is_selected: bool
    class Config:
        from_attributes = True

# --- PO ---
class POItemCreate(ItemBase):
    price: float
    name: Optional[str] # Optional for override

class POCreate(BaseModel):
    projectId: str
    supplierId: str
    materialRequestId: Optional[str]
    quotationId: Optional[str] = None
    items: List[POItemCreate]

class POOut(BaseModel):
    id: str
    total_amount: float
    status: str
    created_at: datetime
    supplier_id: str
    items: List[POItemCreate] = [] # Simplified for list view
    class Config:
        from_attributes = True

# --- GRN ---
class ReceiptItemCreate(ItemBase):
    pass

class ReceiptCreate(BaseModel):
    poId: str
    items: List[ReceiptItemCreate]

class ReceiptOut(BaseModel):
    id: str
    po_id: str
    received_date: datetime
    received_by: str
    class Config:
        from_attributes = True

# --- Invoice ---
class InvoiceCreate(BaseModel):
    poId: str
    supplierInvoiceNumber: str
    totalAmount: float

class InvoiceOut(BaseModel):
    id: str
    po_id: str
    status: str
    match_status_details: Optional[str]
    total_amount: float
    created_at: datetime
    class Config:
        from_attributes = True

# --- AI ---
class AIRequest(BaseModel):
    data: dict
    context: str
