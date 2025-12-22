# ✅ Checklist Deploy Frontend lên Vercel

## 📋 Trước khi deploy

### 1. Code đã sẵn sàng
- [x] ✅ Build script đã có trong `package.json` (`npm run build`)
- [x] ✅ TypeScript config đã đúng
- [x] ✅ Dependencies đã được cài đặt đầy đủ
- [x] ✅ API base URL đã được chuyển sang environment variable
- [x] ✅ File `vercel.json` đã được tạo với SPA routing config

### 2. Environment Variables
- [ ] ⚠️ **CẦN THIẾT**: Thêm `VITE_API_BASE_URL` trong Vercel Dashboard
  - Key: `VITE_API_BASE_URL`
  - Value: URL backend API (ví dụ: `https://your-backend.vercel.app`)

### 3. Backend API
- [ ] ⚠️ **CẦN THIẾT**: Backend đã được deploy và có URL công khai
- [ ] ⚠️ **CẦN THIẾT**: Backend đã cấu hình CORS để cho phép domain Vercel

## 🚀 Các bước deploy

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Bước 2: Deploy trên Vercel
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import repository từ GitHub
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (hoặc để trống nếu repo chỉ có frontend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Thêm Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: URL backend API của bạn
6. Click "Deploy"

### Bước 3: Kiểm tra sau khi deploy
- [ ] ✅ Ứng dụng có thể truy cập được
- [ ] ✅ Login page hiển thị đúng
- [ ] ✅ API calls hoạt động (kiểm tra Network tab)
- [ ] ✅ Routing hoạt động khi refresh page
- [ ] ✅ Tất cả assets load được

## 🔧 Cấu hình đã được thiết lập

### File `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variable trong code
- File `enhanced-api.ts` đã được cập nhật để sử dụng `import.meta.env.VITE_API_BASE_URL`
- Fallback về `http://localhost:3001` nếu không có env variable (cho development)

## ⚠️ Lưu ý quan trọng

1. **Environment Variables**: Phải được set trong Vercel Dashboard, không phải trong file `.env`
2. **CORS**: Backend phải cấu hình CORS để cho phép domain Vercel
3. **Build Time**: Environment variables được inject vào build time, cần rebuild sau khi thay đổi
4. **SPA Routing**: File `vercel.json` đã cấu hình để hỗ trợ SPA routing

## 🐛 Troubleshooting

### Build failed
- Kiểm tra Node.js version (nên dùng Node 18+)
- Chạy `npm run build` local để kiểm tra lỗi
- Kiểm tra tất cả dependencies đã được install

### API calls fail
- Kiểm tra `VITE_API_BASE_URL` đã được set đúng chưa
- Kiểm tra backend CORS configuration
- Kiểm tra Network tab trong DevTools để xem lỗi cụ thể

### 404 khi refresh page
- Kiểm tra file `vercel.json` đã có trong repository
- Đảm bảo `rewrites` rule đã được cấu hình

## 📝 Files đã được tạo/cập nhật

- ✅ `vercel.json` - Cấu hình Vercel deployment
- ✅ `DEPLOY.md` - Hướng dẫn chi tiết về deployment
- ✅ `src/services/enhanced-api.ts` - Đã cập nhật để dùng env variable
- ✅ `VERCEL_CHECKLIST.md` - File này

## 🎯 Kết luận

Frontend đã **SẴN SÀNG** để deploy lên Vercel với các điều kiện:
1. ✅ Code đã được chuẩn bị đầy đủ
2. ⚠️ Cần set `VITE_API_BASE_URL` trong Vercel Dashboard
3. ⚠️ Backend API phải đã được deploy và cấu hình CORS

