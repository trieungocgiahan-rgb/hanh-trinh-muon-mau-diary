# Làm web trông và đọc như do người thật làm

Giữ nguyên bố cục, bảng màu vui tươi và mọi tính năng. Chỉ sửa những chi tiết khiến web trông như "AI làm sẵn".

## 1. Viết lại chữ cho tự nhiên, cụ thể
Hiện chữ còn chung chung, giống văn quảng cáo ("Cả đội cùng nhau ghi lại hành trình", "Đừng để khoảnh khắc trôi mất", "Dùng được ngay trong vài phút").
- Dùng giọng của chính nhóm: xưng "tụi mình/bạn", câu ngắn, kể chuyện thật. Ví dụ: "Nhật ký của Season 2 — Chuyện của Mây. Ai đi buổi nào, chụp gì, nói gì, đều ở đây."
- Bỏ các câu khẩu hiệu sáo rỗng, các cặp chữ thường bị bẻ đôi "... *trôi mất*", và dòng chữ in hoa giãn chữ phía trên tiêu đề.
- Nói rõ web dùng để làm gì và cho ai, kèm một hai chi tiết có thật của dự án (tên dự án, các loại hoạt động như workshop, khảo sát thực địa).
- Trang đăng nhập: bớt câu chào kiểu máy, giải thích thẳng "Đăng nhập bằng Gmail. Lần đầu vào, quản trị viên sẽ duyệt bạn trong ngày."
- Sửa cả bản tiếng Anh cho đồng bộ.

## 2. Bớt các chi tiết giao diện "AI quen tay"
- Bỏ chữ màu chuyển sắc trong tiêu đề, giảm lớp vân hạt (grain) và nền loang mờ, chỉ giữ ở phần đầu trang.
- Mỗi khối dùng một kiểu thẻ riêng thay vì cùng một kiểu bo góc và đổ bóng lặp lại khắp nơi.
- Tiêu đề viết hoa kiểu câu, cỡ chữ vừa phải, căn trái nhất quán. Bớt hiệu ứng nổi lên khi rê chuột.
- Ảnh minh họa: ưu tiên ảnh thật của dự án. Nếu bạn có ảnh hoạt động thật, mình sẽ thay ảnh tự tạo bằng ảnh đó (đây là điểm giúp web "thật" nhất).
- Các nút ở trang chủ chỉ giữ 1 nút chính "Vào nhật ký" và 1 nút "Xem thử".

## 3. Bên trong ứng dụng
- Thống nhất chữ trên nút, thông báo lỗi và màn hình trống theo giọng mới (ví dụ màn hình trống: "Chưa có hoạt động nào tháng này. Bấm vào một ngày để ghi buổi đầu tiên.").
- Không đổi chức năng nào.

## 4. Kiểm tra
- Chụp màn hình trang chủ, trang đăng nhập và lịch trên máy tính và điện thoại để so trước/sau.

## Cần bạn bổ sung (không bắt buộc)
- Vài tấm ảnh thật từ các buổi hoạt động.
- Một hai câu nói thật của thành viên, nếu muốn có trích dẫn.
Nếu không có, mình sẽ bỏ hẳn phần trích dẫn chứ không bịa.

## Ghi chú kỹ thuật
- Chữ sửa trong `src/lib/i18n/vi.ts` và `en.ts` (giữ nguyên các khóa).
- Giao diện sửa trong `src/components/landing/*`, `src/routes/auth.tsx`, `src/styles.css`. Dùng token màu, không tô màu cứng.
- Không đổi luồng đăng nhập, dữ liệu hay quyền truy cập.
