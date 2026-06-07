# CHƯƠNG 3. KHẢO SÁT VÀ PHÂN TÍCH (PHẦN 3)

---

## 3.4. Sơ đồ tuần tự (Sequence Diagram)

Sơ đồ tuần tự mô tả chi tiết sự tương tác theo trình tự thời gian giữa các thành phần trong hệ thống (Người dùng, Frontend Client, Backend API, Database) đối với các chức năng cốt lõi.

### 3.4.1. Chức năng Đăng nhập hệ thống

Quy trình xác thực người dùng và cấp phát mã bảo mật JWT:

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Người học
    participant Client as Frontend (Trình duyệt)
    participant API as Backend API (ASP.NET Core)
    participant DB as Cơ sở dữ liệu (SQL Server)

    Learner->>Client: Nhập Email, Mật khẩu và nhấn "Sign In"
    activate Client
    Client->>API: Gửi yêu cầu POST /api/auth/login (Email, Password)
    activate API
    API->>DB: Truy vấn thông tin người dùng theo Email
    activate DB
    DB-->>API: Trả về bản ghi người dùng (chứa mật khẩu đã băm)
    deactivate DB
    
    Note over API: Sử dụng BCrypt để so sánh mật khẩu nhập vào<br/>với mật khẩu đã băm trong cơ sở dữ liệu
    
    ALT Mật khẩu khớp
        Note over API: Khởi tạo Payload và ký số mã JWT Token<br/>với thời hạn hết hạn 24 giờ
        API-->>Client: Phản hồi Status 200 (Trả về JWT Token & thông tin cá nhân)
        Client->>Client: Lưu JWT Token vào LocalStorage / Memory
        Client->>Client: Chuyển hướng giao diện vào trang Dashboard
        Client-->>Learner: Hiển thị trang Dashboard cá nhân
    ELSE Mật khẩu hoặc Email sai
        API-->>Client: Phản hồi Status 401 Unauthorized (Lỗi xác thực)
        deactivate API
        Client-->>Learner: Hiển thị thông báo lỗi lên màn hình đăng nhập
    end
    deactivate Client
```

---

### 3.4.2. Chức năng Ôn tập Flashcard và cập nhật lịch sử lặp lại ngắt quãng (SRS)

Quy trình truy xuất thẻ đến hạn ôn tập, tương tác bảng vẽ Canvas và cập nhật thông số tính toán SM-2:

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Người học
    participant Client as Frontend (Trình duyệt)
    participant API as Backend API (ASP.NET Core)
    participant DB as Cơ sở dữ liệu (SQL Server)

    Learner->>Client: Chọn bộ thẻ và nhấn "Practice (SRS)"
    activate Client
    Client->>API: Gửi yêu cầu GET /api/decks/{id}/due-cards (Header Bearer JWT)
    activate API
    API->>API: Xác thực JWT từ Header
    API->>DB: Truy vấn các thẻ có trạng thái Due Date <= Hôm nay
    activate DB
    DB-->>API: Trả về danh sách thẻ cần ôn tập
    deactivate DB
    API-->>Client: Phản hồi danh sách thẻ (định dạng JSON)
    deactivate API
    Client->>Client: Hiển thị giao diện ôn tập và tải thẻ đầu tiên
    Client-->>Learner: Hiển thị nghĩa tiếng Việt (mặt trước) & Bảng vẽ Canvas trống
    deactivate Client

    %% Luyện viết nét chữ
    Learner->>Client: Vẽ nét chữ Kanji bằng ngón tay/chuột lên Canvas
    activate Client
    Client->>Client: Bắt sự kiện PointerEvents, vẽ nét vẽ lên thẻ Canvas thời gian thực
    Client-->>Learner: Hiển thị nét vẽ của người dùng trên bảng vẽ
    deactivate Client

    %% Phát âm
    Learner->>Client: Nhấn nút phát loa âm thanh
    activate Client
    Client->>Client: Gọi Web Speech API (speechSynthesis) phát âm ja-JP
    Client-->>Learner: Trình duyệt phát ra giọng đọc tiếng Nhật của từ
    deactivate Client

    %% Lật thẻ
    Learner->>Client: Nhấn vào Flashcard để lật thẻ
    activate Client
    Client->>Client: Ẩn mặt trước, hiển thị mặt sau (Chữ Kanji chuẩn)
    Client-->>Learner: Hiển thị từ Kanji mẫu để đối chiếu với Canvas nét vẽ
    deactivate Client

    %% Đánh giá SRS
    Learner->>Client: Nhấn nút chọn điểm đánh giá (Ví dụ: Good - 3)
    activate Client
    Client->>API: Gửi POST /api/cards/{id}/rate (Độ nhớ = 3, Header Bearer JWT)
    activate API
    API->>API: Thực thi logic thuật toán lặp lại ngắt quãng SM-2:<br/>- Cập nhật Easiness Factor (EF)<br/>- Tính toán Interval tiếp theo<br/>- Tăng số lần lặp lại liên tục (Repetitions)
    API->>DB: Cập nhật thông số SM-2 và ngày Due Date mới của thẻ vào bảng Flashcards
    activate DB
    DB-->>API: Phản hồi lưu thành công
    deactivate DB
    API-->>Client: Trả về trạng thái cập nhật thành công (Status 200)
    deactivate API
    Client->>Client: Xóa sạch nét vẽ trên Canvas cũ
    Client->>Client: Tải thẻ tiếp theo từ hàng đợi ôn tập
    Client-->>Learner: Hiển thị thẻ mới tiếp theo
    deactivate Client
```

---

## 3.5. Kết luận chương 3

Trong Chương 3, tác giả đã trình bày chi tiết quá trình khảo sát và phân tích hệ thống. Thông qua việc phân tích ưu và nhược điểm của các ứng dụng học tiếng Nhật hàng đầu hiện nay như Anki, Quizlet và Mazii, tác giả đã xác định rõ bài toán thực tiễn cần giải quyết: tích hợp một bảng vẽ Canvas hỗ trợ viết tay trực tiếp song song với quy trình ôn tập flashcard lặp lại ngắt quãng (SRS).

Từ nghiên cứu thực trạng, chương này đã đặc tả đầy đủ các yêu cầu chức năng (các phân hệ dành cho Người học và Quản trị viên, các tính năng cốt lõi như Canvas vẽ tay, phát âm TTS, nhập dữ liệu từ vựng hàng loạt, xem thống kê tiến trình học) cùng các yêu cầu phi chức năng về mặt hiệu năng độ trễ dưới 16ms của nét vẽ Canvas, tính tương thích đa thiết bị (Responsive) và an toàn bảo mật (JWT & BCrypt).

Cuối cùng, các sơ đồ ca sử dụng (Use Case) và sơ đồ tuần tự (Sequence Diagram) đã mô tả trực quan cấu trúc tương tác và dòng dữ liệu chạy thực tế giữa Frontend Client, ASP.NET Core API và cơ sở dữ liệu SQL Server. Kết quả phân tích chi tiết của chương này sẽ là kim chỉ nam trực tiếp để tác giả triển khai Chương 4: Thiết kế hệ thống và thiết kế cơ sở dữ liệu vật lý tiếp theo của đồ án.
