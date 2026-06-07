# CHƯƠNG 3. KHẢO SÁT VÀ PHÂN TÍCH (PHẦN 1)

Chương này tập trung khảo sát thực trạng các ứng dụng học tiếng Nhật hiện nay, từ đó chỉ ra những hạn chế trong việc hỗ trợ luyện viết chữ viết. Đồng thời, chương này tiến hành phân tích chi tiết các yêu cầu chức năng và phi chức năng của hệ thống để làm cơ sở thiết kế kiến trúc và cơ sở dữ liệu.

---

## 3.1. Khảo sát thực trạng

Để xây dựng một ứng dụng học tiếng Nhật thực sự hiệu quả và đáp ứng đúng nhu cầu người học, tác giả đã tiến hành khảo sát và đánh giá các phần mềm, trang web học từ vựng phổ biến hiện nay.

### 3.1.1. Khảo sát các ứng dụng học từ vựng phổ biến

#### 1. Phần mềm Anki (AnkiWeb & Anki Desktop)
* **Ưu điểm:**
  * Là công cụ đi đầu và mạnh mẽ nhất về phương pháp học lặp lại ngắt quãng (Spaced Repetition System - SRS).
  * Cho phép người dùng tùy biến thẻ học rất cao, hỗ trợ nhiều loại dữ liệu (hình ảnh, âm thanh, LaTeX).
  * Cộng đồng người dùng lớn, chia sẻ hàng ngàn bộ thẻ (shared decks) chất lượng.
* **Nhược điểm:**
  * Giao diện người dùng lỗi thời, phức tạp và khó tiếp cận đối với người mới bắt đầu học.
  * Phiên bản AnkiWeb (chạy trên trình duyệt) có giao diện rất đơn giản và hoàn toàn **không hỗ trợ bảng viết tay (canvas)** để người dùng thực hành viết chữ khi đang ôn tập thẻ.
  * Việc tạo hoặc nhập bộ thẻ yêu cầu người dùng phải tìm hiểu nhiều thiết lập kỹ thuật phức tạp.

#### 2. Nền tảng học tập Quizlet
* **Ưu điểm:**
  * Giao diện hiện đại, trực quan, thân thiện và rất dễ sử dụng trên cả máy tính lẫn điện thoại di động.
  * Hỗ trợ nhiều chế độ học tập thú vị (Flashcard, Học, Viết, Kiểm tra, Ghép thẻ).
  * Quy trình tạo bộ thẻ nhanh chóng, hỗ trợ gợi ý nghĩa từ vựng tự động.
* **Nhược điểm:**
  * Tính năng lặp lại ngắt quãng (Spaced Repetition) nâng cao hiện tại đã bị giới hạn hoặc chuyển sang phiên bản trả phí (Quizlet Plus).
  * Chế độ "Viết" của Quizlet thực chất là gõ câu trả lời bằng bàn phím máy tính hoặc điện thoại. Quizlet hoàn toàn **không tích hợp bảng vẽ tự do** để người dùng trực tiếp dùng chuột hoặc ngón tay viết nét chữ Kanji/Kana. Điều này làm giảm hiệu quả ghi nhớ mặt chữ tượng hình của tiếng Nhật.

#### 3. Các ứng dụng từ điển & luyện viết chuyên biệt (như Mazii, Write It! Japanese)
* **Ưu điểm:**
  * Các ứng dụng từ điển (Mazii) hỗ trợ tra cứu từ vựng chi tiết, có tính năng vẽ nhận diện chữ viết tay để tra cứu Kanji.
  * Các ứng dụng luyện viết (Write It! Japanese) hướng dẫn chi tiết từng nét viết chữ cái Hiragana/Katakana rất trực quan.
* **Nhược điểm:**
  * Các ứng dụng luyện viết chỉ giới hạn ở bảng chữ cái cơ bản, không hỗ trợ ôn tập từ vựng hay các chữ Kanji phức tạp theo nhu cầu cá nhân.
  * Các ứng dụng này không hoạt động theo mô hình flashcard lặp lại ngắt quãng, người dùng không thể quản lý tiến trình ghi nhớ dài hạn của từng từ vựng riêng lẻ.

---

### 3.1.2. Đánh giá và hướng giải quyết của đề tài

Qua khảo sát thực tế, tác giả nhận thấy có một khoảng trống lớn trong các công cụ học tiếng Nhật hiện nay: **Sự thiếu đồng bộ giữa ôn tập ghi nhớ (Flashcard SRS) và thực hành viết chữ (Canvas)**. Học tiếng Nhật — đặc biệt là chữ Kanji — yêu cầu người học phải kết hợp đồng thời cả việc nhận diện nghĩa, nghe phát âm và thực hành nét viết để tạo trí nhớ cơ học sâu. Việc người học phải chuyển đổi liên tục giữa ứng dụng flashcard và giấy bút bên ngoài làm gián đoạn sự tập trung và giảm hiệu suất học tập.

**Hướng giải quyết của đề tài:**
Xây dựng ứng dụng **JapanE** nhằm tích hợp cả ba yếu tố cốt lõi này lên cùng một không gian học tập:
1. **Ôn tập thông minh:** Áp dụng thuật toán lặp lại ngắt quãng SuperMemo-2 (SM-2) để tự động hóa chu kỳ ôn tập của từng từ vựng dựa trên mức độ tự đánh giá của người học.
2. **Luyện viết tương tác trực tiếp:** Tích hợp bảng vẽ Canvas ngay bên cạnh thẻ flashcard. Người học có thể nhìn từ vựng, nghe phát âm và viết trực tiếp lên màn hình bằng chuột, ngón tay hoặc bút cảm ứng, sau đó lật thẻ để đối chiếu ngay nét viết của mình với hình mẫu chuẩn.
3. **Trải nghiệm tối giản và hiện đại:** Giao diện tối giản theo phong cách Bento Grid cao cấp, hỗ trợ nhập từ vựng hàng loạt từ file văn bản để tối ưu hóa thời gian chuẩn bị học liệu.

---

## 3.2. Phân tích yêu cầu hệ thống

Hệ thống được thiết kế để phân tách rõ ràng giữa phân hệ giao diện người dùng và phân hệ quản lý thông qua các yêu cầu chức năng và phi chức năng cụ thể.

### 3.2.1. Yêu cầu chức năng (Functional Requirements)

Hệ thống được chia thành hai nhóm đối tượng sử dụng chính: **Người học (Learner)** và **Quản trị viên (Admin)**.

#### 1. Phân hệ Người học (Learner)
* **Quản lý tài khoản:**
  * Đăng ký tài khoản học tập cá nhân bằng email.
  * Đăng nhập hệ thống bảo mật để đồng bộ hóa tiến trình học trên các thiết bị khác nhau.
* **Quản lý bộ thẻ (Decks):**
  * Tạo mới bộ thẻ cá nhân theo chủ đề (Ví dụ: Từ vựng N5, Động từ Kanji...).
  * Chỉnh sửa tên bộ thẻ hoặc xóa bộ thẻ khi không còn nhu cầu sử dụng.
  * Thêm, sửa, xóa các thẻ từ vựng (Flashcards) bên trong từng bộ thẻ.
* **Nhập từ vựng hàng loạt (Bulk Import):**
  * Hỗ trợ tải tệp tin dữ liệu dạng `.csv`, `.tsv`, hoặc `.txt` có định dạng phân tách bằng dấu phẩy hoặc tab.
  * Hiển thị bảng xem trước (preview) danh sách từ vựng trước khi xác nhận lưu vào hệ thống để giảm thiểu sai sót.
* **Học tập và Ôn tập:**
  * **Chế độ Duyệt thẻ (Browse):** Xem toàn bộ các thẻ trong bộ thẻ theo thứ tự, cho phép chuyển đổi qua lại (Prev/Next) tự do để làm quen từ mới.
  * **Chế độ Luyện tập (Practice - SRS):** Hệ thống chỉ lọc ra các thẻ đã đến hạn ôn tập (Due) trong ngày. Sau khi lật thẻ, người học sẽ tự đánh giá khả năng nhớ theo 4 mức độ (Forgot, Hard, Good, Easy) để máy chủ tính toán chu kỳ lặp lại tiếp theo.
* **Tương tác trên bảng vẽ Canvas:**
  * Người học có thể vẽ nét chữ tự do trên Canvas bằng chuột hoặc ngón tay/bút cảm ứng.
  * Các công cụ hỗ trợ nét vẽ: Thay đổi kích thước bút vẽ, chế độ tẩy xóa nét vẽ (Eraser), nút xóa toàn bộ bảng vẽ (Clear) để vẽ lại.
* **Hỗ trợ phát âm (Text-to-Speech):**
  * Nút bấm phát âm thanh chuẩn tiếng Nhật (`ja-JP`) cho từ vựng trên thẻ bằng giọng đọc tự nhiên.
* **Thống kê tiến trình học tập (Statistics):**
  * Biểu đồ tròn hiển thị phân bố tỷ lệ từ vựng (Chưa học, Đang học, Đã thuần thục).
  * Biểu đồ nhiệt (Heatmap) ghi nhận lịch sử hoạt động học tập hàng ngày trong vòng 12 tháng gần nhất để tạo động lực học tập.
  * Biểu đồ cột hiển thị số lượng thẻ đến hạn ôn tập dự kiến trong 7 ngày tới.

#### 2. Phân hệ Quản trị viên (Admin)
* **Quản lý người dùng:** Xem danh sách tài khoản học viên, quản lý quyền truy cập hoặc khóa tài khoản vi phạm chính sách.
* **Quản lý kho từ vựng hệ thống:** Quản lý các bộ thẻ từ vựng mẫu (như từ vựng JLPT chuẩn từ N5 đến N3) để chia sẻ chung cho toàn bộ người dùng mới đăng ký.

---

### 3.2.2. Yêu cầu phi chức năng (Non-Functional Requirements)

Để hệ thống hoạt động ổn định và mang lại trải nghiệm người dùng tối ưu, hệ thống cần đáp ứng các tiêu chuẩn phi chức năng sau:

* **Hiệu năng và Độ trễ Canvas (Performance & Responsiveness):**
  * Các nét vẽ trên Canvas phải được phản hồi ngay lập tức (độ trễ vẽ dưới 16ms - tương ứng tần số quét 60FPS) để đảm bảo nét vẽ mượt mà, không bị đứt đoạn hay trễ so với chuyển động của chuột/tay.
  * Thời gian phản hồi của Backend API đối với các tác vụ đăng nhập hoặc lấy danh sách thẻ phải dưới 200ms trong điều kiện mạng bình thường.
* **Khả năng tương thích thiết bị (Usability & Responsiveness):**
  * Giao diện ứng dụng phải thiết kế đáp ứng (Responsive Design), hiển thị tối ưu trên cả màn hình máy tính để bàn (luyện viết bằng chuột/bảng vẽ điện tử) và màn hình điện thoại di động/máy tính bảng (luyện viết trực tiếp bằng ngón tay).
* **Độ tin cậy và Tính toàn vẹn dữ liệu (Reliability & Integrity):**
  * Hệ thống Backend có cơ chế tự động thử lại kết nối cơ sở dữ liệu (`EnableRetryOnFailure`) tối đa 10 lần khi khởi chạy trên môi trường Docker để tránh lỗi sập dịch vụ khi Database khởi động chậm hơn API.
  * Dữ liệu tiến trình học tập của người dùng phải được đồng bộ chính xác và tức thì lên máy chủ sau khi người dùng xếp hạng độ nhớ của thẻ.
* **Bảo mật thông tin (Security):**
  * Mật khẩu người dùng bắt buộc phải được băm một chiều bằng thuật toán bảo mật BCrypt trước khi lưu vào SQL Server.
  * Phiên làm việc phải được bảo vệ bằng chữ ký số JWT có thời hạn hết hạn tự động và cơ chế xác thực an toàn gửi kèm trong Header.
