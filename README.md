# PNM - BOX

Website đặt phòng cafe phim phòng riêng.

| Thư mục | Vai trò | Công nghệ |
|---|---|---|
| `backend/` | API | Express, MongoDB (Mongoose), Socket.IO, PayOS, OpenAI, Cloudinary |
| `frontend/` | Giao diện | Next.js 13 (Pages Router), SCSS modules, SWR |

## Chạy local

```bash
cd backend && cp .env.example .env   # điền giá trị thật
npm install && npm run dev
```

```bash
cd frontend && cp .env.example .env
npm install && npm run dev
```

Mặc định API chạy ở `http://localhost:2911`, giao diện ở `http://localhost:3000`.

## Ghi chú triển khai

- `CLIENT_URL` (backend) phải trùng origin của frontend để CORS, socket và returnUrl PayOS hoạt động.
- Webhook PayOS trỏ về `POST <API>/api/payos/webhook`.
- Khi FE và API khác domain: đăng nhập trả về `token`, FE lưu và gửi qua header `Authorization: Bearer`.
- Đơn > 150.000đ phải thanh toán (cọc 50% hoặc toàn bộ) trong 15 phút, quá hạn tự chuyển `THẤT BẠI`.
- Đơn đã thanh toán đủ sẽ tự chuyển `HOÀN THÀNH` khi hết giờ để khách đánh giá.
