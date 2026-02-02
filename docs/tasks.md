
# Danh sách tác vụ triển khai (Implementation Tasks)

## 1. Refactoring & Cleanup (Đang thực hiện)
- [x] Chuyển đổi các string literal sang Enum/Constants (`src/models/constants.ts`).
- [x] Cập nhật các Component Admin để sử dụng Constants (Lessons, Users, Topics...).
- [x] Thêm nút liên hệ WhatsApp.
- [x] Thêm Confirmation Modal khi xóa dữ liệu.
- [ ] Kiểm tra toàn bộ Type safety trong các Service (đặc biệt là `user-progress.service.ts`).

## 2. Frontend Features (Ưu tiên cao)
- [ ] **Exercise Logic:** Cải thiện `ExercisePlayerComponent`:
    - [ ] Hỗ trợ xáo trộn câu hỏi ngẫu nhiên.
    - [ ] Hiển thị giải thích chi tiết ngay sau khi trả lời sai (chế độ Practice).
- [ ] **Search Grounding:** Tích hợp Google Search vào thanh tìm kiếm (Mock up UI hiển thị kết quả từ web).
- [ ] **Profile Settings:** Cho phép User đổi mật khẩu, cập nhật Avatar.

## 3. Admin Advanced Features
- [ ] **Drag & Drop:** Cho phép kéo thả để sắp xếp thứ tự câu hỏi trong Exercise Form.
- [ ] **Bulk Import:** Tính năng import câu hỏi từ file CSV/Excel.
- [ ] **Analytics:** Vẽ biểu đồ thực tế sử dụng thư viện D3.js hoặc Chart.js trong Dashboard.

## 4. Backend Integration (Node.js/MongoDB)
*Lưu ý: Hiện tại đang dùng Mock Service (RxJS), cần chuyển đổi sang HTTP Client thật.*

- [ ] Thiết kế RESTful API Schema (Swagger).
- [ ] Tạo API Endpoints:
    - `GET /api/lessons`
    - `POST /api/auth/login`
    - `POST /api/exercises/submit`
- [ ] Thay thế `of(data)` trong các Service bằng `this.http.get(...)`.

## 5. GenAI Integration (Gemini API)
*Sử dụng `@google/genai`*

- [ ] **Service:** Tạo `GeminiService` để wrap các gọi API.
- [ ] **Feature:** Tạo nút "Explain with AI" trong bài tập. Khi bấm, gửi context câu hỏi lên Gemini để nhận giải thích chi tiết.
- [ ] **Feature:** Tạo nút "Generate Questions" trong Admin Exercise Form. Admin nhập chủ đề -> Gemini trả về JSON list câu hỏi -> Auto fill vào form.

## 6. UI/UX Polish
- [ ] **Responsive:** Kiểm tra lại hiển thị trên Mobile cho bảng Admin (Tables đang bị tràn).
- [ ] **Loading States:** Thêm Skeleton Loader đẹp hơn cho trang danh sách bài học.
- [ ] **Theme:** Hoàn thiện Dark Mode (hiện tại mới chỉ có color picker cơ bản).
