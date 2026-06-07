# CHƯƠNG 5. THIẾT KẾ HỆ THỐNG VÀ CƠ SỞ DỮ LIỆU (PHẦN 2)

---

## 5.3. Cài đặt chương trình và thực thi thuật toán cốt lõi

Phần này mô tả chi tiết việc triển khai hai giải pháp kỹ thuật cốt lõi quyết định tính năng thông minh và tính tương tác của ứng dụng **JapanE**: thuật toán lặp lại ngắt quãng SM-2 phía Backend và bảng vẽ Canvas luyện viết tay phía Frontend.

### 5.3.1. Triển khai thuật toán Spaced Repetition SuperMemo-2 (SM-2) bằng C#

Hệ thống Backend của JapanE triển khai thuật toán lặp lại ngắt quãng SuperMemo-2 (SM-2) để tối ưu hóa tần suất ôn tập từ vựng cho từng học viên. 

#### 1. Nguyên lý hoạt động của thuật toán
Sau mỗi lượt ôn tập một thẻ từ vựng, học viên sẽ tự đánh giá độ nhớ của mình theo thang điểm từ 1 đến 4. Hệ thống sẽ ánh xạ điểm này sang thang điểm chất lượng phản hồi $q$ (Quality) trong thuật toán gốc từ 0 đến 5 như sau:
* **Mức 1 (Forgot):** $q = 0$ (Quên hoàn toàn từ vựng).
* **Mức 2 (Hard):** $q = 2$ (Nhớ mang máng nhưng viết sai nét hoặc trễ).
* **Mức 3 (Good):** $q = 4$ (Trả lời đúng sau khi có một chút do dự).
* **Mức 4 (Easy):** $q = 5$ (Nhớ ngay lập tức và viết trôi chảy).

Dựa trên điểm chất lượng $q$, thuật toán tiến hành tính toán lại hai chỉ số chính của thẻ học:
1. **Hệ số độ nhớ EaseFactor (EF):** Quyết định tốc độ giãn cách giữa các chu kỳ ôn tập. Công thức tính:
$$EF' = EF + (0.1 - (4 - q) \times (0.08 + (4 - q) \times 0.02))$$
Hệ số EaseFactor sau khi tính được giới hạn tối thiểu là $1.3$ (đảm bảo theo đặc tả của thuật toán gốc để chu kỳ ôn tập không bị dừng lại quá lâu).
2. **Khoảng giãn cách ôn tập tiếp theo (Interval - tính theo ngày):**
   * Nếu người học chọn **Forgot (rating = 1)**: Số lần lặp lại đúng liên tiếp (Repetitions) đặt lại bằng $0$, chu kỳ Interval đặt bằng $1$ ngày để ôn tập ngay ngày hôm sau.
   * Nếu người học chọn **Hard (rating = 2)**: Giữ nguyên khoảng Interval hiện tại để kiểm tra lại năng lực viết trước khi thay đổi, đồng thời cộng dồn số lần lặp lại.
   * Nếu người học chọn **Good (rating = 3)** hoặc **Easy (rating = 4)**: Số lần lặp lại tăng lên 1 đơn vị, khoảng Interval mới được tính dựa trên số lần lặp:
     * Lần lặp 1: $Interval = 1$ ngày.
     * Lần lặp 2: $Interval = 6$ ngày.
     * Lần lặp từ 3 trở đi: $Interval = Round(Interval_{cũ} \times EF')$.

#### 2. Mã nguồn triển khai thực tế (`SrsService.cs`)
```csharp
using JapaneseFlashcardAPI.Application.Interfaces;
using JapaneseFlashcardAPI.Domain.Entities;

namespace JapaneseFlashcardAPI.Application.Services;

public class SrsService : ISrsService
{
    // Ánh xạ điểm đánh giá 1-4 sang điểm chất lượng gốc SM-2 (0-5)
    private static readonly Dictionary<int, double> QualityMap = new()
    {
        { 1, 0 }, // Forgot  → Quên hoàn toàn
        { 2, 2 }, // Hard    → Trả lời đúng nhưng rất khó khăn
        { 3, 4 }, // Good    → Trả lời đúng sau một khoảng do dự
        { 4, 5 }, // Easy    → Trả lời hoàn hảo ngay tức thì
    };

    private const double MinEaseFactor = 1.3;

    public void ApplyReview(Flashcard card, int rating)
    {
        if (rating < 1 || rating > 4)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 4.");

        double q = QualityMap[rating];
        double ef = (double)card.EaseFactor;

        // 1. Cập nhật hệ số EaseFactor
        ef = ef + (0.1 - (4 - q) * (0.08 + (4 - q) * 0.02));
        ef = Math.Max(ef, MinEaseFactor); // Đảm bảo EF không nhỏ hơn 1.3

        // 2. Cập nhật số lần lặp lại (Repetitions) và khoảng giãn cách (Interval)
        if (rating == 1)
        {
            // Reset số lần lặp lại liên tục về 0 và đặt lịch ôn tập lại sau 1 ngày
            card.Repetitions = 0;
            card.Interval = 1;
        }
        else if (rating == 2)
        {
            // Trả lời Hard: Tăng số lần lặp nhưng giữ nguyên chu kỳ ôn tập hiện tại
            card.Repetitions++;
        }
        else
        {
            // Trả lời Good hoặc Easy: Tăng chu kỳ ôn tập theo hệ số EF
            card.Repetitions++;
            card.Interval = card.Repetitions switch
            {
                1 => 1,
                2 => 6,
                _ => (int)Math.Round(card.Interval * ef, MidpointRounding.AwayFromZero)
            };
        }

        // 3. Cập nhật và lưu các chỉ số thực thể
        card.EaseFactor = (decimal)Math.Round(ef, 2);
        card.NextReviewDate = DateTime.UtcNow.AddDays(card.Interval);
    }
}
```

---

### 5.3.2. Cài đặt bảng vẽ Canvas và bắt sự kiện vẽ tay bằng Vanilla JavaScript

Bảng vẽ (Canvas) ở Frontend được lập trình thuần bằng mã HTML5 Canvas API giúp đạt hiệu năng vẽ mượt mà nhất mà không cần cài đặt các thư viện đồ họa ngoài.

#### 1. Cơ chế vẽ nét chữ và bắt tọa độ vẽ
Để vẽ trên màn hình, ứng dụng lắng nghe hai nhóm sự kiện: sự kiện chuột (chuột trái nhấn giữ) và sự kiện cảm ứng (tay trượt trên màn hình thiết bị di động/máy tính bảng). Khi người dùng nhấn xuống, hệ thống ghi nhận trạng thái vẽ (`state.canvas.drawing = true`) và khởi tạo đường vẽ mới (`beginPath`). Khi di chuyển, hệ thống liên tục lấy tọa độ điểm vẽ (`offsetX`, `offsetY`) vẽ đường thẳng (`lineTo`, `stroke`) nối các điểm lại và di chuyển con trỏ vẽ tới tọa độ mới.

Đặc biệt, để khắc phục hiện tượng trang bị trượt dọc (scrolling) khi người học vuốt ngón tay luyện viết trên các màn hình điện thoại, hệ thống thiết lập cơ chế ngăn chặn hành vi mặc định của trình duyệt bằng hàm `e.preventDefault()` với thuộc tính `{ passive: false }` trong sự kiện Touch.

#### 2. Mã nguồn triển khai bảng vẽ (`canvas.js`)
```javascript
import { state } from './state.js';

export function initCanvas() {
  const canvas = document.getElementById('draw-canvas');
  if (!canvas) return;

  // Tự động điều chỉnh kích thước Canvas theo thẻ div bao ngoài
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    const img = canvas.width > 0 ? canvas.toDataURL() : null; // Lưu nét vẽ hiện tại trước khi resize
    canvas.width = rect.width || 400;
    canvas.height = rect.height || 300;
    // Khôi phục nét vẽ sau khi resize để tránh mất dữ liệu vẽ dở
    if (img) { 
      const i = new Image(); 
      i.onload = () => getCtx()?.drawImage(i, 0, 0); 
      i.src = img; 
    }
  }

  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(canvas.parentElement);

  // Sự kiện tương tác chuột trên PC
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Sự kiện tương tác cảm ứng bằng ngón tay / bút viết trên Mobile/Tablet
  canvas.addEventListener('touchstart', e => { 
    e.preventDefault(); // Ngăn chặn cuộn trang web khi đang vẽ nét chữ
    startDrawing(touchToMouse(e, canvas)); 
  }, { passive: false });
  
  canvas.addEventListener('touchmove', e => { 
    e.preventDefault(); 
    draw(touchToMouse(e, canvas)); 
  }, { passive: false });
  
  canvas.addEventListener('touchend', stopDrawing);
}

// Chuyển đổi tọa độ cảm ứng chạm sang hệ tọa độ Canvas
export function touchToMouse(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  return { 
    offsetX: touch.clientX - rect.left, 
    offsetY: touch.clientY - rect.top 
  };
}

export function getCtx() {
  return document.getElementById('draw-canvas')?.getContext('2d');
}

export function startDrawing(e) {
  state.canvas.drawing = true;
  const ctx = getCtx();
  if (!ctx) return;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

export function draw(e) {
  if (!state.canvas.drawing) return;
  const ctx = getCtx();
  const size = parseInt(document.getElementById('pen-size')?.value || 4);
  if (!ctx) return;

  ctx.lineWidth = state.canvas.tool === 'eraser' ? size * 4 : size; // Tẩy có kích thước to gấp 4 lần bút
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (state.canvas.tool === 'eraser') {
    // Chế độ tẩy: Xóa màu nét vẽ (Xóa đè nét đè)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    // Chế độ bút vẽ: Vẽ bình thường
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#1e293b'; // Màu xám đá phiến đậm
  }

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

export function stopDrawing() {
  state.canvas.drawing = false;
  const ctx = getCtx();
  if (ctx) { 
    ctx.globalCompositeOperation = 'source-over'; 
    ctx.beginPath(); 
  }
}

// Xóa sạch toàn bộ bảng Canvas
export function clearCanvas() {
  const canvas = document.getElementById('draw-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
```
