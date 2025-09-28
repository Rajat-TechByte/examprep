# PROJECT_CONTEXT.md — AI Exam Tutor (Canonical Spec)

**Last updated:** 2025-09-28  

---

## 1. Project overview (one line)
AI-powered exam tutor for government exam aspirants — syllabus-aware quizzes, persistent user memory, adaptive learning, and AI-assisted question generation.

---

## 2. Vision & differentiator
- Exam-specific (UPSC/SSC/NEET/etc.) with **syllabus trees per exam**.  
- Persistent **user memory** (weak areas, attempts, progress).  
- Adaptive quiz engine that **biases toward weak topics**.  
- AI-powered **question generation & explanations** (RAG optional).  

---

## 3. MVP feature list
- **Auth**: email/password + JWT; roles = STUDENT / EDITOR / ADMIN ✅  
- **Exams & syllabus tree** (seeded for UPSC + SSC).  
- **Quiz generation**: DB-first, fallback AI generation.  
- **Attempt lifecycle**: start → submit; snapshot pinned to versions. ✅  
- **Scoring & WeakArea aggregation** per user-topic.  
- **Dashboard endpoints** for progress & weak topics.  
- **Question Versioning**: immutable snapshots ensure grading consistency. ✅  

---

## 4. Data model (Prisma schema)
**Implemented models:**  
- `User`  
- `Exam`  
- `UserExam`  
- `Subject`  
- `Topic`  
- `Question`  
- `Option`  
- `Answer`  
- `Tag`  
- `QuestionTag`  
- `QuestionVersion`  
- `ExamAttempt` ✅  
- `WeakArea` ✅  

**Optional / nice-to-have models:**  
- `AttemptEvent` (audit log for attempt start/pause/submit).  
- `AttemptAttachment` (uploads/screenshots).  
- `AttemptSummary` (denormalized quick stats).  

---

## 5. Zod DTOs (schemas)
- **Answer**: `submitAnswerSchema` (uses `questionVersionId` + `attemptId`).  
- **Attempt**: `startAttemptSchema`, `submitAttemptSchema` ✅  
- **Auth**: `signupSchema`, `loginSchema` ✅  
- **Exam**: `createExamSchema`, `updateExamSchema`  
- **Question**: `createQuestionSchema`  
- **Syllabus**: `syllabusSchema`  
- **User**: `userRoleSchema`, `registerUserSchema`, `updateUserSchema`, `promoteUserRoleSchema`  
- **UserExam**: `registerUserExamSchema`, `updateProgressSchema`  

---

## 6. Design decisions & invariants
- **Grading immutability**: answers always tied to a `QuestionVersion`.  
- **Attempt immutability**: `ExamAttempt.rawSnapshot` is frozen once created; grading uses this snapshot.  
- **Exactly one correct option** per question (enforced in DTO).  
- **Versioning rule**: each question create/update produces a new immutable `QuestionVersion` snapshot.  
- **WeakArea update**: uses EMA algorithm; composite unique key `(userId, examId, topicId)` guarantees one row per triple.  
- **Migrations**: additive; existing answers keep `attemptId?` nullable for backward compatibility.  
- **Auth invariants**:  
  - All protected routes require `Authorization: Bearer <token>`.  
  - `req.user.id` is always source of truth; `userId` is never trusted from client input.  
  - Roles enforced via `authorize()` middleware.  

---

## 7. API surface (MVP)
Auth:  
- `POST /auth/signup` ✅  
- `POST /auth/login` ✅  

Quiz & Attempts:  
- `POST /quizzes/generate`  
- `POST /attempts/start` ✅  
- `POST /attempts/submit` ✅  
- `GET /users/:id/progress?exam=<slug>`  

Admin:  
- `POST /admin/questions/import`  
- `GET /admin/questions/ai-review`  

---

## 8. Dev setup
- Install: `pnpm install`  
- Prisma client: `npx prisma generate`  
- Migrate (dev): `npx prisma migrate dev --name <name>`  
- Start dev server: `pnpm dev`  
- Tests: `pnpm test`  
- Seed: `node prisma/seed.js` or `pnpm ts-node scripts/seedAuth.ts` ✅  
- Smoke tests:  
  - `pnpm ts-node scripts/smokeQuestion.ts` (question versioning) ✅  
  - `pnpm ts-node scripts/smokeAttempt.ts` (auth + attempt lifecycle) ✅  

---

## 9. Coding conventions / PR checklist
- Typecheck: `pnpm tsc --noEmit`  
- Prisma generate: `npx prisma generate`  
- Tests: `pnpm test`  
- Lint & format: `pnpm lint` + `pnpm format`  
- PR must include: summary, local test steps, migration steps, rollback plan.  

---

## 10. File locations
- Prisma schema: `prisma/schema.prisma`  
- Seeds: `prisma/seed.ts` or `scripts/seedAuth.ts`  
- DTOs: `src/schemas/*.ts`  
- Services: `src/services/*`  
- Controllers: `src/controllers/*`  
- Routes: `src/routes/*`  
- Smoke scripts: `scripts/*`  
- Tests: `test/*`  

---

## 11. Communication & meta
- Keep this file updated on **design changes** (schema, API, invariants).  
- Maintainer: <Your name / GitHub handle>  
- Demo URL: <url>  
- Test account: student@example.com / StudentPass123! (seeded) ✅  