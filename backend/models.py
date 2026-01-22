
import uuid
import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

# --- RBAC & Users ---
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    approval_limit = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    material_requests = relationship("MaterialRequest", back_populates="requester")

# --- Master Data ---
class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    rating = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Item(Base):
    __tablename__ = "items"
    id = Column(String, primary_key=True, default=generate_uuid)
    sku = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    unit = Column(String)
    base_price = Column(Float, default=0.0)
    category = Column(String)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    owner_name = Column(String)
    budget = Column(Float, default=0.0)
    spent = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")
    
    boq_items = relationship("ProjectBOQ", back_populates="project")

class ProjectBOQ(Base):
    __tablename__ = "project_boq"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    item_id = Column(String, ForeignKey("items.id"))
    total_quantity = Column(Float, default=0.0)
    received_quantity = Column(Float, default=0.0) 
    
    project = relationship("Project", back_populates="boq_items")
    item = relationship("Item")

# --- Procurement Lifecycle ---

class MaterialRequest(Base):
    __tablename__ = "material_requests"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    requester_id = Column(String, ForeignKey("users.id"))
    status = Column(String, default="PENDING_TECHNICAL") 
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    requester = relationship("User", back_populates="material_requests")
    items = relationship("RequestItem", back_populates="request", cascade="all, delete-orphan")

class RequestItem(Base):
    __tablename__ = "request_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    request_id = Column(String, ForeignKey("material_requests.id"))
    item_id = Column(String, ForeignKey("items.id"))
    quantity = Column(Float, nullable=False)
    
    request = relationship("MaterialRequest", back_populates="items")
    item = relationship("Item")

class RFQ(Base):
    __tablename__ = "rfqs"
    id = Column(String, primary_key=True, default=generate_uuid)
    material_request_id = Column(String, ForeignKey("material_requests.id"))
    created_by = Column(String, ForeignKey("users.id"))
    status = Column(String, default="OPEN")
    deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    quotations = relationship("Quotation", back_populates="rfq")

class Quotation(Base):
    __tablename__ = "quotations"
    id = Column(String, primary_key=True, default=generate_uuid)
    rfq_id = Column(String, ForeignKey("rfqs.id"), nullable=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    total_amount = Column(Float)
    currency = Column(String, default="SAR")
    valid_until = Column(DateTime, nullable=True)
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rfq = relationship("RFQ", back_populates="quotations")
    supplier = relationship("Supplier")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    material_request_id = Column(String, ForeignKey("material_requests.id"), nullable=True)
    quotation_id = Column(String, ForeignKey("quotations.id"), nullable=True)
    
    status = Column(String, default="PENDING_APPROVAL")
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    items = relationship("POItem", back_populates="po", cascade="all, delete-orphan")
    supplier = relationship("Supplier")
    project = relationship("Project")

class POItem(Base):
    __tablename__ = "po_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    po_id = Column(String, ForeignKey("purchase_orders.id"))
    item_id = Column(String, ForeignKey("items.id"))
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    received_quantity = Column(Float, default=0.0)
    
    po = relationship("PurchaseOrder", back_populates="items")
    item = relationship("Item")

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(String, primary_key=True, default=generate_uuid)
    po_id = Column(String, ForeignKey("purchase_orders.id"))
    received_by = Column(String, ForeignKey("users.id"))
    received_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    items = relationship("ReceiptItem", back_populates="receipt", cascade="all, delete-orphan")

class ReceiptItem(Base):
    __tablename__ = "receipt_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    receipt_id = Column(String, ForeignKey("receipts.id"))
    item_id = Column(String, ForeignKey("items.id"))
    quantity = Column(Float, nullable=False)
    
    receipt = relationship("Receipt", back_populates="items")
    item = relationship("Item")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True, default=generate_uuid)
    po_id = Column(String, ForeignKey("purchase_orders.id"))
    supplier_invoice_number = Column(String)
    total_amount = Column(Float)
    status = Column(String, default="PENDING_MATCH")
    match_status_details = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SystemSettings(Base):
    __tablename__ = "system_settings"
    id = Column(String, primary_key=True, default="1")
    company_name = Column(String, default="My Enterprise")
    tax_number = Column(String)
    currency = Column(String, default="SAR")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    user_name = Column(String)
    action = Column(String)
    details = Column(Text)
    category = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
