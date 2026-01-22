
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from .. import models, auth, database, schemas
from ..services.procurement_service import ProcurementService
import google.generativeai as genai
import os

router = APIRouter(prefix="/api")
get_db = database.get_db

# --- Auth ---
async def get_current_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        if email is None: raise HTTPException(status_code=401)
    except:
        raise HTTPException(status_code=401, detail="Token invalid")
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None: raise HTTPException(status_code=401)
    return user

async def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user

@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    return {"access_token": auth.create_access_token(data={"sub": user.email, "role": user.role}), "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.UserOut)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- Master Data ---
@router.get("/projects")
def get_projects(db: Session = Depends(get_db)): return db.query(models.Project).all()

@router.get("/projects/{project_id}/boq", response_model=List[schemas.ProjectBOQOut])
def get_project_boq(project_id: str, db: Session = Depends(get_db)):
    return ProcurementService.get_project_boq(db, project_id)

@router.post("/projects")
def create_project(proj: schemas.ProjectCreate, db: Session = Depends(get_db), user: models.User = Depends(get_admin_user)):
    db_proj = models.Project(**proj.dict())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.get("/suppliers")
def get_suppliers(db: Session = Depends(get_db)): return db.query(models.Supplier).all()

@router.post("/suppliers")
def create_supplier(sup: schemas.SupplierCreate, db: Session = Depends(get_db)):
    db_sup = models.Supplier(**sup.dict())
    db.add(db_sup)
    db.commit()
    return db_sup

@router.get("/items")
def get_items(db: Session = Depends(get_db)): return db.query(models.Item).all()

@router.post("/items")
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    return db_item

@router.get("/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()

@router.post("/users")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        name=user.name, email=user.email, role=user.role, approval_limit=user.approvalLimit,
        password_hash=auth.get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    return db_user

# --- Procurement Lifecycle ---
@router.get("/material-requests", response_model=List[schemas.RequestOut])
def list_requests(db: Session = Depends(get_db)): return db.query(models.MaterialRequest).all()

@router.post("/material-requests", response_model=schemas.RequestOut)
def create_request(req: schemas.RequestCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return ProcurementService.create_material_request(db, req, user.id)

# RFQ & Quotes
@router.get("/rfqs", response_model=List[schemas.RFQOut])
def list_rfqs(db: Session = Depends(get_db)): return db.query(models.RFQ).all()

@router.post("/rfqs", response_model=schemas.RFQOut)
def create_rfq(rfq: schemas.RFQCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return ProcurementService.create_rfq(db, rfq, user.id)

@router.get("/quotations", response_model=List[schemas.QuotationOut])
def list_quotations(db: Session = Depends(get_db)): return db.query(models.Quotation).all()

@router.post("/quotations", response_model=schemas.QuotationOut)
def create_quotation(quote: schemas.QuotationCreate, db: Session = Depends(get_db)):
    return ProcurementService.create_quotation(db, quote)

# POs
@router.get("/purchase-orders", response_model=List[schemas.POOut])
def list_pos(db: Session = Depends(get_db)): return db.query(models.PurchaseOrder).all()

@router.post("/purchase-orders", response_model=schemas.POOut)
def create_po(po: schemas.POCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return ProcurementService.create_po(db, po, user.id)

@router.put("/purchase-orders/{po_id}/approve")
def approve_po(po_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return ProcurementService.approve_po(db, po_id, user)

# GRN
@router.get("/receipts", response_model=List[schemas.ReceiptOut])
def list_receipts(db: Session = Depends(get_db)): return db.query(models.Receipt).all()

@router.post("/receipts")
def create_receipt(rec: schemas.ReceiptCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return ProcurementService.create_receipt(db, rec, user.id)

# Invoices
@router.get("/invoices", response_model=List[schemas.InvoiceOut])
def list_invoices(db: Session = Depends(get_db)): return db.query(models.Invoice).all()

@router.post("/invoices", response_model=schemas.InvoiceOut)
def create_invoice(inv: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    return ProcurementService.create_invoice(db, inv)

@router.post("/invoices/{invoice_id}/match", response_model=schemas.InvoiceOut)
def match_invoice(invoice_id: str, db: Session = Depends(get_db)):
    return ProcurementService.match_invoice_manually(db, invoice_id)

# --- AI ---
@router.post("/ai/analyze")
def ai_analyze(req: schemas.AIRequest, user: models.User = Depends(get_current_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: return {"text": "AI Service Unavailable (Missing Key)"}
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    try:
        response = model.generate_content(f"Context: {req.context}. Data: {req.data}. Analyze risks and budget.")
        return {"text": response.text}
    except Exception as e:
        return {"text": f"AI Error: {str(e)}"}
