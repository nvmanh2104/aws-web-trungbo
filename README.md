# Quản Lý Trạm AWS - Trung Bộ

## Cài đặt nhanh (lần đầu dùng máy mới)

### Bước 1: Cài Node.js
- Vào https://nodejs.org → Tải bản **LTS** → Cài bình thường (Next → Next → Finish)
- Mở **Command Prompt** (Win+R → gõ `cmd` → Enter), gõ:
  ```
  node -v
  npm -v
  ```
  Nếu thấy số version là cài thành công.

### Bước 2: Cài VS Code
- Vào https://code.visualstudio.com → Tải → Cài bình thường

### Bước 3: Chạy project
- Giải nén thư mục `tram-aws` vào nơi muốn (ví dụ `C:\Projects\tram-aws`)
- Mở VS Code → File → Open Folder → chọn thư mục `tram-aws`
- Mở Terminal trong VS Code: menu **Terminal → New Terminal**
- Gõ lệnh:
  ```
  npm install
  npm start
  ```
- Trình duyệt tự mở tại http://localhost:3000

## Cấu trúc project

```
tram-aws/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── stationApi.js      ← Gọi API backend
│   ├── components/
│   │   ├── StationForm.jsx    ← Form thêm/sửa trạm
│   │   ├── StationDetail.jsx  ← Xem chi tiết trạm
│   │   ├── ConfirmDialog.jsx  ← Hộp thoại xác nhận xoá
│   │   └── Toast.jsx          ← Thông báo
│   ├── App.jsx                ← Màn hình chính
│   ├── index.js               ← Entry point
│   └── index.css              ← CSS toàn cục
└── package.json
```

## Đổi URL API
Mở file `src/api/stationApi.js`, sửa dòng đầu:
```js
const BASE_URL = 'http://222.255.11.94:3030/trungbo-aws-config';
```
