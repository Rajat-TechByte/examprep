# CHANGELOG — AI Exam Tutor

This file tracks **notable changes** in the project, tied to commits or milestones.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) (simplified).  

---

## [Unreleased]
- WeakArea aggregation refinements (tuning α, richer `meta`)
- Adaptive sampling logic for quiz generation
- Auth scaffolding (JWT middleware)
- AI question generation + RAG integration
- Dashboard endpoints
- CI/CD pipeline

---

## [0.3.0] — 2025-09-23
### Added
- Implemented **Attempt Lifecycle**:
  - New `ExamAttempt` model for per-session attempt snapshots.
  - Updated `Answer` model with `attemptId` and `selectedSnapshot` JSON.
  - Introduced `WeakArea` model with EMA-based weight updates.
  - Added Zod validators (`startAttemptSchema`, `submitAttemptSchema`).
  - Service layer for attempt start/submit, grading, and weak area updates.
  - Controller + routes for `/attempts/start` and `/attempts/submit`.
  - Example payloads + smoke checklist in docs.

### Changed
- `docs/` updated with attempt lifecycle notes, migration/backfill guidance, and acceptance criteria.
- Moved attempt lifecycle tasks from "Unreleased" to this release.

---

## [0.2.0] — 2025-09-22
### Added
- Implemented **Question Versioning**:
  - Introduced `QuestionVersion` model with `versionNumber`, `text`, and `options` JSON snapshot.
  - Service + controller now auto-create a snapshot on `Question` create/update (transactional).
  - `Answer` flow updated to reference `questionVersionId` instead of `questionId`.
  - Added smoke script + test (`scripts/smokeQuestion.ts`, `test/question.versioning.test.ts`).

### Changed
- Project context and dev summary updated to reflect completed versioning.
- Removed versioning tasks from "Unreleased".

---

## [0.1.0] — 2025-09-21
### Added
- Initial **Prisma schema** with base models:  
  `User`, `Exam`, `UserExam`, `Subject`, `Topic`, `Question`, `Option`, `Answer`, `Tag`, `QuestionTag`.
- **Zod DTOs** for Auth, Exam, Question, Syllabus, User, UserExam, Answer.  
- **Seed scripts** created and verified locally.  
- Drafted **project vision & roadmap** (`PROJECT_CONTEXT.md`).  
- Added **development summary log** (`PROJECT_DEVELOPMENT_SUMMARY.md`).  

### Notes
- Question versioning design discussed, but not implemented.  
- No CI/CD yet.  
- MVP focus defined: Auth, Attempts, WeakAreas, Adaptive Quiz.  

---

## [0.0.1] — 2025-09-20
### Added
- Repo scaffolding with `pnpm`, Prisma, Zod, Express.  
- Minimal schema migration committed.  
- Project planning conversations distilled into canonical docs.  
