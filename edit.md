I. CÁC LỖI / ĐIỂM CHƯA ĐÚNG (QUAN TRỌNG)
❌ 1. STORE_MANAGER KHÔNG ĐƯỢC tạo / sửa / xóa Inventory Transactions
Hiện tại bạn ghi:

STORE_MANAGER:

✅ Tạo transaction

✅ Update

✅ Delete

❌ Lỗi ERP nghiêm trọng:

Manager không được phép thao tác nghiệp vụ kho

Vi phạm Separation of Duties

Manager chỉ:

xem

duyệt

giám sát

✅ SỬA:
Role	Inventory Transactions
STORE_MANAGER	❌ Chỉ xem
INVENTORY_STAFF	✅ Tạo / Update (ADJUSTMENT)
ADMIN	✅
❌ 2. INVENTORY_STAFF KHÔNG NÊN được XÓA Inventory Batch
Hiện tại:

INVENTORY_STAFF: ✅ Xóa batch

❌ Sai ERP:

Batch là chứng từ lịch sử

Xóa batch = phá audit trail

✅ SỬA:

INVENTORY_STAFF:

❌ Không xóa batch

✅ Chỉ:

tạo batch (từ GRN)

cập nhật trạng thái (expired / damaged)

Chỉ ADMIN được soft-delete (rất hiếm)

❌ 3. INVENTORY_STAFF KHÔNG ĐƯỢC tạo Sales Transaction
Hiện tại:

Inventory Staff: ✅ tạo sales

❌ Sai bối cảnh ERP:

Sales đến từ:

POS

hoặc Store Operation

Kho không bán hàng

✅ SỬA:
Role	Sales Transaction
STORE_MANAGER	✅ (demo/manual)
INVENTORY_STAFF	❌
PROCUREMENT_STAFF	❌
ADMIN	✅
❌ 4. PROCUREMENT_STAFF KHÔNG NÊN Confirm PO thay Supplier
Hiện tại:

Procurement Staff: ✅ Confirm PO from supplier

❌ Sai nghiệp vụ:

Supplier confirmation ≠ procurement action

Procurement chỉ:

gửi PO

theo dõi

update ETA (nếu cần)

✅ SỬA (CHO PILOT):

PROCUREMENT_STAFF:

✅ Mark PO as SENT

❌ KHÔNG confirm thay supplier

ADMIN:

Có thể override (demo)

❌ 5. AUTO-APPROVE Stock Request là NGUY HIỂM
Hiện tại:
Auto replenish:
- auto create
- auto approve
- auto create PO

❌ Sai ERP control:

Không được auto-approve 100%

Vi phạm kiểm soát nội bộ

✅ SỬA:
Auto replenish:
- auto create Stock Request
- status = PENDING_REVIEW
- PROCUREMENT_STAFF review → generate PO

❌ 6. STORE_MANAGER KHÔNG NÊN xóa / sửa Inventory Transaction

Đã trùng với (1) nhưng cần nhấn mạnh:

Manager không can thiệp dữ liệu gốc

Chỉ giám sát

II. FLOW ĐÚNG ERP – SAU KHI SỬA
✅ FLOW 1: Procurement (ĐÃ SỬA)
1. PROCUREMENT_STAFF tạo PO (DRAFT)
   ↓
2. Gửi PO → status = PENDING_APPROVAL
   ↓
3. STORE_MANAGER Approve / Reject
   ↓
4. PROCUREMENT_STAFF mark PO = SENT
   ↓
5. Supplier giao hàng (ngoài hệ thống)
   ↓
6. INVENTORY_STAFF tạo GRN
   ↓
7. System:
   - tạo Inventory Batch
   - tạo Inventory Transaction (RECEIPT)

✅ FLOW 2: Stock Request (ĐÃ SỬA)
1. STORE_MANAGER tạo Stock Request
   ↓
2. PROCUREMENT_STAFF review
   ↓
3. Generate PO (DRAFT)
   ↓
4. Quay lại Procurement Flow

✅ FLOW 3: Auto Replenish (ĐÃ SỬA – AN TOÀN)
1. Cron job check Safety Stock
   ↓
2. Auto-create Stock Request
   ↓
3. Status = AUTO_GENERATED
   ↓
4. PROCUREMENT_STAFF review
   ↓
5. Generate PO


👉 KHÔNG auto approve

✅ FLOW 4: Inventory Adjustment (CHUẨN ERP)
1. INVENTORY_STAFF tạo Adjustment
   ↓
2. System tạo Inventory Transaction (ADJUSTMENT)
   ↓
3. STORE_MANAGER chỉ xem & audit

✅ FLOW 5: Sales (DEMO-SAFE)
1. STORE_MANAGER tạo Sales Transaction (manual demo)
   ↓
2. System:
   - trừ inventory theo FEFO
   - tạo ISSUE transaction
   - tính gross profit

III. BẢNG QUYỀN ĐÃ SỬA (RÚT GỌN)
Chức năng	ADMIN	STORE_MANAGER	INVENTORY_STAFF	PROCUREMENT
Approve PO	✅	✅	❌	❌
Create PO	✅	❌	❌	✅
Send PO	✅	❌	❌	✅
Create GRN	✅	❌	✅	❌
Create Inventory Transaction	✅	❌	✅	❌
Delete Inventory Batch	✅	❌	❌	❌
Create Sales	✅	✅	❌	❌
IV. KẾT LUẬN THẲNG
Sau khi sửa:

✅ ĐÚNG ERP

✅ Không vi phạm separation of duties

✅ Demo an toàn

✅ Giảng viên không bắt bẻ được

Trước khi sửa:

❌ Manager can thiệp kho

❌ Kho bán hàng

❌ Auto approve nguy hiểm