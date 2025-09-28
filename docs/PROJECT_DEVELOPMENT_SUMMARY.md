# PROJECT_DEVELOPMENT_SUMMARY.md — AI Exam Tutor (Progress Log)

**Last updated:** 2025-09-28  

---

## 1. Reminder (one line)
AI-powered, exam-specific tutor — syllabus-aware quizzes, persistent memory, adaptive quizzes, AI-assisted question generation.

---

## 2. What’s completed ✅
- Minimal schema changes + migrations committed.  
- Seed files created + tested locally.  
- Zod DTOs implemented (auth, exam, question, syllabus, user, user-exam, answer).  
- Vision & roadmap defined.  
- **Question Versioning implemented**
- **Attempt lifecycle implemented**
- **Auth scaffolding implemented**:  
  - Signup/login with bcrypt + JWT.  
  - `authMiddleware` to protect routes.  
  - `authorize()` role guard for admin-only routes.  
  - Controllers updated to use `req.user.id` (never client `userId`).  
  - `/api/attempts/*` now requires JWT.  
  - Seed script for admin & student accounts.  
  - Smoke script updated to login → start attempt → submit attempt. ✅  

---

## 3. What’s missing / gaps 🚧
- **WeakArea refinements** (tuning α, richer `meta`, backfill support).  
- **AI integration** (question generation + RAG).  
- **Dashboard endpoints**.  
- **CI/CD pipeline**.  

---

## 4. Key decisions (snapshot)
- Use JSON snapshot for `QuestionVersion.options`.  
- Answers always reference a `QuestionVersionId` (immutability).  
- Attempts pin quiz state in `ExamAttempt.rawSnapshot` for deterministic grading.  
- WeakArea weight updates use EMA; composite unique `(userId, examId, topicId)`.  
- Migrations are additive/non-destructive (legacy `answers` keep nullable `attemptId`).  
- Auth always enforced via JWT; no endpoint trusts body `userId`.  
---

## 5. Immediate next priority
**Refine WeakArea + adaptive quiz generation (Priority D)**  

Deliverables:   
1. Tune α, persist richer `meta`.  
2. Add adaptive quiz generator that biases to weak topics.  
3. Backfill WeakArea for legacy attempts.  

---

## 6. Suggested commit message (Priority C already done)
```bash
feat(auth): complete JWT auth scaffolding and secure routes

- Implemented signup/login with bcrypt + JWT
- Added auth middleware and role guard
- Secured attempt routes with JWT
- Updated controllers/services to use req.user.id
- Added seed accounts + smoke test flow

``` 

## 7. Next steps after Priority C

1. Refine WeakArea aggregation + adaptive quiz generation.
2. Add AI question generation service (RAG optional).
3. Build dashboard endpoints.
4. Set up CI/CD pipeline.

## 8. Maintenance rule

- Update this file whenever you finish a task or set a new short-term goal.
- Keep in sync with /docs/PROJECT_CONTEXT.md if something changes in design.