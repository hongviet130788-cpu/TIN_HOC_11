# Tin học THPT – Trò chơi Khởi động & Kiểm tra (web app)

Gồm: `index.html` (giao diện), `schema.sql` (cơ sở dữ liệu + phân quyền), `supabase/functions/generate/index.ts` (AI, chỉ admin gọi được).

## 1. Supabase
1. Tạo project tại supabase.com (vùng Singapore).
2. **SQL Editor** → dán toàn bộ `schema.sql` → Run.
3. **Authentication → Sign In / Providers**: bật **Email** và bật **Allow anonymous sign-ins** (cho học sinh). Nên bật **CAPTCHA** (Authentication → Attack Protection) để chống spam.
4. **Authentication → Users → Add user**: tạo tài khoản giáo viên (mật khẩu dài). Rồi chạy trong SQL Editor (thay email):
   `insert into admins select id from auth.users where email = 'giaovien@example.com';`
   Quyền admin chỉ đến từ bảng `admins`, nên người khác đăng ký email cũng không thành admin.
5. **Project Settings → API**: copy **Project URL** và **anon public key**.

## 2. AI (Edge Function)
Cài Supabase CLI, trong thư mục này chạy:
```
supabase login
supabase link --project-ref <mã-project>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... ALLOWED_ORIGIN=https://<tên-github>.github.io
supabase functions deploy generate
```
Khóa API chỉ nằm ở secrets, **không** ghi vào index.html. Mỗi lần soạn đề có chi phí nhỏ theo bảng giá nhà cung cấp.

## 3. Cấu hình và đưa lên GitHub
1. Mở `index.html`, tìm dòng `const CFG=` và điền **Project URL** + **anon key** (anon key được phép công khai; **không bao giờ** đưa `service_role key`).
2. GitHub → New repository `tin-hoc-game` (Public) → Add file → Upload files → chọn `index.html` → Commit.
3. Settings → Pages → Branch `main`, `/ (root)` → Save. Link: `https://<tên-github>.github.io/tin-hoc-game/`.
4. Supabase → Authentication → URL Configuration: điền Site URL là link trên.

## 4. Sử dụng
- Giáo viên: mở link, đăng nhập mục **Quản trị**, nhập danh sách lớp, tạo trò chơi/đề, lấy mã + QR.
- Học sinh: quét QR hoặc nhập mã, chọn tên trong danh sách lớp. Mỗi học sinh nộp 1 lần.

## Bảo mật đã có
RLS bật trên mọi bảng; chỉ admin tạo/sửa đề, danh sách lớp, gọi AI; học sinh chỉ nộp được 1 lần và không sửa/xóa kết quả; có CSP chặn script lạ; không lưu khóa bí mật ở web; giới hạn kích thước bài nộp.

## Giới hạn còn lại (nên biết)
- Đáp án nằm trong dữ liệu đề và máy học sinh chấm, nên học sinh rành kỹ thuật có thể xem đáp án hoặc gửi điểm giả. Phù hợp khởi động và kiểm tra thường xuyên; **thi chính thức cần chấm ở server** (chưa làm).
- Danh sách lớp dùng chung một bản; chọn tên không kiểm tra danh tính.
- Tên và điểm là dữ liệu cá nhân của học sinh: cần được nhà trường đồng ý.
