# CHƯƠNG 2. PHƯƠNG PHÁP VÀ CÔNG CỤ SỬ DỤNG (PHẦN 1)

Chương này trình bày chi tiết về các phương pháp tiếp cận kỹ thuật, kiến trúc ứng dụng cùng các công cụ phát triển phần mềm và công nghệ cốt lõi được áp dụng thực tế để xây dựng ứng dụng web học tiếng Nhật qua flashcard tích hợp canvas luyện viết.

---

## 2.1. Công cụ lập trình và môi trường phát triển

### 2.1.1. Visual Studio Code & Visual Studio
* **Visual Studio Code (VS Code):** Là trình soạn thảo mã nguồn nhẹ, mã nguồn mở do Microsoft phát triển. VS Code được trang bị hệ thống extension phong phú, hỗ trợ tối đa việc viết mã nguồn Frontend (HTML, CSS và JavaScript). Trong dự án này, VS Code đóng vai trò là công cụ chính để lập trình giao diện người dùng và xử lý sự kiện bảng vẽ Canvas.
* **Visual Studio:** Môi trường phát triển tích hợp (IDE) chuyên dụng của Microsoft dùng để xây dựng mã nguồn Backend. IDE này cung cấp khả năng biên dịch mạnh mẽ, hỗ trợ gỡ lỗi trực quan và tự động hoàn thành mã nguồn thông minh cho ngôn ngữ C# và nền tảng .NET.

### 2.1.2. Antigravity IDE (Môi trường lập trình tích hợp trợ lý AI)
* **Giới thiệu:** Antigravity IDE là môi trường phát triển mã nguồn hiện đại thế hệ mới, tích hợp sâu tác nhân trí tuệ nhân tạo (AI Agent) có khả năng hiểu ngữ cảnh toàn bộ dự án một cách tự động. 
* **Vai trò trong dự án:**
  * **Hỗ trợ lập trình cặp (AI Pair Programming):** Trợ lý AI đồng hành trực tiếp cùng lập trình viên trong quá trình phát triển dự án.
  * **Sinh mã nguồn tự động:** Hỗ trợ tạo khung ứng dụng (boilerplate code), viết các hàm xử lý logic phức tạp (như tính toán chu kỳ lặp lại ngắt quãng SM-2 hoặc chuyển đổi tọa độ điểm vẽ trên canvas) một cách nhanh chóng dựa trên mô tả yêu cầu.
  * **Giải thích và tối ưu hóa mã nguồn:** Giúp người phát triển nhanh chóng hiểu rõ cấu trúc của các module JavaScript phức tạp và tìm ra các điểm thẽn hiệu năng hoặc lỗi cú pháp thông qua phân tích tự động.
  * **Gỡ lỗi (Debugging):** Hỗ trợ phát hiện lỗi thời gian chạy (runtime errors) và đề xuất các giải pháp khắc phục tức thì, cải thiện đáng kể tốc độ phát triển dự án.

### 2.1.3. Docker & Docker Desktop
* **Giới thiệu:** Docker là nền tảng ảo hóa cho phép đóng gói ứng dụng và toàn bộ môi trường chạy phụ thuộc của nó vào trong các container độc lập và gọn nhẹ. Docker Desktop cung cấp giao diện đồ họa trực quan để quản lý các container này trên hệ điều hành Windows.
* **Vai trò trong dự án:** Docker giúp đóng gói và cô lập các dịch vụ bao gồm Cơ sở dữ liệu SQL Server 2022 và ứng dụng Backend API. Thông qua cấu hình tệp `docker-compose.yml`, toàn bộ hệ thống được khởi chạy đồng bộ chỉ với một câu lệnh đơn giản, đảm bảo tính nhất quán của môi trường hoạt động từ môi trường phát triển cục bộ đến môi trường triển khai thực tế.

---

## 2.2. Công nghệ phát triển ứng dụng

### 2.2.1. Ngôn ngữ C# và .NET 9.0 (ASP.NET Core Web API)
* **Giới thiệu:** C# là ngôn ngữ lập trình hướng đối tượng mạnh mẽ, an toàn kiểu (type-safe). .NET 9.0 là phiên bản phát hành mới nhất của Microsoft, tối ưu hiệu năng biên dịch và quản lý bộ nhớ vượt trội. ASP.NET Core Web API là framework xây dựng các dịch vụ RESTful API tốc độ cao chạy trên nền .NET.
* **Vai trò trong dự án:** Sử dụng để phát triển máy chủ Backend API xử lý toàn bộ logic nghiệp vụ bao gồm: xác thực người dùng, lưu trữ tiến trình học tập, tính toán ngày ôn tập thẻ kế tiếp và kết nối cơ sở dữ liệu.

### 2.2.2. Entity Framework Core (EF Core)
* **Giới thiệu:** Là một thư viện Object-Relational Mapper (ORM) mã nguồn mở và gọn nhẹ dành cho .NET. EF Core giúp lập trình viên thao tác với dữ liệu dưới dạng các đối tượng C# thuần túy thay vì phải viết các câu lệnh truy vấn SQL thủ công.
* **Vai trò trong dự án:** EF Core quản lý quá trình giao tiếp dữ liệu giữa Backend C# và cơ sở dữ liệu SQL Server. Dự án áp dụng phương pháp tiếp cận **Code-First**, giúp định nghĩa cấu trúc cơ sở dữ liệu trực tiếp bằng các lớp thực thể (Entities), tự động kiểm tra và khởi tạo cấu trúc bảng (`EnsureCreated`) cùng các cột dữ liệu cần thiết mỗi khi hệ thống khởi động.

### 2.2.3. Hệ quản trị cơ sở dữ liệu Microsoft SQL Server 2022 (Express Edition)
* **Giới thiệu:** Là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mạnh mẽ do Microsoft phát triển, nổi tiếng với khả năng bảo mật, đảm bảo tính toàn vẹn dữ liệu (chuẩn ACID) và tối ưu hóa hiệu năng truy vấn quan hệ.
* **Vai trò trong dự án:** SQL Server lưu trữ dữ liệu có cấu trúc của hệ thống, bao gồm thông tin người dùng, mật khẩu đã mã hóa, thông tin chi tiết của các bộ thẻ học (Decks), từ vựng tiếng Nhật (Kanji, Hiragana, nghĩa tiếng Việt, ví dụ minh họa) và dữ liệu trạng thái học tập để phục vụ thuật toán lặp lại ngắt quãng.

### 2.2.4. HTML5, CSS3 và Vanilla JavaScript (HTML5 Canvas & Web Speech API)
Ứng dụng sử dụng kiến trúc trang đơn (SPA) chạy trực tiếp bằng công nghệ Web thuần túy ở Frontend nhằm đạt tốc độ phản hồi nhanh nhất và giảm tải tài nguyên hệ thống.
* **HTML5 Canvas API:** Bảng vẽ canvas trong dự án được phát triển trực tiếp bằng thẻ `<canvas>` của HTML5 và xử lý đồ họa vector thông qua mã JavaScript. API này lắng nghe trực tiếp các sự kiện tương tác trỏ chuột (`mousedown`, `mousemove`, `mouseup`) và cảm ứng tay trên màn hình (`touchstart`, `touchmove`, `touchend`) để người học thực hiện vẽ/luyện viết chữ Kanji và Kana mượt mà trực tiếp trên thẻ nhớ mà không cần tải thêm bất kỳ thư viện vẽ đồ họa nặng nề nào khác.
* **Web Speech API (`SpeechSynthesis`):** Được tích hợp để cung cấp tính năng phát âm thanh (Text-to-Speech). Khi người dùng nhấn nút loa, trình duyệt sẽ tự động tổng hợp giọng đọc tiếng Nhật chuẩn (`ja-JP`) với tốc độ phát được điều chỉnh phù hợp (`rate: 0.85`), hỗ trợ người học ghi nhớ phát âm chuẩn xác song song với luyện viết.
* **SVG (Scalable Vector Graphics) & Bento Grid Layout:** Thiết kế giao diện theo phong cách hiện đại (Bento Grid) kết hợp đồ họa SVG động để vẽ biểu đồ tiến trình học tập (Donut Chart) và biểu đồ cột hiển thị lịch học (Bar Chart) trực tiếp trên trang Dashboard mà không cần dùng đến thư viện đồ thị cồng kềnh.
* **Vanilla JavaScript (ES6 Modules):** Tổ chức mã nguồn Frontend thành các module riêng biệt (`canvas.js`, `study.js`, `decks.js`, `tts.js`...) giúp hệ thống dễ bảo trì, tải tài nguyên theo nhu cầu và tối ưu hiệu suất thực thi trên trình duyệt.

### 2.2.5. Cơ chế bảo mật JWT (JSON Web Token) và BCrypt
* **Mã hóa mật khẩu với BCrypt:** Sử dụng thư viện `BCrypt.Net-Next` ở Backend để băm mật khẩu người dùng trước khi lưu trữ vào SQL Server. BCrypt tự động tạo chuỗi muối ngẫu nhiên (salt) giúp ngăn chặn hoàn toàn việc lộ mật khẩu ngay cả khi cơ sở dữ liệu bị rò rỉ.
* **Xác thực phi trạng thái (Stateless Authentication) với JWT:** Sau khi đăng nhập thành công, máy chủ cấp phát một chuỗi JWT đã được ký số bằng thuật toán bảo mật. Chuỗi mã này được lưu ở bộ nhớ trình duyệt phía Client và đính kèm vào tiêu đề `Authorization: Bearer <token>` trong mỗi yêu cầu gửi lên API để xác thực danh tính người dùng một cách an toàn và tối giản nhất.
