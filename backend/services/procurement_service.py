
from sqlalchemy.orm import Session
from fastapi import HTTPException
from .. import models, schemas
import datetime

class ProcurementService:
    
    @staticmethod
    def create_material_request(db: Session, req: schemas.RequestCreate, user_id: str):
        project = db.query(models.Project).filter(models.Project.id == req.projectId).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        db_req = models.MaterialRequest(
            project_id=req.projectId,
            requester_id=user_id,
            status="PENDING_TECHNICAL",
            notes=req.notes
        )
        db.add(db_req)
        db.flush()

        for item in req.items:
            db.add(models.RequestItem(
                request_id=db_req.id,
                item_id=item.itemId,
                quantity=item.quantity
            ))
        
        db.commit()
        db.refresh(db_req)
        return db_req

    @staticmethod
    def create_rfq(db: Session, rfq_data: schemas.RFQCreate, user_id: str):
        pr = db.query(models.MaterialRequest).filter(models.MaterialRequest.id == rfq_data.materialRequestId).first()
        if not pr or pr.status != "APPROVED_TECHNICAL":
            raise HTTPException(status_code=400, detail="PR not found or not approved technically")
        
        db_rfq = models.RFQ(
            material_request_id=rfq_data.materialRequestId,
            created_by=user_id,
            status="OPEN",
            deadline=rfq_data.deadline
        )
        db.add(db_rfq)
        db.commit()
        db.refresh(db_rfq)
        
        pr.status = "IN_PROCUREMENT"
        db.commit()
        return db_rfq

    @staticmethod
    def create_quotation(db: Session, quote_data: schemas.QuotationCreate):
        db_quote = models.Quotation(
            rfq_id=quote_data.rfqId,
            supplier_id=quote_data.supplierId,
            total_amount=quote_data.totalAmount,
            currency=quote_data.currency,
            valid_until=quote_data.validUntil,
            is_selected=False
        )
        db.add(db_quote)
        db.commit()
        db.refresh(db_quote)
        return db_quote

    @staticmethod
    def select_winning_quotation(db: Session, rfq_id: str, quotation_id: str):
        # 1. Validation
        rfq = db.query(models.RFQ).filter(models.RFQ.id == rfq_id).first()
        if not rfq: raise HTTPException(status_code=404, detail="RFQ not found")
        
        quote = db.query(models.Quotation).filter(models.Quotation.id == quotation_id, models.Quotation.rfq_id == rfq_id).first()
        if not quote: raise HTTPException(status_code=404, detail="Quotation not found for this RFQ")
        
        if rfq.status != "OPEN": raise HTTPException(status_code=400, detail="RFQ is not OPEN")

        # 2. Update Statuses
        quote.is_selected = True
        rfq.status = "CLOSED"
        
        # 3. Generate PO automatically from Context
        # Fetch PR items to know what was ordered
        pr = db.query(models.MaterialRequest).filter(models.MaterialRequest.id == rfq.material_request_id).first()
        if not pr: raise HTTPException(status_code=500, detail="Original PR missing")

        db_po = models.PurchaseOrder(
            project_id=pr.project_id,
            supplier_id=quote.supplier_id,
            material_request_id=pr.id,
            quotation_id=quote.id,
            status="PENDING_APPROVAL",
            total_amount=quote.total_amount
        )
        db.add(db_po)
        db.flush()

        # Distribute Cost (Simple allocation for Lump Sum quotes)
        # In a real system with line-item quotes, we would map specific prices.
        item_count = len(pr.items)
        avg_price = quote.total_amount / item_count if item_count > 0 else 0

        for req_item in pr.items:
            db.add(models.POItem(
                po_id=db_po.id,
                item_id=req_item.item_id,
                quantity=req_item.quantity,
                price=avg_price, # Allocated price
                received_quantity=0.0
            ))

        db.commit()
        db.refresh(db_po)
        return db_po

    @staticmethod
    def create_po(db: Session, po_data: schemas.POCreate, user_id: str):
        total = sum(item.quantity * item.price for item in po_data.items)

        db_po = models.PurchaseOrder(
            project_id=po_data.projectId,
            supplier_id=po_data.supplierId,
            material_request_id=po_data.materialRequestId,
            quotation_id=po_data.quotationId,
            status="PENDING_APPROVAL",
            total_amount=total
        )
        db.add(db_po)
        db.flush()

        for item in po_data.items:
            db.add(models.POItem(
                po_id=db_po.id,
                item_id=item.itemId,
                quantity=item.quantity,
                price=item.price
            ))
        
        if po_data.quotationId:
            quote = db.query(models.Quotation).filter(models.Quotation.id == po_data.quotationId).first()
            if quote:
                quote.is_selected = True
                if quote.rfq_id:
                    rfq = db.query(models.RFQ).filter(models.RFQ.id == quote.rfq_id).first()
                    if rfq: rfq.status = "CLOSED"

        db.commit()
        db.refresh(db_po)
        return db_po

    @staticmethod
    def approve_po(db: Session, po_id: str, user: models.User):
        po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
        if not po:
            raise HTTPException(status_code=404, detail="PO not found")
        
        if user.role not in ["ADMIN", "GENERAL_MANAGER"] and po.total_amount > user.approval_limit:
            raise HTTPException(status_code=403, detail="Amount exceeds approval limit")
        
        po.status = "APPROVED"
        db.commit()
        return po

    @staticmethod
    def create_receipt(db: Session, rec_data: schemas.ReceiptCreate, user_id: str):
        po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == rec_data.poId).first()
        if not po:
            raise HTTPException(status_code=404, detail="PO not found")
        
        db_rec = models.Receipt(
            po_id=rec_data.poId,
            received_by=user_id
        )
        db.add(db_rec)
        db.flush()

        all_fully_received = True

        for rec_item in rec_data.items:
            po_line = db.query(models.POItem).filter(
                models.POItem.po_id == rec_data.poId,
                models.POItem.item_id == rec_item.itemId
            ).first()

            if not po_line: continue

            if po_line.received_quantity + rec_item.quantity > po_line.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot receive {rec_item.quantity}. Only {po_line.quantity - po_line.received_quantity} remaining for item."
                )

            po_line.received_quantity += rec_item.quantity
            if po_line.received_quantity < po_line.quantity:
                all_fully_received = False

            db.add(models.ReceiptItem(
                receipt_id=db_rec.id,
                item_id=rec_item.itemId,
                quantity=rec_item.quantity
            ))
        
        if all_fully_received:
            for line in po.items:
                if line.received_quantity < line.quantity:
                    all_fully_received = False
                    break
        
        po.status = "RECEIVED" if all_fully_received else "PARTIALLY_RECEIVED"
        db.commit()
        return db_rec

    @staticmethod
    def perform_three_way_match(db: Session, invoice: models.Invoice):
        po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == invoice.po_id).first()
        if not po: return
        
        # 1. Calculate GRN Value (Value of Goods Actually Received)
        grn_value = sum(item.received_quantity * item.price for item in po.items)
        
        # 2. Compare with Invoice Amount
        variance = invoice.total_amount - grn_value
        tolerance = 100.0 # Configurable tolerance

        if abs(variance) <= tolerance:
            invoice.status = "MATCHED"
            invoice.match_status_details = f"Success. Variance: {variance:.2f} (within limit). GRN Value: {grn_value}"
        else:
            invoice.status = "MISMATCH"
            invoice.match_status_details = f"Failed. Invoice: {invoice.total_amount}, GRN Value: {grn_value}. Variance: {variance:.2f}"
        
        db.commit()
        return invoice

    @staticmethod
    def create_invoice(db: Session, inv_data: schemas.InvoiceCreate):
        db_inv = models.Invoice(
            po_id=inv_data.poId,
            supplier_invoice_number=inv_data.supplierInvoiceNumber,
            total_amount=inv_data.totalAmount,
            status="PENDING_MATCH"
        )
        db.add(db_inv)
        db.commit()
        db.refresh(db_inv)
        
        # Trigger Match
        return ProcurementService.perform_three_way_match(db, db_inv)

    @staticmethod
    def match_invoice_manually(db: Session, invoice_id: str):
        inv = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
        if not inv: raise HTTPException(status_code=404, detail="Invoice not found")
        return ProcurementService.perform_three_way_match(db, inv)

    @staticmethod
    def get_project_boq(db: Session, project_id: str):
        return db.query(models.ProjectBOQ).filter(models.ProjectBOQ.project_id == project_id).all()
