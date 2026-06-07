# CHƯƠNG 3. KHẢO SÁT VÀ PHÂN TÍCH (PHẦN 2)

---

## 3.3. Phân tích ca sử dụng (Use Case Analysis)

Phân tích ca sử dụng giúp xác định rõ các hành vi tương tác giữa người dùng (tác nhân) và hệ thống ứng dụng JapanE.

### 3.3.1. Xác định các tác nhân (Actors)

Hệ thống có hai tác nhân chính:
1. **Người học (Learner):** Tác nhân chính của hệ thống. Thực hiện các hoạt động đăng ký, đăng nhập tài khoản, tạo và quản lý các bộ thẻ ghi nhớ, nhập từ vựng hàng loạt, thực hiện ôn tập từ vựng bằng phương pháp flashcard kết hợp vẽ chữ trên canvas, xem biểu đồ tiến trình học tập.
2. **Quản trị viên (Admin):** Tác nhân quản trị. Quản trị hệ thống, quản lý cơ sở dữ liệu từ vựng dùng chung và giám sát danh sách người dùng.

---

### 3.3.2. Sơ đồ ca sử dụng tổng quát

Sơ đồ ca sử dụng mô tả tổng quan các chức năng mà người học và quản trị viên có thể tương tác với hệ thống.

```mermaid
usecaseDiagram
    direction LR
    actor Learner as "Người học (Learner)"
    actor Admin as "Quản trị viên (Admin)"

    Learner --> (Đăng ký tài khoản)
    Learner --> (Đăng nhập hệ thống)
    Learner --> (Quản lý bộ thẻ - Decks)
    Learner --> (Quản lý thẻ học - Cards)
    Learner --> (Nhập từ vựng hàng loạt - Bulk Import)
    Learner --> (Học tập & Ôn tập từ vựng)
    Learner --> (Xem thống kê tiến trình - Stats)

    (Học tập & Ôn tập từ vựng) ..> (Vẽ tay trên Canvas) : <<include>>
    (Học tập & Ôn tập từ vựng) ..> (Phát âm thanh - TTS) : <<include>>
    (Học tập & Ôn tập từ vựng) ..> (Đánh giá mức độ nhớ) : <<include>>

    Admin --> (Đăng nhập hệ thống)
    Admin --> (Quản lý người dùng)
    Admin --> (Quản lý kho từ vựng hệ thống)
```

---

### 3.3.3. Đặc tả chi tiết các ca sử dụng của hệ thống

Dưới đây là bảng đặc tả chi tiết cho toàn bộ các ca sử dụng quan trọng trong hệ thống học tập.

#### 1. Ca sử dụng: Học từ vựng kết hợp luyện viết trên Canvas

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Học từ vựng kết hợp luyện viết trên Canvas |
| **Tác nhân** | Người học (Learner) |
| **Mô tả ngắn** | Người học ôn tập từ vựng bằng thẻ flashcard, thực hiện luyện viết các nét chữ trên bảng vẽ canvas và lật thẻ để đối chiếu kết quả. |
| **Tiền điều kiện** | Người học đã đăng nhập vào hệ thống và đã chọn một bộ thẻ học còn thẻ cần ôn tập hoặc học mới. |
| **Hậu điều kiện** | Hệ thống ghi nhận trạng thái vẽ của người học và hiển thị giao diện đánh giá. |
| **Luồng sự kiện chính** | 1. Người học nhấn nút **"Study Now"** trên bộ thẻ.<br>2. Hệ thống hiển thị giao diện học chia đôi (Split Screen): bên trái là thông tin gợi ý của thẻ (Mặt trước: Nghĩa từ vựng, câu ví dụ minh họa), bên phải là bảng vẽ Canvas trống.<br>3. Người học dùng chuột/tay/bút cảm ứng vẽ nét chữ tương ứng lên bảng Canvas để tập viết từ vựng.<br>4. Hệ thống hiển thị nét vẽ của người dùng trên Canvas thời gian thực.<br>5. Người học nhấn nút **"Speak"** (Loa) nếu muốn nghe phát âm chuẩn của từ.<br>6. Người học nhấn vào thẻ flashcard để lật thẻ (Reveal).<br>7. Hệ thống ẩn mặt trước và hiển thị mặt sau của thẻ (Chữ Kanji, chữ Kana chuẩn, âm thanh phát âm) đồng thời giữ nguyên nét vẽ của người dùng trên Canvas để đối chiếu.<br>8. Hệ thống hiển thị thanh đánh giá độ nhớ (gồm 4 mức nút bấm). |
| **Luồng ngoại lệ / Sự kiện phụ** | * Tại bước 3, nếu người học vẽ sai, họ có thể nhấn nút **"Clear"** để xóa toàn bộ nét vẽ và viết lại từ đầu, hoặc nhấn **"Eraser"** để tẩy từng nét cụ thể.<br>* Người học có thể trượt thanh cỡ nét vẽ để điều chỉnh độ dày bút vẽ trên canvas phù hợp. |

---

#### 2. Ca sử dụng: Ôn tập từ vựng theo thuật toán lặp lại ngắt quãng (Practice SRS)

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Ôn tập từ vựng theo thuật toán lặp lại ngắt quãng (Practice SRS) |
| **Tác nhân** | Người học (Learner) |
| **Mô tả ngắn** | Người học đánh giá mức độ ghi nhớ của thẻ học để hệ thống tính toán và lên lịch ôn tập cho lần tiếp theo dựa trên thuật toán SM-2. |
| **Tiền điều kiện** | Người học đang ở giao diện học tập và vừa thực hiện lật mặt sau của thẻ nhớ. |
| **Hậu điều kiện** | Lịch ôn tập của thẻ được cập nhật trên máy chủ, hệ thống tự động chuyển sang thẻ học tiếp theo. |
| **Luồng sự kiện chính** | 1. Sau khi đối chiếu nét viết, người học lựa chọn đánh giá mức độ ghi nhớ bằng cách nhấn vào 1 trong 4 nút:<br>&nbsp;&nbsp;&nbsp;&nbsp;- **Forgot (1):** Quên hoàn toàn từ vựng.<br>&nbsp;&nbsp;&nbsp;&nbsp;- **Hard (2):** Nhớ mang máng, viết sai nét hoặc mất nhiều thời gian mới nhớ ra.<br>&nbsp;&nbsp;&nbsp;&nbsp;- **Good (3):** Nhớ từ vựng, viết đúng nét nhưng cần suy nghĩ.<br>&nbsp;&nbsp;&nbsp;&nbsp;- **Easy (4):** Nhớ ngay lập tức, viết trôi chảy không lỗi.<br>2. Hệ thống thu nhận điểm đánh giá của người học và gửi yêu cầu cập nhật lên Backend API.<br>3. Backend API nhận điểm đánh giá và tính toán các thông số học tập mới theo thuật toán SM-2 (bao gồm: Hệ số EF - Easiness Factor, khoảng thời gian lặp lại Interval, và số lần lặp lại liên tục Repetitions).<br>4. Hệ thống lưu kết quả cập nhật vào cơ sở dữ liệu SQL Server.<br>5. Frontend nhận phản hồi thành công từ API, tự động xóa Canvas cũ và chuyển sang thẻ tiếp theo trong hàng đợi ôn tập. |
| **Luồng ngoại lệ / Sự kiện phụ** | * Nếu kết nối mạng bị gián đoạn khi gửi điểm đánh giá, hệ thống hiển thị thông báo lỗi đồng bộ và yêu cầu người dùng thử lại hoặc tự động lưu tạm tiến trình để đồng bộ sau. |

---

#### 3. Ca sử dụng: Nhập dữ liệu từ vựng hàng loạt (Bulk Import)

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Nhập dữ liệu từ vựng hàng loạt (Bulk Import) |
| **Tác nhân** | Người học (Learner) |
| **Mô tả ngắn** | Người học nhập nhanh nhiều thẻ từ vựng vào bộ thẻ bằng cách tải lên file dữ liệu hoặc dán đoạn văn bản có cấu trúc chuẩn. |
| **Tiền điều kiện** | Người học đã chọn một bộ thẻ cụ thể và nhấn nút **"Import"**. |
| **Hậu điều kiện** | Các từ vựng hợp lệ được lưu vào cơ sở dữ liệu của bộ thẻ tương ứng. |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị hộp thoại Import (Modal Import).<br>2. Người học thực hiện dán văn bản có định dạng ngăn cách bằng phím Tab/dấu phẩy hoặc kéo thả một file `.csv` / `.tsv` / `.txt` vào vùng quy định.<br>3. Hệ thống tiến hành phân tích cú pháp (parsing) nội dung văn bản/file theo từng dòng.<br>4. Hệ thống hiển thị bảng xem trước (Preview Table) hiển thị danh sách từ vựng đã phân tách thành các cột: Kanji, Reading, Meaning, Example để người học kiểm tra trực quan.<br>5. Người học nhấn nút **"Import [X] Cards"** để xác nhận lưu.<br>6. Hệ thống gửi danh sách từ vựng hợp lệ lên Backend API dưới dạng mảng dữ liệu JSON.<br>7. Backend API lưu hàng loạt từ vựng vào SQL Server thông qua EF Core và phản hồi kết quả thành công.<br>8. Hệ thống hiển thị thông báo thành công và tự động tải lại danh sách thẻ của bộ thẻ. |
| **Luồng ngoại lệ / Sự kiện phụ** | * Tại bước 3, nếu dòng văn bản không đúng định dạng phân tách hoặc thiếu các trường bắt buộc (như Kanji hoặc Nghĩa), hệ thống bỏ qua dòng lỗi đó hoặc hiển thị cảnh báo dòng không hợp lệ trong bảng Preview.<br>* Tại bước 5, nếu không có từ vựng nào hợp lệ được tìm thấy, nút Import sẽ bị vô hiệu hóa (disabled). |

---

#### 4. Ca sử dụng: Đăng nhập hệ thống

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Đăng nhập hệ thống |
| **Tác nhân** | Người học (Learner), Quản trị viên (Admin) |
| **Mô tả ngắn** | Người dùng đăng nhập vào hệ thống để đồng bộ dữ liệu ôn tập và sử dụng các tính năng cá nhân hóa. |
| **Tiền điều kiện** | Người dùng đã đăng ký tài khoản hợp lệ trên hệ thống. |
| **Hậu điều kiện** | Hệ thống cấp mã xác thực JWT, chuyển hướng người dùng vào giao diện tương ứng (Dashboard hoặc trang Admin). |
| **Luồng sự kiện chính** | 1. Người dùng truy cập ứng dụng web, hệ thống hiển thị màn hình Auth đăng nhập.<br>2. Người dùng nhập Email và Mật khẩu cá nhân.<br>3. Người dùng nhấn nút **"Sign In"**.<br>4. Hệ thống gửi thông tin đăng nhập lên Backend API.<br>5. Backend so khớp mật khẩu đã băm (sử dụng BCrypt), tạo JWT Token có thời hạn và phản hồi thông tin đăng nhập thành công kèm token.<br>6. Client nhận kết quả, lưu token vào bộ nhớ và chuyển hướng vào Dashboard. |
| **Luồng ngoại lệ / Sự kiện phụ** | * Tại bước 5, nếu Email không tồn tại hoặc mật khẩu không khớp, Backend phản hồi lỗi 401 Unauthorized. Client hiển thị thông báo lỗi tương ứng lên giao diện để người dùng kiểm tra lại thông tin. |

---

#### 5. Ca sử dụng: Quản lý bộ thẻ (Decks)

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Quản lý bộ thẻ (Decks) |
| **Tác nhân** | Người học (Learner) |
| **Mô tả ngắn** | Người học thực hiện các thao tác tạo mới bộ thẻ, đổi tên hoặc xóa bộ thẻ cá nhân. |
| **Tiền điều kiện** | Người học đã đăng nhập vào hệ thống. |
| **Hậu điều kiện** | Cơ sở dữ liệu ghi nhận thay đổi và danh sách bộ thẻ hiển thị ở màn hình được cập nhật. |
| **Luồng sự kiện chính** | * **Tạo bộ thẻ:**<br>1. Người học nhấn **"+ New Deck"**.<br>2. Nhập tiêu đề bộ thẻ trên hộp thoại Modal và nhấn **"Create Deck"**.<br>3. Hệ thống gửi yêu cầu tạo bộ thẻ lên Backend, lưu vào DB và làm mới danh sách hiển thị.<br>* **Sửa tên bộ thẻ:**<br>1. Chọn bộ thẻ, nhấn **"Rename"**.<br>2. Nhập tên mới và nhấn **"Save"**.<br>3. Hệ thống gửi yêu cầu PUT cập nhật tên bộ thẻ lên API Backend và làm mới giao diện.<br>* **Xóa bộ thẻ:**<br>1. Chọn bộ thẻ cần xóa và nhấn **"Delete Deck"**.<br>2. Hệ thống hiển thị hộp thoại xác nhận xóa.<br>3. Người học nhấn **"Delete"**, hệ thống gửi yêu cầu DELETE lên API để xóa bộ thẻ cùng các thẻ liên quan trong DB. |
| **Luồng ngoại lệ / Sự kiện phụ** | * Tại bước tạo bộ thẻ, nếu tên bộ thẻ để trống hoặc vượt quá 200 ký tự, hệ thống hiển thị lỗi cảnh báo và ngăn chặn gửi yêu cầu. |

---

#### 6. Ca sử dụng: Quản lý thẻ học (Cards)

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Quản lý thẻ học (Cards) |
| **Tác nhân** | Người học (Learner) |
| **Mô tả ngắn** | Người học thêm mới thẻ từ vựng thủ công, sửa thông tin từ vựng hoặc xóa thẻ khỏi bộ thẻ hiện có. |
| **Tiền điều kiện** | Người học đã đăng nhập và chọn một bộ thẻ học cụ thể. |
| **Hậu điều kiện** | Cơ sở dữ liệu ghi nhận thông tin thẻ mới, thẻ sửa hoặc xóa. |
| **Luồng sự kiện chính** | * **Thêm thẻ mới:**<br>1. Người học nhấn **"+ Add Card"**.<br>2. Nhập các trường: Kanji, Reading, Meaning, Example và nhấn **"Add Card"**.<br>3. Hệ thống gửi yêu cầu POST lên API Backend để lưu thẻ mới vào DB.<br>* **Sửa thẻ:**<br>1. Nhấn nút **"Edit"** (Bút chì) tại dòng thẻ học trong bảng danh sách thẻ.<br>2. Hệ thống hiển thị Modal chứa thông tin thẻ hiện tại.<br>3. Học viên sửa nội dung và nhấn **"Save Changes"** để cập nhật qua API.<br>* **Xóa thẻ:**<br>1. Nhấn nút **"Delete"** (Thùng rác) tại dòng thẻ.<br>2. Xác nhận đồng ý xóa trên Modal, hệ thống gửi yêu cầu DELETE lên API xóa thẻ khỏi DB. |
| **Luồng ngoại lệ / Sự kiện phụ** | * Nếu từ vựng thêm mới bị thiếu trường bắt buộc (Kanji hoặc Meaning), hệ thống báo lỗi đỏ trên Modal và không gửi yêu cầu API. |

---

#### 7. Ca sử dụng: Xem thống kê tiến trình học tập (Stats)

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Xem thống kê tiến trình học tập (Stats) |
| **Tác nhân** | Người học (Learner) |
| **Mô tả ngắn** | Người học xem các số liệu trực quan về kết quả ôn tập, lịch học hàng ngày và mức độ chuyên cần để tự đánh giá hiệu quả học tập. |
| **Tiền điều kiện** | Người học đã đăng nhập hệ thống và đã thực hiện học tập để có dữ liệu lịch sử. |
| **Hậu điều kiện** | Hệ thống vẽ trực quan các biểu đồ tiến trình dạng đồ họa SVG lên màn hình. |
| **Luồng sự kiện chính** | 1. Người học nhấn vào mục **"Statistics"** trên thanh Sidebar.<br>2. Client gửi yêu cầu GET lên API Backend để lấy dữ liệu thống kê tổng hợp (tổng số thẻ học, streak ngày học liên tục, số lượng thẻ due, tỷ lệ ghi nhớ).<br>3. API tính toán các chỉ số từ lịch sử học trong DB và trả về dạng JSON.<br>4. Client tiếp nhận dữ liệu và vẽ các thành phần đồ thị lên màn hình:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Biểu đồ tròn Donut Chart SVG hiển thị tỷ lệ Mastered, Learning và New.<br>&nbsp;&nbsp;&nbsp;&nbsp;- Grid Heatmap thể hiện mật độ số thẻ ôn tập hàng ngày trong 12 tháng gần nhất.<br>&nbsp;&nbsp;&nbsp;&nbsp;- Bar Chart cột thể hiện số thẻ dự kiến ôn tập trong 7 ngày kế tiếp.<br>&nbsp;&nbsp;&nbsp;&nbsp;- Bảng lịch sử các phiên học gần đây (Recent Session History). |
| **Luồng ngoại lệ / Sự kiện phụ** | * Nếu người học là tài khoản hoàn toàn mới chưa có lịch sử học, các biểu đồ sẽ hiển thị trạng thái mặc định (0% hoặc trống kèm thông báo hướng dẫn bắt đầu học). |

---

#### 8. Ca sử dụng: Quản lý người dùng và kho từ vựng hệ thống

| Thành phần | Đặc tả chi tiết |
| :--- | :--- |
| **Tên ca sử dụng** | Quản lý người dùng và kho từ vựng hệ thống |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả ngắn** | Admin thực hiện quản lý tài khoản người dùng và quản lý kho dữ liệu từ vựng dùng chung. |
| **Tiền điều kiện** | Admin đăng nhập thành công bằng tài khoản có quyền quản trị (Role: Admin). |
| **Hậu điều kiện** | Dữ liệu quản trị được đồng bộ và lưu trữ trên hệ thống. |
| **Luồng sự kiện chính** | 1. Admin truy cập hệ thống và chuyển hướng vào trang quản lý Admin.<br>2. Admin chọn **Quản lý người dùng** để xem danh sách tài khoản học viên, thực hiện chặn/mở khóa tài khoản hoặc xem tổng quát hoạt động hệ thống.<br>3. Admin chọn **Quản lý từ vựng** để chỉnh sửa kho dữ liệu từ vựng JLPT dùng chung (thêm các thẻ mẫu, chỉnh sửa thông tin nét vẽ hoặc âm thanh bị lỗi).<br>4. Các thao tác cập nhật dữ liệu của Admin được hệ thống lưu trực tiếp vào cơ sở dữ liệu thông qua RESTful API. |
| **Luồng ngoại lệ / Sự kiện phụ** | * Nếu người dùng không có quyền Admin cố tình truy cập vào các URL quản trị, hệ thống phát hiện và tự động chặn truy cập, chuyển hướng về trang Dashboard kèm thông báo lỗi truy cập. |
