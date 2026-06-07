# CHƯƠNG 2. PHƯƠNG PHÁP VÀ CÔNG CỤ SỬ DỤNG (PHẦN 2)

---

## 2.3. Công cụ thiết kế giao diện và sơ đồ

### 2.3.1. Draw.io (diagrams.net)
* **Giới thiệu:** Draw.io là công cụ vẽ biểu đồ chuyên nghiệp, trực quan chạy trực tiếp trên nền tảng web hoặc phiên bản ngoại tuyến (offline). Nó hỗ trợ thư viện ký hiệu chuẩn hóa vô cùng phong phú phù hợp cho nhiều quy chuẩn biểu đồ hệ thống thông tin.
* **Vai trò trong dự án:** Được sử dụng để thiết kế các sơ đồ phân tích và thiết kế hệ thống bao gồm: Sơ đồ ca sử dụng (Use Case Diagram), Sơ đồ thực thể quan hệ (ERD - Entity Relationship Diagram) và Sơ đồ hoạt động/Sơ đồ tuần tự (Activity/Sequence Diagrams) mô tả luồng ôn tập và vẽ chữ trên canvas.

### 2.3.2. Figma
* **Giới thiệu:** Figma là nền tảng thiết kế giao diện người dùng (UI/UX) và tạo bản mẫu tương tác (prototyping) cộng tác thời gian thực dựa trên nền tảng đám mây. Figma được sử dụng rộng rãi nhờ tính năng vector linh hoạt và khả năng làm việc nhóm hiệu quả.
* **Vai trò trong dự án:** Figma được sử dụng để xây dựng các bản thiết kế độ trung thực cao (high-fidelity mockups) cho giao diện của dự án, giúp định hình bố cục trang web, cách bố trí hệ thống Bento Grid ở trang chủ và vị trí của các nút bấm trên thanh công cụ Canvas trước khi bước vào giai đoạn code.

### 2.3.3. Stitch UI (Stitch)
* **Giới thiệu:** Stitch UI là công cụ hỗ trợ thiết kế giao diện thông minh thế hệ mới tích hợp công nghệ AI. Stitch cho phép các nhà phát triển chuyển đổi ý tưởng thiết kế từ mô tả ngôn ngữ tự nhiên thành các màn hình giao diện thực tế và đồng bộ hóa hệ thống thiết kế (Design System).
* **Vai trò trong dự án:**
  * **Thiết kế nhanh các màn hình giao diện học:** Stitch UI được sử dụng để nhanh chóng dựng khung và phát triển giao diện học flashcard chia đôi (Split Screen) - giao diện cốt lõi kết hợp giữa thẻ nhớ và bảng vẽ canvas.
  * **Chuyển đổi mô tả văn bản thành màn hình UI thực tế:** Người thiết kế chỉ cần nhập các mô tả văn bản (ví dụ: "Tạo một giao diện học flashcard với nút bấm phát âm ở trên cùng, phía dưới là bảng vẽ canvas rộng có nút xóa và hoàn tác nét vẽ") để Stitch tự động dựng mã nguồn giao diện HTML/CSS tương ứng, giúp giảm thiểu thời gian code giao diện thủ công.
  * **Quản lý hệ thống thiết kế (Design System):** Stitch giúp duy trì và quản lý sự nhất quán của các thành phần giao diện (nút bấm, bảng màu HSL cao cấp, font chữ Noto Serif JP, khoảng cách padding/margin) trên toàn bộ ứng dụng, đảm bảo tính thẩm mỹ đồng bộ và giao diện người dùng hiện đại, tinh tế.

---

## 2.4. Phương pháp và quy trình phát triển

### 2.4.1. Quy trình phát triển phần mềm Agile và mô hình Scrum
* **Giới thiệu:** Agile là triết lý phát triển phần mềm linh hoạt, tập trung vào việc cộng tác, bàn giao sớm sản phẩm hoạt động được và phản hồi nhanh với sự thay đổi. Scrum là một khung làm việc (framework) cụ thể triển khai Agile thông qua các chu kỳ phát triển ngắn gọi là Sprint (thường từ 1-2 tuần).
* **Vai trò trong dự án:** Mô hình Scrum rút gọn được áp dụng để quản lý tiến độ dự án. Công việc được chia nhỏ thành các Sprint tuần tự: thiết kế giao diện canvas vẽ tay, xây dựng API lưu trữ, triển khai thuật toán lặp lại ngắt quãng SuperMemo-2 và tích hợp Frontend - Backend. Việc này giúp nhóm phát triển liên tục kiểm thử, đánh giá trải nghiệm vẽ tay trên canvas và tinh chỉnh thuật toán kịp thời qua từng vòng lặp.

### 2.4.2. Hệ thống quản lý phiên bản Git và nền tảng GitHub
* **Git:** Là hệ thống quản lý phiên bản phân tán (DVCS) mã nguồn mở, hỗ trợ ghi lại lịch sử thay đổi mã nguồn chi tiết và quản lý các nhánh phát triển (branches) một cách độc lập. Trong dự án, Git giúp phân nhánh an toàn khi viết mã thử nghiệm tính năng vẽ Canvas hoặc logic SRS mà không làm hỏng nhánh chính đang chạy ổn định.
* **GitHub:** Là dịch vụ lưu trữ đám mây dùng để lưu trữ các kho mã nguồn Git. GitHub giúp sao lưu dữ liệu lập trình an toàn và hỗ trợ theo dõi tiến trình thực hiện thông qua tính năng Issues để quản lý các đầu việc cần làm và các lỗi cần sửa.

---

## 2.5. Kết luận chương 2
Chương 2 đã làm rõ phương pháp tiếp cận kỹ thuật và định hình chính xác bộ công cụ phát triển thực tế của dự án. Sự kết hợp đồng bộ giữa các nền tảng lập trình mạnh mẽ của Microsoft (C#, .NET 9.0, SQL Server 2022) cùng sự linh hoạt và mượt mà của công nghệ Web thuần phía Client (HTML5 Canvas API, Web Speech API) được hỗ trợ hiệu quả bởi trợ lý AI thông minh trong **Antigravity IDE** và tốc độ dựng giao diện của **Stitch UI** giúp đảm bảo dự án vận hành tối ưu.

Các công cụ bổ trợ thiết kế (Figma, Draw.io) cùng quy trình phát triển linh hoạt Agile/Scrum và hệ thống kiểm soát mã nguồn Git/GitHub cung cấp một quy trình thực hiện đồ án khoa học, hiệu quả. Đây là những cơ sở kỹ thuật cốt lõi để tác giả tiến hành phân tích chi tiết các yêu cầu chức năng và thiết kế cơ sở dữ liệu hệ thống trong Chương 3 tiếp theo.
