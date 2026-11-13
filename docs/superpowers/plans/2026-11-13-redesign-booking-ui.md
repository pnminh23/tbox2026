# Booking UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay giao diện khách và luồng đặt phòng bằng thiết kế "nâu than & chiếc vé": trang chủ có ô tìm phòng, lưới giờ trống, màn xác nhận/thanh toán, trang vé, kèm hệ chuyển động.

**Architecture:** Backend thêm 2 endpoint đọc (availability theo cơ sở, kiểm tra mã giảm giá). Frontend thêm lớp token SCSS + bộ component `components/ui/`, logic chọn giờ/tính giá tách thành hàm thuần trong `lib/booking.js` (có test), các trang đặt phòng dựng lại trên các mảnh đó. Chuyển động bằng CSS + 1 hook `useInView`, không thêm thư viện.

**Tech Stack:** Next.js 13 Pages Router, SCSS modules, SWR, axios, socket.io-client; Express 4 + Mongoose 8; test bằng `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-13-redesign-booking-ui-design.md`

## Global Constraints

- Token màu đúng giá trị spec 5.1 (`--bg #1C1815`, `--surface #29231F`, `--seam #3D3530`, `--cell #342D28`, `--gold #F3B817`/hover `#FFD45C`, `--ticket #F6EBD9`, `--ink #211A15`, `--ink-muted #6B5A4E`, `--text #F6EBD9`, `--text-muted #CDC2B6`, `--danger #FF8A7A`/chữ `#FFB3A7`).
- Font: Big Shoulders Display 800–900 (tiêu đề, giá) + Be Vietnam Pro 400–700, subset `vietnamese`.
- Không nhãn in hoa giãn chữ, không dấu `·`, không `→` trong nút; tiêu đề in hoa được phép.
- Chỉ animate `transform`/`opacity`; vi tương tác 150–250ms, chuyển cảnh 300–500ms; mọi animation tắt dưới `prefers-reduced-motion: reduce`; không lặp vô hạn trừ trạng thái tải.
- Không thêm thư viện animation. Nút/ô bấm ≥ 44px. Không tràn ngang ở 375px.
- Ngưỡng cọc `150000`, giữ chỗ `15` phút, đơn tối thiểu `60` phút — đồng bộ với `backend/src/services/booking.js`.
- Commit theo `CLAUDE.md`: tiếng Anh, mệnh lệnh, động từ viết hoa, 1 dòng ≤ 72 ký tự, không dấu chấm; kèm 2 dòng attribution của phiên.
- Code ngắn gọn, tái sử dụng, comment súc tích (yêu cầu chủ dự án).

## Review Focus

1. Bấm ô làm dải chọn chạm khung đã đặt/đã qua → dải co lại tới ô trống cuối cùng, không bao giờ chứa ô bận (test `selectRange` ở Task 3).
2. URL có `date` sai định dạng hoặc ngày đã qua → về hôm nay, không crash (test `parseBookingQuery` ở Task 3).
3. Combo khác thời lượng hoặc không áp dụng loại phòng → hiện nhưng bị khóa kèm lý do (test `comboOptions` ở Task 3).
4. Socket báo khung giờ đang chọn vừa bị người khác giữ → bỏ chọn và báo cho khách (Task 6, bước kiểm tra thủ công có kịch bản).
5. Cơ sở không có phòng hoạt động / không có khung giờ → trạng thái rỗng có hướng dẫn, không lưới trống trơn (test `buildAvailability` ở Task 1 + Task 6).

---

### Task 1: Backend availability & promotion check

**Files:**
- Create: `backend/src/services/availability.js`, `backend/test/availability.test.js`
- Modify: `backend/src/controllers/bookingController.js`, `backend/src/routes/bookingRoutes.js`, `backend/src/controllers/promotionController.js`, `backend/src/routes/promotionRoutes.js`, `backend/package.json` (script `"test": "node --test"`)

**Interfaces:**
- Produces: `buildAvailability(rooms, bookings) -> [{ _id, name, image, type: { _id, name, pricePerMinute }, bookedSlots: string[] }]` (rooms đã sort theo tên số, chỉ status `Active`); `GET /api/booking/availability?branch=<id>&date=YYYY-MM-DD` → `{ success, data: { date, rooms } }`; `GET /api/promotion/check?code=XXX` → `{ success, data: { name, discountPercent } }` hoặc 404 "Mã giảm giá không hợp lệ hoặc đã hết lượt".

- [ ] **Step 1: Write failing tests** `buildAvailability`: (a) gộp `time_slots` của mọi booking cùng phòng thành `bookedSlots` dạng string, không trùng; (b) bỏ phòng `Inactive`; (c) sort `101, 103, 201` kiểu số; (d) không có phòng → `[]`.
- [ ] **Step 2:** `cd backend && npm test` → FAIL (module chưa có).
- [ ] **Step 3:** Viết `buildAvailability` (hàm thuần) + controller `getAvailability` dùng `roomModel.find({branch}).populate('type')` và `bookingModel.find({room: {$in}, date: dayRange(date), status: {$in: ACTIVE_STATUSES}}, 'room time_slots')`; 400 nếu thiếu branch/date. `checkPromotion` dùng `promotionModel.findOne({ name: code.trim().toUpperCase(), quantity: { $gt: 0 } })`. Route công khai, đặt trước các route có tham số.
- [ ] **Step 4:** `npm test` → PASS; `JWT_SECRET=x node -e "import('./src/routes/bookingRoutes.js')"` không lỗi.
- [ ] **Step 5:** Commit `Add availability and promotion check endpoints`.

### Task 2: Design tokens, fonts & UI primitives

**Files:**
- Create: `frontend/src/styles/_tokens.scss`, `frontend/src/styles/_motion.scss`, `frontend/src/hooks/useInView.js`, `frontend/src/components/ui/{Ticket,Reveal,Skeleton,PriceTag,Button}/` (mỗi thư mục: `X.js` + `X.module.scss`), `frontend/src/components/ui/index.js`
- Modify: `frontend/src/pages/_app.js` (nạp font qua `next/font/google`, gắn class biến font lên `<main>` bọc), `frontend/src/styles/_global.scss` (import tokens, nền `var(--bg)`, `:focus-visible`, reduced-motion toàn cục)

**Interfaces:**
- Produces: CSS vars spec 5.1 + `--font-display`, `--font-body`; mixin SCSS `@include display($size)`; keyframes chung `fade-up`, `sweep-x`, `flash`, `shimmer`, `print-out`, `stamp` trong `_motion.scss`.
- `useInView(options?) -> [ref, inView]` (chỉ báo true một lần).
- `<Ticket direction="horizontal|vertical" main={node} stub={node} tone="cream|gold" className />` — lỗ bấm bằng mask, đường đứt nét ở mép stub.
- `<Reveal as="div" stagger={60}>` — con trực tiếp nhận `--i` để trễ so le, chạy `fade-up` khi vào khung nhìn.
- `<Skeleton w h radius />`, `<PriceTag value={number} />` (đếm từ giá trị cũ tới mới trong 400ms bằng `requestAnimationFrame`; reduced-motion → nhảy thẳng), `<Button variant="primary|outline|ghost" size="md|lg" loading href|onClick>` (loading = spinner + `aria-busy` + disabled).

- [ ] **Step 1:** Viết tokens/motion/hook/components theo interface.
- [ ] **Step 2:** `npx next build` → thành công; `npx next lint` → sạch.
- [ ] **Step 3:** Tạm render 1 trang thử (`pages/_ui-preview.js`, xóa trước commit) và chụp Playwright 1280px: vé có lỗ khoét thấy nền, PriceTag đếm, Button loading.
- [ ] **Step 4:** Commit `Add design tokens and shared UI primitives`.

### Task 3: Booking logic (pure functions)

**Files:**
- Create: `frontend/src/lib/booking.mjs`, `frontend/src/lib/booking.test.mjs`
- Modify: `frontend/package.json` (script `"test": "node --test src/lib/"`)

**Interfaces:**
- `PAYMENT_THRESHOLD = 150000`, `HOLD_MINUTES = 15`, `MIN_MINUTES = 60`, `DEFAULT_MINUTES = 120`
- `slotStart(day: 'YYYY-MM-DD', hhmm) -> Date`
- `isPastSlot(day, slot, now = new Date(), graceMinutes = 10) -> boolean`
- `selectRange(slots, bookedIds: Set<string>, day, fromIndex, minutes = DEFAULT_MINUTES, now?) -> { start, end } | null` — mở rộng từ `fromIndex` tới đủ `minutes`, dừng trước ô bận/đã qua; `null` nếu ô đầu bận hoặc tổng < `MIN_MINUTES`.
- `extendRange(slots, bookedIds, day, range, toIndex, now?) -> range | null` — chỉ khi mọi ô từ `range.start` tới `toIndex` trống.
- `rangeMinutes(slots, range) -> number`, `rangeLabel(slots, range) -> '19:00 đến 21:00'`
- `estimateTotal({ pricePerMinute, minutes, combo?, typeId, discountPercent = 0 }) -> number` (làm tròn như server: `Math.round`)
- `depositOf(total) -> Math.ceil(total / 2)`
- `comboOptions(combos, typeId, minutes) -> [{ _id, name, price, disabled, reason }]` — `reason`: `"Cần đặt {h} giờ{ 30 phút}"` hoặc `"Không áp dụng cho loại phòng này"`.
- `parseBookingQuery(query, today) -> { branch, date, room, start, end, duration }` — `date` sai/đã qua → `today`; số không hợp lệ → `undefined`.

- [ ] **Step 1: Write failing tests** cho từng hàm, tối thiểu: `selectRange` co lại trước ô bận (slots 30', bận index 3, từ 0 → `{0,2}`), trả `null` khi chỉ còn 30'; `extendRange` từ chối khi chen ô bận; `estimateTotal` combo lấy giá theo `typeId`, giảm 10% của 155555 → 140000; `depositOf(155555) === 77778`; `comboOptions` đánh dấu đúng 2 loại lý do; `parseBookingQuery({date:'2020-01-01'}) .date === today`.
- [ ] **Step 2:** `cd frontend && npm test` → FAIL.
- [ ] **Step 3:** Cài đặt các hàm.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `Add pure booking logic for time grid and pricing`.

### Task 4: Header, Footer & user layout

**Files:**
- Modify: `frontend/src/components/common/Header/*`, `frontend/src/components/common/Footer/*`, `frontend/src/layout/LayoutUser/*`, `frontend/src/components/common/AccountBadge/*.scss`

**Interfaces:** Consumes Task 2 tokens/Button. Header: logo, nav (Phòng → `/bookRoom`, Combo, Phim, Cơ sở, Tin tức), đăng nhập/AccountBadge, nút "Đặt phòng"; mobile: nút menu 44px mở drawer trượt từ phải (300ms), khóa cuộn, Esc/overlay để đóng, focus vào drawer. Header trong suốt trên hero trang chủ (`variant="overlay"` prop của LayoutUser), nền `--bg` khi cuộn > 40px.

- [ ] **Step 1:** Cài đặt.
- [ ] **Step 2:** Build + lint sạch; Playwright 375 & 1280: không tràn ngang, Tab tới được mọi link, drawer mở/đóng bằng phím.
- [ ] **Step 3:** Commit `Redesign header, footer and user layout`.

### Task 5: Home page

**Files:**
- Modify: `frontend/src/components/page/User/HomePage/*` (viết lại), `frontend/src/pages/index.js`
- Create: `frontend/src/components/page/User/HomePage/SearchTicket.js`, `TonightRooms.js` (+ scss)
- Create: `frontend/src/services/availability.js` — `useAvailability(branch, date) -> { rooms, isLoading, error, mutate }` (SWR key `/api/booking/availability?branch=&date=`)

**Interfaces:** Consumes `useAvailability`, `selectRange`/`isPastSlot` (để tính giờ trống kế tiếp), `Ticket`, `Reveal`, `Button`. SearchTicket submit → `router.push('/bookRoom?branch&date&start&duration')`. TonightRooms: phòng có nhiều giờ trống nhất làm thẻ lớn, tối đa 3 giờ trống kế tiếp mỗi phòng; chip → `/bookRoom?branch&date&room&start`. Mở trang: hiệu ứng "tắt đèn" (ảnh `brightness 1.15→.42` 1.6s, chùm sáng hiện sau 1.1s, tiêu đề + vé `fade-up` 1.4s/1.6s). Các khu sau bọc `Reveal`. Combo dùng `useAllCombo` + `Ticket tone="gold"`. Trạng thái tải: Skeleton; lỗi: thông báo + nút thử lại; hết phòng tối nay: gợi ý "Xem ngày mai".

- [ ] **Step 1:** Cài đặt.
- [ ] **Step 2:** Build + lint; Playwright với mock API (mở rộng mock có `/availability`) 375/768/1280: chụp trước và sau 2s (thấy ảnh tối dần), cuộn thấy các khu hiện so le, `emulateMedia({reducedMotion:'reduce'})` → không animation.
- [ ] **Step 3:** Commit `Rebuild home page with search ticket and tonight rooms`.

### Task 6: Time grid booking page

**Files:**
- Modify: `frontend/src/pages/bookRoom/index.js`; replace `frontend/src/components/page/User/BookRoomPage/*`
- Create: `frontend/src/components/ui/{TimeGrid,DayPicker,TimeChips}/`, `BookRoomPage/{BookingTicket,RoomCards}.js`
- Modify: `frontend/src/hooks/useBookingRealTime.js` → export thêm `useBranchRealtime(branch, onChange)`

**Interfaces:**
- `<TimeGrid rooms slots day range onPick(roomId, index) showFrom={12} />` — role `grid`, phím mũi tên di chuyển, Enter/Space chọn; ô chọn `sweep-x` 220ms; khi đổi `day` các hàng `fade-up` so le 40ms.
- `<DayPicker value onChange days={7} />`, `<TimeChips times selected onPick />`.
- State trang lấy từ `parseBookingQuery`, ghi lại URL bằng `router.replace(..., { shallow: true })`.
- Desktop (≥ 900px): lưới + `BookingTicket` dính bên phải; mobile: `RoomCards` (TimeChips + chọn thời lượng 1g30/2g/2g30/3g) + cuống vé ghim đáy trượt lên khi có lựa chọn.
- `BookingTicket`: dòng thay đổi `flash` 400ms, `PriceTag` cho tạm tính, nút "Giữ phòng này" → `/bookRoom/checkout?<query>`.
- Socket: khi có `newBooking`/`editBooking` cùng cơ sở → `mutate()`; nếu dải đang chọn giờ có ô bận → bỏ chọn + toast "Khung giờ bạn chọn vừa có người đặt, hãy chọn giờ khác".
- Rỗng: không phòng → "Cơ sở này chưa mở phòng, thử cơ sở khác"; lỗi tải → nút thử lại.

- [ ] **Step 1:** Cài đặt.
- [ ] **Step 2:** Build + lint + `npm test`.
- [ ] **Step 3:** Playwright với mock: bấm ô trống → chọn 2 giờ, vé điền đúng và giá đếm; bấm ô xa → kéo dài; bấm ô bận không chọn; mở `?date=2020-01-01` → về hôm nay; 375px dùng card + cuống vé; mock phát socket `newBooking` vào giờ đang chọn → bỏ chọn + toast.
- [ ] **Step 4:** Commit `Replace booking form with interactive time grid`.

### Task 7: Checkout page

**Files:**
- Create: `frontend/src/pages/bookRoom/checkout.js`, `frontend/src/components/page/User/Checkout/{Checkout.js,Checkout.module.scss,ContactFields.js,FilmPicker.js,ComboPicker.js}`
- Modify: `frontend/src/services/promotion.js` — thêm `checkPromotion(code) -> { success, data?, message? }`

**Interfaces:** Consumes `parseBookingQuery`, `useAvailability` (lấy phòng/giá), `comboOptions`, `estimateTotal`, `depositOf`, `createBooking`, `payBooking`, `useUserData`, `Ticket`, `PriceTag`, `Button`. Thiếu phòng/giờ trong query → quay về `/bookRoom`. Liên hệ: validate tên ≥ 3, SĐT `/^[0-9]{10,11}$/`, email; lỗi hiện dưới ô khi blur, `aria-invalid` + `aria-describedby`. Phim không bắt buộc ("Để sau" mặc định). Mã giảm giá "Áp dụng" gọi `checkPromotion`, đúng → tạm tính trừ % kèm dòng giảm giá; sai → lỗi dưới ô. Nút: tổng > 150000 → chọn "Cọc 50%"/"Trả đủ" + "Thanh toán qua PayOS"; ngược lại "Xác nhận đặt phòng". Submit: `createBooking` → nếu `paymentRequired` gọi `payBooking(id, type)`, ngược lại `router.push('/bookRoom/<id>?new=1')`; lỗi 409 → toast + nút "Chọn giờ khác" về lưới giữ query. Ghi chú "Phòng được giữ 15 phút sau khi bạn bấm thanh toán". Chuyển từ lưới sang đây trượt ngang 300ms.

- [ ] **Step 1:** Cài đặt.
- [ ] **Step 2:** Build + lint.
- [ ] **Step 3:** Playwright với mock (`/api/booking/create`, `/api/payos/create`, `/api/promotion/check`): lỗi SĐT hiện khi blur; combo sai thời lượng bị khóa có lý do; mã hợp lệ đổi giá; đơn ≤ 150k đi tới trang vé; đơn > 150k gọi PayOS với `type` đã chọn; 409 hiện nút "Chọn giờ khác".
- [ ] **Step 4:** Commit `Add checkout page with contact, combo and payment choice`.

### Task 8: Ticket page

**Files:**
- Modify: `frontend/src/pages/bookRoom/[_id].js`; replace `frontend/src/components/page/User/BookingDetail/*`
- Create: `frontend/src/hooks/useCountdown.js` — `useCountdown(deadline: Date) -> { minutes, seconds, expired }`

**Interfaces:** Consumes `useBookingById`, `useBookingActions`, `canPay`, `canCustomerCancel`, `HOLD_MINUTES`, `Ticket`. Vé dọc đầy đủ thông tin; `?new=1` hoặc vừa thanh toán (`status=PAID`) → hiệu ứng `print-out` 600ms rồi `stamp` "Đã giữ chỗ"; đơn `CHỜ THANH TOÁN` → đồng hồ `createdAt + 15'`, dưới 2 phút đổi `--danger` và nhịp 1s, hết giờ → "Hết thời gian giữ chỗ" + nút đặt lại; kết quả PayOS `cancel` → thông báo trung tính + nút thanh toán lại. Nút trả tiếp/hủy theo quy tắc sẵn có.

- [ ] **Step 1:** Cài đặt.
- [ ] **Step 2:** Build + lint; Playwright với mock 3 trạng thái (thành công, chờ thanh toán còn 1 phút, đã hủy).
- [ ] **Step 3:** Commit `Rebuild booking detail as printable ticket`.

### Task 9: Restyle remaining user pages

**Files:**
- Modify (chỉ giao diện, giữ logic): `ListFilmPage`, `ComboPage`, `LocationsPage`, `NewsPage`, `NewsDetail`, `components/auth/*`, `AccountPage`, `AllBooking`, `OverviewPage`, `common/ListInvoice`, `common/ItemSlider/*`, `common/Input`, `common/Selection`, `common/Popup`, `ChatBot` (màu)
- Remove: component không còn dùng sau Task 5–8 (`Banner`, `RoomDisplay`, `Calender` nếu không còn import — kiểm bằng grep)

**Interfaces:** Consumes tokens, `Button`, `Reveal`, `Ticket` (ListInvoice hiển thị dạng vé nhỏ). Nút "Đặt phòng xem phim này" ở ListFilm → `/bookRoom?film=<id>`; Checkout đọc `film` để chọn sẵn.

- [ ] **Step 1:** Cài đặt từng nhóm trang.
- [ ] **Step 2:** Build + lint; Playwright 375/1280 mọi trang khách: không tràn ngang, không còn màu cũ `#1e1e1e`/`#a70304` (grep trong scss trang khách).
- [ ] **Step 3:** Commit theo nhóm, ví dụ `Restyle film, combo and location pages`, `Restyle auth and account pages`.

### Task 10: Final verification & docs

**Files:**
- Modify: `README.md` (mục giao diện + `npm test`), `docs/analysis/2026-11-13-tong-quan-va-phan-tich.md` (đánh dấu UI đã làm)

- [ ] **Step 1:** `cd backend && npm test`; `cd frontend && npm test && npx next lint && npx next build` → đều sạch.
- [ ] **Step 2:** Chạy đủ 3 kịch bản spec mục 8 trên mock; chụp 375/768/1280 trang chủ, lưới, checkout, vé; bật reduced-motion kiểm không còn animation; Tab hết luồng.
- [ ] **Step 3:** Commit `Update docs for redesigned booking flow`; push nhánh.
