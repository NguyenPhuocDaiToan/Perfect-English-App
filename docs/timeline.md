
# Timeline Dự Án: Perfect English Grammar

Dưới đây là lộ trình phát triển dự kiến cho dự án website học ngữ pháp tiếng Anh.

## Giai đoạn 1: Khởi tạo & MVP (Tuần 1-2)
**Mục tiêu:** Xây dựng khung ứng dụng, cấu trúc dữ liệu và giao diện cơ bản.

- [x] **Thiết lập dự án:** Angular 17+, Tailwind CSS, cấu trúc thư mục.
- [x] **Routing:** Cấu hình Lazy loading cho Admin và Public modules.
- [x] **Data Models:** Định nghĩa User, Lesson, Exercise, Topic bằng TypeScript interfaces.
- [x] **UI Components cơ bản:** Header, Footer, Sidebar, Buttons, Inputs.
- [x] **Mock Services:** Tạo các service trả về dữ liệu giả lập (RxJS `of`, `delay`) để phát triển UI không cần Backend thực.

## Giai đoạn 2: Tính năng người dùng (Public) (Tuần 3-4)
**Mục tiêu:** Người dùng có thể xem bài học, làm bài tập và kiểm tra đầu vào.

- [x] **Trang chủ (Home):** Landing page, giới thiệu, testimonials.
- [x] **Bài học (Explanations):** Danh sách bài học, lọc theo topic, xem chi tiết bài học.
- [x] **Bài tập (Exercises):** Danh sách bài tập, bộ lọc độ khó.
- [x] **Làm bài tập (Player):** Giao diện trắc nghiệm, điền từ, kéo thả. Chấm điểm tức thì.
- [x] **Level Test:** Bài kiểm tra xếp lớp đầu vào.
- [ ] **Blog:** Trang tin tức, mẹo học tập (Đã có UI list, cần chi tiết bài viết).

## Giai đoạn 3: Quản trị & Nội dung (Admin Panel) (Tuần 5-6)
**Mục tiêu:** Admin có thể quản lý toàn bộ nội dung của hệ thống.

- [x] **Dashboard:** Thống kê tổng quan (Users, Lessons, XP).
- [x] **Quản lý Users:** CRUD Users, phân quyền (Role base).
- [x] **Quản lý Topics:** Tạo danh mục ngữ pháp.
- [x] **Quản lý Lessons:** Soạn thảo bài học (tích hợp CKEditor hoặc Markdown).
- [x] **Quản lý Exercises/Questions:** Ngân hàng câu hỏi, tạo bài tập từ ngân hàng câu hỏi.
- [x] **An toàn:** Modal xác nhận xóa (Confirmation Dialog).

## Giai đoạn 4: Authentication & Gamification (Tuần 7-8)
**Mục tiêu:** Giữ chân người dùng và bảo mật hệ thống.

- [x] **Auth Flows:** Đăng nhập, Đăng ký, Quên mật khẩu, Xác thực email (UI Only).
- [x] **Gamification:** Hệ thống XP, Streak (chuỗi ngày học), Badges.
- [x] **User Dashboard:** Trang cá nhân của học viên, biểu đồ tiến độ học tập.
- [ ] **Membership:** Tích hợp cổng thanh toán (Stripe/PayPal giả lập) cho gói Pro.

## Giai đoạn 5: Tích hợp AI (Gemini) & Backend (Tuần 9-12)
**Mục tiêu:** Làm cho ứng dụng thông minh hơn và lưu trữ dữ liệu thực.

- [ ] **Backend API:** Xây dựng Node.js/NestJS API kết nối MongoDB.
- [ ] **AI Tutor:** Chatbot giải thích ngữ pháp ngữ cảnh (sử dụng Gemini Flash).
- [ ] **AI Content Gen:** Tool cho Admin để tự động sinh câu hỏi trắc nghiệm từ bài học.
- [ ] **AI Writing:** Chấm điểm và sửa lỗi bài viết essay của học viên.

## Giai đoạn 6: Testing & Deployment (Tuần 13)
**Mục tiêu:** Đảm bảo chất lượng và đưa sản phẩm ra thị trường.

- [ ] **Unit Testing:** Viết test cho các Service và Utility functions.
- [ ] **E2E Testing:** Kiểm thử luồng người dùng (Cypress/Playwright).
- [ ] **Optimization:** Lazy loading ảnh, tối ưu bundle size.
- [ ] **Deployment:** Deploy lên Vercel/Netlify (Frontend) và Render/Heroku (Backend).
