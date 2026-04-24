# Course Module System — Implementation Plan

## Context

The artfulmethod-backend needs a course module system for an art education app. There are 5 archetypes (Storyteller, Framer, Archivist, Artist, Integrator), each mapped to a Course. Each course has ~10 sequential lessons. Each lesson shows 1 artwork and has 1–3 voice reflection prompts. After completing all prompts the user sees an AI-generated Lesson Report. Courses and lessons unlock sequentially.

---

## DB Architecture — Field-by-Field Reasoning

### Table 1: `Courses`

```
Courses
  id               PK AUTO_INCREMENT
  archetype        VARCHAR(100)
  title            VARCHAR(200)
  subtitle         VARCHAR(200)
  tagline          TEXT
  cover_image_url  VARCHAR(500)
  duration_mins    INT
  sort_order       INT
  is_active        BOOLEAN DEFAULT true
  deleted_at       DATE
  created_at, updated_at
```

| Field | Figma Evidence | Spreadsheet Evidence |
|---|---|---|
| `archetype` | Slug used for logic e.g. `'storyteller'`. Also used to match against user's assigned archetype to show **"Your home base"** badge on course card | Spreadsheet col A: Archetype names |
| `title` | **"The Storyteller"**, **"The Integrator"** — main heading on course card and course detail header | — |
| `subtitle` | **"PATTERN SEEKER"**, **"NARRATIVE MAKER"** — uppercase label shown under title on course card and course detail | — |
| `tagline` | **"Simultaneously hold the personal and universal..."** — paragraph text below subtitle on course card | — |
| `cover_image_url` | The coloured card image (green circle logo, orange wavy logo, yellow target etc.) shown on course card and course detail header | — |
| `duration_mins` | Course header shows **"22 min"** total — this is a course-level stat, not per-lesson | — |
| `sort_order` | Controls which course unlocks first. Courses unlock sequentially — Integrator first (home base), then others | — |

> **NOT included:** `total_lessons` — removed because it can be computed as `COUNT(CourseLessons)` at query time. No need to denormalize.

---

### Table 2: `CourseLessons`

```
CourseLessons
  id                PK AUTO_INCREMENT
  course_id         FK -> Courses
  lesson_number     INT
  title             VARCHAR(200)
  lesson_type       ENUM('reflection', 'course_report') DEFAULT 'reflection'
  artwork_title     VARCHAR(500)
  artwork_info      TEXT
  artwork_url       VARCHAR(500)
  artwork_image_url VARCHAR(500)
  sort_order        INT
  is_active         BOOLEAN DEFAULT true
  deleted_at        DATE
  created_at, updated_at
```

| Field | Figma Evidence | Spreadsheet Evidence |
|---|---|---|
| `lesson_number` | Numbers **1–11** shown in the lesson list on course detail screen | Spreadsheet col B: Lesson numbers 1–10 |
| `title` | **"First Impressions"**, **"Emotional Undercurrents"**, **"Reading Atmosphere"** etc. — lesson name in the list row | — |
| `lesson_type` | Lesson 11 is **"Read your Full Course Report"** — it has no artwork or prompts, it just unlocks the full course report. All other lessons are `reflection` type | — |
| `artwork_title` | **"About the artwork"** screen shows artwork title e.g. **"The Art of Painting"** with artist, date, medium, dimensions, museum | Spreadsheet col F: Full artwork metadata block |
| `artwork_info` | **"About the artwork"** screen shows description paragraph e.g. **"In The Art of Painting, Johannes Vermeer turns the act of painting itself into the subject..."** | Spreadsheet col G: Image info |
| `artwork_url` | Not shown in Figma UI directly, but present in spreadsheet. Used for attribution/reference | Spreadsheet col H: Museum links e.g. artic.edu, rijksmuseum.nl |
| `artwork_image_url` | The **full-screen painting image** shown as background during all 3 voice reflection prompts (Vermeer painting visible in all prompt screens) | — (admin uploads to S3) |
| `sort_order` | Controls lesson sequence independent of lesson_number | — |

> **NOT included:** `duration_mins` per lesson — moved to course level. The **"22 min"** shown is course total, individual lesson duration not shown in Figma.

---

### Table 3: `CourseLessonPrompts`

```
CourseLessonPrompts
  id            PK AUTO_INCREMENT
  lesson_id     FK -> CourseLessons
  prompt_number INT   (1, 2, 3)
  prompt_text   TEXT
  sort_order    INT
  created_at, updated_at
```

| Field | Figma Evidence | Spreadsheet Evidence |
|---|---|---|
| `prompt_number` | **"Prompt 1"**, **"Prompt 2"**, **"Prompt 3"** — shown as blurred overlay before recording starts. Dots indicator shows which prompt you're on | Spreadsheet cols C, D, E: Question 1, Question 2, Question 3 |
| `prompt_text` | Text shown at bottom of voice reflection screen e.g. **"Share whatever comes to mind when you look at this image..."**, **"What quiet narrative exists between these two figures?"** | Spreadsheet cols C/D/E: actual prompt questions |

---

### Table 4: `UserCourseProgress`

```
UserCourseProgress
  id           PK AUTO_INCREMENT
  user_id      FK -> Users
  course_id    FK -> Courses
  status       ENUM('not_started','in_progress','completed') DEFAULT 'not_started'
  started_at   DATE
  completed_at DATE
  created_at, updated_at
  UNIQUE(user_id, course_id)
```

| Field | Figma Evidence |
|---|---|
| `status` | Course card states: **"7/10 lessons completed"** (in_progress), **"Completed"** badge (completed). Also drives locking of next course — locked card shows **"Will be automatically unlocked after completing The Storyteller unit."** |
| `started_at / completed_at` | Needed to compute progress timeline |

---

### Table 5: `UserLessonAttempts`

```
UserLessonAttempts
  id           PK AUTO_INCREMENT
  user_id      FK -> Users
  lesson_id    FK -> CourseLessons
  course_id    FK -> Courses
  status       ENUM('in_progress','completed') DEFAULT 'in_progress'
  started_at   DATE
  completed_at DATE
  created_at, updated_at
```

| Field | Figma Evidence |
|---|---|
| `status` | Lesson row states: **"Completed"** badge, **"Continue"** (in_progress), **"Locked"**. Completed attempt unlocks next lesson |
| `course_id` | Denormalized for efficient course-level queries (count completed lessons per course) |

---

### Table 6: `UserPromptResponses`

```
UserPromptResponses
  id              PK AUTO_INCREMENT
  attempt_id      FK -> UserLessonAttempts
  prompt_id       FK -> CourseLessonPrompts
  voice_url       VARCHAR(500)
  transcript_text TEXT
  duration_sec    INT
  created_at, updated_at
```

| Field | Figma Evidence |
|---|---|
| `voice_url` | User records voice on each prompt screen — **"Recording..."** → **"Saving your reflection..."** states. Audio saved to S3 |
| `transcript_text` | Report screen shows **"What You Said · What It Reveals · Prompt 1/2/3"** sections — needs the transcript to generate AI report |
| `duration_sec` | Lesson row shows **"6 minutes reflection"** on the report screen header |

---

### Table 7: `CourseLessonReports`

```
CourseLessonReports
  id            PK AUTO_INCREMENT
  attempt_id    FK -> UserLessonAttempts  UNIQUE
  ai_response   LONGTEXT
  status        ENUM('pending','completed','failed') DEFAULT 'pending'
  error_message TEXT
  created_at, updated_at
```

| Field | Figma Evidence |
|---|---|
| `ai_response` | Full report screen shows long structured text: **Intro → Your Primary Aesthetic Archetypes → What You Said & What It Reveals (Prompt 1/2/3) → The Perception Framework → Moving Across Your Range → How might this growth show up?** All stored as LONGTEXT |
| `status` | Lesson completed screen → **"Read My Lesson Report"** button. Client polls this until `completed`. Also **"If skips report"** path shown in Figma |

> **Removed:** `pdf_url` — not shown anywhere in the Figma app screens. The report is rendered as in-app text, not a PDF download.

---

### Users Table — One Addition

```
Users (existing table — add 1 column)
  archetype   VARCHAR(100)  NULL   -- set during onboarding
```

**Why:** The **"Your home base"** badge shown on the user's matched archetype course requires comparing `user.archetype` with `course.archetype`. This is set during the onboarding flow (existing `/auth/me` PATCH endpoint can set it).

---

## Entity Relationship Diagram

```
Users ──< UserCourseProgress >── Courses
  │                                  │
  │                            CourseLessons ──< CourseLessonPrompts
  │                                  │
  └──< UserLessonAttempts >── CourseLessons
            │
            ├──< UserPromptResponses >── CourseLessonPrompts
            │
            └──< CourseLessonReports
```

---

## API Endpoints

### Admin — Course Content Management

| Method | Path | Why Needed |
|--------|------|------------|
| `POST` | `/api/v1/courses` | Admin creates a course (archetype, title, subtitle, tagline, cover image) |
| `GET` | `/api/v1/courses` | Admin lists all courses — management view |
| `PUT` | `/api/v1/courses/:id` | Admin updates course details or cover image |
| `DELETE` | `/api/v1/courses/:id` | Admin soft deletes course |
| `POST` | `/api/v1/courses/:courseId/lessons` | Admin creates lesson with artwork fields + prompts array |
| `PUT` | `/api/v1/courses/:courseId/lessons/:lessonId` | Admin updates lesson or prompts |
| `DELETE` | `/api/v1/courses/:courseId/lessons/:lessonId` | Admin soft deletes lesson |

### User — Course Consumption

| Method | Path | Figma Screen |
|--------|------|-------------|
| `GET` | `/api/v1/courses` | **Courses list screen** — returns all courses with lock state + user progress (lessons completed count, status) + `isHomeBase` flag |
| `GET` | `/api/v1/courses/:id` | **Course detail screen** — returns course info + lessons list each with status (completed/active/locked) + artwork count + prompt count |
| `GET` | `/api/v1/courses/:courseId/lessons/:lessonId` | **Lesson start screen** — returns lesson detail: artwork image, artwork title/info, all prompts |
| `POST` | `/api/v1/courses/:courseId/lessons/:lessonId/start` | **"Begin Lesson" button** — creates UserLessonAttempt, returns attempt id |
| `POST` | `/api/v1/courses/:courseId/lessons/:lessonId/attempts/:attemptId/prompts/:promptId/respond` | **Voice reflection screens** — uploads audio, saves voice_url + transcript, returns next state |
| `POST` | `/api/v1/courses/:courseId/lessons/:lessonId/attempts/:attemptId/complete` | **"Finish My Reflection" button on About the Artwork screen** — marks lesson complete, triggers AI report async |
| `GET` | `/api/v1/courses/:courseId/lessons/:lessonId/attempts/:attemptId/report` | **"Read My Lesson Report" button** — returns report (poll until status=completed) |

---

## Key Response Shapes

**GET /api/v1/courses (user)**
```json
[{
  "id": 1,
  "archetype": "integrator",
  "title": "The Integrator",
  "subtitle": "PATTERN SEEKER",
  "tagline": "Simultaneously hold the personal and universal...",
  "coverImageUrl": "https://...",
  "durationMins": 22,
  "totalLessons": 10,
  "isHomeBase": true,
  "isLocked": false,
  "userProgress": {
    "status": "in_progress",
    "lessonsCompleted": 7
  }
}]
```

**GET /api/v1/courses/:id (user)**
```json
{
  "id": 1,
  "title": "The Storyteller",
  "subtitle": "NARRATIVE MAKER",
  "tagline": "...",
  "coverImageUrl": "https://...",
  "durationMins": 22,
  "lessonsCompleted": 2,
  "lessons": [
    {
      "id": 10,
      "lessonNumber": 1,
      "title": "First Impressions",
      "lessonType": "reflection",
      "artworkCount": 1,
      "promptCount": 3,
      "status": "completed"
    },
    {
      "id": 11,
      "lessonNumber": 2,
      "title": "Emotional Undercurrents",
      "lessonType": "reflection",
      "artworkCount": 1,
      "promptCount": 2,
      "status": "active"
    },
    {
      "id": 12,
      "lessonNumber": 3,
      "title": "Reading Atmosphere",
      "lessonType": "reflection",
      "artworkCount": 1,
      "promptCount": 3,
      "status": "locked"
    },
    {
      "id": 20,
      "lessonNumber": 11,
      "title": "Read your Full Course Report",
      "lessonType": "course_report",
      "status": "locked"
    }
  ]
}
```

**GET /api/v1/courses/:courseId/lessons/:lessonId (user)**
```json
{
  "id": 10,
  "lessonNumber": 1,
  "title": "First Impressions",
  "lessonType": "reflection",
  "artworkTitle": "Lady Filmer in her Drawing Room...",
  "artworkInfo": "Lady Filmer's photocollage places herself...",
  "artworkUrl": "https://artic.edu/artworks/198126/...",
  "artworkImageUrl": "https://s3.../artwork.jpg",
  "prompts": [
    { "id": 1, "promptNumber": 1, "promptText": "What do you see?" },
    { "id": 2, "promptNumber": 2, "promptText": "What do you think is going on?" },
    { "id": 3, "promptNumber": 3, "promptText": "What does it make you wonder?" }
  ]
}
```

**POST /start → 201**
```json
{ "attemptId": 45 }
```

**POST /prompts/:promptId/respond (multipart: audio file) → 200**
```json
{ "voiceUrl": "https://s3...", "transcriptText": "I see a woman..." }
```

**POST /complete → 200**
```json
{ "reportStatus": "pending" }
```

**GET /report → 200**
```json
{
  "status": "completed",
  "aiResponse": "## Intro\nYou spent time with three paintings...\n\n## Your Primary Aesthetic Archetypes\n...\n\n## What You Said · What It Reveals · Prompt 1\n..."
}
```

---

## Locking Logic (computed at query time)

- **Course locked** if: `sort_order > 1` AND no `UserCourseProgress` with `status='completed'` exists for the previous course (`sort_order - 1`) for this user
- **Lesson locked** if: `lesson_number > 1` AND no `UserLessonAttempt` with `status='completed'` exists for the previous lesson for this user
- **`isHomeBase`** = `user.archetype === course.archetype`

No lock column in DB — all computed.

---

## AI Report Generation Flow (POST /complete)

1. Fetch all `UserPromptResponses` for the attempt, join `CourseLessonPrompts.prompt_text`
2. Fetch lesson: `artwork_title`, `artwork_info`, `course.title`, `course.archetype`
3. Create `CourseLessonReports` row with `status='pending'`
4. Mark `UserLessonAttempt.status = 'completed'`, set `completed_at`
5. Upsert `UserCourseProgress` (in_progress or completed if last reflection lesson done)
6. Trigger async Claude call (`claude-sonnet-4-6`) with structured prompt:
   - Archetype identity context
   - Artwork context
   - Each prompt → transcript pair
   - Report structure: Intro, Primary Archetypes, What You Said per prompt, Perception Framework, Moving Across Your Range
7. On Claude response: update `CourseLessonReports.ai_response`, set `status='completed'`
8. Return `{ reportStatus: "pending" }` to client immediately

---

## File Structure

### New Files
```
migrations/
  20260424000001-create-courses.js
  20260424000002-create-course-lessons.js
  20260424000003-create-course-lesson-prompts.js
  20260424000004-create-user-course-progress.js
  20260424000005-create-user-lesson-attempts.js
  20260424000006-create-user-prompt-responses.js
  20260424000007-create-course-lesson-reports.js

models/
  course.js
  courselesson.js
  courselessonprompt.js
  usercourseprogress.js
  userlessonattempt.js
  userpromptresponse.js
  courselessonreport.js

routes/
  course.routes.js

controller/
  course.controller.js

services/
  course.service.js

validations/
  course.validation.js
```

### Modified Files
```
models/index.js            — register 7 new models & associations
models/user.js             — add archetype field
migrations/new-migration   — add archetype column to Users table
routes/index.route.js      — mount /courses route
validations/auth.validation.js — add archetype to profile update schema
```

### Existing Code to Reuse
| File | Purpose |
|------|---------|
| `middlewares/authenticate.middleware.js` | Auth on all course routes |
| `middlewares/isAdmin.middleware.js` | Admin-only management routes |
| `middlewares/upload.middleware.js` | S3 upload for artwork images + audio |
| `middlewares/audio-upload.middleware.js` | Audio upload for voice responses |
| `middlewares/validate.js` | Zod validation |
| `utils/async-handler.js` | Wrap controllers |
| `utils/api-response.js` | Standardized responses |
| `utils/app-error.js` | 400/403/404 errors |
| `services/mental-health.service.js` | Reference for Claude API call pattern |
| `services/transcribe.service.js` | Reference for audio upload + transcript pattern |

---

## Verification Steps

1. `npx sequelize-cli db:migrate` — confirm 7 new tables + archetype column on Users
2. Admin: `POST /courses` — create Storyteller course
3. Admin: `POST /courses/:id/lessons` — create lesson 1 with artwork + 3 prompts
4. User: `PATCH /auth/me` with `{ archetype: "storyteller" }` — set home base
5. User: `GET /courses` — confirm Storyteller unlocked, `isHomeBase: true`, others locked
6. User: `GET /courses/:id` — confirm lesson 1 active, lessons 2+ locked
7. User: `POST /lessons/:id/start` — confirm attempt created
8. User: `POST /prompts/:id/respond` × 3 — confirm voice_url + transcript saved each time
9. User: `POST /attempts/:id/complete` — confirm `{ reportStatus: "pending" }`
10. User: `GET /attempts/:id/report` — poll until `status: "completed"`, verify AI response sections
11. User: `GET /courses/:id` — confirm lesson 2 now `status: "active"`
12. Complete all reflection lessons → confirm lesson 11 "Read your Full Course Report" unlocked
13. Complete course → `GET /courses` — confirm next course unlocked
14. Check `/api-docs` — all endpoints documented in Swagger
