# Hướng dẫn Deploy Frontend lên Vercel

## Yêu cầu trước khi deploy

1. **Backend API đã được deploy** và có URL công khai
2. **Environment Variables** cần được cấu hình trong Vercel

## Các bước deploy

### 1. Chuẩn bị Environment Variables

Trong Vercel Dashboard, thêm Environment Variable:
- **Key**: `VITE_API_BASE_URL`
- **Value**: URL của backend API (ví dụ: `https://your-backend-api.vercel.app`)

### 2. Deploy trên Vercel

#### Cách 1: Deploy qua Vercel CLI
```bash
npm install -g vercel
cd frontend
vercel
```

#### Cách 2: Deploy qua GitHub
1. Push code lên GitHub repository
2. Vào [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import repository từ GitHub
5. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Thêm Environment Variable `VITE_API_BASE_URL`
7. Click "Deploy"

### 3. Cấu hình Routing (SPA)

File `vercel.json` đã được tạo để hỗ trợ SPA routing. Tất cả routes sẽ được redirect về `/index.html`.

## Kiểm tra sau khi deploy

1. ✅ Ứng dụng có thể truy cập được
2. ✅ Login page hiển thị đúng
3. ✅ API calls hoạt động (kiểm tra Network tab trong DevTools)
4. ✅ Routing hoạt động khi refresh page
5. ✅ Tất cả assets (CSS, JS, images) load được

## Troubleshooting

### Lỗi: API calls fail với CORS
- Đảm bảo backend đã cấu hình CORS để cho phép domain của Vercel
- Kiểm tra `VITE_API_BASE_URL` đã được set đúng chưa

### Lỗi: 404 khi refresh page
- Kiểm tra file `vercel.json` đã có trong repository
- Đảm bảo `rewrites` rule đã được cấu hình đúng

### Lỗi: Build failed
- Kiểm tra tất cả dependencies đã được install
- Kiểm tra TypeScript errors: `npm run build` trong local
- Kiểm tra Node.js version trong Vercel (nên dùng Node 18+)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://api.example.com` |

## Notes

- Vite sử dụng prefix `VITE_` cho environment variables
- Variables sẽ được inject vào build time, không phải runtime
- Sau khi thay đổi environment variables, cần rebuild và redeploy

