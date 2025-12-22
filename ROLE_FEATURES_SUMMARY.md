# Tổng Hợp Tính Năng Theo Role - KFC SCM System

## Tổng Quan

Hệ thống KFC Supply Chain Management có **4 role** chính với các quyền hạn và tính năng khác nhau:

1. **ADMIN** - System Administrator
2. **STORE_MANAGER** - Store Manager  
3. **INVENTORY_STAFF** - Inventory Staff
4. **PROCUREMENT_STAFF** - Procurement Staff

---

## 1. ADMIN (System Administrator)

### Mô Tả
Quản trị viên hệ thống có quyền truy cập đầy đủ vào tất cả các chức năng của hệ thống.

### Quyền Truy Cập Trang

| Trang | Quyền |
|-------|-------|
| Dashboard | ✅ Xem đầy đủ |
| Inventory | ✅ Quản lý đầy đủ |
| Inventory Transactions | ✅ Quản lý đầy đủ |
| Stock Requests | ✅ Xem và quản lý |
| Procurement | ✅ Quản lý đầy đủ |
| Suppliers | ✅ Quản lý đầy đủ |
| Reports | ✅ Xem đầy đủ |
| Users | ✅ Quản lý đầy đủ |

### Chức Năng Chi Tiết

#### 👥 User Management (Quản lý người dùng)
- ✅ Tạo user mới
- ✅ Xem danh sách users
- ✅ Xem chi tiết user
- ✅ Cập nhật thông tin user
- ✅ Xóa user (soft delete)

#### 📦 Inventory Management (Quản lý kho)
- ✅ Xem danh sách inventory batches
- ✅ Xem chi tiết inventory batch
- ✅ Tạo inventory batch mới
- ✅ Cập nhật inventory batch
- ✅ Xóa inventory batch

#### 📊 Inventory Transactions (Giao dịch kho)
- ✅ Xem danh sách tất cả inventory transactions
- ✅ Xem chi tiết transaction
- ✅ Lọc transactions theo:
  - Transaction Type (RECEIPT/ISSUE/ADJUSTMENT)
  - Item ID
  - Batch ID
  - Date range
- ✅ Tạo transaction mới
- ✅ Cập nhật transaction
- ✅ Xóa transaction

#### 📋 Procurement (Đặt hàng)
- ✅ Xem danh sách Purchase Orders (PO)
- ✅ Xem chi tiết PO
- ✅ Tạo PO mới
- ✅ Cập nhật PO
- ✅ Xóa PO
- ✅ Duyệt PO (Approve)
- ✅ Từ chối PO (Reject)
- ✅ Xác nhận PO từ supplier (Confirm)

#### 🏢 Suppliers (Nhà cung cấp)
- ✅ Xem danh sách suppliers
- ✅ Xem chi tiết supplier
- ✅ Tạo supplier mới
- ✅ Cập nhật supplier
- ✅ Xóa supplier
- ✅ Xem lịch sử đặt hàng với supplier

#### 📥 Goods Receipts (Nhận hàng)
- ✅ Xem danh sách goods receipts
- ✅ Xem chi tiết goods receipt
- ✅ Tạo goods receipt mới (GRN)
- ✅ Xóa goods receipt

#### 📦 Stock Requests (Yêu cầu hàng)
- ✅ Xem danh sách stock requests
- ✅ Tạo stock request mới
- ✅ Duyệt stock request (Approve)
- ✅ Tự động tạo PO từ stock requests
- ✅ Tự động replenish khi dưới Safety Stock

#### 💰 Sales (Bán hàng)
- ✅ Tạo sales transaction
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales

#### 📊 Reports (Báo cáo)
- ✅ Xem Dashboard report (đầy đủ KPI)
- ✅ Xem Inventory report
- ✅ Xem Procurement report
- ✅ Xem Sales report
- ✅ Xem Low Stock Alerts
- ✅ Xem Gross Profit report
- ✅ Xem Expired Items report
- ✅ Export tất cả reports

#### ⚙️ Items & Stores (Sản phẩm & Cửa hàng)
- ✅ Quản lý Items (CRUD đầy đủ)
- ✅ Quản lý Stores (CRUD đầy đủ)
- ✅ Xem danh sách Roles

---

## 2. STORE_MANAGER (Store Manager)

### Mô Tả
Quản lý cửa hàng có quyền xem báo cáo, duyệt các yêu cầu quan trọng và quản lý tổng thể hoạt động cửa hàng.

### Quyền Truy Cập Trang

| Trang | Quyền |
|-------|-------|
| Dashboard | ✅ Xem đầy đủ |
| Inventory | ✅ Xem (chỉ xem) |
| Inventory Transactions | ✅ Xem |
| Stock Requests | ✅ Xem + Tạo |
| Procurement | ✅ Xem + Duyệt |
| Suppliers | ✅ Xem (chỉ xem) |
| Reports | ✅ Xem đầy đủ |
| Users | ❌ Không truy cập |

### Chức Năng Chi Tiết

#### 📊 Dashboard
- ✅ Xem đầy đủ dashboard với các KPI:
  - Total Inventory Value
  - Low Stock Items
  - Pending PO Approvals
  - Stock-out Risk
  - Gross Profit (30d)
  - Items Below Safety Stock

#### 📦 Inventory Management
- ✅ Xem danh sách inventory batches
- ✅ Xem chi tiết inventory batch
- ✅ Xem stock alerts
- ❌ Không thể tạo/sửa/xóa inventory batch

#### 📊 Inventory Transactions
- ✅ Xem danh sách tất cả inventory transactions
- ✅ Xem chi tiết transaction
- ✅ Lọc transactions theo:
  - Transaction Type
  - Item ID
  - Batch ID
  - Date range
- ✅ Tạo transaction mới
- ✅ Cập nhật transaction
- ✅ Xóa transaction

#### 📋 Procurement
- ✅ Xem danh sách Purchase Orders
- ✅ Xem chi tiết PO
- ✅ **Duyệt PO (Approve)** ⭐
- ✅ **Từ chối PO (Reject)** ⭐
- ❌ Không thể tạo/sửa/xóa PO

#### 🏢 Suppliers
- ✅ Xem danh sách suppliers
- ✅ Xem chi tiết supplier
- ✅ Xem lịch sử đặt hàng với supplier
- ❌ Không thể tạo/sửa/xóa supplier

#### 📥 Goods Receipts
- ✅ Xem danh sách goods receipts
- ✅ Xem chi tiết goods receipt
- ❌ Không thể tạo/xóa goods receipt

#### 📦 Stock Requests
- ✅ Xem danh sách stock requests
- ✅ **Tạo stock request mới** ⭐
- ❌ Không thể duyệt stock request

#### 💰 Sales
- ✅ Tạo sales transaction
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales

#### 📊 Reports
- ✅ Xem Dashboard report
- ✅ Xem Inventory report
- ✅ Xem Procurement report
- ✅ Xem Sales report
- ✅ Xem Low Stock Alerts
- ✅ Xem Gross Profit report
- ✅ Xem Expired Items report
- ✅ Export tất cả reports

#### ⚙️ Items & Stores
- ✅ Xem danh sách Items
- ✅ Xem danh sách Stores
- ✅ Xem danh sách Roles

---

## 3. INVENTORY_STAFF (Inventory Staff)

### Mô Tả
Nhân viên kho có quyền quản lý hàng tồn kho, nhận hàng và điều chỉnh stock.

### Quyền Truy Cập Trang

| Trang | Quyền |
|-------|-------|
| Dashboard | ❌ Không truy cập |
| Inventory | ✅ Quản lý đầy đủ |
| Inventory Transactions | ✅ Quản lý đầy đủ |
| Stock Requests | ❌ Không truy cập |
| Procurement | ✅ Xem (chỉ xem) |
| Suppliers | ❌ Không truy cập |
| Reports | ✅ Xem (một phần) |
| Users | ❌ Không truy cập |

### Chức Năng Chi Tiết

#### 📦 Inventory Management
- ✅ Xem danh sách inventory batches
- ✅ Xem chi tiết inventory batch
- ✅ **Tạo inventory batch mới** ⭐
- ✅ **Cập nhật inventory batch** ⭐
- ✅ **Xóa inventory batch** ⭐
- ✅ Xem stock alerts

#### 📊 Inventory Transactions
- ✅ Xem danh sách tất cả inventory transactions
- ✅ Xem chi tiết transaction
- ✅ Lọc transactions theo:
  - Transaction Type
  - Item ID
  - Batch ID
  - Date range
- ✅ Tạo transaction mới
- ✅ Cập nhật transaction
- ✅ Xóa transaction

#### 📋 Procurement
- ✅ Xem danh sách Purchase Orders
- ✅ Xem chi tiết PO
- ❌ Không thể tạo/sửa/xóa/duyệt PO

#### 📥 Goods Receipts
- ✅ Xem danh sách goods receipts
- ✅ Xem chi tiết goods receipt
- ✅ **Tạo goods receipt mới (GRN)** ⭐
- ❌ Không thể xóa goods receipt

#### 📊 Reports
- ✅ Xem Inventory report
- ✅ Xem Low Stock Alerts
- ✅ Xem Expired Items report
- ❌ Không xem được Dashboard, Procurement, Sales reports

#### 💰 Sales
- ✅ Tạo sales transaction
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales

#### ⚙️ Items & Stores
- ✅ Xem danh sách Items
- ✅ Xem danh sách Stores
- ✅ Xem danh sách Roles

---

## 4. PROCUREMENT_STAFF (Procurement Staff)

### Mô Tả
Nhân viên mua hàng có quyền quản lý đơn đặt hàng, nhà cung cấp và tạo PO.

### Quyền Truy Cập Trang

| Trang | Quyền |
|-------|-------|
| Dashboard | ✅ Xem (read-only) |
| Inventory | ❌ Không truy cập |
| Inventory Transactions | ❌ Không truy cập |
| Stock Requests | ✅ Xem + Duyệt |
| Procurement | ✅ Quản lý đầy đủ |
| Suppliers | ✅ Quản lý đầy đủ |
| Reports | ✅ Xem (một phần) |
| Users | ❌ Không truy cập |

### Chức Năng Chi Tiết

#### 📊 Dashboard
- ✅ Xem dashboard (read-only)
- ✅ Xem các KPI:
  - Total Inventory Value
  - Low Stock Items
  - Pending PO Approvals
  - Stock-out Risk
  - Gross Profit (30d)
  - Items Below Safety Stock
- ❌ Không có quyền chỉnh sửa

#### 📋 Procurement
- ✅ Xem danh sách Purchase Orders
- ✅ Xem chi tiết PO
- ✅ **Tạo PO mới** ⭐
- ✅ **Cập nhật PO** ⭐ (chỉ khi PO chưa được duyệt và chưa bị hủy)
- ✅ **Xác nhận PO từ supplier (Confirm)** ⭐
- ✅ **Xóa PO** ⭐
- ❌ Không thể duyệt/từ chối PO (chỉ STORE_MANAGER mới có quyền này)

#### 🏢 Suppliers
- ✅ Xem danh sách suppliers
- ✅ Xem chi tiết supplier
- ✅ **Tạo supplier mới** ⭐
- ✅ **Cập nhật supplier** ⭐
- ✅ **Xóa supplier** ⭐
- ✅ Xem lịch sử đặt hàng với supplier

#### 📦 Stock Requests
- ✅ Xem danh sách stock requests
- ✅ **Duyệt stock request (Approve)** ⭐
- ✅ **Tự động tạo PO từ stock requests** ⭐
- ✅ **Tự động replenish khi dưới Safety Stock** ⭐
- ❌ Không thể tạo stock request mới

#### 📊 Reports
- ✅ Xem Dashboard report
- ✅ Xem Procurement report
- ❌ Không xem được Inventory, Sales, Expired Items reports

#### 💰 Sales
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales
- ❌ Không thể tạo sales transaction

#### ⚙️ Items & Stores
- ✅ Xem danh sách Items
- ✅ Xem danh sách Stores
- ✅ Xem danh sách Roles

---

## Bảng Tóm Tắt Quyền Hạn

| Chức Năng | ADMIN | STORE_MANAGER | INVENTORY_STAFF | PROCUREMENT_STAFF |
|-----------|:-----:|:-------------:|:---------------:|:-----------------:|
| **User Management** |
| Tạo/Sửa/Xóa User | ✅ | ❌ | ❌ | ❌ |
| **Inventory** |
| Xem Inventory | ✅ | ✅ | ✅ | ❌ |
| Tạo/Sửa Inventory Batch | ✅ | ❌ | ✅ | ❌ |
| Xóa Inventory Batch | ✅ | ❌ | ✅ | ❌ |
| **Inventory Transactions** |
| Xem Transactions | ✅ | ✅ | ✅ | ❌ |
| Tạo/Sửa/Xóa Transaction | ✅ | ✅ | ✅ | ❌ |
| **Procurement** |
| Xem PO | ✅ | ✅ | ✅ | ✅ |
| Tạo PO | ✅ | ❌ | ❌ | ✅ |
| Sửa PO | ✅ | ❌ | ❌ | ✅ |
| Xóa PO | ✅ | ❌ | ❌ | ✅ |
| Duyệt/Từ chối PO | ✅ | ✅ | ❌ | ❌ |
| Xác nhận PO (Supplier) | ✅ | ❌ | ❌ | ✅ |
| **Suppliers** |
| Xem Suppliers | ✅ | ✅ | ❌ | ✅ |
| Tạo/Sửa/Xóa Supplier | ✅ | ❌ | ❌ | ✅ |
| **Goods Receipts** |
| Xem GRN | ✅ | ✅ | ✅ | ❌ |
| Tạo GRN | ✅ | ❌ | ✅ | ❌ |
| Xóa GRN | ✅ | ❌ | ❌ | ❌ |
| **Stock Requests** |
| Xem Stock Requests | ✅ | ✅ | ❌ | ✅ |
| Tạo Stock Request | ✅ | ✅ | ❌ | ❌ |
| Duyệt Stock Request | ✅ | ❌ | ❌ | ✅ |
| Auto Generate PO | ✅ | ❌ | ❌ | ✅ |
| **Sales** |
| Tạo Sales Transaction | ✅ | ✅ | ✅ | ❌ |
| Xem Sales | ✅ | ✅ | ✅ | ✅ |
| **Reports** |
| Dashboard Report | ✅ | ✅ | ❌ | ✅ |
| Inventory Report | ✅ | ✅ | ✅ | ❌ |
| Procurement Report | ✅ | ✅ | ❌ | ✅ |
| Sales Report | ✅ | ✅ | ❌ | ❌ |
| Low Stock Alerts | ✅ | ✅ | ✅ | ❌ |
| Gross Profit Report | ✅ | ✅ | ❌ | ❌ |
| Expired Items Report | ✅ | ✅ | ✅ | ❌ |
| **Items & Stores** |
| Quản lý Items | ✅ | ✅ (xem) | ✅ (xem) | ✅ (xem) |
| Quản lý Stores | ✅ | ✅ (xem) | ✅ (xem) | ✅ (xem) |

---

## Lưu Ý Quan Trọng

### Quy Tắc Duyệt PO
- **STORE_MANAGER** là role duy nhất (ngoài ADMIN) có quyền duyệt/từ chối PO
- **PROCUREMENT_STAFF** chỉ có thể tạo, sửa, xóa PO nhưng không thể duyệt

### Quy Tắc Sửa PO
- **PROCUREMENT_STAFF** chỉ có thể sửa PO khi:
  - PO chưa được duyệt (status: `pending_approval`)
  - PO chưa bị hủy (status: `cancelled`)
  - PO chưa được giao hàng (status: `delivered`)

### Quy Tắc Stock Requests
- **STORE_MANAGER** tạo stock request
- **PROCUREMENT_STAFF** duyệt và tự động tạo PO từ stock requests

### Quy Tắc Goods Receipt (GRN)
- Chỉ **INVENTORY_STAFF** (và ADMIN) mới có quyền tạo GRN khi nhận hàng
- GRN sẽ tự động cập nhật inventory và batch tracking

### Quy Tắc Inventory Transactions
- **STORE_MANAGER** và **INVENTORY_STAFF** có quyền xem và quản lý transactions
- Transactions được tạo tự động khi có GRN hoặc Sales
- Có thể filter theo transaction type, item, batch, và date range

### Quy Tắc Reports
- **STORE_MANAGER** có quyền xem tất cả reports
- **INVENTORY_STAFF** chỉ xem được Inventory, Low Stock, và Expired Items reports
- **PROCUREMENT_STAFF** chỉ xem được Dashboard và Procurement reports

---

## Workflow Điển Hình

### Quy Trình Đặt Hàng (Procurement Flow)
```
1. PROCUREMENT_STAFF tạo PO
   ↓
2. STORE_MANAGER duyệt/từ chối PO
   ↓
3. PROCUREMENT_STAFF xác nhận với supplier
   ↓
4. Supplier giao hàng
   ↓
5. INVENTORY_STAFF tạo GRN (Goods Receipt)
   ↓
6. Hệ thống tự động cập nhật inventory và tạo transactions
```

### Quy Trình Yêu Cầu Hàng (Stock Request Flow)
```
1. STORE_MANAGER tạo Stock Request
   ↓
2. PROCUREMENT_STAFF duyệt Stock Request
   ↓
3. PROCUREMENT_STAFF tự động tạo PO từ Stock Request
   ↓
4. Quy trình tiếp tục như Procurement Flow
```

### Quy Trình Tự Động Replenish
```
1. Hệ thống tự động kiểm tra Safety Stock (chạy cron job hàng ngày)
   ↓
2. Nếu item dưới Safety Stock:
   - Tạo Stock Request tự động
   - Tự động approve
   - Tạo PO tự động
   ↓
3. PROCUREMENT_STAFF xem và xử lý PO
```

### Quy Trình Bán Hàng (Sales Flow)
```
1. STORE_MANAGER hoặc INVENTORY_STAFF tạo Sales Transaction
   ↓
2. Hệ thống tự động:
   - Tính giá vốn theo FIFO
   - Trừ inventory từ batch
   - Tạo Inventory Transaction (ISSUE)
   ↓
3. Tính Gross Profit và cập nhật reports
```

---

## Tính Năng Đặc Biệt

### 1. Inventory Transactions (Giao dịch kho)
- **Mục đích**: Audit trail đầy đủ cho mọi thay đổi trong kho
- **Types**: RECEIPT (nhận hàng), ISSUE (xuất hàng), ADJUSTMENT (điều chỉnh)
- **Reference**: Liên kết với PO, GRN, hoặc Adjustment ID
- **Truy cập**: STORE_MANAGER, INVENTORY_STAFF, ADMIN

### 2. Expired Items Report (Báo cáo hàng hết hạn)
- **Mục đích**: Cảnh báo và theo dõi hàng sắp hết hạn hoặc đã hết hạn
- **Features**: 
  - Filter theo số ngày threshold
  - Hiển thị số ngày còn lại đến hết hạn
  - Export Excel
- **Truy cập**: STORE_MANAGER, INVENTORY_STAFF, ADMIN

### 3. Gross Profit Report (Báo cáo lợi nhuận gộp)
- **Mục đích**: Tính toán và hiển thị lợi nhuận gộp từ sales
- **Features**:
  - Tính giá vốn theo FIFO
  - Filter theo store, date range
  - Hiển thị margin percentage
- **Truy cập**: STORE_MANAGER, ADMIN

### 4. Safety Stock & Auto Replenish
- **Mục đích**: Tự động tạo PO khi inventory dưới Safety Stock
- **Features**:
  - Tính toán Safety Stock dựa trên lead time và demand
  - Cron job chạy hàng ngày lúc 2 AM
  - Tự động tạo Stock Request và PO
- **Truy cập**: PROCUREMENT_STAFF, ADMIN (có thể trigger thủ công)

---

*Tài liệu này được cập nhật dựa trên phân tích code trong hệ thống KFC SCM và bao gồm tất cả các tính năng đã được triển khai.*

