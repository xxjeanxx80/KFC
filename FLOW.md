👔 MANAGER (Mana) – “THẰNG QUYẾT”

Vai trò:
👉 Quyết định CÓ MUA hay KHÔNG MUA, mua bao nhiêu là chấp nhận được

Manager KHÔNG:

Không đụng kho

Không nhận hàng

Không sửa số lượng tồn

Manager CHỈ:

Xem tình hình

Phê duyệt

Chịu trách nhiệm cuối

📌 Nếu có vấn đề → Manager chịu

🧾 PROCUREMENT (Pro) – “THẰNG ĐI MUA”

Vai trò:
👉 Lo MUA Ở ĐÂU – MUA BAO NHIÊU – GIÁ BAO NHIÊU – KHI NÀO GIAO

Procurement KHÔNG:

Không đụng kho

Không nhận hàng

Không tự duyệt mua

Procurement CHỈ:

Lập đơn mua (PO)

Chọn nhà cung cấp

Gửi PO đi

Theo dõi giao hàng

📌 Nếu mua sai giá / sai supplier → Procurement chịu

📦 INVENTORY (Kho) – “THẰNG GIỮ HÀNG”

Vai trò:
👉 Lo HÀNG THỰC TẾ

Inventory KHÔNG:

Không quyết định mua

Không duyệt đơn

Không sửa giá

Inventory CHỈ:

Nhận hàng

Đếm hàng

Ghi nhận tồn kho

Theo dõi hạn dùng

📌 Nếu thiếu hàng / sai số → Inventory chịu

2️⃣ BÂY GIỜ ĐI THEO 1 FLOW THỰC TẾ (CỰC QUAN TRỌNG)
🟢 BƯỚC 1: THIẾU HÀNG → AI THẤY?

👉 Manager là thằng thấy trước tiên

Ví dụ:

Dashboard báo:

Gà còn 20kg

Ngày mai cần 40kg

➡️ Manager biết: thiếu

🟢 BƯỚC 2: CẦN MUA → AI NÓI?

👉 Manager là thằng NÓI “CẦN”

➡️ Manager tạo Stock Request

Ý nghĩa:

“Tao thấy sắp thiếu, cần mua thêm”

❗ Stock Request KHÔNG PHẢI đơn mua
→ Chỉ là yêu cầu nội bộ

🟢 BƯỚC 3: AI ĐI MUA?

👉 Procurement nhận yêu cầu

Procurement:

Xem stock request

Kiểm tra:

Mua ở đâu

Giá bao nhiêu

Lead time

➡️ Procurement tạo Purchase Order (PO)

🟢 BƯỚC 4: AI QUYẾT ĐỊNH “MUA THIỆT”?

👉 Manager duyệt PO

Trước đó:

PO chỉ là đề xuất

Sau khi duyệt:

PO = cam kết mua thật

📌 ĐÂY LÀ ĐIỂM QUAN TRỌNG NHẤT

🟢 BƯỚC 5: AI GỬI ĐƠN ĐI?

👉 Procurement gửi PO cho supplier

Gọi điện

Email

EDI

➡️ Hệ thống chỉ ghi:

PO = SENT

🟢 BƯỚC 6: HÀNG VỀ → AI NHẬN?

👉 Inventory là thằng DUY NHẤT được nhận

Inventory:

Mở PO

Đếm hàng

So với PO

➡️ Inventory tạo Goods Receipt (GRN)

📌 ĐÂY LÀ LÚC TỒN KHO TĂNG

🟢 BƯỚC 7: AI GHI SỔ?

👉 HỆ THỐNG TỰ LÀM

Khi GRN được tạo:

Tạo inventory batch

Tạo inventory transaction (RECEIPT)

Cập nhật tồn kho

❗ Inventory không tự cộng số

3️⃣ TẠI SAO PHẢI LÀM VÒNG VÈ NHƯ VẬY?
❓ Sao không cho Procurement vừa mua vừa nhận?

➡️ Vì:

Nó mua khống

Nó báo “đã nhận đủ” dù chưa có

❓ Sao không cho Manager nhận hàng?

➡️ Vì:

Manager có quyền duyệt

Nếu vừa duyệt vừa nhận → gian lận

📌 ERP luôn tách 3 thằng này

4️⃣ TÓM TẮT CỰC NGẮN (BẠN PHẢI THUỘC)
Thằng	1 câu dễ nhớ
Manager	“Có mua hay không là tao quyết”
Procurement	“Tao lo mua cho đúng chỗ, đúng giá”
Inventory	“Tao chỉ tin hàng tao đếm”
5️⃣ SƠ ĐỒ NHỚ NHANH
Manager thấy thiếu
      ↓
Manager tạo Stock Request
      ↓
Procurement tạo PO
      ↓
Manager duyệt PO
      ↓
Procurement gửi PO
      ↓
Inventory nhận hàng (GRN)
      ↓
System cập nhật tồn kho