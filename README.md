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

## Kiểm thử

```bash
cd backend && npm test    # tính phòng trống, nghiệp vụ đặt phòng
cd frontend && npm test   # logic đặt phòng thuần (src/lib/booking.mjs)
cd frontend && npx next lint && npx next build
```

## Giao diện khách

- Thiết kế: `docs/superpowers/specs/2026-11-13-redesign-booking-ui-design.md` (nền than ấm, điểm nhấn vàng, vé giấy).
- Token màu/khoảng cách ở `frontend/src/styles/_tokens.scss` (chỉ áp trong `.theme-box`, admin giữ giao diện cũ); keyframe và mixin ở `_motion.scss`.
- Component dùng chung ở `frontend/src/components/ui` (Button, Ticket, TimeGrid, Field, Dialog…).
- Luồng đặt: Trang chủ (tìm phòng) → `/bookRoom` (lưới phòng × giờ, lựa chọn lưu trên URL) → `/bookRoom/checkout` (liên hệ, phim, combo, mã giảm giá, thanh toán) → `/bookRoom/<mã vé>`.
- API phục vụ giao diện mới: `GET /api/booking/availability?branch&date`, `GET /api/promotion/check?code`.
- Animation chỉ dùng transform/opacity và tắt hết khi người dùng bật giảm chuyển động.

## Ghi chú triển khai

- `CLIENT_URL` (backend) phải trùng origin của frontend để CORS, socket và returnUrl PayOS hoạt động.
- Webhook PayOS trỏ về `POST <API>/api/payos/webhook`.
- Khi FE và API khác domain: đăng nhập trả về `token`, FE lưu và gửi qua header `Authorization: Bearer`.
- Đơn > 150.000đ phải thanh toán (cọc 50% hoặc toàn bộ) trong 15 phút, quá hạn tự chuyển `THẤT BẠI`.
- Đơn đã thanh toán đủ sẽ tự chuyển `HOÀN THÀNH` khi hết giờ để khách đánh giá.
