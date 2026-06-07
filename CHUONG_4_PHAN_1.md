# CHƯƠNG 4. THIẾT KẾ GIAO DIỆN (PHẦN 1)

Chương này trình bày chi tiết về triết lý thiết kế giao diện (UI/UX) của ứng dụng **JapanE** theo hệ thống thiết kế đồng bộ mang tên **"The Scholarly Inkstone"** (Mực nghiên học thuật). Đồng thời, chương này mô tả chi tiết bố cục và các thành phần giao diện của các màn hình chính bao gồm màn hình Xác thực, Bảng điều khiển (Dashboard) và màn hình Quản lý bộ thẻ (My Decks).

---

## 4.1. Hệ thống thiết kế (Design System "The Scholarly Inkstone")

Giao diện của JapanE được xây dựng dựa trên triết lý tối giản, tinh tế nhưng mang đậm màu sắc học thuật truyền thống Nhật Bản kết hợp phong cách thiết kế hiện đại. Hệ thống thiết kế sử dụng các thẻ biến CSS (CSS custom properties) đồng bộ để quản lý màu sắc, kiểu chữ và các thuộc tính bo góc.

### 4.1.1. Bảng màu và các mã màu Tokens (Color Palette)
Hệ thống sử dụng các tông màu đá phiến (Slate) trầm kết hợp với màu xanh ngọc lục bảo (Emerald) để tạo điểm nhấn trực quan:
* **Màu nền hệ thống (Surface Colors):**
  * Nền chính ứng dụng (`--surface`): `#f8fafc` (tương ứng Slate-50) tạo cảm giác nhẹ nhàng, sạch sẽ.
  * Nền thanh bên Sidebar (`--surface-low`): `#f1f5f9` (Slate-100) tạo sự phân cấp không gian rõ ràng.
  * Nền thẻ chứa nội dung (`--surface-container`): `#ffffff` giúp các nội dung học tập nổi bật trên nền Slate.
  * Nền trạng thái di chuột/nhấn (`--surface-high`, `--surface-highest`): `#e2e8f0` và `#cbd5e1`.
* **Màu sắc chủ đạo (Primary Colors):**
  * Màu chữ chính và các hành động chính (`--primary`): `#0f172a` (Slate-900) đem lại độ tương phản cao, dễ đọc.
  * Màu đường viền và nút bấm bổ trợ (`--primary-container`): `#1e293b` (Slate-800).
* **Màu nhấn và màu bổ trợ (Accent Colors):**
  * Màu nhấn học tập và trạng thái thành công/đã thuộc (`--tertiary`): `#10b981` (Emerald-500) thể hiện tiến trình học tập trôi chảy, tươi mát.
  * Màu cảnh báo và lỗi đăng nhập (`--error`): `#ef4444` (Rose-500) thu hút sự chú ý tức thì của người học.

### 4.1.2. Hệ thống kiểu chữ (Typography)
Ứng dụng tích hợp ba bộ font chữ chuẩn hóa từ Google Fonts để phục vụ các mục đích hiển thị khác nhau:
* **Font chữ viết Nhật Bản (`--font-serif`):** Sử dụng font **'Noto Serif JP'** (Serif - Chữ có chân). Đây là font chữ tối ưu để hiển thị các ký tự Kanji, Hiragana và Katakana theo phong cách thư pháp bút mực cổ truyền, giúp người học dễ dàng nhận biết cấu trúc nét viết chuẩn xác nhất của chữ tượng hình.
* **Font chữ nội dung (`--font-body`):** Sử dụng font **'Plus Jakarta Sans'** (Sans-serif). Một font chữ hình học hiện đại, có khoảng cách chữ tối ưu, mang lại cảm giác dễ chịu khi đọc các câu ví dụ, nghĩa từ vựng hoặc mô tả tiếng Việt.
* **Font nhãn và số liệu (`--font-label`):** Sử dụng font **'Inter'**. Được áp dụng cho các nhãn nút bấm, chỉ số thống kê, tiến trình phần trăm để đảm bảo tính rõ nét, chuyên nghiệp.

### 4.1.3. Hệ thống bo góc (Border Radii)
Để tạo cảm giác mềm mại và hiện đại (phong cách Bento Grid), hệ thống quy định các mức bo góc nhất quán:
* Bo góc nhỏ (`--radius-sm` - 6px): Sử dụng cho các ô nhập liệu (inputs) và nút bấm nhỏ.
* Bo góc trung bình (`--radius-md` - 10px): Sử dụng cho các nút bấm hành động chính, menu con.
* Bo góc lớn (`--radius-lg` - 16px): Sử dụng cho các thẻ Bento, khung bảng vẽ Canvas và các hộp thoại Modals.
* Bo góc siêu lớn (`--radius-xl` - 24px) & dạng viên thuốc (`--radius-pill` - 50px): Dành cho thẻ Flashcard lật và các chip phân loại.

---

## 4.2. Thiết kế chi tiết các giao diện chính (Phần đầu)

### 4.2.1. Giao diện Xác thực (Đăng nhập / Đăng ký)
* **Bố cục giao diện:**
  * **Cột bên trái (Giao diện trang trí thương hiệu):** Sử dụng gam màu tối trầm của đá phiến kết hợp với biểu tượng cổng Torii truyền thống màu đỏ được cách điệu bằng chữ Hán **"学"** (Học). Phía dưới hiển thị câu slogan đại diện cho tinh thần của ứng dụng: *"The Scholarly Inkstone"* (Nghiên mực học thuật).
  * **Cột bên phải (Khung biểu mẫu tương tác):** Thiết kế dạng thẻ trắng nổi bật (`--surface-container`). Ở trên cùng là logo thương hiệu **JapanE**, tiếp theo là thanh Tab chuyển đổi mượt mà giữa hai trạng thái "Login" và "Register".
* **Các thành phần tương tác:**
  * Trường nhập liệu Email, Username, Password được thiết kế tối giản với đường viền mỏng `#cbd5e1`, tự động chuyển sang viền đậm khi người dùng trỏ chuột (focus).
  * Nút bấm hành động chính "Sign In" / "Create Account" được tô màu đen Slate-900 cá tính, bo góc tròn nhẹ, tạo hiệu ứng chuyển màu mượt mà khi di chuột qua.
  * Vùng hiển thị thông báo lỗi màu đỏ Rose-500 mảnh nằm ngay dưới các trường nhập liệu để cảnh báo tức thì khi người dùng nhập sai định dạng hoặc mật khẩu không đúng.

### 4.2.2. Giao diện Bảng điều khiển (Dashboard)
* **Bố cục giao diện:** Thiết kế theo phong cách giao diện Bento Grid (chia ô dạng hộp) đang là xu hướng hiện nay, giúp tổ chức thông tin trực quan và khoa học:
  * **Thanh trạng thái thống kê nhanh (Stats Row):** Gồm 4 thẻ Bento nhỏ hiển thị các thông số quan trọng: *Due Today* (Số thẻ đến hạn - làm nổi bật bằng viền lục bảo), *Day Streak* (Số ngày học liên tiếp - kèm biểu tượng ngọn lửa 🔥), *Total Cards* (Tổng số thẻ hiện tại) và *Active Decks* (Tổng số bộ thẻ đang học).
  * **Ô lớn bên trái (Bản đồ nhiệt - Study Activity Heatmap):** Hiển thị lịch sử ôn tập hàng ngày trong 3 tháng gần nhất dưới dạng lưới các ô vuông nhỏ. Màu sắc của ô vuông thay đổi từ xám nhạt (không học) sang xanh lục bảo đậm dần tương ứng với số lượng thẻ đã học trong ngày, giúp kích thích động lực chuyên cần của người học.
  * **Ô bên phải (Biểu đồ tròn tiến độ - Vocab Progress):** Sử dụng đồ họa SVG vẽ một biểu đồ hình bánh donut thể hiện phần trăm phân bố từ vựng: Đã thuộc (Mastered - màu xanh ngọc), Đang học (Learning - màu vàng cam) và Chưa học (Not Started - màu xám). Tâm biểu đồ hiển thị tổng số từ vựng hiện có.
  * **Hàng dưới bên trái (Danh sách bộ thẻ đang hoạt động - Active Decks):** Hiển thị danh sách các bộ thẻ dưới dạng lưới các ô vuông bo góc. Mỗi thẻ hiển thị tên bộ thẻ, thẻ cấp độ JLPT, số lượng từ và một thanh tiến trình Mastered/Learning thu nhỏ.
  * **Hàng dưới bên phải (Biểu đồ cột dự báo - Weekly Outlook):** Biểu đồ cột SVG mô phỏng số lượng thẻ đến hạn ôn tập trong các ngày tiếp theo trong tuần để người học chủ động lên kế hoạch.

![Hình 4.1. Bản phác thảo (Wireframe) giao diện Bảng điều khiển (Dashboard)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_4_1.png)




### 4.2.3. Giao diện Quản lý bộ thẻ (My Decks - Split View)
Để tối ưu hóa không gian hiển thị và giảm thiểu số lần chuyển trang, giao diện Quản lý bộ thẻ được thiết kế theo dạng **Split-Pane (Chia đôi màn hình trái - phải)**:
* **Bảng bên trái (Danh sách bộ thẻ):**
  * Phía trên là tiêu đề trang và nút bấm "+ New Deck" để tạo nhanh bộ thẻ mới.
  * Thanh tìm kiếm bộ thẻ cho phép lọc từ khóa thời gian thực.
  * Hàng Tab bộ lọc nhanh gồm: *All* (Tất cả bộ thẻ), *Due* (Chỉ hiển thị bộ thẻ có thẻ đến hạn ôn tập trong ngày) và *Favorites* (Bộ thẻ yêu thích).
  * Danh sách bộ thẻ hiển thị dạng danh sách trượt dọc mượt mà. Mỗi dòng hiển thị tên bộ thẻ, tổng số thẻ con và thẻ biểu tượng tag thể loại (Ví dụ: 動 - Động từ, 名 - Danh từ).
* **Bảng bên phải (Chi tiết bộ thẻ & Bảng danh sách từ vựng):**
  * Khi chưa chọn bộ thẻ, bảng hiển thị một hình ảnh minh họa nhẹ nhàng và thông báo hướng dẫn chọn bộ thẻ.
  * Khi người học chọn một bộ thẻ cụ thể, bảng bên phải sẽ tự động hiển thị chi tiết:
    * **Phần đầu:** Tên bộ thẻ nổi bật, các tag cấp độ (JLPT N5) và hàng nút hành động nhanh: **"Study Now"** (bắt đầu học - màu lục bảo nổi bật), **"Rename"** (đổi tên), **"Import"** (nhập thẻ hàng loạt), **"Add Card"** (thêm thẻ thủ công) và **"Delete Deck"** (xóa bộ thẻ).
    * **Thanh tiến trình lớn:** Hiển thị tỉ lệ phần trăm từ vựng đã thuộc (Mastered) và đang học (Learning) của bộ thẻ dưới dạng thanh trượt hai màu sinh động.
    * **Các thẻ chỉ số phụ:** Hiển thị ngày ôn tập kế tiếp (Next Review) và tỷ lệ trả lời đúng trung bình (Avg. Performance).
    * **Bảng danh sách từ vựng (Cards Table):** Một bảng dữ liệu lưới chi tiết hiển thị toàn bộ các thẻ từ vựng hiện có trong bộ thẻ. Bảng hiển thị rõ nét các cột: chữ Kanji, Hiragana (Reading), Nghĩa tiếng Việt, ví dụ mẫu, ngày ôn tập kế tiếp và khoảng thời gian ôn tập (Interval). Ở góc trên là thanh thả sắp xếp (Sort) cho phép sắp xếp danh sách thẻ theo: Thứ tự chữ cái Kanji, Ngày đến hạn (Due Date) hoặc Khoảng thời gian ôn tập (Interval). Cuối mỗi dòng từ vựng là nút sửa (Edit) và xóa (Delete) thẻ nhanh.

![Hình 4.2. Bản phác thảo (Wireframe) giao diện Quản lý bộ thẻ (My Decks Split-View)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_4_2.png)



