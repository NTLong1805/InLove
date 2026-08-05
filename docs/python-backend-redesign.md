# Ý tưởng thiết kế lại website InLove với backend Python

## 1. Mục tiêu sản phẩm

Repo hiện tại là một landing page tĩnh cho cặp đôi, gồm các khối nội dung chính: trang chủ đếm ngày yêu, thông tin hai người, nhật ký câu chuyện, quote, gallery ảnh/video và form gửi lời nhắn. Mục tiêu thiết kế lại là giữ cảm xúc, hiệu ứng và bố cục hiện có, nhưng chuyển toàn bộ nội dung sang dữ liệu có thể quản trị để 2 người dùng được phép đăng nhập và thêm, sửa, xóa hoặc ẩn/hiện thông tin mà không cần sửa mã nguồn.

## 2. Đề xuất frontend

### 2.1. Hướng tiếp cận

- Giữ phong cách visual hiện tại: pastel hồng/tím, font chữ mềm, hiệu ứng trái tim, animation khi cuộn, gallery dạng slider.
- Tách frontend thành các component thay vì viết toàn bộ trong một file HTML:
  - `HeroCounter`: hiển thị ngày bắt đầu yêu và avatar hai người.
  - `CoupleProfile`: hồ sơ từng người, cung hoàng đạo, ngày sinh, avatar, chỉ số love language.
  - `StoryTimeline`: danh sách kỷ niệm theo ngày, ảnh/video đại diện, mô tả ngắn.
  - `QuoteSection`: quote tình yêu, có thể thay đổi từ admin.
  - `GallerySection`: album ảnh/video phân nhóm.
  - `MessageForm`: form gửi lời nhắn/lời chúc.
- Dữ liệu lấy qua API thay vì hard-code trong HTML.
- Với nhu cầu nhỏ cho 2 người, có thể dùng một trong hai hướng:
  - **Nhanh, nhẹ, dễ triển khai:** Jinja2 templates render từ backend FastAPI/Django.
  - **Chuyên nghiệp, dễ mở rộng UI:** React hoặc Next.js gọi REST API từ Python backend.

### 2.2. Giao diện người xem

- Trang public không cần đăng nhập, tối ưu mobile-first.
- Navigation giữ các mục hiện tại: Home, About Us, Our Story, Quote, Gallery, Contact.
- Gallery có bộ lọc theo album hoặc mốc thời gian.
- Timeline hỗ trợ trạng thái nổi bật để ghim các kỷ niệm quan trọng.
- Form lời nhắn có chống spam nhẹ bằng rate limit hoặc captcha đơn giản.

### 2.3. Giao diện quản trị cho 2 người

- Đường dẫn gợi ý: `/admin` hoặc `/dashboard`.
- Chỉ cho phép 2 tài khoản đăng nhập.
- Các màn hình CRUD:
  - Quản lý thông tin cặp đôi: tên, biệt danh, avatar, ngày sinh, mô tả, love language.
  - Quản lý ngày bắt đầu yêu để tự động tính số ngày.
  - Quản lý nhật ký/kỷ niệm: ngày, tiêu đề, mô tả, ảnh/video, trạng thái hiển thị.
  - Quản lý gallery: upload, sắp xếp, phân album, đặt ảnh bìa.
  - Quản lý quote: nội dung, tác giả, trạng thái nổi bật.
  - Quản lý lời nhắn từ khách: xem, xóa, đánh dấu đã đọc.
- Dùng form có preview ảnh/video trước khi lưu.
- Thêm chức năng kéo-thả để sắp xếp thứ tự câu chuyện và ảnh trong gallery.

## 3. Đề xuất backend Python

### 3.1. Framework

Khuyến nghị dùng **FastAPI** nếu muốn backend gọn, hiện đại, dễ viết API và có tài liệu Swagger tự động. Nếu muốn có admin CRUD sẵn rất nhanh, **Django** cũng phù hợp. Với website chỉ dùng cho 2 người nhưng vẫn cần chuyên nghiệp, hai phương án hợp lý là:

1. **FastAPI + SQLModel/SQLAlchemy + Alembic**
   - Ưu điểm: nhẹ, nhanh, API rõ ràng, dễ kết hợp frontend hiện đại.
   - Cần tự xây giao diện admin.
2. **Django + Django Admin + Django REST Framework**
   - Ưu điểm: có admin mạnh ngay, phân quyền sẵn, upload file tốt.
   - Phù hợp nếu ưu tiên triển khai CRUD nhanh và ít viết dashboard từ đầu.

Đề xuất thực tế: dùng **Django** nếu muốn sớm có hệ thống thêm/sửa/xóa ổn định cho 2 người; dùng **FastAPI** nếu muốn học và kiểm soát kiến trúc API nhiều hơn.

### 3.2. Cấu trúc dữ liệu gợi ý

- `User`: 2 tài khoản quản trị.
- `SiteSetting`: tên website, ngày bắt đầu yêu, logo, theme color.
- `PersonProfile`: thông tin mỗi người, avatar, biệt danh, ngày sinh, cung hoàng đạo.
- `LoveLanguageScore`: các chỉ số như Acts of Service, Quality Time, Words of Affirmation, Receiving Gifts, Physical Touch.
- `Story`: ngày kỷ niệm, tiêu đề, mô tả, media chính, media preview, thứ tự, trạng thái hiển thị.
- `Album`: tên album, mô tả, ảnh bìa, thứ tự.
- `MediaAsset`: ảnh/video, loại file, album, caption, alt text, thứ tự.
- `Quote`: nội dung, tác giả, trạng thái active.
- `Message`: tên người gửi, email tùy chọn, nội dung, trạng thái đã đọc.
- `AuditLog`: ghi lại ai đã tạo/sửa/xóa dữ liệu nào.

### 3.3. API gợi ý

Public API:

- `GET /api/site-settings`
- `GET /api/profiles`
- `GET /api/stories?visible=true`
- `GET /api/albums`
- `GET /api/albums/{id}/media`
- `GET /api/quotes/featured`
- `POST /api/messages`

Admin API:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/admin/me`
- `POST /api/admin/stories`
- `PATCH /api/admin/stories/{id}`
- `DELETE /api/admin/stories/{id}`
- `POST /api/admin/media`
- `PATCH /api/admin/media/{id}`
- `DELETE /api/admin/media/{id}`
- Các endpoint CRUD tương tự cho profile, quote, album và setting.

### 3.4. Lưu trữ file

- Giai đoạn đầu: lưu ảnh/video trong thư mục `media/` trên server, database chỉ lưu đường dẫn.
- Khi deploy chuyên nghiệp hơn: dùng S3-compatible storage như AWS S3, Cloudflare R2 hoặc MinIO.
- Tạo thumbnail cho ảnh/video để gallery tải nhanh.
- Kiểm tra loại file và giới hạn dung lượng upload.

### 3.5. Bảo mật và phân quyền

- Chỉ tạo 2 tài khoản admin, không mở đăng ký công khai.
- Mật khẩu hash bằng Argon2 hoặc bcrypt.
- Dùng session cookie HttpOnly/SameSite nếu frontend cùng domain; dùng JWT ngắn hạn nếu tách domain.
- CSRF protection cho form/admin nếu dùng cookie session.
- Rate limit cho login và form gửi lời nhắn.
- Validate upload file để tránh tải file độc hại.
- Backup database và media định kỳ.

## 4. Lộ trình triển khai

### Giai đoạn 1: Chuẩn hóa dữ liệu hiện tại

- Trích toàn bộ nội dung đang hard-code trong `index.html` thành file seed JSON hoặc fixture.
- Định nghĩa model database cho profile, story, gallery, quote và message.
- Giữ nguyên giao diện public gần như hiện tại để giảm rủi ro.

### Giai đoạn 2: Xây backend và admin

- Tạo project Python backend.
- Tạo database SQLite cho local/dev; PostgreSQL cho production.
- Tạo CRUD admin cho 2 tài khoản.
- Thêm upload ảnh/video và preview.

### Giai đoạn 3: Kết nối frontend với API

- Chuyển từng section sang render từ API hoặc template context.
- Thêm loading state, empty state và error state.
- Tối ưu responsive và ảnh thumbnail.

### Giai đoạn 4: Deploy và vận hành

- Docker hóa ứng dụng.
- Dùng Nginx reverse proxy, HTTPS, backup tự động.
- Thiết lập môi trường staging trước khi thay đổi production.

## 5. Kiến trúc khuyến nghị cho nhu cầu 2 người

Nếu mục tiêu là website đẹp, dễ sửa nội dung, ít người dùng và ít chi phí vận hành, kiến trúc phù hợp nhất là:

- **Backend:** Django + Django Admin.
- **Database:** SQLite ở bản cá nhân hoặc PostgreSQL khi deploy lâu dài.
- **Frontend public:** Django templates tái sử dụng CSS/JS hiện có, sau đó refactor dần thành component.
- **Upload:** lưu local `media/` ở giai đoạn đầu, chuyển sang Cloudflare R2 khi cần.
- **Deploy:** một VPS nhỏ hoặc Render/Fly.io/Railway, kèm backup media/database.

Cách này giúp có CRUD, đăng nhập, phân quyền, upload và quản trị nội dung rất nhanh, trong khi vẫn giữ được giao diện InLove hiện tại.
