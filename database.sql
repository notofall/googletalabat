
-- إعداد نظام المشتريات (إتقان) - PostgreSQL Schema

-- 1. جدول المستخدمين والصلاحيات
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL, -- SUPERVISOR, ENGINEER, ADMIN, etc.
    approval_limit DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول المشاريع
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    total_budget DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    levels_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول ربط المستخدمين بالمشاريع (صلاحيات الوصول)
CREATE TABLE project_assignments (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- 4. جدول تصنيفات الأصناف
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL
);

-- 5. جدول كتالوج الأصناف
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(50) NOT NULL,
    base_price DECIMAL(15, 2) DEFAULT 0.00
);

-- 6. جدول الأسماء البديلة للأصناف (Aliases)
CREATE TABLE item_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    alias_name VARCHAR(255) NOT NULL
);

-- 7. جدول الموردين
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. جدول كميات المشروع المجدولة (BOQ)
CREATE TABLE project_boq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    phase_name VARCHAR(255), -- المرحلة مثل "الأساسات"
    total_quantity DECIMAL(15, 3) NOT NULL,
    received_quantity DECIMAL(15, 3) DEFAULT 0.00
);

-- 9. جدول طلبات المواد
CREATE TABLE material_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    requester_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'DRAFT',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. تفاصيل طلبات المواد
CREATE TABLE request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES material_requests(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    quantity DECIMAL(15, 3) NOT NULL,
    alias_used VARCHAR(255),
    notes TEXT
);

-- 11. عروض الأسعار
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES material_requests(id),
    supplier_id UUID REFERENCES suppliers(id),
    total_amount DECIMAL(15, 2) NOT NULL,
    is_winner BOOLEAN DEFAULT FALSE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. أوامر الشراء
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES material_requests(id),
    quotation_id UUID REFERENCES quotations(id),
    supplier_id UUID REFERENCES suppliers(id),
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. سندات الاستلام
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES purchase_orders(id),
    received_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    received_by UUID REFERENCES users(id)
);

-- 14. تفاصيل الاستلام
CREATE TABLE receipt_items (
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    quantity_received DECIMAL(15, 3) NOT NULL,
    PRIMARY KEY (receipt_id, item_id)
);

-- إنشاء Index لتسريع البحث
CREATE INDEX idx_project_assignments_user ON project_assignments(user_id);
CREATE INDEX idx_request_status ON material_requests(status);
CREATE INDEX idx_item_sku ON items(sku);
