# Tóm Tắt Quyền Hạn Theo Role - KFC SCM System

## Tổng Quan

Hệ thống KFC Supply Chain Management có **4 role** chính với các quyền hạn khác nhau:

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
| Dashboard | ✅ Xem |
| Inventory | ✅ Xem |
| Procurement | ✅ Xem |
| Suppliers | ✅ Xem |
| Reports | ✅ Xem |
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
- ✅ Xóa inventory batch

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

#### 📥 Goods Receipts (Nhận hàng)
- ✅ Xem danh sách goods receipts
- ✅ Xem chi tiết goods receipt
- ✅ Tạo goods receipt mới (GRN)
- ✅ Xóa goods receipt

#### 📊 Reports (Báo cáo)
- ✅ Xem Dashboard report
- ✅ Xem Inventory report
- ✅ Xem Procurement report
- ✅ Xem Sales report
- ✅ Xem Low Stock Alerts

#### 📦 Stock Requests (Yêu cầu hàng)
- ✅ Xem danh sách stock requests
- ✅ Duyệt stock request (Approve)
- ✅ Tự động tạo PO từ stock requests

#### 💰 Sales (Bán hàng)
- ✅ Tạo sales transaction
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales

#### ⚙️ Items & Stores (Sản phẩm & Cửa hàng)
- ✅ Quản lý Items (CRUD)
- ✅ Quản lý Stores (CRUD)

---

## 2. STORE_MANAGER (Store Manager)

### Mô Tả
Quản lý cửa hàng có quyền xem báo cáo, duyệt các yêu cầu quan trọng và quản lý tổng thể hoạt động cửa hàng.

### Quyền Truy Cập Trang

| Trang | Quyền |
|-------|-------|
| Dashboard | ✅ Xem (đầy đủ) |
| Inventory | ✅ Xem (chỉ xem) |
| Procurement | ✅ Xem + Duyệt |
| Suppliers | ✅ Xem (chỉ xem) |
| Reports | ✅ Xem |
| Users | ❌ Không truy cập |

### Chức Năng Chi Tiết

#### 📊 Dashboard
- ✅ Xem đầy đủ dashboard với các KPI
- ✅ Xem thống kê tổng quan

#### 📦 Inventory Management
- ✅ Xem danh sách inventory batches
- ✅ Xem chi tiết inventory batch
- ✅ Xem stock alerts
- ❌ Không thể tạo/sửa/xóa inventory batch

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

#### 📊 Reports
- ✅ Xem Dashboard report
- ✅ Xem Inventory report
- ✅ Xem Procurement report
- ✅ Xem Sales report
- ✅ Xem Low Stock Alerts

#### 📦 Stock Requests
- ✅ Xem danh sách stock requests
- ✅ **Tạo stock request mới** ⭐
- ❌ Không thể duyệt stock request

#### 💰 Sales
- ✅ Tạo sales transaction
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales

#### ⚙️ Items & Stores
- ✅ Xem danh sách Items
- ✅ Xem danh sách Stores

---

## 3. INVENTORY_STAFF (Inventory Staff)

### Mô Tả
Nhân viên kho có quyền quản lý hàng tồn kho, nhận hàng và điều chỉnh stock.

### Quyền Truy Cập Trang

| Trang | Quyền |
|-------|-------|
| Dashboard | ❌ Không truy cập |
| Inventory | ✅ Quản lý đầy đủ |
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
- ✅ Xem stock alerts
- ❌ Không thể xóa inventory batch

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
- ❌ Không xem được Dashboard, Procurement, Sales reports

#### 💰 Sales
- ✅ Tạo sales transaction
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales

#### ⚙️ Items & Stores
- ✅ Xem danh sách Items
- ✅ Xem danh sách Stores

---

## 4. PROCUREMENT_STAFF (Procurement Staff)

### Mô Tả
Nhân viên mua hàng có quyền quản lý đơn đặt hàng, nhà cung cấp và tạo PO.

### Quyền Truy Cập Trang

| Trang | Quyền |
|-------|-------|
| Dashboard | ✅ Xem (read-only) |
| Inventory | ❌ Không truy cập |
| Procurement | ✅ Quản lý đầy đủ |
| Suppliers | ✅ Quản lý đầy đủ |
| Reports | ✅ Xem (một phần) |
| Users | ❌ Không truy cập |

### Chức Năng Chi Tiết

#### 📊 Dashboard
- ✅ Xem dashboard (read-only)
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

#### 📊 Reports
- ✅ Xem Dashboard report
- ✅ Xem Procurement report
- ❌ Không xem được Inventory, Sales reports

#### 📦 Stock Requests
- ✅ Xem danh sách stock requests
- ✅ **Duyệt stock request (Approve)** ⭐
- ✅ **Tự động tạo PO từ stock requests** ⭐
- ❌ Không thể tạo stock request mới

#### 💰 Sales
- ✅ Xem danh sách sales
- ✅ Xem chi tiết sales
- ❌ Không thể tạo sales transaction

#### ⚙️ Items & Stores
- ✅ Xem danh sách Items
- ✅ Xem danh sách Stores

---

## Bảng Tóm Tắt Quyền Hạn

| Chức Năng | ADMIN | STORE_MANAGER | INVENTORY_STAFF | PROCUREMENT_STAFF |
|-----------|:-----:|:-------------:|:---------------:|:-----------------:|
| **User Management** |
| Tạo/Sửa/Xóa User | ✅ | ❌ | ❌ | ❌ |
| **Inventory** |
| Xem Inventory | ✅ | ✅ | ✅ | ❌ |
| Tạo/Sửa Inventory Batch | ✅ | ❌ | ✅ | ❌ |
| Xóa Inventory Batch | ✅ | ❌ | ❌ | ❌ |
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
| Tạo Stock Request | ❌ | ✅ | ❌ | ❌ |
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
6. Hệ thống tự động cập nhật inventory
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

---

*Tài liệu này được tạo tự động dựa trên phân tích code trong hệ thống KFC SCM.*

