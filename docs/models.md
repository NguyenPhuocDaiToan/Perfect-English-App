
# Data Models Specification

Tài liệu mô tả chi tiết các Entities (Thực thể) trong hệ thống. Các Type và Enum được định nghĩa trong `src/models/constants.ts`.

## 1. User (Người dùng)
Lưu trữ thông tin tài khoản, quyền hạn và tiến độ gamification.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique Identifier. |
| `name` | `string` | Tên hiển thị. |
| `email` | `string` | Email đăng nhập (Unique). |
| `role` | `UserRole` | 'Admin', 'Editor', 'Teacher', 'Student'. |
| `status` | `UserStatus` | 'Active', 'Inactive', 'Suspended', 'Pending'. |
| `isPremium` | `boolean` | `true` nếu đã mua gói trả phí. |
| `streak` | `number` | Số ngày học liên tiếp. |
| `xp` | `number` | Điểm kinh nghiệm tích lũy. |
| `avatarUrl` | `string` | Link ảnh đại diện. |
| `createdAt` | `string` | ISO Date string ngày tạo. |
| `lastLogin` | `string` | ISO Date string lần đăng nhập cuối. |

## 2. Topic (Chủ đề)
Nhóm các bài học và bài tập lại với nhau (ví dụ: Tenses, Nouns).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique Identifier. |
| `title` | `string` | Tên chủ đề. |
| `category` | `TopicCategory` | 'Grammar', 'Vocabulary', 'Skills', 'Writing', 'Speaking'. |
| `description`| `string` | Mô tả ngắn. |
| `status` | `PublishStatus`| 'Published', 'Draft'. |

## 3. Lesson (Bài học)
Nội dung lý thuyết.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique Identifier. |
| `title` | `string` | Tiêu đề bài học. |
| `level` | `CEFRLevel` | 'A1' - 'C1'. |
| `status` | `PublishStatus`| Trạng thái xuất bản. |
| `topics` | `number[]` | Liên kết đến nhiều Topic (Many-to-Many). |
| `content` | `string` | Nội dung HTML (từ CKEditor). |
| `exercise` | `number?` | ID bài tập đi kèm (Optional). |
| `isPremium` | `boolean` | `true` nếu bài học chỉ dành cho VIP. |

## 4. Question (Ngân hàng câu hỏi)
Đơn vị nhỏ nhất của bài tập.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique Identifier. |
| `type` | `QuestionType` | 'MCQ', 'MultiSelect', 'FillBlank', 'TrueFalse'. |
| `topic` | `QuestionTopic` | Phân loại câu hỏi. |
| `difficulty` | `DifficultyLevel`| 'Easy', 'Medium', 'Hard'. |
| `questionText`| `string` | Nội dung câu hỏi. |
| `options` | `McqOption[]` | Danh sách lựa chọn (cho trắc nghiệm). |
| `correctAnswer`| `boolean` | Dùng cho True/False. |
| `correctAnswerText`| `string` | Dùng cho FillBlank. |
| `explanation` | `string` | Giải thích đáp án đúng. |
| `tags` | `string[]` | Tags phụ trợ (ví dụ: 'ielts', 'toeic'). |

## 5. Exercise (Bài tập)
Tập hợp các câu hỏi để người dùng làm.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique Identifier. |
| `title` | `string` | Tên bài tập. |
| `questions`| `number[]` | Danh sách ID các câu hỏi trong bài tập này. |
| `timeLimit` | `number` | Thời gian làm bài (phút). |
| `difficulty` | `DifficultyLevel`| Độ khó tổng quan. |
| `topics` | `number[]` | Liên kết Topic. |
| `lessons` | `number[]` | Liên kết Lesson (bài tập củng cố bài học). |

## 6. BlogPost (Bài viết Blog)
Tin tức hoặc mẹo học tập.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique Identifier. |
| `slug` | `string` | URL friendly string (e.g., 'cach-hoc-tieng-anh'). |
| `title` | `string` | Tiêu đề. |
| `content` | `string` | Nội dung HTML. |
| `thumbnail` | `string` | Ảnh bìa. |
| `authorId` | `number` | ID người viết (User). |
| `tags` | `string[]` | Tags bài viết. |

## 7. UserProgress (Tiến độ học tập)
Lưu trữ kết quả làm bài của người dùng.

| Field | Type | Description |
|-------|------|-------------|
| `exercise` | `number` | ID bài tập. |
| `status` | `string` | 'In Progress', 'Completed'. |
| `bestScore` | `number` | Điểm cao nhất đạt được (0-100). |
| `lastPlayedAt`| `Date` | Thời gian làm bài gần nhất. |
