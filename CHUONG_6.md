# CHƯƠNG 6. CHẠY CHƯƠNG TRÌNH, ĐÁNH GIÁ VÀ HƯỚNG PHÁT TRIỂN

Chương này trình bày quy trình hướng dẫn cài đặt khởi chạy hệ thống **JapanE** trong môi trường thực tế, mô tả trực quan các màn hình giao diện người dùng thực tế của ứng dụng, đồng thời đánh giá toàn diện về ưu/nhược điểm và vạch ra định hướng nâng cấp phát triển đề tài trong tương lai.

---

## 6.1. Hướng dẫn khởi chạy và vận hành chương trình

Nhờ áp dụng công nghệ container hóa thông qua Docker, quy trình cài đặt và khởi chạy toàn bộ hệ thống JapanE (bao gồm Web API Backend, Cơ sở dữ liệu SQL Server và ứng dụng Web Front-end) trên máy tính cục bộ hoặc máy chủ được đơn giản hóa tối đa chỉ bằng vài câu lệnh:

1. **Yêu cầu hệ thống tối thiểu:**
   * Máy tính đã cài đặt sẵn **Docker Desktop** (trên Windows/macOS) hoặc **Docker Engine** (trên Linux/Ubuntu).
   * Cổng mạng `5000` (dành cho API & Frontend Web) và `1433` (dành cho kết nối cơ sở dữ liệu SQL Server ngoài) phải ở trạng thái trống, chưa có ứng dụng khác sử dụng.

2. **Các bước khởi chạy hệ thống:**
   * Bước 1: Mở công cụ dòng lệnh (Terminal/PowerShell) và điều hướng vào thư mục gốc chứa mã nguồn dự án:
     ```bash
     cd JapanE_LEARN
     ```
   * Bước 2: Thiết lập mật khẩu quản trị cơ sở dữ liệu và khóa bảo mật JWT trong tệp cấu hình môi trường `.env` ở thư mục gốc (nếu triển khai trên Production) hoặc sử dụng các giá trị mặc định được định nghĩa sẵn.
   * Bước 3: Khởi chạy lệnh điều phối dịch vụ Docker Compose để tự động xây dựng hình ảnh ứng dụng và liên kết mạng:
     ```bash
     docker compose up -d
     ```
     *Lưu ý:* Ở lần chạy đầu tiên, Docker Compose sẽ tự động kéo hình ảnh cơ sở dữ liệu từ Microsoft Registry và biên dịch mã nguồn C# Backend theo chỉ dẫn của `Dockerfile`. Các lần khởi chạy sau sẽ diễn ra tức thì trong vòng 3 đến 5 giây.
   * Bước 4: Kiểm tra trạng thái hoạt động của các container:
     ```bash
     docker compose ps
     ```
     Đảm bảo cả hai container `japane-learn-api` và `japane-learn-db` đều ở trạng thái `Running` (Up).

3. **Truy cập ứng dụng:**
   * Mở trình duyệt web bất kỳ và truy cập vào địa chỉ: [http://localhost:5000](http://localhost:5000)
   * Hệ thống Backend ASP.NET Core sẽ tự động phục vụ trực tiếp giao diện Web Front-end Single Page Application (SPA). Người dùng có thể tiến hành Đăng ký tài khoản, Đăng nhập và bắt đầu ôn luyện.

---

## 6.2. Các màn hình giao diện thực tế của ứng dụng

Dưới đây là hình ảnh chụp giao diện hoạt động thực tế của ứng dụng **JapanE** trên nền tảng trình duyệt Web, tuân thủ chặt chẽ theo ngôn ngữ thiết kế tối giản, hiện đại và tối ưu hóa trải nghiệm học tập học thuật:

### 6.2.1. Màn hình Bảng điều khiển (Dashboard)
Màn hình Bảng điều khiển cung cấp cho học viên cái nhìn trực quan toàn diện nhất về tiến trình học tập của bản thân. Giao diện được bố trí theo phong cách Bento Grid hiện đại giúp phân nhóm thông tin khoa học:
* **Các thẻ chỉ số chính:** Thống kê tổng số từ vựng người học đã đạt trạng thái thuộc lòng hoàn toàn (*Mastered*), số thẻ đang học trong chu kỳ ôn tập ngắt quãng (*Learning*), và số thẻ mới chuẩn bị học (*New*).
* **Biểu đồ Weekly Outlook:** Minh họa số lượng thẻ từ vựng sẽ đến hạn cần phải ôn tập trong 7 ngày kế tiếp của tuần giúp học viên chủ động sắp xếp thời gian ôn tập.
* **Danh sách bộ thẻ (My Decks grid):** Hiển thị danh sách các chủ đề từ vựng người học sở hữu kèm theo phân loại cấp độ JLPT (N5 - N1) và thanh hiển thị phần trăm tiến độ học tập thực tế.

![Hình 6.1. Giao diện thực tế Bảng điều khiển (Dashboard)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_6_1.png)

---

### 6.2.2. Màn hình Quản lý bộ thẻ (My Decks)
Giao diện quản lý bộ thẻ áp dụng bố cục chia đôi màn hình tương tác cao (Split-View):
* **Cột bên trái:** Hiển thị danh sách các bộ thẻ đang hoạt động và cho phép tạo mới nhanh một bộ thẻ bằng cách nhập tiêu đề.
* **Cột bên phải:** Bảng thông tin chi tiết hiển thị toàn bộ các thẻ từ vựng (Flashcards) có trong bộ thẻ được chọn. Học viên dễ dàng theo dõi chữ Kanji, âm đọc Hiragana, dịch nghĩa tiếng Việt, ví dụ minh họa và thời gian đến hạn ôn tập tiếp theo của từng từ. Tại đây tích hợp sẵn form thêm từ vựng mới và các nút chỉnh sửa (Edit), xóa (Delete) thẻ nhanh chóng.

![Hình 6.2. Giao diện thực tế Quản lý bộ thẻ (My Decks)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_6_2.png)

---

### 6.2.3. Màn hình Bảng vẽ Canvas ôn tập (Study Canvas View)
Đây là giao diện cốt lõi của ứng dụng trong mỗi phiên ôn tập từ vựng tiếng Nhật:
* **Khung hiển thị gợi ý (Phía trên):** Hiển thị nghĩa tiếng Việt của từ cần viết để học viên bắt đầu liên tưởng và nút loa tích hợp Web Speech API phát giọng đọc chuẩn của từ vựng đó.
* **Bảng vẽ viết tay (Phía trung tâm):** Bảng vẽ Canvas nền lưới ô ly xám nhạt hỗ trợ học viên vẽ viết nét chữ Kanji/Kana bằng ngón tay trên di động hoặc bằng chuột trên máy tính. 
* **Thanh công cụ vẽ (Phía dưới):** Bao gồm nút xóa nhanh bảng vẽ (Clear), thanh trượt điều chỉnh độ dày nét bút viết, nút chuyển đổi công cụ Bút viết / Tẩy xóa chuyên nghiệp, và nút **Show Answer** nổi bật để lật mặt sau của thẻ học.

![Hình 6.3. Giao diện thực tế Bảng vẽ Canvas ôn tập (Study Canvas View)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_6_3.png)

---

### 6.2.4. Màn hình Lật thẻ đáp án & Đánh giá (Study Revealed Card View)
Khi người học chọn "Show Answer", mặt sau của thẻ được lật mở đồng thời giữ nguyên nét vẽ của học viên trên bảng vẽ để làm cơ sở đối chiếu:
* **Khung hiển thị đáp án:** Xuất hiện đầy đủ chữ mẫu Kanji viết chuẩn, cách đọc phiên âm Kana (Furigana), nghĩa chi tiết và câu ví dụ tiếng Nhật thực tế kèm nghĩa dịch mẫu để bổ trợ ngữ cảnh.
* **Thanh đánh giá chất lượng ghi nhớ (SRS rating):** Cung cấp 4 nút bấm tương tác tương ứng với 4 mức độ nhớ chữ để kích hoạt thuật toán lặp lại ngắt quãng SuperMemo-2 (SM-2):
  1. **Forgot (rating = 1):** Không nhớ chữ viết hoặc viết sai hoàn toàn nét chữ (Hệ thống đặt lịch ôn tập lại sau 1 ngày).
  2. **Hard (rating = 2):** Nhớ mang máng và viết còn ngập ngừng, sai nét nhỏ (Hệ thống giữ nguyên khoảng chu kỳ cũ để kiểm tra lại).
  3. **Good (rating = 3):** Viết đúng chữ vựng nhưng cần một chút thời gian suy nghĩ do dự (Hệ thống tăng chu kỳ giãn cách ôn tập).
  4. **Easy (rating = 4):** Viết chính xác và trôi chảy từ vựng ngay lập tức (Hệ thống tăng mạnh chu kỳ giãn cách ôn tập).

![Hình 6.4. Giao diện thực tế Lật thẻ đáp án & Đánh giá (Study Revealed Card View)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_6_4.png)

---

### 6.2.5. Màn hình Thống kê chi tiết (Statistics View)
Giao diện thống kê cung cấp báo cáo chi tiết về thói quen và hiệu suất học tập của người dùng:
* **Biểu đồ phân tích trạng thái học tập:** Biểu đồ hình tròn SVG biểu diễn phần trăm phân bố từ vựng theo ba nhóm trạng thái (Đã thuộc hoàn toàn, Đang học, Thẻ mới) giúp đánh giá trực quan hiệu suất ghi nhớ dài hạn.
* **Nhật ký ôn tập lịch sử (Review Logs):** Bảng lịch sử liệt kê thời gian thực học viên thực hiện ôn tập, tên từ vựng tiếng Nhật đã ôn và điểm số tự đánh giá của lượt học đó để người dùng nhìn nhận lại tiến trình nỗ lực của bản thân.

![Hình 6.5. Giao diện thực tế Thống kê chi tiết (Statistics View)](file:///C:/Users/HOHIEU/.gemini/antigravity/brain/d0949afd-8564-47e8-b4b7-15446c0ba489/hinh_6_5.png)

---

## 6.3. Đánh giá kết quả đạt được

Trải qua quá trình khảo sát, thiết kế và phát triển thực tế mã nguồn ứng dụng web **JapanE**, nhóm nghiên cứu đã đạt được những kết quả đáng ghi nhận cùng một số hạn chế cần khắc phục:

### 6.3.1. Các ưu điểm nổi bật
* **Sự kết hợp đột phá:** Khắc phục được nhược điểm của các ứng dụng học Flashcard truyền thống (chỉ hỗ trợ nhìn và lật) bằng cách tích hợp trực tiếp bảng vẽ Canvas tương tác. Học viên vừa được giãn cách ôn tập khoa học bằng thuật toán, vừa được rèn luyện trực tiếp cơ tay viết chữ Kanji/Kana - kỹ năng cốt lõi của tiếng Nhật.
* **Thuật toán SM-2 vận hành hiệu quả:** Hệ thống Backend C# xử lý chính xác việc tính toán lại hệ số EaseFactor và khoảng giãn cách ôn tập Interval, giúp tiết kiệm tối đa thời gian học tập của học viên bằng cách chỉ tập trung vào các từ vựng hay quên.
* **Tối ưu tương tác bảng vẽ cảm ứng:** Mã JavaScript xử lý Canvas hoạt động mượt mà, tốc độ phản hồi nét viết nhanh gần như không có độ trễ. Thiết lập ngăn chặn sự kiện mặc định của trình duyệt (`e.preventDefault()`) giúp giải quyết triệt để lỗi cuộn màn hình khi viết tay trên điện thoại di động và máy tính bảng.
* **Kiến trúc bền vững, dễ cài đặt:** Hệ thống phân tầng Client-Server tách biệt thông qua bảo mật JWT giúp ứng dụng nhẹ và tải nhanh. Việc đóng gói hoàn chỉnh bằng Docker cùng quy trình tích hợp và triển khai tự động CI/CD qua GitHub Actions giúp ứng dụng có độ tin cậy vận hành rất cao.

### 6.3.2. Một số hạn chế hiện tại
* **Đánh giá chữ viết mang tính chủ quan:** Hệ thống chưa tích hợp công nghệ trí tuệ nhân tạo (AI/OCR) tự động nhận diện chữ Kanji người học vừa viết trên bảng vẽ là đúng hay sai nét. Việc đánh giá độ nhớ (1-4) hiện tại vẫn phụ thuộc hoàn toàn vào tính tự giác đối chiếu thủ công của học viên khi mở đáp án.
* **Yêu cầu kết nối mạng:** Phiên bản hiện tại của ứng dụng hoạt động theo cơ chế Single Page Application gọi API liên tục tới máy chủ nên yêu cầu học viên phải có kết nối Internet liên tục trong quá trình ôn tập.

---

## 6.4. Hướng phát triển tương lai

Để ứng dụng **JapanE** trở nên hoàn thiện và thông minh hơn, định hướng phát triển tiếp theo của đề tài sẽ tập trung vào các nội dung trọng tâm sau:

1. **Tích hợp trí tuệ nhân tạo nhận dạng chữ viết tay (AI OCR):**
   * Tích hợp một mô hình học sâu (Deep Learning) tối giản trực tiếp ở phía Client sử dụng thư viện **TensorFlow.js** để tự động nhận diện chữ Kanji/Kana mà người dùng vừa vẽ trên Canvas.
   * Cung cấp phản hồi tự động về độ chính xác của nét viết và thứ tự nét vẽ (Stroke Order), từ đó đưa ra điểm số đánh giá khách quan thay vì phụ thuộc hoàn toàn vào cảm tính chủ quan của người học.

2. **Hỗ trợ học tập ngoại tuyến (Offline Mode):**
   * Phát triển ứng dụng thành định dạng **PWA (Progressive Web App)** hoặc đóng gói ứng dụng di động Hybrid sử dụng **React Native**.
   * Sử dụng giải pháp lưu trữ cục bộ như IndexedDB ở trình duyệt để lưu trữ các bộ thẻ và nhật ký ôn tập khi không có mạng, sau đó tự động đồng bộ hóa (Sync) dữ liệu lên cơ sở dữ liệu SQL Server ở Backend khi có kết nối Internet trở lại.

3. **Mở rộng tính năng chia sẻ cộng đồng:**
   * Phát triển phân hệ "Thư viện thẻ cộng đồng" (Community Decks) cho phép người dùng chia sẻ các bộ thẻ từ vựng tự biên soạn lên hệ thống chung.
   * Người dùng khác có thể tìm kiếm, đánh giá xếp hạng và tải về bộ thẻ cộng đồng về tài khoản cá nhân để bắt đầu ôn tập.

---

## 6.5. Kết luận đề tài

Đề tài nghiên cứu và xây dựng ứng dụng web học tiếng Nhật **JapanE** tích hợp bảng vẽ viết tay tương tác và thuật toán ôn tập giãn cách SuperMemo-2 đã hoàn thành trọn vẹn tất cả mục tiêu đề ra ban đầu. 

Hệ thống đã hiện thực hóa thành công một giải pháp giáo dục số hóa tiên tiến, kết hợp hài hòa giữa cơ sở khoa học về trí nhớ dài hạn (Spaced Repetition) và phương pháp học viết truyền thống nhằm mang lại trải nghiệm tối ưu cho người học tiếng Nhật. Quá trình triển khai thử nghiệm cho thấy ứng dụng hoạt động ổn định, hiệu năng bảng vẽ mượt mà, cấu hình triển khai tự động hóa an toàn. Đây sẽ là tiền đề vững chắc để phát triển hệ thống thành một nền tảng hỗ trợ học ngoại ngữ toàn diện và thông minh hơn trong tương lai.
