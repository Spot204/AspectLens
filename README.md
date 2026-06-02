# AspectLens

Hướng dẫn cài đặt và chạy dự án `AspectLens` sử dụng React + Vite.

## Yêu cầu

- Node.js phiên bản 18+ hoặc tương đương
- npm (đi kèm Node.js)

## Cài đặt

1. Mở terminal tại thư mục gốc dự án:
   ```bash
   cd c:\Code\Website\aspectlens
   ```
2. Cài đặt các package:
   ```bash
   npm install
   ```

## Chạy ứng dụng ở chế độ phát triển

```bash
npm run dev
```

Sau khi chạy lệnh này, Vite sẽ khởi động server phát triển. Mở trình duyệt và truy cập địa chỉ được hiển thị trong terminal, mặc định thường là:

```bash
http://localhost:5173
```

## Build sản phẩm để triển khai

```bash
npm run build
```

Lệnh này sẽ tạo thư mục `dist` chứa file đã được đóng gói sẵn, có thể dùng để deploy.

## Xem lại build cục bộ

```bash
npm run preview
```

Lệnh này chạy server để xem trước build đã tạo.

## Lint mã nguồn

```bash
npm run lint
```

## Thư mục chính

- `src/` - mã nguồn React
- `src/components/` - các component giao diện
- `src/services/` - các dịch vụ API, xử lý dữ liệu
- `public/` - tài nguyên tĩnh

## Ghi chú

- Dự án dùng `Vite`, `React`, `Tailwind CSS`, `axios`, `recharts`, `papaparse`, và `xlsx`.
- Nếu gặp lỗi sau khi cài đặt, hãy thử xóa thư mục `node_modules` và file `package-lock.json`, sau đó chạy lại `npm install`.
