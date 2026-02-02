
# AI Prompts & System Instructions

Tài liệu này chứa các câu lệnh (Prompts) được thiết kế để sử dụng với Google Gemini API nhằm phát triển tính năng và tạo nội dung cho ứng dụng.

## 1. Prompts dành cho Content Generation (Admin Tool)

Dùng để giúp Admin tạo nội dung bài học và bài tập nhanh chóng.

### Tạo câu hỏi trắc nghiệm (MCQ) từ chủ đề
**Input:** Chủ đề ngữ pháp (ví dụ: "Present Perfect Tense") và độ khó (B1).
**Prompt:**
> "Act as an expert English teacher. Create 5 multiple-choice questions about '{Topic}' for {Level} students.
> Output strictly in JSON format with the following schema:
> `[{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "index_of_correct_option", "explanation": "..." }]`"

### Tạo bài giải thích ngữ pháp
**Input:** Tên bài học.
**Prompt:**
> "Write a comprehensive grammar explanation for '{LessonTitle}'.
> Structure it with HTML tags (<h2>, <p>, <ul>, <li>, <strong>).
> Include:
> 1. Definition and Usage.
> 2. Form/Structure (Positive, Negative, Question).
> 3. 3-5 Examples for each form.
> 4. Common mistakes to avoid.
> Keep the tone encouraging and clear."

## 2. Prompts dành cho AI Tutor (Tính năng học viên)

Dùng cho tính năng Chatbot hoặc giải thích lỗi sai.

### Giải thích tại sao sai
**Input:** Câu hỏi, đáp án người dùng chọn, đáp án đúng.
**Prompt:**
> "The user answered a grammar question incorrectly.
> Question: '{QuestionText}'
> User Answer: '{UserAnswer}'
> Correct Answer: '{CorrectAnswer}'
> Explain briefly and clearly why the user's answer is wrong and why the correct answer is right. Do not give the answer immediately, guide them."

### Chấm điểm bài viết (Writing Assistant)
**Input:** Đề bài và bài làm của học viên.
**Prompt:**
> "Grade the following short essay based on CEFR {Level} standards.
> Topic: '{Topic}'
> Student Submission: '{Submission}'
>
> Provide:
> 1. Corrected version of the text.
> 2. List of grammatical errors found.
> 3. Suggestions for better vocabulary.
> 4. An estimated score (0-100)."

## 3. Prompts dành cho Development (Coding Assistant)

Dùng khi yêu cầu AI (như tôi) sửa đổi code.

### Refactor Code
**Prompt:**
> "Refactor the following Angular component `{ComponentName}` to use Signals instead of RxJS BehaviorSubjects. Ensure `OnPush` change detection is enabled and remove any memory leaks."

### Thêm tính năng mới
**Prompt:**
> "Create a new standalone component named `VocabularyCardComponent`. It should accept an `Input` of type `VocabularyWord` and display the word, pronunciation, meaning, and an example sentence. Use Tailwind CSS for styling with a 'flip card' animation effect."

### Tạo Mock Data
**Prompt:**
> "Generate a JSON array of 10 mock users for the `User` interface defined below. Vary the roles between 'Student', 'Teacher', and 'Admin'. Include realistic names and avatar URLs."
