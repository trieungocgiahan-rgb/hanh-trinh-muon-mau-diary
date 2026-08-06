# Landing page + đăng nhập chỉ bằng Google

## 1. Trang landing mới tại `/`

Hiện tại `/` chỉ chuyển hướng thẳng vào `/lich`. Sẽ thay bằng một trang giới thiệu công khai (ai cũng xem được), dựng theo đúng ảnh mẫu, dùng lại bảng màu coral/peach và font Baloo 2 + Be Vietnam Pro sẵn có của dự án.

Các phần theo thứ tự trong ảnh mẫu:

1. **Hero** — tên lớn "The Colorful Journey" kiểu chữ viết tay + in đậm, mô tả ngắn, 2 nút (`Explore the Journey` → đăng nhập, `See Latest Moments` → cuộn xuống), dòng "150+ returning visitors", cùng ảnh mock giao diện timeline bên phải, polaroid dán băng keo và sticker trái tim.
2. **"No more drop-offs. Stronger connections."** — lý do làm sản phẩm + 3 bước (Stay in the loop / Relive & reconnect / Feel like you're here) nối bằng đường nét đứt, kèm ảnh nhóm + giấy note.
3. **"Browse by moments, not just dates."** — 3 thẻ: Photos & Memories, Journal Entries, Project Updates.
4. **Dải số liệu** — 150+ / 60+ / 25+ / 100% trên nền peach (giữ đúng như ảnh mẫu).
5. **"Real people. Real impact."** — 3 lời nhận xét (Linh N., Huy P., Mai T.) như ảnh mẫu, kèm ảnh polaroid "Together, even when apart."
6. **CTA nền gradient coral** — "Every moment matters, Be part of the journey." + nút `Join the Journey` → đăng nhập.
7. **Footer** — logo chữ, 3 cột liên kết (cuộn trong trang), dòng bản quyền, giấy note.

Chi tiết phong cách: khối bo góc lớn, đổ bóng mềm, sticker ✨/trái tim, ảnh nghiêng nhẹ như dán vào sổ tay — đúng tinh thần ảnh mẫu.

Người đã đăng nhập vào `/` sẽ được đưa thẳng vào `/lich` như trước, nên không ai bị mất luồng cũ.

## 2. Ảnh minh họa (tự tạo)

Tạo khoảng 5 ảnh theo phong cách ấm, pastel giống ảnh mẫu, lưu trong `src/assets`:
- ảnh nhóm workshop trong phòng sáng
- bàn làm việc với ảnh, giấy note, hoa
- polaroid phong cảnh (biển/hoàng hôn)
- tranh minh họa "photos & memories" và "journal entries" cho phần 3 thẻ

Ảnh mock giao diện timeline trong hero sẽ được dựng bằng HTML/CSS (không phải ảnh) để nét và tự đổi theo màu chủ đề.

## 3. Đăng nhập / tạo tài khoản: chỉ còn Google

- Trang `/auth` bỏ hoàn toàn tab **Đăng nhập / Đăng ký** bằng email + mật khẩu, chỉ còn một nút lớn **Tiếp tục với Google**, thiết kế lại đồng bộ với landing page.
- Bỏ luôn phần ô nhập email, mật khẩu, họ tên và các thông báo lỗi liên quan.
- Tắt phương thức email/mật khẩu ở phía backend để không ai đăng ký bằng email được nữa.

**Lưu ý quan trọng:** hiện có khoảng 7 tài khoản đã tạo bằng email + mật khẩu. Sau khi tắt email, những người đó phải đăng nhập bằng Google với **cùng địa chỉ Gmail** đã dùng (hầu hết là Gmail nên vẫn vào được đúng tài khoản cũ). Nếu bạn muốn giữ đường đăng nhập bằng mật khẩu cho họ thì cho mình biết, mình sẽ chỉ ẩn khỏi giao diện thay vì tắt hẳn.

## 4. Thông tin chia sẻ (SEO)

Trang landing có tiêu đề, mô tả, og:title / og:description / og:image riêng dùng ảnh hero — để khi gửi link cho người mới thì hiện preview đẹp.

---

## Ghi chú kỹ thuật

- `src/routes/index.tsx`: bỏ `redirect` vô điều kiện, thành route công khai (SSR bật) có `head()` riêng; chỉ chuyển hướng khi đã có session.
- Landing tách thành các component nhỏ trong `src/components/landing/` (Hero, WhySection, MomentsSection, StatsBand, Testimonials, CTASection, LandingFooter) để file route gọn.
- Toàn bộ màu dùng token trong `src/styles.css`; nếu cần thêm sắc peach/handwriting sẽ bổ sung token mới chứ không hardcode.
- Nút Google vẫn dùng `lovable.auth.signInWithOAuth("google", …)` như hiện tại.
- Tắt email provider bằng công cụ cấu hình đăng nhập của backend (giữ Google bật).
- Xử lý luôn cảnh báo hydration React #418 đang xuất hiện ở preview.
