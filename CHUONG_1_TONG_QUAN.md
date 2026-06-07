# CHƯƠNG 1. TỔNG QUAN

## 1.1. Đặt vấn đề

### 1.1.1. Tính cấp thiết của đề tài
Trong thời đại số hóa và toàn cầu hóa ngày nay, việc học ngoại ngữ, đặc biệt là tiếng Nhật, đã trở thành một nhu cầu vô cùng phổ biến tại Việt Nam và trên thế giới. Tiếng Nhật không chỉ là một công cụ hỗ trợ công việc và học tập, mà còn mở ra cơ hội tiếp cận nền văn hóa, khoa học kỹ thuật tiên tiến. Tuy nhiên, tiếng Nhật là một trong những ngôn ngữ khó học nhất đối với người nước ngoài do hệ thống chữ viết phức tạp gồm ba bộ chữ chính: Hiragana, Katakana và Kanji (chữ Hán). Để làm chủ ngôn ngữ này, người học cần phải ghi nhớ một lượng lớn từ vựng và mặt chữ, đòi hỏi sự kiên trì luyện tập thường xuyên.

Phương pháp học qua thẻ ghi nhớ (Flashcard) kết hợp với kỹ thuật lặp lại ngắt quãng (Spaced Repetition System - SRS) đã được chứng minh là một trong những giải pháp hiệu quả nhất để ghi nhớ từ vựng dài hạn. Sự xuất hiện của các nền tảng học từ vựng trực tuyến như Anki, Quizlet, hay Memrise đã giúp người học dễ dàng tiếp cận và quản lý quá trình học tập của mình mọi lúc, mọi nơi.

Tuy nhiên, đối với các ngôn ngữ tượng hình và có độ phức tạp cao về nét viết như tiếng Nhật, việc chỉ nhìn mặt chữ (nhận diện thụ động) hoặc gõ chữ bằng bàn phím là chưa đủ. Luyện viết là một bước vô cùng quan trọng giúp kích thích trí nhớ cơ học (muscle memory) và ghi nhớ sâu cấu trúc chữ Kanji. Hiện nay, hầu hết các trang web flashcard phổ biến đều thiếu tính năng bảng vẽ (canvas) cho phép viết tay trực tiếp trên giao diện học. Người học thường phải chuẩn bị thêm giấy bút bên ngoài hoặc mở một ứng dụng vẽ song song, gây gián đoạn quá trình tập trung và làm giảm trải nghiệm liền mạch. Do đó, việc xây dựng một hệ thống học flashcard thông minh tích hợp sẵn canvas luyện viết trực tiếp trên nền tảng web là vô cùng cần thiết và có tính thực tiễn cao.

### 1.1.2. Lý do chọn đề tài
Xuất phát từ thực tế học tập tiếng Nhật của bản thân và nhiều người học khác, việc thiếu một công cụ hỗ trợ luyện viết song song với quá trình ôn tập flashcard là một rào cản lớn. Các ứng dụng hiện nay hoặc chỉ tập trung vào flashcard thuần túy, hoặc chỉ tập trung vào luyện viết chữ cái cơ bản mà thiếu sự kết hợp đồng bộ. 

Việc lựa chọn đề tài này nhằm giải quyết hạn chế đó, tạo ra một không gian học tập tích hợp đa giác quan: nghe phát âm, nhìn mặt chữ, hiểu nghĩa và thực hành viết ngay trên cùng một màn hình. Hệ thống này không chỉ nâng cao hiệu quả ghi nhớ từ vựng mà còn tối ưu hóa thời gian học tập, mang lại trải nghiệm tương tác liền mạch, hiện đại và nâng cao sự hứng thú của người dùng đối với việc học tiếng Nhật.

---

## 1.2. Xác định đề tài

### 1.2.1. Mục tiêu của đề tài
Mục tiêu chính của đồ án là phát triển một ứng dụng web học tiếng Nhật qua flashcard có tích hợp canvas luyện viết cá nhân hóa, cụ thể như sau:
* **Xây dựng nền tảng học Flashcard:** Cho phép người dùng tạo, quản lý và sử dụng các bộ thẻ từ vựng (decks), học tập thông qua thuật toán lặp lại ngắt quãng (như SuperMemo-2) để tự động hóa tần suất ôn tập từ vựng dựa trên kết quả ghi nhớ của người học.
* **Phát triển tính năng Canvas luyện viết:** Tích hợp trực tiếp bảng vẽ tương tác (canvas) vào giao diện thẻ flashcard để người dùng có thể luyện viết ngay khi ôn tập. Cung cấp các công cụ vẽ, xóa (clear), hoàn tác (undo) nét vẽ và công cụ hiển thị mẫu chữ/thứ tự nét (stroke order) để người học tự đối chiếu và sửa lỗi nét viết.

### 1.2.2. Tên đề tài
Tên đầy đủ của đề tài là: **“XÂY DỰNG ỨNG DỤNG WEB HỌC TIẾNG NHẬT QUA PHƯƠNG PHÁP FLASHCARD TÍCH HỢP CANVAS LUYỆN VIẾT”**

### 1.2.3. Đối tượng nghiên cứu
Các đối tượng nghiên cứu chính của đồ án bao gồm:
* Phương pháp học tập lặp lại ngắt quãng (Spaced Repetition System - SRS) và thuật toán phân lịch ôn tập SuperMemo-2 (SM-2).
* Công nghệ vẽ đồ họa 2D trên nền tảng web sử dụng HTML5 Canvas API và việc bắt sự kiện Pointer/Touch Events.
* Cấu trúc dữ liệu bài học: Thông tin từ vựng tiếng Nhật bao gồm chữ Kanji, chữ Kana (Hiragana/Katakana), Romaji, nghĩa tiếng Việt, âm thanh phát âm và hình ảnh hướng dẫn nét viết (Stroke Order).

### 1.2.4. Phạm vi đề tài
Đề tài tập trung vào việc thiết kế và xây dựng một nền tảng web học tập từ vựng tiếng Nhật thông minh với các giới hạn cụ thể:
* **Về mặt ứng dụng:**
  * Xây dựng phân hệ người dùng (Learner): Cho phép đăng nhập, quản lý bộ thẻ cá nhân, học tập qua flashcard kết hợp canvas vẽ tay trực tiếp và xem biểu đồ tiến trình ôn tập.
  * Xây dựng phân hệ quản trị (Admin): Hỗ trợ import/export dữ liệu từ vựng bằng file văn bản/excel, quản lý cấu trúc thẻ học, giám sát tài khoản và dữ liệu hệ thống.
* **Về mặt dữ liệu:** Giới hạn nội dung học tập tập trung chủ yếu vào nhóm từ vựng tiếng Nhật cơ bản và trung cấp (JLPT N5 đến N3), lấy nguồn dữ liệu từ vựng chuẩn hóa kết hợp file mẫu nét viết và âm thanh.
* **Về mặt công nghệ:**
  * Phía Client: Ứng dụng chạy trên trình duyệt web sử dụng HTML, CSS và JavaScript thuần để tối ưu hóa hiệu năng xử lý nét vẽ trực tiếp trên màn hình.
  * Phía Server: Xây dựng RESTful API sử dụng ASP.NET Core để quản lý cơ sở dữ liệu người dùng, lưu trữ tiến trình học và tính toán thời gian ôn tập của thuật toán lặp lại ngắt quãng.

---

## 1.3. Kết luận chương 1
Trong chương này, tác giả đã trình bày tổng quan về đề tài xây dựng ứng dụng web học tiếng Nhật, bao gồm bối cảnh ra đời, lý do chọn đề tài xuất phát từ trải nghiệm thực tế cá nhân, mục tiêu thực hiện và phạm vi nghiên cứu. Qua việc phân tích thực trạng các công cụ học tập hiện nay, tác giả nhận thấy việc tích hợp tính năng canvas viết tay trực tiếp trên giao diện ôn tập flashcard là thực sự cần thiết, giải quyết triệt để nhu cầu luyện viết tiếng Nhật mà không bị ngắt quãng trải nghiệm.

Tác giả cũng đã nêu rõ mục tiêu chính của đồ án là xây dựng một nền tảng web học tập có giao diện hiện đại, thân thiện, cung cấp đầy đủ các chức năng cơ bản như quản lý bộ thẻ học, luyện phát âm, ôn tập theo chu kỳ thông minh cùng bảng vẽ canvas tương tác. Bên cạnh đó, phạm vi đề tài cũng được khoanh vùng rõ ràng nhằm đảm bảo tính khả thi cao trong thời gian triển khai thực hiện.

Kết thúc chương này, tác giả đã định hình được cái nhìn tổng thể về đề tài, làm cơ sở khoa học và định hướng cụ thể cho các chương tiếp theo như khảo sát - phân tích yêu cầu hệ thống, thiết kế cơ sở dữ liệu và giao diện, lựa chọn công nghệ chi tiết và đánh giá kết quả triển khai ứng dụng.
