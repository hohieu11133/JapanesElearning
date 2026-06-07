# CHƯƠNG 2. PHƯƠNG PHÁP VÀ CÔNG CỤ SỬ DỤNG

Chương này trình bày chi tiết về các phương pháp phát triển, kiến trúc hệ thống cùng các công cụ, công nghệ thực tế được áp dụng để thiết kế, xây dựng và triển khai ứng dụng web học tiếng Nhật qua flashcard tích hợp canvas luyện viết.

---

## 2.1. Công cụ lập trình và môi trường phát triển

### 2.1.1. Visual Studio Code & Visual Studio
* **Visual Studio Code (VS Code):** Là trình soạn thảo mã nguồn nhẹ, mã nguồn mở do Microsoft phát triển. VS Code được trang bị hệ thống extension phong phú, hỗ trợ tối đa việc viết mã HTML, CSS và JavaScript. Trong dự án, VS Code đóng vai trò là công cụ chính để lập trình toàn bộ phần giao diện người dùng (Frontend) và xử lý sự kiện bảng vẽ Canvas.
* **Visual Studio / C# Dev Kit:** Là môi trường phát triển tích hợp (IDE) chuyên dụng được sử dụng để xây dựng mã nguồn Backend. Nhờ khả năng biên dịch mạnh mẽ, hỗ trợ gỡ lỗi trực quan và tự động hoàn thành mã nguồn thông minh, công cụ này giúp đẩy nhanh tiến độ phát triển các dịch vụ Web API.

### 2.1.2. Docker & Docker Desktop
* **Giới thiệu:** Docker là nền tảng ảo hóa cho phép đóng gói ứng dụng và toàn bộ môi trường chạy phụ thuộc vào trong các thùng chứa (containers) gọn nhẹ. Docker Desktop cung cấp môi trường quản lý các container cục bộ trực quan trên hệ điều hành Windows.
* **Vai trò trong dự án:** Docker được sử dụng để đóng gói và cô lập các dịch vụ bao gồm Cơ sở dữ liệu SQL Server 2022 và ứng dụng API. Thông qua tệp `docker-compose.yml`, toàn bộ hệ thống (Database và API) được thiết lập kết nối tự động, giúp việc khởi chạy môi trường chạy thực tế (Production) diễn ra nhanh chóng, đồng bộ và nhất quán trên mọi máy tính của nhà phát triển hoặc máy chủ triển khai.

---

## 2.2. Công nghệ phát triển ứng dụng (Tech Stack thực tế)

### 2.2.1. C# và nền tảng .NET 9.0 (ASP.NET Core Web API)
* **Giới thiệu:** C# là ngôn ngữ lập trình hướng đối tượng mạnh mẽ, an toàn kiểu (type-safe). .NET 9.0 là phiên bản phát hành mới nhất của Microsoft, tối ưu hiệu năng biên dịch và quản lý bộ nhớ vượt trội. ASP.NET Core Web API là framework xây dựng các dịch vụ RESTful API tốc độ cao chạy trên nền .NET.
* **Vai trò trong dự án:** ASP.NET Core được sử dụng để phát triển máy chủ trung tâm (Backend API), cung cấp các RESTful Endpoints phục vụ việc đăng ký/đăng nhập tài khoản, quản lý các bộ thẻ (Decks), các thẻ từ vựng (Flashcards) và theo dõi lịch sử học tập.

### 2.2.2. Entity Framework Core (EF Core)
* **Giới thiệu:** Là một thư viện Object-Relational Mapper (ORM) mã nguồn mở và gọn nhẹ dành cho .NET. EF Core giúp lập trình viên thao tác với dữ liệu dưới dạng các đối tượng C# (Plain Old CLR Objects - POCO) thay vì phải viết các câu lệnh truy vấn SQL thủ công.
* **Vai trò trong dự án:** EF Core quản lý quá trình giao tiếp dữ liệu giữa Backend C# và cơ sở dữ liệu SQL Server. Dự án áp dụng phương pháp tiếp cận **Code-First**, trong đó các bảng cơ sở dữ liệu và mối quan hệ giữa chúng (Một - Nhiều giữa Decks và Cards, Nhiều - Nhiều giữa Người dùng và Tiến trình học) được ánh xạ trực tiếp từ lớp Entity. EF Core cũng tự động kiểm tra và khởi tạo cấu trúc bảng (`EnsureCreated`) cùng các cột dữ liệu cần thiết mỗi khi hệ thống khởi động.

### 2.2.3. Hệ quản trị cơ sở dữ liệu Microsoft SQL Server 2022 (Express Edition)
* **Giới thiệu:** Là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mạnh mẽ do Microsoft phát triển, nổi tiếng với khả năng bảo mật, đảm bảo tính toàn vẹn dữ liệu (chuẩn ACID) và tối ưu hóa hiệu năng truy vấn quan hệ.
* **Vai trò trong dự án:** SQL Server lưu trữ dữ liệu có cấu trúc của hệ thống, bao gồm thông tin người dùng, mật khẩu đã mã hóa, thông tin chi tiết của các bộ thẻ học, từ vựng tiếng Nhật (Kanji, Hiragana, nghĩa tiếng Việt, ví dụ minh họa) và dữ liệu trạng thái học tập để phục vụ thuật toán lặp lại ngắt quãng.

### 2.2.4. HTML5, CSS3 và Vanilla JavaScript (HTML5 Canvas & Web Speech API)
Ứng dụng sử dụng kiến trúc trang đơn (SPA) chạy trực tiếp bằng công nghệ Web thuần túy ở Frontend nhằm đạt tốc độ phản hồi nhanh nhất và giảm tải tài nguyên hệ thống.
* **HTML5 Canvas API:** Bảng vẽ canvas trong dự án được phát triển trực tiếp bằng thẻ `<canvas>` của HTML5 và xử lý đồ họa vector thông qua mã JavaScript. API này lắng nghe trực tiếp các sự kiện tương tác trỏ chuột (`mousedown`, `mousemove`, `mouseup`) và cảm ứng tay trên màn hình (`touchstart`, `touchmove`, `touchend`) để người học thực hiện vẽ/luyện viết chữ Kanji và Kana mượt mà trực tiếp trên thẻ nhớ mà không cần tải thêm bất kỳ thư viện vẽ đồ họa nặng nề nào khác.
* **Web Speech API (`SpeechSynthesis`):** Được tích hợp để cung cấp tính năng phát âm thanh (Text-to-Speech). Khi người dùng nhấn nút loa, trình duyệt sẽ tự động tổng hợp giọng đọc tiếng Nhật chuẩn (`ja-JP`) với tốc độ phát được điều chỉnh phù hợp (`rate: 0.85`), hỗ trợ người học ghi nhớ phát âm chuẩn xác song song với luyện viết.
* **SVG (Scalable Vector Graphics) & Bento Grid Layout:** Thiết kế giao diện theo phong cách hiện đại (Bento Grid) kết hợp đồ họa SVG động để vẽ biểu đồ tiến trình học tập (Donut Chart) và biểu đồ cột hiển thị lịch học (Bar Chart) trực tiếp trên trang Dashboard mà không cần dùng đến thư viện đồ thị cồng kềnh.
* **Vanilla JavaScript (ES6 Modules):** Tổ chức mã nguồn Frontend thành các module riêng biệt (`canvas.js`, `study.js`, `decks.js`, `tts.js`...) giúp hệ thống dễ bảo trì, tải tài nguyên theo nhu cầu và tối ưu hiệu suất thực thi trên trình duyệt.

### 2.2.5. Cơ chế bảo mật JWT (JSON Web Token) và BCrypt
* **Mã hóa mật khẩu với BCrypt:** Sử dụng thư viện `BCrypt.Net-Next` ở Backend để băm mật khẩu người dùng trước khi lưu trữ vào SQL Server. BCrypt tự động tạo chuỗi muối ngẫu nhiên (salt) giúp ngăn chặn hoàn toàn việc lộ mật khẩu ngay cả khi cơ sở dữ liệu bị rò rỉ.
* **Xác thực phi trạng thái (Stateless Authentication) với JWT:** Sau khi đăng nhập thành công, máy chủ cấp phát một chuỗi JWT đã được ký số bằng thuật toán bảo mật. Chuỗi mã này được lưu ở bộ nhớ trình duyệt phía Client và đính kèm vào tiêu đề `Authorization: Bearer <token>` trong mỗi yêu cầu gửi lên API để xác thực danh tính người dùng một cách an toàn và tối giản nhất.

---

## 2.3. Công cụ thiết kế giao diện và sơ đồ

### 2.3.1. Draw.io (diagrams.net)
* Draw.io là công cụ thiết kế biểu đồ chuyên nghiệp, trực quan trên nền tảng web. Nó được sử dụng để xây dựng các sơ đồ thiết kế hệ thống bao gồm: Sơ đồ ca sử dụng (Use Case Diagram), Sơ đồ thực thể quan hệ (ERD) và các sơ đồ tuần tự (Sequence Diagram) mô tả luồng giao tiếp dữ liệu giữa Frontend, API và Database.

### 2.3.2. Figma
* Figma là nền tảng thiết kế UI/UX cộng tác thời gian thực. Công cụ này được áp dụng để dựng khung bản vẽ (Wireframe) và thiết kế giao diện chi tiết cho ứng dụng (màn hình Dashboard học tập, màn hình học flashcard chia đôi với một bên là thẻ từ vựng và một bên là bảng vẽ canvas). Figma giúp định hình màu sắc, bố cục và khoảng cách hiển thị tối ưu trước khi chuyển sang giai đoạn lập trình giao diện.

---

## 2.4. Phương pháp và quy trình phát triển

### 2.4.1. Quy trình phát triển phần mềm Agile và mô hình Scrum
* Dự án áp dụng mô hình Scrum rút gọn của quy trình Agile để quản lý các bước thực hiện. Công việc được chia thành các vòng lặp phát triển ngắn (Sprint) từ 1 đến 2 tuần. Mỗi Sprint tập trung hoàn thành một nhóm tính năng độc lập (Ví dụ: Sprint 1 làm giao diện Canvas vẽ tay; Sprint 2 hoàn thiện API lưu trữ và thuật toán lặp lại ngắt quãng SuperMemo-2; Sprint 3 thực hiện tích hợp và kiểm thử liên kết). Phương pháp này giúp phát hiện lỗi sớm và điều chỉnh các tính năng tương tác viết tay kịp thời.

### 2.4.2. Hệ thống quản lý phiên bản Git và nền tảng GitHub
* **Git:** Sử dụng để quản lý các phiên bản mã nguồn, ghi nhận chi tiết lịch sử sửa đổi và hỗ trợ phân nhánh (branching) khi thực nghiệm các giải pháp vẽ trên Canvas hoặc thuật toán SRS mới mà không ảnh hưởng đến nhánh mã nguồn chính đang hoạt động ổn định.
* **GitHub:** Là máy chủ lưu trữ mã nguồn từ xa. Dự án sử dụng GitHub để sao lưu mã nguồn trực tuyến an toàn và quản lý công việc thông qua tính năng Issues để ghi lại danh sách các lỗi phát hiện và các yêu cầu cải tiến tính năng trong suốt quá trình xây dựng dự án.

---

## 2.5. Kết luận chương 2
Chương 2 đã làm rõ phương pháp tiếp cận kỹ thuật và định hình chính xác bộ công cụ phát triển thực tế của dự án. Với sự kết hợp đồng bộ giữa ngôn ngữ lập trình mạnh mẽ C# (.NET 9.0), hệ quản trị dữ liệu vững chắc SQL Server, cùng sự linh hoạt và mượt mà của công nghệ Web thuần phía Client (HTML5 Canvas API, Web Speech API), ứng dụng web học tiếng Nhật hoàn toàn đáp ứng được yêu cầu về mặt hiệu năng xử lý vẽ tay thời gian thực và trải nghiệm học tập liền mạch.

Các công cụ phụ trợ (Figma, Draw.io) cùng quy trình phát triển Agile và hệ thống quản lý mã nguồn Git/GitHub cung cấp nền tảng quản lý dự án khoa học. Đây là những cơ sở kỹ thuật cốt lõi để tác giả tiến hành phân tích chi tiết các yêu cầu chức năng và thiết kế cơ sở dữ liệu hệ thống trong Chương 3 tiếp theo.
