
# Lộ trình triển khai Backend (Node.js/NestJS + MongoDB)

Tài liệu này mô tả chi tiết các tác vụ cần thực hiện để xây dựng Backend API cho hệ thống Perfect English Grammar. Công nghệ sử dụng: **NestJS**, **Mongoose (MongoDB)**, **Passport (JWT)**.

## Độ ưu tiên 1: Core Foundation & Authentication (Nền móng)
**Mục tiêu:** Thiết lập dự án, kết nối Database, và quản lý người dùng cơ bản. Hệ thống không thể hoạt động nếu thiếu module này.

### 1.1. Project Setup
- [ ] Khởi tạo NestJS Project: `nest new backend`
- [ ] Cấu hình Environment Variables (`.env`): PORT, MONGO_URI, JWT_SECRET, GOOGLE_API_KEY.
- [ ] Cấu hình CORS (cho phép Frontend gọi API).
- [ ] Cấu hình Swagger (OpenAPI) để tự động sinh tài liệu API.
- [ ] Kết nối MongoDB sử dụng `MongooseModule`.

### 1.2. Auth Module (Authentication & Authorization)
*Chịu trách nhiệm đăng ký, đăng nhập, bảo vệ routes.*

- **Schema (User):**
  ```typescript
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Hashed (Bcrypt)
    name: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Teacher', 'Admin', 'Editor'], default: 'Student' },
    status: { type: String, enum: ['Active', 'Pending', 'Banned'], default: 'Active' },
    avatarUrl: String,
    isPremium: { type: Boolean, default: false },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now }
  }
  ```
- **Tasks:**
  - [ ] Implement `AuthService`: Login (validate user, sign JWT), Register (hash password).
  - [ ] Implement `JwtStrategy`: Giải mã token để lấy thông tin user từ Header.
  - [ ] Implement `RolesGuard`: Chặn user thường truy cập API Admin.
- **Endpoints:**
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/profile` (Protected)
  - `POST /auth/verify-email` (Mock/Real logic)

---

## Độ ưu tiên 2: Content Management (Cấu trúc nội dung)
**Mục tiêu:** Quản lý nội dung học tập tĩnh (Topics, Lessons). Đây là xương sống của ứng dụng.

### 2.1. Topic Module
*Quản lý danh mục bài học (Grammar, Vocabulary...)*

- **Schema (Topic):**
  ```typescript
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true }, // SEO friendly URL
    category: { type: String, enum: ['Grammar', 'Vocabulary', 'Skills', 'Writing', 'Speaking'] },
    description: String,
    status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
    order: Number // Để sắp xếp hiển thị
  }
  ```
- **Endpoints:**
  - `GET /topics` (Public - Lọc theo category)
  - `GET /topics/:id` (Public)
  - `POST /topics` (Admin)
  - `PUT /topics/:id` (Admin)
  - `DELETE /topics/:id` (Admin)

### 2.2. Lesson Module
*Quản lý bài học lý thuyết.*

- **Schema (Lesson):**
  ```typescript
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1'] },
    content: String, // HTML content from CKEditor
    topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }, // Optional link
    isPremium: Boolean,
    status: { type: String, enum: ['Published', 'Draft'] },
    views: { type: Number, default: 0 }
  }
  ```
- **Endpoints:**
  - `GET /lessons` (Public - Pagination, Search, Filter)
  - `GET /lessons/:id` (Public - Check Premium logic here or in Guard)
  - `POST /lessons` (Admin)
  - `PUT /lessons/:id` (Admin)
  - `DELETE /lessons/:id` (Admin)

---

## Độ ưu tiên 3: Assessment Engine (Ngân hàng câu hỏi)
**Mục tiêu:** Xây dựng hệ thống bài tập và câu hỏi trắc nghiệm. Phức tạp nhất về mặt logic dữ liệu.

### 3.1. Question Bank Module
*Kho chứa câu hỏi dùng chung.*

- **Schema (Question):**
  ```typescript
  {
    type: { type: String, enum: ['MCQ', 'MultiSelect', 'FillBlank', 'TrueFalse'] },
    topic: { type: String, enum: ['Grammar', 'Vocabulary', 'Reading', 'Listening'] },
    subTopic: String, // e.g., "Present Simple"
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    questionText: { type: String, required: true },
    options: [{ text: String, isCorrect: Boolean }], // For MCQ/MultiSelect
    correctAnswer: Boolean, // For True/False
    correctAnswerText: String, // For FillBlank
    explanation: String, // Giải thích sau khi làm bài
    tags: [String]
  }
  ```
- **Endpoints:**
  - `GET /questions` (Admin only - Filter, Search)
  - `POST /questions` (Admin)
  - `PUT /questions/:id` (Admin)
  - `DELETE /questions/:id` (Admin)

### 3.2. Exercise Module
*Tập hợp các câu hỏi thành bài kiểm tra.*

- **Schema (Exercise):**
  ```typescript
  {
    title: { type: String, required: true },
    description: String,
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    timeLimit: Number, // Minutes
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    lessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    status: { type: String, enum: ['Published', 'Draft'] },
    isPremium: Boolean
  }
  ```
- **Endpoints:**
  - `GET /exercises` (Public List)
  - `GET /exercises/:id` (Protected - Lấy chi tiết bài tập kèm danh sách câu hỏi)
  - `POST /exercises` (Admin)
  - `PUT /exercises/:id` (Admin)

---

## Độ ưu tiên 4: User Progression (Gamification)
**Mục tiêu:** Lưu trữ kết quả học tập để hiển thị Dashboard và tính năng Gamification.

### 4.1. Progress Module
*Lưu kết quả làm bài.*

- **Schema (UserProgress):**
  ```typescript
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    status: { type: String, enum: ['In Progress', 'Completed'] },
    score: Number, // 0-100
    userAnswers: Map, // Lưu câu trả lời chi tiết: { questionId: answer }
    completedAt: Date
  }
  ```
- **Tasks:**
  - API `submit` bài tập: Tính toán điểm số dựa trên `Question Bank` (Backend validation, không tin tưởng Frontend gửi điểm lên).
  - Cập nhật `XP` và `Streak` cho User sau khi submit thành công.
- **Endpoints:**
  - `GET /progress` (Lấy lịch sử học tập của current user)
  - `POST /exercises/:id/submit` (Chấm điểm và lưu kết quả)

### 4.2. Activity Log Module (Admin Feature)
- **Schema:** Lưu log tác vụ (Login, Update, Delete...) để Admin theo dõi (như trong Dashboard UI).

---

## Độ ưu tiên 5: Community & CMS (Bổ trợ)
**Mục tiêu:** Tăng tương tác và SEO.

### 5.1. Blog Module
- **Schema (BlogPost):** Tương tự Lesson nhưng đơn giản hơn, có thêm `authorId`, `thumbnail`.
- **Endpoints:** CRUD Blog posts.

### 5.2. File Upload Module
- Sử dụng `Multer` để upload ảnh (Avatar, Thumbnail) lên server (thư mục `uploads/`) hoặc tích hợp Cloudinary/S3.
- **Endpoint:** `POST /upload`.

---

## Technical Guidelines cho Backend Developer

1.  **DTOs (Data Transfer Objects):** Phải tạo DTO cho mọi request body (ví dụ: `CreateLessonDto`, `LoginDto`) và sử dụng `class-validator` để validate dữ liệu đầu vào.
2.  **Interceptors:** Sử dụng Interceptor để transform response trả về theo chuẩn thống nhất (ví dụ: loại bỏ password khỏi user object).
3.  **Exception Filters:** Xử lý lỗi tập trung, trả về message thân thiện thay vì stack trace.
4.  **Pagination:** Mọi API `GET` danh sách (Lessons, Users, Logs) bắt buộc phải hỗ trợ phân trang (`page`, `limit`).
