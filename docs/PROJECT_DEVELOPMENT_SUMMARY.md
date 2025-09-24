# PROJECT_DEVELOPMENT_SUMMARY.md — AI Exam Tutor (Progress Log)

**Last updated:** 2025-09-23  

---

## 1. Reminder (one line)
AI-powered, exam-specific tutor — syllabus-aware quizzes, persistent memory, adaptive quizzes, AI-assisted question generation.

---

## 2. What’s completed ✅
- Minimal schema changes + migrations committed.  
- Seed files created + tested locally.  
- Zod DTOs implemented (auth, exam, question, syllabus, user, user-exam, answer).  
- Vision & roadmap defined.  
- **Question Versioning implemented**:  
  - `QuestionVersion` model added.  
  - Service + controller create transactional snapshots on question create/update.  
  - Smoke script + integration test working.  
- **Attempt lifecycle implemented**:  
  - Added `ExamAttempt` model for per-session snapshots.  
  - Updated `Answer` with `attemptId` + `selectedSnapshot`.  
  - Introduced `WeakArea` model for per-user/topic weights.  
  - Added Zod validators (`startAttemptSchema`, `submitAttemptSchema`).  
  - Service layer handles grading + WeakArea updates (EMA).  
  - Controllers + routes wired (`/attempts/start`, `/attempts/submit`).  
  - Smoke script confirmed full lifecycle (generate → start → submit).  

---

## 3. What’s missing / gaps 🚧
- **WeakArea refinements** (tuning α, richer `meta`, backfill support).  
- **Auth scaffolding** (JWT middleware, protect routes).  
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

---

## 5. Immediate next priority
**Add Auth scaffolding (Priority C)**  

Deliverables:  
1. JWT middleware + route protection.  
2. Secure `/attempts/*` and `/dashboard/*` routes.  
3. Seed admin + student accounts for testing.  
4. Update smoke tests to include auth-protected flows.  

---

## 6. Suggested commit message (Priority C)
```bash
feat(auth): add JWT middleware and protect routes

- Implemented JWT-based auth guard
- Secured attempt and dashboard routes
- Added seed accounts for local testing
- Updated smoke tests for protected flows

```

## 7. Next steps after Priority C

1. Refine WeakArea aggregation + adaptive quiz generation.

2. Add AI question generation service (RAG optional).

3. Build dashboard endpoints.

4. Set up CI/CD pipeline.

## 8. Maintenance rule

- Update this file whenever you finish a task or set a new short-term goal.

- Keep in sync with /docs/PROJECT_CONTEXT.md if something changes in design.
