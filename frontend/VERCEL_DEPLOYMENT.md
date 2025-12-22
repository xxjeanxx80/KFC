# Hướng dẫn Deploy Frontend lên Vercel

## Cấu hình Biến Môi Trường trên Vercel

Để ứng dụng frontend có thể kết nối với backend, bạn cần cấu hình biến môi trường trên Vercel:

### Bước 1: Truy cập Vercel Dashboard

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào mục **Settings** > **Environment Variables**

### Bước 2: Thêm Biến Môi Trường

Thêm biến môi trường sau:

**Tên biến:** `VITE_API_BASE_URL`  
**Giá trị:** URL của backend API (ví dụ: `https://backendkfc.onrender.com`)

**Lưu ý:**
- Không thêm dấu `/` ở cuối URL
- Đảm bảo URL backend đã được deploy và hoạt động
- Áp dụng cho tất cả các môi trường (Production, Preview, Development)

### Bước 3: Redeploy

Sau khi thêm biến môi trường, bạn cần:

1. Vào mục **Deployments**
2. Chọn deployment mới nhất
3. Click vào menu **...** (3 chấm)
4. Chọn **Redeploy**

Hoặc bạn có thể push một commit mới lên repository để trigger deployment tự động.

## Kiểm tra Cấu hình

Sau khi deploy, kiểm tra trong browser console:

1. Mở ứng dụng trên Vercel
2. Mở Developer Tools (F12)
3. Vào tab **Console**
4. Kiểm tra log để xem API base URL đã được cấu hình đúng chưa

Nếu thấy log `[API] Making POST request to /auth/login` với URL đúng, nghĩa là cấu hình đã thành công.

## Xử lý Lỗi CORS

Nếu vẫn gặp lỗi CORS sau khi cấu hình:

1. Kiểm tra backend đã được deploy và hoạt động
2. Kiểm tra biến môi trường `FRONTEND_URL` trên Render (backend) đã được cấu hình với URL Vercel của bạn
3. Đảm bảo backend đã được cập nhật với cấu hình CORS mới nhất

## Cấu hình Backend trên Render

Trên Render Dashboard, thêm biến môi trường:

**Tên biến:** `FRONTEND_URL`  
**Giá trị:** URL của frontend trên Vercel (ví dụ: `https://your-app.vercel.app`)

Sau đó restart service backend trên Render.

