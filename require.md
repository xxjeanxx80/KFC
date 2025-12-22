TỔNG QUAN: WEB APP CỦA BẠN CẦN LÀM GÌ?

👉 Web app = công cụ vận hành cho 1 KFC Mega Market Shop (pilot)
👉 Phục vụ 4 vai trò chính
👉 Thể hiện ERP thinking:

Separation of Duties

Transaction-based inventory

Demand-driven replenishment

Batch & expiry control

2. NHỮNG MODULE WEB BẮT BUỘC PHẢI CÓ (CORE)
2.1. Authentication & Role-based Access (BẮT BUỘC)

Ai làm gì thấy cái gì

Trên web:

Login

Phân quyền theo role:

System Admin

Store Manager

Procurement Staff

Inventory Staff

Demo cần chứng minh:

Mỗi role thấy menu khác nhau

Không role nào làm hết mọi việc

👉 Đây là ERP control cốt lõi – rất quan trọng khi demo

2.2. Item & Supplier Management (Master Data)

Nền tảng cho mọi nghiệp vụ

Web cần:

Danh sách Items (SKU, min/max stock)

Danh sách Suppliers

Supplier–Item mapping:

Giá

Lead time

Preferred supplier

Demo:

1 item – nhiều supplier

Không phụ thuộc 1 nhà cung cấp

2.3. Inventory Dashboard (ĂN ĐIỂM NHẤT)

Trung tâm điều hành

Web cần hiển thị:

Tồn kho theo batch

Expiry date

Trạng thái:

In stock

Low stock

Expired

Tổng tồn kho từng item

Không cần:

Update tay số lượng

Inventory snapshot table

👉 Chỉ hiển thị dữ liệu từ inventory_batches

2.4. Inventory Transactions (Audit & Traceability)

Chứng minh ERP chứ không phải CRUD

Web cần:

Danh sách inventory transactions:

RECEIPT

ISSUE

ADJUSTMENT

Ai làm – lúc nào – vì sao

Demo:

Cho giảng viên thấy audit trail

2.5. Stock Request (Demand-driven SCM)

Thay thế Excel / gọi điện

Web cần:

Tạo stock request (thủ công)

Xem trạng thái:

Requested

Approved

Converted to PO

Demo:

Store operation → tạo nhu cầu

Procurement không tự nghĩ số lượng

2.6. Purchase Order Management (CORE)

Xương sống SCM

Web cần:

Tạo PO từ:

Stock request

Supplier-item mapping

Hiển thị:

Supplier

Items

Status

Status đủ để demo:

DRAFT

PENDING_APPROVAL

APPROVED

SENT

🚫 Không cần:

Supplier portal

ETA real update

2.7. PO Approval (Separation of Duties)

Rất nên có

Web cần:

Store Manager:

Xem PO chờ duyệt

Approve / Reject

Demo:

Procurement tạo PO

Manager duyệt

3. MODULE NÊN CÓ (NHƯNG CÓ THỂ GIẢN LƯỢC)
3.1. Goods Receipt (Có thể demo tối thiểu)

Nếu làm kịp – làm đơn giản

Web:

Tạo Goods Receipt từ PO

Nhập:

Received qty

Batch

Expiry

👉 Nếu chưa làm xong backend → KHÔNG demo

3.2. Reports (ĐƠN GIẢN)

Không cần BI phức tạp

Web:

Low stock list

Expired / near-expiry items

PO status list

👉 Chỉ cần bảng + số liệu

4. NHỮNG THỨ KHÔNG CẦN TRIỂN KHAI TRÊN WEB (RẤT QUAN TRỌNG)

🚫 Sales forecasting thật
🚫 POS integration thật
🚫 IoT sensor thật
🚫 Finance accounting thật
🚫 Multi-store

👉 Những cái này:

Nói ở report

Nói khi demo

Không cần code

5. TÓM TẮT CỰC NGẮN (1 slide demo)
Web app của bạn cần:

Login + Role

Inventory theo batch & expiry

Inventory transaction log

Stock request

Purchase order + approval

Supplier-item mapping

Dashboard tồn kho

Web app của bạn KHÔNG cần:

AI forecast

IoT

Kế toán