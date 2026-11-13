# Thiết kế lại giao diện và luồng đặt phòng PNM BOX

_Ngày: 13/11/2026 — mockup đã duyệt: https://claude.ai/artifact/XMHEZwD25VXDQ4NqXFBuoS (trang "Bản 2: Nâu than & chiếc vé")_

## 1. Vì sao làm

Chủ dự án thấy giao diện hiện tại "không có hồn", thiếu chuyển động, và luồng đặt phòng chưa thân thiện. Mục tiêu đo được: **tăng tỉ lệ khách đặt phòng thành công**.

Gốc của vấn đề trong luồng hiện tại (`frontend/src/components/page/User/BookRoomPage`): khách phải chọn phim → cơ sở → loại phòng → phòng rồi mới thấy giờ trống, không biết giá cho tới khi đặt xong, và thông tin liên hệ nằm tách rời form.

## 2. Mục tiêu / không làm / thất bại nếu

**Mục tiêu**
- Khách thấy giờ trống ngay từ trang chủ, đặt được trong 3 màn: trang chủ → chọn phòng & giờ → xác nhận & thanh toán.
- Giá tạm tính và tiền cọc luôn hiển thị trước khi bấm đặt.
- Giao diện có bản sắc riêng (chiếc vé xem phim), chuyển động sinh động nhưng có mục đích.
- Dùng tốt trên điện thoại (phần lớn khách) và bàn phím/trình đọc màn hình.

**Không làm (đợt này)**
- Không thiết kế lại trang admin (chỉ hưởng token màu/chữ mới nếu dùng chung component).
- Không đổi mô hình giá, ngưỡng cọc 150.000đ, thời gian giữ chỗ 15 phút.
- Không làm app mobile native.

**Thất bại nếu**
- Animation làm chậm trang hoặc gây khó chịu (giật, lặp vô hạn, không tắt được khi bật giảm chuyển động).
- Khách đặt được khung giờ đã có người giữ, hoặc giá hiển thị khác giá server tính mà không giải thích.
- Trang tràn ngang hoặc nút nhỏ hơn 44px trên điện thoại.

## 3. Ràng buộc

- Stack giữ nguyên: Next.js 13 Pages Router, SCSS modules, SWR, axios (`frontend/`); Express + Mongoose (`backend/`).
- Quy tắc code của chủ dự án: ngắn gọn, ưu tiên tái sử dụng, comment súc tích; git theo `CLAUDE.md`.
- Giá phòng lấy từ `roomTypes.base_price_per_minute`; giá combo theo loại phòng; server là nguồn sự thật về giá.
- Combo yêu cầu đúng thời lượng (`combo.duration`), backend đã kiểm tra.

## 4. Các hướng đã cân nhắc

| Hướng | Mô tả | Đánh đổi | Kết quả |
|---|---|---|---|
| Wizard 4 bước | Mỗi màn một lựa chọn, có thanh tiến độ | Dễ hiểu nhưng nhiều màn, vẫn giấu giờ trống tới bước 2 | Bỏ |
| **Lưới giờ trống** | Bảng phòng × giờ của cả ngày, bấm ô để chọn | Thấy ngay chỗ trống; cần API trả trạng thái cả cơ sở | **Chọn** |
| Giữ form hiện tại, chỉ đổi màu | Ít việc nhất | Không giải quyết lý do khách bỏ ngang | Bỏ |

Phong cách: đã thử 3 hướng (Rạp đêm, Hẹn hò ấm cúng, Neon pop) rồi làm lại theo skill `frontend-design`; chủ dự án chốt **nền nâu than ấm + chiếc vé**.

## 5. Phần đã quyết

### 5.1 Hệ thống thiết kế (token)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#1C1815` | nền trang |
| `--surface` | `#29231F` | khối, ô nhập trên nền tối |
| `--seam` | `#3D3530` | viền, đường kẻ |
| `--cell` | `#342D28` | ô giờ trống |
| `--gold` | `#F3B817` (hover `#FFD45C`) | hành động chính, lựa chọn |
| `--ticket` | `#F6EBD9` | giấy vé |
| `--ink` | `#211A15` | chữ trên vé / trên nền vàng |
| `--ink-muted` | `#6B5A4E` | chữ phụ trên vé |
| `--text` | `#F6EBD9` | chữ trên nền tối |
| `--text-muted` | `#CDC2B6` | chữ phụ trên nền tối |
| `--danger` | `#FF8A7A` (chữ `#FFB3A7`) | lỗi nhập liệu |

- Chữ: **Big Shoulders Display** 800–900 (tiêu đề, giá), **Be Vietnam Pro** 400–700 (nội dung). Nạp qua `next/font/google` với subset `vietnamese`.
- Bo góc: 10px (nút, ô), 14–18px (khối, vé). Khoảng cách theo lưới 4/8px.
- Tiêu đề in hoa là kiểu chữ biển hiệu; **không** dùng nhãn in hoa giãn chữ, không dấu `·`, không `→` trong nút.
- Token đặt ở `frontend/src/styles/_tokens.scss` (CSS custom properties + mixin), thay dần `_color.scss` cũ; admin vẫn dùng biến cũ.

### 5.2 Component dùng chung mới (`frontend/src/components/ui/`)

- `Ticket` — khung vé có 2 phần nối bằng đường đứt nét và **lỗ bấm khoét bằng CSS mask** (`direction="horizontal" | "vertical"`). Dùng cho ô tìm phòng, cuống combo, tóm tắt đơn, trang chi tiết đơn.
- `TimeGrid` — lưới phòng × khung giờ (ô: trống / đang chọn / đã đặt / đã qua), điều hướng bằng phím mũi tên, có `aria-label` từng ô.
- `DayPicker` — dải 7 ngày.
- `TimeChips` — nút giờ bắt đầu (mobile và card phòng).
- `PriceTag` — số tiền có hiệu ứng đếm khi đổi.
- `Reveal` — bọc phần tử để hiện khi cuộn tới (dùng `useInView`).
- `Skeleton` — khung chờ tải.

### 5.3 Màn hình

1. **Trang chủ** (`/`): hero ảnh phòng + chùm sáng máy chiếu; ô tìm phòng dạng vé (cơ sở, ngày, giờ bắt đầu, thời lượng → `/bookRoom?branch&date&start&duration`); "Còn trống tối nay" (1 phòng nổi bật + các phòng khác, mỗi phòng có nút giờ trống dẫn thẳng vào lưới đã chọn sẵn); combo dạng cuống vé (giá thật); 4 cam kết; 3 cơ sở. Mobile: nút "Tìm phòng trống" ghim đáy màn.
2. **Chọn phòng & giờ** (`/bookRoom`): chọn cơ sở, dải ngày, lưới giờ (mặc định từ 14:00, nút "Xem cả ngày"); bấm 1 ô = chọn 2 giờ (hoặc thời lượng từ query), bấm ô xa hơn cùng hàng = kéo dài; vé bên phải tự điền và hiện tạm tính. Mobile: mỗi phòng là 1 card với nút giờ bắt đầu + chọn thời lượng; cuống vé ghim đáy.
3. **Xác nhận & thanh toán** (`/bookRoom/checkout`): liên hệ (tự điền nếu đã đăng nhập, lỗi hiện ngay dưới ô), phim **không bắt buộc**, combo (chỉ bật combo khớp loại phòng và thời lượng, combo khác hiện lý do), mã giảm giá (kiểm tra trước), chọn cọc 50% / trả đủ khi đơn > 150.000đ; nút "Thanh toán qua PayOS" hoặc "Xác nhận đặt phòng" nếu đơn ≤ 150.000đ.
4. **Vé của bạn** (`/bookRoom/[id]`, thay `BookingDetail`): chiếc vé hoàn chỉnh, trạng thái thanh toán, đồng hồ giữ chỗ nếu đang chờ thanh toán, nút trả tiếp / hủy theo quy tắc hiện có.
5. Các trang khách còn lại (phim, combo, cơ sở, tin tức, đăng nhập/đăng ký, tài khoản, lịch sử): **áp token + Header/Footer mới**, sửa bố cục cho đồng bộ; không đổi chức năng.

### 5.4 Chuyển động

Nguyên tắc: sinh động ở những khoảnh khắc quan trọng, còn lại tiết chế; chỉ animate `transform`/`opacity`; ease-out khi vào, ease-in khi ra; vi tương tác 150–250ms, chuyển cảnh 300–500ms; **mọi animation tắt khi `prefers-reduced-motion`**; không có animation lặp vô hạn trừ trạng thái tải.

| Khoảnh khắc | Chuyển động |
|---|---|
| Mở trang chủ | "Tắt đèn rạp": ảnh tối dần (1.6s), chùm sáng hiện, tiêu đề và vé trượt nhẹ lên (một lần) |
| Cuộn trang chủ | Mỗi khu (phòng trống, combo, cam kết, cơ sở) hiện lần lượt khi vào khung nhìn, phần tử con lệch nhau 60ms, chỉ chạy 1 lần |
| Rê / bấm nút, chip | Đổi màu 150ms; nhấn xuống `scale(.97)` |
| Card phòng | Ảnh phóng nhẹ `scale(1.04)` khi rê, khung không xê dịch |
| Đổi ngày / cơ sở | Ô lưới mờ dần rồi hiện lại so le theo hàng (40ms/hàng) |
| Chọn giờ trên lưới | Vệt vàng lan từ ô đầu tới ô cuối (`scaleX`, 220ms) |
| Vé cập nhật | Dòng vừa đổi nháy nền vàng nhạt 400ms; giá đếm lên/xuống (`PriceTag`) |
| Chuyển màn đặt phòng | Nội dung trượt ngang 24px + mờ (300ms) theo chiều đi tới / quay lại |
| Cuống vé mobile | Trượt lên từ đáy khi có lựa chọn đầu tiên |
| Bấm thanh toán | Nút chuyển sang trạng thái đang xử lý (spinner), khóa bấm lại |
| Đặt thành công | Vé "in ra" (trượt ra khỏi khe, 600ms) rồi đóng dấu "Đã giữ chỗ" |
| Đồng hồ giữ chỗ | Còn dưới 2 phút: chữ đổi màu cảnh báo, nhịp nhẹ mỗi giây |
| Đang tải | Skeleton có ánh sáng quét ngang |

Thực hiện bằng CSS keyframes/transition trong SCSS module + hook nhỏ `useInView` (IntersectionObserver) và `usePrefersReducedMotion`; **không thêm thư viện animation** để giữ bundle nhẹ.

### 5.5 Thay đổi backend cần cho luồng mới

- `GET /api/booking/availability?branch=&date=` (công khai): trả các phòng đang hoạt động của cơ sở kèm loại phòng, giá/phút và danh sách khung giờ đã có người giữ trong ngày — một lần gọi cho cả lưới thay vì gọi từng phòng.
- `GET /api/promotion/check?code=` (công khai): trả `discountPercent` nếu mã còn lượt, không lộ danh sách mã.
- Không đổi `POST /api/booking/create`: phim vốn đã không bắt buộc ở server; client gửi ngày `YYYY-MM-DD` như hiện tại.
- Socket `newBooking` / `editBooking` dùng lại để lưới tự cập nhật.

## 6. Quyết định của Claude (chủ dự án có thể sửa)

- **Giữ chỗ bắt đầu khi bấm thanh toán**, không phải khi rời lưới giờ: dùng lại API tạo đơn hiện có, tránh tạo đơn rác khi khách chỉ xem. Màn xác nhận ghi rõ "Phòng được giữ 15 phút sau khi bạn bấm thanh toán"; đồng hồ đếm hiện ở trang Vé của bạn và PayOS. (Mockup đặt đồng hồ ở màn xác nhận; đây là điểm khác duy nhất.)
- URL giữ trạng thái lựa chọn (`/bookRoom?branch&date&room&start&end`) để chia sẻ link và quay lại không mất chọn.
- Mặc định lưới hiện từ 14:00 vì phần lớn đơn vào buổi tối; "Xem cả ngày" mở toàn bộ khung giờ.
- Trang `/listFilm` vẫn có nút "Đặt phòng xem phim này", chuyển sang lưới với phim đã gắn sẵn.

## 7. Để người code tự quyết

- Cách chia nhỏ component con trong từng màn, tên class SCSS.
- Chi tiết easing/thời lượng trong khung đã nêu ở 5.4.
- Cách hiển thị lỗi mạng (toast hay inline) miễn có hướng dẫn thao tác tiếp.

## 8. Kiểm tra trước khi giao

- Đặt thử đủ 3 trường hợp: đơn ≤ 150.000đ, đơn cần cọc, khung giờ vừa bị người khác giữ (lưới cập nhật qua socket, server trả 409 có thông báo rõ).
- Chụp màn hình 375 / 768 / 1280px, không tràn ngang; Tab đi hết luồng bằng bàn phím; bật giảm chuyển động thì không còn animation.
- `next build` và lint sạch.
