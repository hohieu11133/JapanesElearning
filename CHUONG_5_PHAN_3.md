# CHƯƠNG 5. THIẾT KẾ HỆ THỐNG VÀ CƠ SỞ DỮ LIỆU (PHẦN 3)

---

## 5.4. Cấu trúc thư mục của mã nguồn dự án

Mã nguồn dự án được phân chia rõ ràng thành hai phần độc lập: **JapaneseFlashcardAPI** (Backend C#) và **frontend** (Frontend Vanilla JS).

```text
JapanE_LEARN/
├── Dockerfile                      # Tài liệu đóng gói ứng dụng bằng Docker
├── docker-compose.yml              # Cấu hình khởi chạy Docker Compose (API & DB)
├── JapaneseFlashcardAPI/           # Thư mục mã nguồn Backend (ASP.NET Core)
│   ├── JapaneseFlashcardAPI.csproj # File quản lý thư viện dự án .NET
│   ├── Program.cs                  # File cấu hình khởi chạy hệ thống chính
│   ├── Domain/                     # Chứa các lớp thực thể (Entities)
│   │   └── Entities/
│   │       ├── User.cs             # Thực thể Người dùng
│   │       ├── Deck.cs             # Thực thể Bộ thẻ học
│   │       ├── Flashcard.cs        # Thực thể Thẻ từ vựng (chứa chỉ số SRS)
│   │       └── ReviewLog.cs        # Thực thể Nhật ký lượt ôn tập
│   ├── Application/                # Chứa logic nghiệp vụ và các interface
│   │   ├── Interfaces/
│   │   └── Services/
│   │       └── SrsService.cs       # Triển khai thực tế thuật toán SM-2
│   ├── Infrastructure/             # Quản lý giao tiếp cơ sở dữ liệu (DbContext)
│   │   └── Data/
│   │       └── AppDbContext.cs     # Cấu hình Entity Framework Core
│   └── Controllers/                # Định nghĩa các RESTful Endpoints
├── frontend/                       # Thư mục mã nguồn Frontend (Web SPA)
│   ├── index.html                  # File cấu trúc giao diện chính của ứng dụng
│   ├── style.css                   # File styles tổng hợp các biến CSS và layout
│   ├── css/                        # Thư mục lưu các file CSS thành phần
│   │   ├── variables.css           # Định nghĩa mã màu Slate/Emerald Tokens
│   │   ├── layout.css              # Định nghĩa layout Bento Grid & Split-view
│   │   └── views.css               # Định nghĩa styles cho từng màn hình
│   └── js/                         # Thư mục lưu mã nguồn JavaScript Modules
│       ├── main.js                 # Điều phối điều hướng SPA chính
│       ├── canvas.js               # Xử lý bảng vẽ tay Canvas vẽ chữ Kanji
│       ├── tts.js                  # Tích hợp phát giọng đọc qua Web Speech API
│       ├── study.js                # Quản lý logic học, lật thẻ và đánh giá
│       ├── decks.js                # Quản lý tạo mới, sửa, xóa, tìm kiếm bộ thẻ
│       ├── api.js                  # Định nghĩa các hàm fetch API Backend
│       └── state.js                # Quản lý trạng thái toàn cục của Frontend
```

---

## 5.5. Cấu hình đóng gói và triển khai hệ thống (Docker)

Để đảm bảo hệ thống có thể triển khai dễ dàng, độc lập và chạy đồng bộ trên mọi nền tảng máy chủ mà không cần cài đặt cục bộ SQL Server hay các phiên bản .NET cụ thể, dự án áp dụng công nghệ đóng gói Container bằng **Docker** và **Docker Compose**.

### 5.5.1. Cấu hình tệp tin Dockerfile (Đóng gói mã nguồn)
Tệp `Dockerfile` được xây dựng bằng cơ chế biên dịch nhiều bước (**Multi-stage Build**) nhằm giảm thiểu tối đa dung lượng tệp tin ảnh (Image) đầu ra khi chạy trên môi trường thực tế:
* **Stage 1:** Tải hình ảnh SDK .NET 9.0 để sao chép mã nguồn Backend, thực hiện khôi phục các thư viện NuGet (`dotnet restore`) và tiến hành biên dịch ứng dụng sang mã nhị phân tối ưu hóa cho Production (`dotnet publish`).
* **Stage 2:** Sử dụng hình ảnh Runtime của ASP.NET Core 9.0 (dung lượng rất nhẹ, loại bỏ các công cụ biên dịch không cần thiết). Bản build của Backend từ Stage 1 được sao chép sang.
* **Stage 3:** Sao chép các tệp tin tĩnh (static files) của thư mục `frontend` vào trong thư mục con `/app/frontend` để Backend ASP.NET Core phục vụ trực tiếp bằng phương thức `UseStaticFiles` mà không cần dựng thêm máy chủ web riêng như Nginx.
* **Stage 4:** Thiết lập các cổng kết nối (Port 8080) và biến môi trường (`ASPNETCORE_ENVIRONMENT=Production`) để chạy trực tiếp ứng dụng nhị phân.

```dockerfile
# ── Stage 1: Build API (.NET 9.0 SDK) ─────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file .csproj trước để restore thư viện và lưu vào cache của Docker
COPY JapaneseFlashcardAPI/JapaneseFlashcardAPI.csproj ./JapaneseFlashcardAPI/
RUN dotnet restore ./JapaneseFlashcardAPI/JapaneseFlashcardAPI.csproj

# Copy mã nguồn Backend còn lại và tiến hành publish ở cấu hình Release
COPY JapaneseFlashcardAPI/ ./JapaneseFlashcardAPI/
RUN dotnet publish ./JapaneseFlashcardAPI/JapaneseFlashcardAPI.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Stage 2: Runtime Environment (Dung lượng ảnh nhỏ gọn) ─────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy sản phẩm Backend sau khi compile từ bước build
COPY --from=build /app/publish .

# Copy các file tĩnh của thư mục frontend vào container để phục vụ web SPA
COPY frontend/ ./frontend/

# ── Thiết lập các biến môi trường cấu hình chạy ───────────────────────────────────
ENV ASPNETCORE_URLS=http://+:8080
ENV FRONTEND_PATH=/app/frontend
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "JapaneseFlashcardAPI.dll"]
```

---

### 5.5.2. Cấu hình khởi chạy hệ thống (Docker Compose)
Tệp `docker-compose.yml` định nghĩa hai dịch vụ chính chạy liên thông trong cùng một mạng nội bộ:
1. **Dịch vụ cơ sở dữ liệu (`db`):** Sử dụng ảnh chính thức từ Microsoft SQL Server 2022 (`mssql/server:2022-latest`). Cấu hình mật khẩu SA bảo mật thông qua biến môi trường của hệ thống và gắn kết đĩa ảo (`volumes`) để lưu trữ dữ liệu bền vững ngay cả khi container bị khởi động lại.
2. **Dịch vụ ứng dụng (`api`):** Được build trực tiếp từ Dockerfile trên. Dịch vụ này lắng nghe trên cổng `5000` của máy chủ và chuyển tiếp tới cổng `8080` của container. Biến môi trường cấu hình chuỗi kết nối (`ConnectionStrings:DefaultConnection`) trỏ thẳng tới dịch vụ `db` trong mạng nội bộ.

Để khắc phục hiện tượng lỗi kết nối do máy chủ API khởi chạy nhanh hơn dịch vụ cơ sở dữ liệu SQL Server (SQL Server cần khoảng 10-15 giây để cấu hình ban đầu), mã nguồn Backend tại `Program.cs` đã tích hợp cơ chế tự động thử lại kết nối tối đa 10 lần, mỗi lần cách nhau 5 giây (`maxRetries = 10`), đảm bảo hệ thống khởi chạy đồng bộ và an toàn 100% trong môi trường Docker.

```yaml
services:

  # ── SQL Server 2022 (Local DB Container) ────────────────────────────────────
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: japane-learn-db
    ports:
      - "1433:1433"
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "${DB_PASSWORD}"
      MSSQL_PID: "Express"
    volumes:
      - sqldata:/var/opt/mssql
    restart: unless-stopped

  # ── Web App API & Frontend Serving Container ────────────────────────────────
  api:
    image: kyhieu/japane-learn:latest
    build:
      context: .
      dockerfile: Dockerfile
    container_name: japane-learn-api
    ports:
      - "5000:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - FRONTEND_PATH=/app/frontend
      - "ConnectionStrings__DefaultConnection=Server=db,1433;Database=JapaneseFlashcardDb;User Id=sa;Password=${DB_PASSWORD};TrustServerCertificate=True;"
      - Jwt__Key=${JWT_KEY}
      - Jwt__Issuer=JapaneseFlashcardAPI
      - Jwt__Audience=JapaneseFlashcardClient
      - Jwt__ExpiresInHours=24
    depends_on:
      - db
    restart: on-failure:5

volumes:
  sqldata:
    driver: local
```

### 5.5.3. Quy trình triển khai hệ thống trên máy chủ Ubuntu Server
Để đưa ứng dụng **JapanE** vào vận hành thực tế trên môi trường sản xuất (Production), máy chủ được cấu hình chạy hệ điều hành **Ubuntu Server 22.04 LTS/24.04 LTS**. Quy trình triển khai cụ thể bao gồm các bước sau:

1. **Chuẩn bị và cài đặt Docker:**
   Hệ thống yêu cầu cài đặt Docker Engine và Docker Compose để quản lý và vận hành các container.
   ```bash
   # Cập nhật danh sách gói phần mềm
   sudo apt update && sudo apt upgrade -y

   # Cài đặt các thư viện cần thiết
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

   # Thêm khóa GPG của Docker
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

   # Cài đặt Docker Engine và Docker Compose
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
   ```

2. **Thiết lập thư mục ứng dụng trên máy chủ:**
   Tạo cấu trúc thư mục chứa tệp cấu hình triển khai cục bộ tại `/home/<user>/app/japane-learn-prod` (viết tắt là `~/app/japane-learn-prod`):
   ```text
   ~/app/japane-learn-prod/
   ├── docker-compose.yml              # File điều phối container
   └── .env                            # Tệp lưu trữ biến môi trường bí mật
   ```

3. **Cấu hình bảo mật qua biến môi trường (`.env`):**
   Để ngăn chặn việc lộ mật khẩu và các khóa mã hóa JWT trên kho lưu trữ mã nguồn Git công khai, máy chủ Ubuntu sử dụng tệp `.env` nội bộ để định nghĩa các giá trị nhạy cảm:
   ```env
   # Mật khẩu quản trị hệ quản trị cơ sở dữ liệu SA SQL Server
   DB_PASSWORD=SecurePassword2026!
   
   # Khóa ký số JWT bảo mật cho hệ thống xác thực
   JWT_KEY=SuperSecretKeyForSigningJwtToken2026Secure!!!
   ```
   Tệp tin này được cấp quyền hạn chế chỉ có tài khoản quản trị mới có thể đọc:
   ```bash
   chmod 600 ~/app/japane-learn-prod/.env
   ```

4. **Khởi chạy hệ thống:**
   Điều hướng tới thư mục chứa tệp cấu hình và chạy lệnh để Docker tự động tải ảnh (Image), khởi tạo mạng nội bộ và khởi chạy các dịch vụ ở chế độ chạy ngầm (Background/Detached mode):
   ```bash
   cd ~/app/japane-learn-prod
   docker compose up -d
   ```

---

### 5.5.4. Thiết lập quy trình Tích hợp và Triển khai liên tục (CI/CD) qua GitHub Actions
Để tự động hóa hoàn toàn quy trình đóng gói ứng dụng, phát hành phiên bản mới và cập nhật tức thì lên máy chủ Ubuntu mà không cần thao tác thủ công, dự án thiết lập đường ống **CI/CD (Continuous Integration / Continuous Deployment)** thông qua **GitHub Actions**.

Luồng hoạt động của hệ thống CI/CD được mô tả qua tệp cấu hình [deploy.yml](file:///d:/JapanE_LEARN/.github/workflows/deploy.yml) bao gồm hai giai đoạn (Jobs) chính chạy liên tục:

1. **Giai đoạn Đóng gói và Đẩy ảnh (Build Job - Chạy trên đám mây GitHub):**
   * Được kích hoạt tự động mỗi khi có sự kiện đẩy mã nguồn (`git push`) lên nhánh chính `main`.
   * Sử dụng một máy ảo Ubuntu tạm thời (`runs-on: ubuntu-latest`) để lấy mã nguồn mới nhất (`actions/checkout@v4`).
   * Sử dụng thông tin chứng thực tài khoản lưu trong GitHub Repository Secrets (`DOCKER_USERNAME` và `DOCKER_PASSWORD`) để đăng nhập vào Docker Hub.
   * Tiến hành biên dịch, build Docker image theo cấu hình `Dockerfile` và đẩy hình ảnh Docker (`kyhieu/japane-learn:latest`) lên Docker Hub phục vụ việc phân phối.

2. **Giai đoạn Triển khai (Deploy Job - Chạy trực tiếp trên Máy chủ Ubuntu thực tế):**
   * Giai đoạn này chỉ bắt đầu sau khi `build_job` hoàn thành thành công (`needs: build_job`).
   * Chạy trực tiếp trên máy chủ Ubuntu thật thông qua cơ chế **GitHub Actions Self-Hosted Runner** (`runs-on: self-hosted`).
   * Thực thi các lệnh cập nhật hệ thống cục bộ:
     * Chuyển đến thư mục ứng dụng sản xuất: `cd ~/app/japane-learn-prod`
     * Tải Docker image mới nhất từ Docker Hub về máy chủ: `docker compose pull api`
     * Khởi động lại container phục vụ API sử dụng mã nguồn mới nhất và buộc tạo lại container mà không ảnh hưởng tới container cơ sở dữ liệu SQL Server đang chạy: `docker compose up -d --force-recreate api`

Cú pháp tệp tin cấu hình CI/CD hoàn chỉnh trong dự án:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: kyhieu/japane-learn:latest

  deploy_ubuntu:
    needs: build_job
    runs-on: self-hosted
    steps:
      - name: Deploy on Local Server
        run: |
          cd ~/app/japane-learn-prod
          docker compose pull api
          docker compose up -d --force-recreate api
```

Bằng cách áp dụng quy trình CI/CD này, tính ổn định và tính sẵn sàng cao của JapanE luôn được đảm bảo; mọi chỉnh sửa lỗi hoặc tính năng mới đều được tích hợp, đóng gói tự động thành container Docker và triển khai lên máy chủ Ubuntu trong vòng vài phút.

---

## 5.6. Kết luận chương 5
Chương 5 đã hoàn thành việc thiết kế chi tiết hệ thống, thiết kế cơ sở dữ liệu quan hệ vật lý và đặc tả phương án cài đặt mã nguồn thực tế của ứng dụng web học tiếng Nhật **JapanE**. 

Bằng cách phân tích cấu trúc đối tượng dữ liệu chặt chẽ giữa tài khoản người dùng, bộ thẻ, thẻ từ vựng và nhật ký lượt học thông qua sơ đồ thực thể ERD và Class Diagram, cơ sở dữ liệu quan hệ của hệ thống trên SQL Server 2022 được đảm bảo hoạt động an toàn, chính xác và đồng bộ. Việc hiện thực hóa trực tiếp thuật toán lặp lại ngắt quãng SuperMemo-2 ở Backend bằng C# giúp giãn cách tần suất học tối ưu cho từng từ vựng, đi kèm giải pháp lập trình bảng vẽ Canvas tương tác tối giản bằng JavaScript thuần xử lý mượt mà vẽ viết chữ Kanji/Kana trên trình duyệt đã đáp ứng chính xác mục tiêu đề tài đề ra.

Đồng thời, giải pháp đóng gói tự động bằng Docker Multi-stage Build và điều phối dịch vụ qua Docker Compose giúp dự án đạt tính ổn định cao, nhất quán cấu hình và sẵn sàng cho việc triển khai thực tế trên các môi trường đám mây hoặc máy chủ Production.
