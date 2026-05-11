# Hướng Dẫn Thiết Lập Hybrid Cloud (Ubuntu + AWS)

Tài liệu này hướng dẫn chi tiết các bước thiết lập High Availability (HA) cho dự án JapanE_LEARNING sử dụng máy chủ nội bộ (Ubuntu) kết hợp với một máy chủ dự phòng (AWS EC2).

## Bước 1: Thiết lập Server AWS EC2

1. Đăng nhập vào AWS Console, tạo một instance EC2 (ví dụ: `t3.small` hoặc `t3.medium`).
2. Mở các port cần thiết trong Security Group (Port 22 cho SSH, Port 80, 443 nếu cần, tuy nhiên nếu dùng Cloudflare Tunnel thì chỉ cần mở Port 22 cho GitHub Actions SSH vào).
3. SSH vào EC2 và cài đặt Docker & Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu
   # Đăng xuất và đăng nhập lại (hoặc chạy lệnh: newgrp docker) để nhận quyền
   ```
4. Tạo thư mục chứa ứng dụng:
   ```bash
   mkdir -p ~/app/japane-learn-prod
   ```
5. Chỉ cần copy file `docker-compose.yml` và `.env` từ máy cá nhân của bạn lên server AWS EC2 vào thư mục `~/app/japane-learn-prod` (không cần mang source code lên vì GitHub Actions đã build thành image trên Docker Hub).

## Bước 2: Cấu hình GitHub Actions CI/CD

Pipeline CI/CD (`.github/workflows/deploy.yml`) đã được cập nhật để deploy code lên cả Ubuntu và AWS. Bạn cần thêm các Secret keys sau vào phần **Settings > Secrets and variables > Actions** trên kho lưu trữ GitHub của bạn:

- `AWS_HOST`: Địa chỉ Public IP của EC2.
- `AWS_USERNAME`: User đăng nhập (thường là `ubuntu`).
- `AWS_SSH_KEY`: Nội dung file khóa riêng tư `.pem` bạn tải về khi tạo EC2.

## Bước 3: Thiết lập Cân bằng tải bằng Cloudflare Tunnel (High Availability)

Thay vì trỏ trực tiếp DNS, hãy sử dụng Cloudflare Tunnel để định tuyến và load balancing:

1. Vào [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Chọn **Networks > Tunnels** và tạo một Tunnel mới (Ví dụ: `JapanELearn-HA`).
3. Cài đặt Cloudflared trên cả **Ubuntu server** và **AWS EC2 server** bằng lệnh cài đặt mà Cloudflare cung cấp (thường là `cloudflared service install <TOKEN>`).
4. Trong phần **Public Hostname** của Tunnel:
   - Thêm hostname của bạn: `api.gitplatform.io.vn`
   - Trỏ Service URL về `http://localhost:5000` (port mà API đang chạy trên docker).
5. **Trường hợp muốn dùng Active-Passive (Chỉ dùng AWS khi Ubuntu sập):**
   Bạn không được gộp 2 máy vào chung 1 Tunnel, mà phải tách ra làm 2 Tunnel và dùng tính năng **Cloudflare Load Balancer** (có phí $5/tháng) như hướng dẫn bên dưới.

### 3.1. Thiết lập Load Balancer (Active-Passive Tự Động)
Nếu bạn đã nâng cấp dịch vụ Load Balancer trên Cloudflare, hãy thực hiện theo các bước sau để máy chủ AWS chỉ chạy khi Ubuntu sập:

1. **Tạo 2 Tunnels riêng biệt:** 
   - Tunnel 1: Tên `Tunnel-Ubuntu` -> Cài connector lên máy Ubuntu. Thêm Public Hostname là `primary.gitplatform.io.vn` trỏ về `localhost:5000`.
   - Tunnel 2: Tên `Tunnel-AWS` -> Cài connector lên máy AWS EC2. Thêm Public Hostname là `backup.gitplatform.io.vn` trỏ về `localhost:5000`.
2. **Cấu hình Origin Pools (Nhóm máy chủ):**
   - Vào trang quản trị Cloudflare (màu xanh dương) > Tên miền của bạn > Mục **Traffic** > **Load Balancing**.
   - Tạo **Pool 1** (Tên: `Primary-Pool`): Thêm Origin Address là `primary.gitplatform.io.vn`.
   - Tạo **Pool 2** (Tên: `Backup-Pool`): Thêm Origin Address là `backup.gitplatform.io.vn`.
3. **Cấu hình Health Checks (Trạm gác):**
   - Tạo một Health Check kiểm tra giao thức `HTTP` qua cổng `80` (hoặc `HTTPS`/`443`) theo đường dẫn `/`. Cloudflare sẽ liên tục chọc vào web của bạn mỗi 60 giây để xem nó còn sống không.
4. **Tạo Load Balancer:**
   - Hostname: `api.gitplatform.io.vn` (Tên miền chính thức khách hàng dùng).
   - Chọn cả 2 Pools bạn vừa tạo.
   - Chỉnh **Traffic Steering** (Điều hướng giao thông) thành **Off** hoặc **Failover**.
   - Đặt `Primary-Pool` làm Default (Ưu tiên 1) và `Backup-Pool` làm Fallback.

👉 **Hoạt động:** Khách hàng gõ `api.gitplatform.io.vn`, Load Balancer sẽ ném toàn bộ về `primary` (Ubuntu). Nếu Health Check phát hiện Ubuntu chết, nó lập tức ném toàn bộ qua `backup` (AWS).
## Bước 4: Xử lý Đồng bộ Database bằng AWS RDS (Đã Chọn)

Kiến trúc đã được thống nhất: **Sử dụng Centralized Database trên AWS RDS**. 

1. **Khởi tạo RDS trên AWS Console:**
   - Vào mục **RDS > Create Database**.
   - Chọn **Microsoft SQL Server > SQL Server Express Edition**.
   - Mục Templates: Chọn **Free Tier** (nếu tài khoản mới) hoặc **Dev/Test**.
   - Cấu hình thông tin đăng nhập: Master username (vd: `admin`) và password (vd: `YourRdsPassword123!`).
   - Cấu hình mạng (Connectivity): Bật **Public access = Yes** (Để server Ubuntu ở nhà có thể kết nối được).
   - Chọn Security Group mặc định hoặc tạo mới. Đảm bảo Security Group này **mở Port 1433** cho tất cả các IP (0.0.0.0/0) hoặc giới hạn IP của nhà bạn để bảo mật.
2. **Cập nhật chuỗi kết nối (Connection String):**
   - Sau khi tạo xong, RDS sẽ cấp cho bạn một **Endpoint** (Ví dụ: `database-1.cxxx.ap-southeast-1.rds.amazonaws.com`).
   - Mở file `.env` trên máy cá nhân của bạn, sửa biến `DB_CONNECTION_STRING`:
     `DB_CONNECTION_STRING=Server=<ENDPOINT_CỦA_BẠN>,1433;Database=JapaneseFlashcardDb;User Id=admin;Password=<MẬT_KHẨU_RDS>;TrustServerCertificate=True;`
3. **Đồng bộ hóa lên 2 Servers:**
   - Việc loại bỏ container `db` đã được cập nhật sẵn trong file `docker-compose.yml`.
   - Copy file `docker-compose.yml` và `.env` mới nhất lên server Ubuntu và AWS EC2.
   - Chạy lệnh `docker-compose down && docker-compose up -d` trên cả hai server để khởi động lại API với cấu hình RDS.
4. **Migrate Dữ liệu:**
   - Máy chủ API của bạn (chạy C# Entity Framework) sẽ tự động chạy Migrations và tạo các bảng cấu trúc mới trên cái RDS Database này trong lần khởi động đầu tiên (tùy thuộc vào code `Program.cs` của bạn).
   - Nếu bạn có dữ liệu cũ ở Ubuntu, bạn có thể dùng tính năng Export/Import (BACPAC) của SQL Server Management Studio (SSMS) để đẩy từ localhost lên AWS RDS.
