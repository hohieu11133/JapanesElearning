# CHƯƠNG 4. THIẾT KẾ GIAO DIỆN (PHẦN 2)

---

## 4.2. Thiết kế chi tiết các giao diện chính (Phần tiếp theo)

### 4.2.4. Giao diện Học tập và Ôn tập (Study View)
Giao diện Học tập là khu vực quan trọng nhất của ứng dụng, nơi người học tập trung ôn tập từ vựng. Màn hình được thiết kế theo dạng chia đôi không gian tương tác (Split-Screen Study Layout):
* **Thanh công cụ điều khiển phía trên (Study Header):**
  * Nút bấm **"End Session"** cho phép người học kết thúc phiên học sớm để đồng bộ và quay lại Dashboard.
  * Thanh tiến trình học tập dạng đường chạy ngang (`--study-progress-bar`) tự động lấp đầy màu xanh lục khi người học hoàn thành các thẻ trong phiên.
  * Bộ đếm số thẻ (Ví dụ: `3 / 15`) hiển thị số lượng thẻ đã ôn tập trên tổng số thẻ cần hoàn thành của phiên học hiện tại.
* **Thanh điều hướng bên trái (Study Sidebar):**
  * Một thanh điều hướng trượt ẩn hiện hiển thị danh sách từ vựng của bộ thẻ (Deck Contents). Dòng từ vựng đang học được đánh dấu bằng đường viền bên mỏng, giúp người học định vị rõ vị trí học của mình.
* **Vùng tương tác chính (Split Screen):**
  * **Bên trái - Khung thẻ ghi nhớ (Flashcard Panel):** Thẻ ghi nhớ được thiết kế với hiệu ứng lật mượt mà. 
    * *Mặt trước thẻ (Front):* Hiển thị nghĩa từ vựng tiếng Việt (Ví dụ: "ăn"), câu ví dụ đã che chữ Kanji và dòng gợi ý nhắc nhở *"How do you write this in Japanese?"* để người học suy nghĩ nét viết.
    * *Mặt sau thẻ (Back):* Xuất hiện sau khi người học nhấn lật thẻ. Hiển thị chữ Kanji viết lớn theo font thư pháp chân phương (`Noto Serif JP`), phiên âm cách đọc chữ Hiragana/Kana, câu ví dụ đầy đủ nghĩa và một nút phát loa biểu tượng 🔊 (`btn-speak`) để nghe phát âm.
  * **Bên phải - Bảng vẽ viết tay Canvas (Canvas Panel):**
    * Nền bảng vẽ canvas màu trắng tinh khiết, viền góc tròn mềm mại.
    * **Thanh công cụ vẽ nét chữ bên dưới:** Gồm nút chọn bút viết (✏), nút chọn tẩy nét vẽ (⊘), thanh trượt ngang điều chỉnh độ dày nét bút vẽ (Size Slider) và nút bấm **"Clear"** để xóa nhanh toàn bộ bảng vẽ viết lại nét chữ khác.
* **Hàng đánh giá độ nhớ (Rating Row):**
  * Sau khi lật mặt sau thẻ và đối chiếu nét chữ viết tay của mình trên Canvas với chữ Kanji mẫu, thanh đánh giá gồm 4 nút bấm xuất hiện ở dưới cùng với các cấp độ màu sắc trực quan: **Forgot (1)** (Đỏ), **Hard (2)** (Cam), **Good (3)** (Lục đậm) và **Easy (4)** (Lục sáng). Người học tự chấm điểm để hệ thống lên lịch ôn tập.

![Hình 4.3. Bản phác thảo (Wireframe) giao diện Ôn tập (Study View)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_4_3.png)




### 4.2.5. Giao diện Hoàn thành phiên học (Study Complete View)
* **Bố cục giao diện:** Thiết kế giao diện tối giản dạng bảng mừng chiến thắng tập trung vào trung tâm:
  * Huy hiệu biểu tượng chữ Kanji **"完"** (Hoàn thành) màu lục bảo viết lớn được bo trong vòng tròn cổ điển.
  * Dòng chữ chúc mừng nổi bật **"Session Complete!"**.
  * Dòng thông báo tóm tắt số lượng thẻ người dùng đã ôn tập thành công trong phiên.
  * Hàng nút hành động nhanh: "Back to Dashboard" để quay lại bảng điều khiển chính hoặc "View Decks" để quay về trang danh sách quản lý bộ thẻ.

### 4.2.6. Giao diện Thống kê chi tiết (Statistics View)
Màn hình thống kê hiển thị chi tiết các số liệu trực quan thu thập từ lịch sử học tập của người học:
* **Hàng chỉ số nhanh (Stats Cards):** Tương tự trang Dashboard nhưng bổ sung chi tiết các chỉ số hoạt động.
* **Bản đồ nhiệt hoạt động 12 tháng (12-Month Heatmap):** Một lưới lịch biểu thị 365 ngày hiển thị mật độ số thẻ học hàng ngày dưới dạng các ô vuông đổi màu từ xám sang lục đậm.
* **Vòng tròn tỉ lệ ghi nhớ dài hạn (Retention Rate Gauge):** Đồ họa SVG vẽ vòng tròn hiển thị phần trăm tỉ lệ ghi nhớ thực tế của học viên (Ví dụ: `87%`). 
* **Biểu đồ tròn phân bố từ vựng (Donut Chart SVG):** Phân chia chi tiết số từ đã thuộc (Mastered), đang học (Learning) và chưa học (Not Started) trong toàn bộ tài khoản.
* **Bảng lịch sử ôn tập gần đây (Recent Session History):** Một bảng lưới hiển thị danh sách các phiên ôn tập gần nhất bao gồm các trường: Ngày học, Tên bộ thẻ, Số thẻ đã học, Tỉ lệ trả lời đúng (%) và Thời gian học thực tế (Phút, Giây).

![Hình 4.4. Bản phác thảo (Wireframe) giao diện Thống kê học tập chi tiết (Statistics View)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_4_4.png)




### 4.2.7. Giao diện các Hộp thoại phụ (Modals)
* **Hộp thoại Nhập từ vựng hàng loạt (Bulk Import Modal):**
  * Thiết kế khung rộng (Modal Wide).
  * Vùng kéo thả tệp tin (Drop Zone) với biểu tượng tệp lớn nét đứt, cho phép người dùng kéo thả file hoặc nhấn duyệt file `.csv`, `.tsv`, `.txt`.
  * Khung nhập văn bản trực tiếp (Textarea) rộng rãi để dán nhanh các dòng từ vựng phân cách bằng phím Tab hoặc dấu phẩy.
  * Bảng xem trước (Preview Table) hiển thị dạng lưới các từ vựng phân tách thành các cột tương ứng để kiểm tra chất lượng từ trước khi lưu.
* **Hộp thoại Chọn chế độ học (Study Mode Selector Modal):**
  * Hiển thị hai thẻ lựa chọn lớn (Choice Cards):
    * **Browse All (Xem tự do):** Biểu tượng cuốn sách 📖, dùng để xem lướt qua các thẻ từ vựng phục vụ học từ mới, cho phép di chuyển tới/lùi tự do mà không tính chu kỳ ôn tập.
    * **Practice (SRS) (Luyện tập thông minh):** Biểu tượng đích ngắm 🎯, chỉ ôn tập các thẻ đến hạn trong ngày để luyện trí nhớ dài hạn và tính toán thuật toán lặp lại ngắt quãng.

---

## 4.3. Kết luận chương 4
Chương 4 đã mô tả chi tiết toàn bộ thiết kế giao diện (UI/UX) của ứng dụng học tiếng Nhật **JapanE**. Với việc triển khai hệ thống thiết kế đồng bộ **"The Scholarly Inkstone"** dựa trên bảng màu trầm của đá phiến và màu nhấn xanh ngọc lục bảo tươi mát, kết hợp các font chữ chọn lọc chuyên biệt như Noto Serif JP, ứng dụng mang lại cảm giác học thuật cổ truyền tinh tế mà vẫn giữ được sự hiện đại, năng động.

Bố cục các giao diện cốt lõi như màn hình Dashboard Bento Grid trực quan, màn hình Decks Split-View tinh gọn và màn hình Study View chia đôi không gian luyện viết vẽ Canvas độc đáo đã giải quyết triệt để nhu cầu học tương tác đa giác quan của học viên. Các hộp thoại bổ trợ (nhập dữ liệu hàng loạt, thống kê chi tiết) được thiết kế nhất quán về mặt bo góc, màu sắc giúp tối ưu hóa tối đa trải nghiệm người dùng, làm nền tảng vững chắc để chuyển sang bước xây dựng và lập trình mã nguồn hệ thống.
