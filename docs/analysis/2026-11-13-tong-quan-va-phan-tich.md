# PNM-BOX (tbox2026) — Tổng quan & phân tích chức năng

_Ngày: 13/11/2026 — đọc toàn bộ code, chạy UI với mock API để kiểm tra trực quan._

---

## B1. Tổng quan dự án

### Cấu trúc (lưu ý: tên thư mục bị đảo)

| Thư mục | Thực chất là | Công nghệ |
|---|---|---|
| `frontend/` | **API server** | Node + Express 4, MongoDB/Mongoose, Socket.IO, PayOS, OpenAI (gpt-4o-mini), Cloudinary, Nodemailer, node-cron |
| `backend/` | **Giao diện web** | Next.js 13 (Pages Router), React 18, SCSS modules, SWR, axios, Swiper, Recharts, react-quill/tiptap |

### Mô hình dữ liệu

`account` (user/admin/employee, OTP) · `branches` (cơ sở) · `roomTypes` (giá/phút) · `rooms` (thuộc branch + type) · `timeSlots` (khung 30 phút) · `films` · `combo` (giá theo loại phòng + thời lượng) · `promotions` (% giảm, số lượng) · `booking` · `review` · `news`.

### Luồng chính

1. **Đăng ký → OTP email → kích hoạt → đăng nhập**: server set cookie `token` (JWT 7 ngày, httpOnly). FE lưu `email` vào localStorage.
2. **Đặt phòng** (`/bookRoom`): chọn phim → cơ sở → ngày + loại phòng → phòng → khung giờ (tự chọn đủ thời lượng phim) → combo / mã giảm giá → `POST /api/booking/create`.
   - Server tính tiền: combo → giá combo theo loại phòng; không combo → `giá/phút × số phút`; trừ % khuyến mãi.
   - **≤ 150.000đ** → `THÀNH CÔNG` ngay, gửi email.
   - **> 150.000đ** → `CHỜ THANH TOÁN`, FE mở popup cọc 50% / 100% → `POST /api/payos/create` → chuyển sang PayOS.
   - PayOS gọi **webhook** → so số tiền → `ĐÃ THANH TOÁN 50%` / `ĐÃ THANH TOÁN`, status `THÀNH CÔNG`.
   - **Cron mỗi phút**: đơn `CHỜ THANH TOÁN` quá 15 phút → `THẤT BẠI`.
3. **Realtime**: Socket.IO phát `newBooking` / `editBooking`, trang đặt phòng tự khoá khung giờ đã có người đặt.
4. **Người dùng**: `/overview` (thống kê), `/account`, `/invoiceDetail` (lịch sử, thanh toán tiếp, huỷ, đánh giá khi `HOÀN THÀNH`).
5. **Admin** (`/admin/*`): quản lý đặt phòng (sơ đồ phòng đang dùng, refresh 5s), tài khoản, phim, cơ sở/phòng/loại phòng, tin tức, combo, khuyến mãi, hoá đơn, thống kê.
6. **Chatbot** (socket `chatbot:message`): bóc ý định bằng từ khoá (phim hot, phòng trống, hướng dẫn…) → truy vấn Mongo → GPT diễn đạt câu trả lời.

---

## B3. Phân tích chức năng — lỗi, rủi ro, thiếu sót

Mức độ: 🔴 nghiêm trọng · 🟠 cao · 🟡 trung bình · ⚪ nhỏ/dọn dẹp

### 🔴 Bảo mật — API gần như không có phân quyền

| # | Vấn đề | Vị trí | Hậu quả |
|---|---|---|---|
| S1 | `verifyRole` được viết nhưng **không route nào dùng**; mọi route CRUD admin không cần đăng nhập | `frontend/src/routes/*.js` | Ai cũng gọi được tạo/sửa/xoá phim, phòng, cơ sở, combo, khuyến mãi, tin tức |
| S2 | `PUT /api/account/edit-account-by-email/:email` không auth, nhận `role` và `password` | `routes/AccountRoutes.js:20`, `controllers/accountContrller.js` | **Ai cũng tự nâng mình thành admin hoặc đổi mật khẩu người khác** |
| S3 | `GET /all-account-data`, `/account-by-email`, `POST /toggle-lock`, `DELETE /delete/:email` không auth | `routes/AccountRoutes.js` | Lộ danh sách khách hàng, khoá/xoá tài khoản bất kỳ |
| S4 | `PUT /api/booking/edit/:_id` không auth, không kiểm chủ đơn | `routes/bookingRoutes.js:39` | Huỷ đơn / đánh dấu "ĐÃ THANH TOÁN" cho đơn bất kỳ |
| S5 | `POST /booking/create` nhận `status`, `isPay` từ client | `bookingController.js:15,116-117` | Gửi `isPay: "ĐÃ THANH TOÁN"` là có đơn "đã thanh toán" |
| S6 | `get-booking-by-id/:id` công khai, `id_booking` là số tuần tự (DDMM + 2 số) | `bookingController.js:347` | Dò được tên, email, SĐT của mọi khách |
| S7 | JWT secret **hardcode trong code FE** | `backend/src/middleware.js:6` | Nếu trùng `JWT_SECRET` của server → ai cũng ký được token admin. Cần đổi secret ngay |
| S8 | `GET /account/data` trả nguyên document: **hash mật khẩu + OTP** | `accountContrller.js:3-20` | Lộ dữ liệu nhạy cảm ra trình duyệt |
| S9 | Tin tức render bằng `dangerouslySetInnerHTML` + API tạo tin không auth | `NewsDetail.js:55`, `NewsItem.js:21` | Stored XSS |
| S10 | Không giới hạn số lần thử OTP (6 số, 5 phút), login, chatbot | auth, socket | Brute-force OTP; spam chatbot đốt tiền OpenAI |
| S11 | `createOrder` lấy `amount` từ client | `payosController.js:13` | Số tiền link thanh toán do client quyết định (webhook có chặn, nhưng nên tính ở server) |

### 🔴 Lỗi nghiệp vụ nghiêm trọng

| # | Vấn đề | Vị trí | Hậu quả |
|---|---|---|---|
| B1 | **Mã đơn `id_booking` = DDMM + số thứ tự, không có năm**, lại `unique` | `services/booking.js` | Từ năm thứ 2 trở đi, ngày nào năm trước đã có đơn thì đơn đầu tiên năm nay bị **trùng khoá → đặt phòng lỗi 500**. Hiện đã là 11/2026 nên lỗi này đang xảy ra nếu DB có dữ liệu 2025 |
| B2 | Kiểm tra trùng lịch **bỏ qua đơn `CHỜ THANH TOÁN`** | `bookingController.js:34`, `payosController.js:41` | Người B vẫn đặt được khung giờ người A đang thanh toán → 2 đơn cùng phòng cùng giờ |
| B3 | Không có khoá/transaction khi tạo đơn; `id_booking` đếm `countDocuments` | `bookingController.js`, `services/booking.js` | 2 người đặt cùng lúc → trùng lịch hoặc trùng mã |
| B4 | **Trang người dùng dùng `LayoutAdmin` → `useAdminAuth()`** chỉ đọc token trong localStorage, mà server **không bao giờ trả token** khi login | `layout/LayoutAdmin/LayoutAdmin.js:12`, `hooks/useAdminAuth.js`, `authController.login` | `/overview`, `/account`, `/invoiceDetail` và mọi trang `/admin/*` đều bị đá về trang chủ (kể cả admin) |
| B5 | Server chỉ đọc token từ **cookie**, FE gửi `Authorization: Bearer` | `authMiddleware.js:5` vs `config/axios.js` | Cơ chế "localStorage token cho Vercel" không hoạt động ở 2 đầu |
| B6 | Tạo khuyến mãi luôn lỗi: server đọc `quanlity`, FE gửi `quantity`, model yêu cầu `quantity` | `promotionController.js:5,62` | Admin không tạo được mã; sửa số lượng không có tác dụng |
| B7 | Mã giảm giá không kiểm `quantity > 0`, trừ cả khi đơn sau đó thất bại | `bookingController.js:64-126` | Số lượng âm, dùng vô hạn |
| B8 | Giảm % → tiền lẻ; cọc `total/2` có thể lẻ | `bookingController.js:97,100` | PayOS yêu cầu số nguyên → tạo link thất bại |
| B9 | Ngày/giờ xử lý theo múi giờ của **máy server** (`setHours`) | `bookingController.js:23-26,199` | Deploy trên server UTC → đơn đặt sáng sớm bị tính sang ngày hôm trước |
| B10 | Webhook đến sau khi cron đã chuyển `THẤT BẠI` → vẫn set `THÀNH CÔNG`; không gửi email/socket sau thanh toán | `payosController.js:68-114` | Đơn "sống lại" dù slot có thể đã bị người khác lấy; admin không thấy realtime |
| B11 | Chatbot dùng chung **một** session `'defaultUser'` cho mọi người | `chatbotController.js:226`, `initChatbotSocket.js` | Ngữ cảnh (chi nhánh, ngày…) của người này lẫn sang người khác |

### 🟠 Lỗi chức năng khác

- `createBooking`: gửi email lỗi → trả 400 dù đơn **đã lưu** → người dùng tưởng thất bại và đặt lại.
- `getBookedByEmail` / `...Current` / `...Stats`: gọi `findById` **ngoài try** và trước khi kiểm `accountId` → user bị xoá là request treo.
- `if (bookings.combo)` trên mảng → combo **không bao giờ được populate** ở danh sách đơn (UI thiếu tên combo).
- Nhiều API trả **400/404 khi danh sách rỗng** (phim, khung giờ, khuyến mãi, booking) → UI hiểu là lỗi.
- Phòng `Inactive` vẫn đặt được; xoá cơ sở để lại phòng "mồ côi"; `editRoom` không đổi được loại/trạng thái; `editCombo` không đổi được thời lượng.
- Người dùng huỷ được đơn **đã thanh toán**, bất kỳ lúc nào, không có chính sách hoàn tiền.
- Trạng thái `HOÀN THÀNH` chỉ do admin bấm tay → khách không đánh giá được nếu admin quên.
- `returnUrl`, CORS, socket URL **hardcode `localhost`** → không chạy khi deploy.
- FE: đổi ngày không xoá khung giờ đã chọn; kiểm tra "tối thiểu 60 phút" chỉ chặn đúng 30 phút; `film.duration` là **chuỗi** nhưng so sánh như số.
- `useUserData` poll mỗi 5 giây trên mọi trang kể cả khi chưa đăng nhập → spam request 401.
- `register` xoá tài khoản chưa xác thực khi có người đăng ký lại cùng email.

### 🟡 Giao diện (thấy khi chạy thử)

- Mobile 390px: trang chủ và combo **tràn ngang lên 505px**; ô chọn cơ sở đè lên nút điều hướng slider.
- Text "Bảo mật riêng tư cam kết 100&Percnt; ko camera" — entity `&percnt;` không được JSX hỗ trợ.
- Trang đặt phòng **không hiện tổng tiền trước khi bấm đặt**; thông tin khách (tên/email/SĐT) tách rời khỏi form đặt.
- Trạng thái rỗng/lỗi gần như không có (khối đánh giá trống, select trống…).
- Dùng `alert()`/`window.confirm()` lẫn với toast.
- Thiếu `<meta description>` thật (đang là "Generated by create next app").

### ⚪ Dọn dẹp

- Đổi tên thư mục `frontend/` ↔ `backend/` cho đúng vai trò.
- Code chết: `controllers/categoryFlimController.js` (import model không tồn tại), `services/payos.js` (import thứ không tồn tại), `validations/otpVlidation.js`, `pages/api/hello.js`, `useStyleClass`.
- `console.log` khắp nơi (kể cả log body webhook PayOS); `next.config.js` đưa `JWT_SECRET` vào `env` của Next (nguy cơ lộ ra bundle client).
- Không có test, không có README chạy dự án, không có `.env.example`.
- Lẫn trộn `sass` + gói `scss` vô dụng; `react-icon` (gói sai tên) cạnh `react-icons`; vừa `react-quill` vừa `tiptap`.

### Thiếu (gợi ý bổ sung)

- Middleware phân quyền admin dùng thống nhất; endpoint "đơn của tôi" thay vì truyền email.
- Tóm tắt giá realtime ở bước đặt phòng; giữ chỗ tạm (hold) khi đang thanh toán.
- Tự động chuyển `HOÀN THÀNH` khi hết giờ; nhắc lịch qua email.
- Trang chi tiết phim; lọc phòng theo sức chứa; bản đồ cơ sở.
- Chính sách huỷ/hoàn tiền; lịch sử thao tác admin.

### Thứ tự sửa đề xuất

1. S1–S8 (phân quyền + không tin dữ liệu client) và **đổi JWT secret**.
2. B1 (mã đơn trùng theo năm), B2–B3 (trùng lịch), B4–B5 (không vào được trang tài khoản/admin), B6.
3. B7–B11 và nhóm 🟠.
4. Giao diện — gộp vào đợt redesign.
