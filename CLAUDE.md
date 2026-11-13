# Quy chuẩn làm việc với Git

## Đặt tên nhánh

- Luôn bắt đầu bằng `claude/`, sau đó là **chức năng sẽ làm**, viết bằng tiếng Anh.
- Chỉ dùng chữ thường, các từ nối bằng dấu `-`.
- Tên phải nói rõ việc làm. **Không** dùng mã ngẫu nhiên, tên vô nghĩa hay hậu tố kiểu `a3buk1`, `nifty-mayer`, `compassionate-thompson`.
- Ngắn gọn: khoảng 2–5 từ.

Ví dụ đúng:

```
claude/add-user-login
claude/fix-admin-token-on-vercel
claude/refactor-booking-api
claude/update-project-docs
```

Ví dụ sai:

```
claude/compassionate-thompson-a3buk1   # tên ngẫu nhiên, không nói lên chức năng
claude/fix                             # quá chung chung
claude/sua-loi-dang-nhap               # không phải tiếng Anh
claude/Add_User_Login                  # viết hoa, dùng dấu gạch dưới
```

## Commit message

- Viết bằng tiếng Anh, ngắn gọn, mô tả **đã làm gì**.
- Dùng thể mệnh lệnh, bắt đầu bằng động từ viết hoa: `Add`, `Fix`, `Update`, `Remove`, `Refactor`...
- Một dòng, tối đa khoảng 72 ký tự, không có dấu chấm ở cuối.
- Không chèn mã ngẫu nhiên, mã phiên hay nội dung thừa vào tiêu đề commit.
- Mỗi commit chỉ chứa một thay đổi có ý nghĩa; việc khác nhau thì tách commit.

Ví dụ đúng:

```
Add login form validation
Fix admin token not saved on Vercel
Update API base URL for production
Remove unused axios interceptor
```

Ví dụ sai:

```
update                         # quá chung chung
fix bug                        # không rõ sửa gì
Sửa lỗi đăng nhập              # không phải tiếng Anh
Added some changes to files.   # mơ hồ, sai thể, có dấu chấm cuối
```
