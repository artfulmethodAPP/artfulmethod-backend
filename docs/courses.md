# Courses Feature — Architecture & API Plan

## What the System Does

The Courses section is an archetype-based learning system. There are **5 courses**, one per perceptual mode (Storyteller, Framer, Archivist, Artist, Integrator). Each course has **10 lessons**. Each lesson contains 1 artwork, 2 intro slides (derived at runtime — no DB table), and 3 voice reflection prompts. The user records audio for each prompt; it is transcribed, they can edit it, then submit.

After completing all 3 prompts in a lesson, the system generates a **per-lesson AI report** from those 3 transcripts using the existing single-transcript archetype analysis pipeline (`archetype.service.js → analyzeArchetype()`).

After completing all 10 lessons (Lesson 11 = "Read your Full Course Report"), the system generates a **Growth in Range (GiR) report** from all 10 lesson transcripts using a separate AI pipeline described in `newplan.md` / `PGlWkk.pdf`. This is a fundamentally different report — it maps how many of the 5 perceptual modes the user drew on across all 10 encounters.

**Two distinct AI report types:**

| Report                 | Trigger                       | Input                        | AI Pipeline                      | Output                                                                                                                        |
| ---------------------- | ----------------------------- | ---------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Lesson Report          | After lesson 10 completes     | 3 transcripts (that lesson)  | `analyzeArchetype()` — existing  | Archetype, teaser cards, quotes+meanings, full portrait                                                                       |
| Growth in Range Report | After all 10 lessons complete | 10 transcripts (all lessons) | New GiR pipeline — see Section 6 | Home base, range modes, absent modes, VTS quotes, range paragraphs, "How Might This Show Up", home base archetype description |

---

## Key UI Behaviours (from Figma)

- Courses list: two tabs — "Courses" and "Artful Meditations"; each card shows course name, subtitle, description, `X / 10 lessons completed`, progress bar, status badge (Completed / In progress / not started)
- Sequential unlocking: completing lesson N unlocks lesson N+1; locked lessons show "Unit locked — will be automatically unlocked after completing [previous unit]"
- Course module detail: numbered list of 10 lessons + a final "Read your Full Course Report" item; each shows `1 artwork · 3 thinking prompts` + status (Completed / Continue / Locked)
- Lesson flow: Loading screen → 2 intro slides (slide 1 = lesson title, slide 2 = archetype copy — derived at runtime) → Artwork view ("About the artwork") → Prompt 1 voice reflection → Prompt 2 → Prompt 3
- Per-lesson report sections (from Figma image 9–14): Intro, Your Primary Aesthetic Archetype, What You Said (3 quotes + meanings), The Perception Framework, Moving Across Your Range, How Might This Show Up
- Full course report (Lesson 11): the Growth in Range report following the GiR structure from `newplan.md`
- Admin panel to manage course content will be introduced later (routes pre-designed below)

---

## Database Design

### Design Principles

- Normalised enough to avoid duplication, flat enough for easy joins
- Max 2-table joins to serve any single screen
- S3 keys stored (not URLs) — presigned on demand, consistent with `AiReport.pdf_s3_key` and `AudioTranscript.audio_s3_key`
- Sequential unlock logic computed in JS from a single DB query, not per-lesson round-trips
- `report_s3_key` on `User_Lesson_Attempts` stores the lesson PDF; lesson report JSON is fetched from S3 via the key stored on the attempt

---

### Table 1: `Courses`

5 rows total, seeded. One per archetype.

```
id                  INT PK AUTO_INCREMENT
name                VARCHAR(100) NOT NULL -- e.g. "The Storyteller"
subtitle            VARCHAR(100)          -- e.g. "PATTERN SEEKER"
description         TEXT                  -- card body text
image_s3_key        TEXT                  -- card image
is_active           BOOLEAN DEFAULT true
sort_order          INT DEFAULT 0
created_at, updated_at
```

---

### Table 2: `Course_Lessons`

10 rows per course = 50 total, seeded.

```
id                  INT PK AUTO_INCREMENT
course_id           INT FK → Courses.id NOT NULL
title               VARCHAR(200) NOT NULL -- e.g. "First Impressions"
sort_order          INT DEFAULT 0
is_active           BOOLEAN DEFAULT true
created_at, updated_at
```

---

### Table 3: `Lesson_Contents`

1 per lesson (one-to-one with `Course_Lessons`). Stores artwork metadata and all 3 prompts as a JSON array.

```
id                  INT PK AUTO_INCREMENT
lesson_id           INT FK → Course_Lessons.id NOT NULL UNIQUE
artwork_title       VARCHAR(200)
artwork_info        TEXT                  -- "About the artwork" body text shown after prompts
artist_name         VARCHAR(200)
years               VARCHAR(50)           -- e.g. "1665–1666"
prompts_json        JSON NOT NULL
-- shape: [
--   { "prompt_number": 1, "prompt_text": "What do you notice first?" },
--   { "prompt_number": 2, "prompt_text": "..." },
--   { "prompt_number": 3, "prompt_text": "..." }
-- ]
image_s3_key        TEXT NOT NULL
created_at, updated_at
```

---

### Intro Slides — No Table, Derived at Runtime

Intro slides are **not stored in the database**. Each lesson has exactly 2 fixed slides:

- **Slide 1:** `"LESSON {sort_order}\n{title}"` — built from `Course_Lessons.sort_order` + `Course_Lessons.title`
- **Slide 2:** Archetype copy text — pulled from the `ARCHETYPE_DESCRIPTIONS[course.name]` constant already in `services/archetype.service.js`

`GET .../intro` looks up the lesson + course in one query and builds both slides in the service layer. Zero additional DB storage needed.

---

### Table 4: `User_Course_Progress`

One row per user per course. Created when user first starts a lesson in that course.

```
id                  INT PK AUTO_INCREMENT
user_id             INT FK → Users.id NOT NULL
course_id           INT FK → Courses.id NOT NULL
lessons_completed   INT DEFAULT 0         -- count kept in sync at lesson completion
status              ENUM('not_started','in_progress','completed') DEFAULT 'not_started'
completed_at        DATETIME NULL
course_report_s3_key TEXT NULL            -- Growth in Range PDF S3 key
created_at, updated_at

UNIQUE (user_id, course_id)
```

---

### Table 5: `User_Lesson_Attempts`

One row per user per lesson. Created when user starts a lesson.

```
id                  INT PK AUTO_INCREMENT
user_id             INT FK → Users.id NOT NULL
course_id           INT FK → Courses.id NOT NULL  -- denormalised for course-level queries
lesson_id           INT FK → Course_Lessons.id NOT NULL
status              ENUM('in_progress','completed') DEFAULT 'in_progress'
completed_at        DATETIME NULL
report_s3_key       TEXT NULL             -- per-lesson archetype PDF S3 key
created_at, updated_at

UNIQUE (user_id, lesson_id)
INDEX (user_id, course_id)
```

---

### Table 6: `User_Prompt_Responses`

3 rows per attempt (one per prompt). Created when user starts a lesson.

```
id                  INT PK AUTO_INCREMENT
attempt_id          INT FK → User_Lesson_Attempts.id NOT NULL
prompt_number       INT NOT NULL          -- 1, 2, 3 (matches prompts_json order in Lesson_Contents)
audio_s3_key        TEXT NULL             -- uploaded audio
transcript_text     TEXT NULL             -- ElevenLabs transcript (editable)
duration_seconds    FLOAT NULL
submitted_at        DATETIME NULL
created_at, updated_at

UNIQUE (attempt_id, prompt_number)
```

---

### Entity Relationship Summary

```
Courses (5)
  └── Course_Lessons (10 per course)
        └── Lesson_Contents        (1 per lesson, 1:1 — artwork + prompts_json)

Users
  └── User_Course_Progress         (1 per user per course)
  └── User_Lesson_Attempts         (1 per user per lesson)
        └── User_Prompt_Responses  (3 per attempt, one per prompt)
```

Intro slides are derived at runtime — no table.

**Joins per screen — never more than 2 tables:**

| Screen                      | Tables                                                   |
| --------------------------- | -------------------------------------------------------- |
| Courses list                | `Courses` + `User_Course_Progress`                       |
| Course detail (lesson list) | `Course_Lessons` + `User_Lesson_Attempts`                |
| Lesson intro slides         | `CourseLesson` + `Course` (derived, no DB query)         |
| Artwork view                | `Lesson_Contents` (single table)                         |
| Prompt screen               | `Lesson_Contents` + `User_Prompt_Responses`              |
| Lesson report               | `User_Lesson_Attempts` (report_s3_key → S3 fetch)        |
| Course GiR report           | `User_Course_Progress` (course_report_s3_key → S3 fetch) |

---

## AI Report Pipelines

### Pipeline A — Per-Lesson Report (3 transcripts → lesson archetype analysis)

Reuses the existing `archetype.service.js → analyzeArchetype()` unchanged.

**Input:** Concatenate the 3 submitted `transcript_text` values from `User_Prompt_Responses` for this attempt (ordered by `prompt_number`), joined with `\n\n---\n\n`.

**Output JSON structure** (stored via `report_s3_key`):

```json
{
  "archetype": {
    "name": "Framer",
    "subtitle": "Structure Seeker",
    "isShortTranscript": false
  },
  "teaserCards": ["line 1", "line 2", "line 3", "line 4"],
  "quotesAndMeanings": [{ "quote": "...", "meaning": "..." }],
  "report": {
    "intro": "...",
    "sections": [{ "heading": "...", "body": "..." }],
    "raw": "..."
  }
}
```

**PDF:** Generated by `pdf.service.js → generateReportPdf()`, uploaded via `uploadReportPdfToS3()`, key stored in `report_s3_key`.

---

### Pipeline B — Full Course Report (10 transcripts → Growth in Range)

This is a **new Claude pipeline** implementing the methodology from `PGlWkk.pdf` / `newplan.md`. It lives in a new function `analyzeGrowthInRange()` in `services/archetype.service.js` (or a separate `services/growth-in-range.service.js`).

**Input:** Array of 10 objects, one per lesson, each with `{ lesson_number, transcript_text }`.

**The 8-step GiR pipeline (all Claude calls):**

**Step 1 — Score each of the 10 transcripts**
One Claude call per transcript (or batch in a single call with structured output). Each returns the dominant mode (one of 5) and secondary mode if close.

**Step 2 — Map the range**
Computed in JS from Step 1 results:

- `home_base` = mode with highest frequency
- `range_modes` = other modes that appeared at least once
- `absent_modes` = modes that never appeared
- `mode_counts` = `{ Storyteller: N, Framer: N, ... }`

**Step 3 — Pull verbatim quotes**
One Claude call. Prompt: given all 10 transcripts + mode scores, select one verbatim quote per mode that appeared. Claude must return exact text, no paraphrase, no em dashes.

**Step 4 — Write VTS commentary per quote**
One Claude call. Given quotes + modes, write one short VTS commentary per quote using only the permitted metacognitive stems from `newplan.md`. No evaluative praise.

**Step 5 — Write "Your Range" paragraphs**
One Claude call. One paragraph per mode that appeared, conditional/observational language. One sentence naming each absent mode without judgment.

**Step 6 — Write "How Might This Show Up?"**
One Claude call. One paragraph, conditional voice, references home base + at least one range mode.

**Steps 3–6 can run in parallel** (same as how `analyzeArchetype()` runs steps 2–4 in `Promise.all`).

**Output JSON structure** (stored via `course_report_s3_key`):

```json
{
  "home_base": "Framer",
  "range_modes": ["Artist"],
  "absent_modes": ["Storyteller", "Archivist", "Integrator"],
  "mode_counts": {
    "Storyteller": 0,
    "Framer": 6,
    "Archivist": 0,
    "Artist": 3,
    "Integrator": 1
  },
  "report": {
    "fixed_intro": "This portrait emerges from your own words...",
    "how_you_see": "...",
    "quotes_and_meanings": [
      { "mode": "Framer", "quote": "...", "vts_commentary": "..." }
    ],
    "your_range": [
      { "mode": "Framer", "paragraph": "..." },
      { "mode": "Artist", "paragraph": "..." }
    ],
    "absent_modes_sentence": "The Storyteller, Archivist, and Integrator modes did not appear across these ten transcripts.",
    "how_might_this_show_up": "...",
    "home_base_archetype_description": "..." // copied exactly from ARCHETYPE_DESCRIPTIONS in archetype.service.js
  }
}
```

**GiR Report Rules (enforced in Claude prompt):**

- Fixed intro paragraph is identical in every report — never altered (text stored as constant in code)
- No em dashes anywhere in the report
- No fabricated quotes — verbatim only
- No evaluative praise in VTS commentary (no "rare", "insightful", "brilliant", etc.)
- One home base only
- Never rank the range (2 modes is not less developed than 5)
- Name absent modes without judgment in one plain sentence — no speculation
- Conditional language throughout: "it seems", "appears to", "might suggest"

**PDF:** New GiR PDF layout (separate from lesson report layout) generated in `pdf.service.js`, uploaded to S3, key stored in `course_report_s3_key`.

---

## API Design

Base path: `/api/v1/courses`. All routes require `authenticate` middleware.

---

### User-Facing Routes

#### `GET /api/v1/courses`

List all courses with the authenticated user's progress per course.

**Response:**

```json
{
  "courses": [
    {
      "id": 1,
      "name": "The Storyteller",
      "subtitle": "NARRATIVE MAKER",
      "description": "...",
      "image_url": "<presigned>",
      "sort_order": 1,
      "user_progress": {
        "lessons_completed": 7,
        "total_lessons": 10,
        "status": "in_progress"
      }
    }
  ]
}
```

`status` values: `"not_started"` | `"in_progress"` | `"completed"`

---

#### `GET /api/v1/courses/:courseId`

Course detail with ordered lesson list and per-lesson status for the user.

**Response:**

```json
{
  "course": { "...course fields...", "image_url": "<presigned>" },
  "lessons": [
    {
      "id": 1,
      "sort_order": 1,
      "title": "First Impressions",
      "prompt_count": 3,
      "status": "completed",
      "attempt_id": 12
    }
  ],
  "full_report_available": false
}
```

`status` values: `"locked"` | `"not_started"` | `"in_progress"` | `"completed"`

Lock logic: first lesson (lowest `sort_order`) always unlocked. Lesson N is `"locked"` if lesson N-1 `status !== "completed"`. Computed in JS from a single query of all attempts for this user + course.

---

#### `GET /api/v1/courses/:courseId/lessons/:lessonId/intro`

Returns the 2 intro slides for a lesson. Both slides are derived at runtime — no separate DB table queried.

- Slide 1: built from `CourseLesson.sort_order` + `CourseLesson.title`
- Slide 2: pulled from `ARCHETYPE_DESCRIPTIONS[course.name]` constant in `archetype.service.js`

**Response:**

```json
{
  "slides": [
    { "slide_number": 1, "content": "LESSON 1\nThe Storyteller" },
    {
      "slide_number": 2,
      "content": "You see the world through narrative, meaning, and human connection."
    }
  ]
}
```

---

#### `GET /api/v1/courses/:courseId/lessons/:lessonId/artwork`

The artwork for the lesson. Fetched from `Lesson_Contents`.

**Response:**

```json
{
  "artwork": {
    "artwork_title": "The Art of Painting",
    "artwork_info": "In The Art of Painting, Johannes Vermeer...",
    "image_url": "<presigned S3 URL>"
  }
}
```

---

#### `POST /api/v1/courses/:courseId/lessons/:lessonId/start`

Creates (or returns existing) a `User_Lesson_Attempts` row. Validates lesson is not locked. Also creates `User_Course_Progress` row if first lesson of the course.

**Response:**

```json
{
  "attempt": {
    "id": 42,
    "status": "in_progress",
    "created_at": "2026-05-11T..."
  }
}
```

---

#### `GET /api/v1/courses/:courseId/lessons/:lessonId/prompts`

Returns the 3 prompts (from `Lesson_Contents.prompts_json`) with the user's current response state for each (from `User_Prompt_Responses`).

**Response:**

```json
{
  "attempt_id": 42,
  "prompts": [
    {
      "prompt_number": 1,
      "prompt_text": "What do you notice first?",
      "response": {
        "id": 55,
        "audio_url": "<presigned or null>",
        "transcript_text": "...",
        "submitted_at": "2026-05-12T10:00:00.000Z"
      }
    }
  ]
}
```

---

#### `POST /api/v1/courses/attempts/:attemptId/prompts/:promptNumber/audio`

Upload audio for a prompt. Transcribes via ElevenLabs (reusing `transcribe.service.js → transcribeAudio()`). Stores audio S3 key + transcript in `User_Prompt_Responses` matched by `prompt_number`.

**Request:** `multipart/form-data`, field: `audio`

**Response:**

```json
{
  "response": {
    "id": 55,
    "transcript_text": "I notice the light coming from the left...",
    "duration_seconds": 42.3,
    "audio_url": "<presigned>"
  }
}
```

---

#### `PATCH /api/v1/courses/attempts/:attemptId/prompts/:promptNumber/transcript`

Edit the transcript text after transcription (user can correct before submitting).

**Request body:** `{ "transcript_text": "..." }`

---

#### `POST /api/v1/courses/attempts/:attemptId/prompts/:promptNumber/submit`

Mark a single prompt response as submitted. Sets `submitted_at = now`.

---

#### `POST /api/v1/courses/attempts/:attemptId/complete`

Called after all 3 prompts are submitted. Runs the per-lesson AI pipeline:

1. Validate all 3 prompts have `submitted_at IS NOT NULL`
2. Concatenate 3 transcript texts
3. Call `analyzeArchetype({ transcript })` — existing service, no changes
4. Generate PDF → store key in `report_s3_key`
5. Update `User_Lesson_Attempts.status = 'completed'`, `completed_at = now`, store `report_s3_key`
6. Increment `User_Course_Progress.lessons_completed`
7. If `lessons_completed === 10`: set `User_Course_Progress.status = 'completed'`, `completed_at = now`

**Response:**

```json
{
  "attempt": { "id": 42, "status": "completed", "completed_at": "..." },
  "next_lesson_unlocked": true,
  "all_lessons_complete": false
}
```

---

#### `GET /api/v1/courses/attempts/:attemptId/report`

Returns the per-lesson report JSON from S3 (no Claude re-run).

**Response:** Same structure as `analyzeArchetype()` output:

```json
{
  "archetype": { "name": "Framer", "subtitle": "Structure Seeker" },
  "teaserCards": ["...", "...", "...", "..."],
  "quotesAndMeanings": [{ "quote": "...", "meaning": "..." }],
  "report": {
    "intro": "...",
    "sections": [{ "heading": "...", "body": "..." }]
  }
}
```

---

#### `GET /api/v1/courses/attempts/:attemptId/report/pdf`

Presigned URL for the per-lesson report PDF.

**Response:** `{ "pdf_url": "<presigned 1-hour URL>" }`

---

#### `GET /api/v1/courses/:courseId/report`

Available only when `User_Course_Progress.status = 'completed'`.

If `course_report_s3_key` already exists: fetches the cached report from S3 and returns it.
If not yet generated: triggers the Growth in Range pipeline (Pipeline B above):

1. Fetch all 10 `User_Lesson_Attempts` for this user + course
2. For each attempt, fetch the 3 `User_Prompt_Responses` transcripts
3. Run `analyzeGrowthInRange({ lessons: [{ lesson_number, transcript_text }] })`
4. Generate GiR PDF → upload to S3
5. Store key → `course_report_s3_key`, update `User_Course_Progress`

**Response:**

```json
{
  "report": {
    "home_base": "Framer",
    "range_modes": ["Artist"],
    "absent_modes": ["Storyteller", "Archivist", "Integrator"],
    "fixed_intro": "This portrait emerges from your own words...",
    "how_you_see": "...",
    "quotes_and_meanings": [
      { "mode": "Framer", "quote": "...", "vts_commentary": "..." }
    ],
    "your_range": [{ "mode": "Framer", "paragraph": "..." }],
    "absent_modes_sentence": "...",
    "how_might_this_show_up": "...",
    "home_base_archetype_description": "..."
  },
  "pdf_url": "<presigned>"
}
```

---

### Admin Routes (stubbed for now — full build when admin panel is introduced)

All require `authenticate` + `isAdmin` middleware.

```
POST   /api/v1/courses                                         Create a course
PUT    /api/v1/courses/:courseId                               Update course metadata + icon
PATCH  /api/v1/courses/:courseId/toggle-active                 Toggle is_active
PATCH  /api/v1/courses/reorder                                 Bulk update sort_order

POST   /api/v1/courses/:courseId/lessons                       Create a lesson
PUT    /api/v1/courses/:courseId/lessons/:lessonId             Update lesson metadata
PATCH  /api/v1/courses/:courseId/lessons/reorder               Bulk reorder lessons

POST   /api/v1/courses/:courseId/lessons/:lessonId/artwork     Create/replace artwork + image upload
PUT    /api/v1/courses/:courseId/lessons/:lessonId/artwork     Update artwork info/image

POST   /api/v1/courses/:courseId/lessons/:lessonId/prompts          Add a prompt
PUT    /api/v1/courses/:courseId/lessons/:lessonId/prompts/:promptId Update prompt text
DELETE /api/v1/courses/:courseId/lessons/:lessonId/prompts/:promptId Delete a prompt

GET    /api/v1/admin/users                                     List all users (paginated)
GET    /api/v1/admin/users/:userId                             User detail + all course progress
GET    /api/v1/admin/users/:userId/courses/:courseId           User progress for one course
GET    /api/v1/admin/attempts/:attemptId/report/pdf            Download any user's lesson PDF
GET    /api/v1/admin/courses/:courseId/report/:userId          Download any user's GiR PDF
```

No new tables needed for the admin panel — all data already exists in the schema above.

---

## Complete User-Facing Route Table

| Method | Path                                                               | Description                                  |
| ------ | ------------------------------------------------------------------ | -------------------------------------------- |
| GET    | `/api/v1/courses`                                                  | List courses with user progress              |
| GET    | `/api/v1/courses/:courseId`                                        | Course detail + lesson list with lock/status |
| GET    | `/api/v1/courses/:courseId/lessons/:lessonId/intro`                | Lesson intro slides                          |
| GET    | `/api/v1/courses/:courseId/lessons/:lessonId/artwork`              | Lesson artwork                               |
| POST   | `/api/v1/courses/:courseId/lessons/:lessonId/start`                | Start lesson (create attempt)                |
| GET    | `/api/v1/courses/:courseId/lessons/:lessonId/prompts`              | Prompts + user response state                |
| POST   | `/api/v1/courses/attempts/:attemptId/prompts/:promptId/audio`      | Upload + transcribe audio                    |
| PATCH  | `/api/v1/courses/attempts/:attemptId/prompts/:promptId/transcript` | Edit transcript                              |
| POST   | `/api/v1/courses/attempts/:attemptId/prompts/:promptId/submit`     | Submit prompt                                |
| POST   | `/api/v1/courses/attempts/:attemptId/complete`                     | Complete lesson, generate AI report          |
| GET    | `/api/v1/courses/attempts/:attemptId/report`                       | Get lesson report JSON                       |
| GET    | `/api/v1/courses/attempts/:attemptId/report/pdf`                   | Get lesson report PDF URL                    |
| GET    | `/api/v1/courses/:courseId/report`                                 | Get Growth in Range report (all 10 lessons)  |

---

## Files to Create / Edit

### Migrations (run in order)

```
migrations/20260512000000-create-courses.js
migrations/20260512000001-create-course-lessons.js
migrations/20260512000002-create-lesson-contents.js
migrations/20260512000003-create-user-course-progress.js
migrations/20260512000004-create-user-lesson-attempts.js
migrations/20260512000005-create-user-prompt-responses.js
```

### Models (new files)

```
models/course.js
models/courselesson.js
models/lessoncontent.js
models/usercourseprogress.js
models/userlessonattempt.js
models/userpromptresponse.js
```

### Edit existing models

- `models/user.js` — add `hasMany` for `UserCourseProgress` and `UserLessonAttempt`

### Seeders

```
seeders/20260512000000-seed-courses.js        -- 5 archetype courses
seeders/20260512000001-seed-course-lessons.js -- 10 lessons + artworks + prompts per course
```

### Services

```
services/course.service.js          -- all DB read/write logic for courses, lessons, progress
```

Edit `services/archetype.service.js`:

- Add `analyzeGrowthInRange({ lessons })` function implementing the 8-step GiR pipeline
- Reuses existing `callClaude()` helper and `ARCHETYPE_DESCRIPTIONS` constant already in that file
- GiR-specific Claude prompts (scoring, quotes, VTS commentary, range paragraphs, how might this show up) live as constants in this function

Edit `services/pdf.service.js`:

- Add `generateGrowthInRangePdf(result)` — new PDF layout for the GiR report
- Add `uploadGrowthInRangePdfToS3(pdfBuffer)` — uploads to `reports/courses/{uuid}.pdf`

Reuses (no changes):

- `services/transcribe.service.js → transcribeAudio()` — prompt audio upload + transcription
- `services/s3.service.js → getPresignedUrl()` — all presigned URLs

### Middlewares (new files)

```
middlewares/course-audio-s3.middleware.js   -- multer-s3 for prompt audio (pattern: transcribe audio upload)
middlewares/course-image-s3.middleware.js   -- multer-s3 for artwork images (pattern: icon-upload-s3.middleware.js)
```

### Validation

```
validations/course.validation.js   -- Zod schemas for all route inputs
```

### Controller + Routes

```
controller/course.controller.js
routes/course.routes.js
```

Edit `routes/index.route.js`:

```js
const courseRoutes = require("./course.routes");
router.use("/courses", courseRoutes);
```

---

## Key Implementation Notes

**`report_s3_key` — stores the lesson PDF, also acts as cache indicator**
At lesson completion, generate the PDF, upload to S3, store the key in `report_s3_key`. `GET .../report` fetches the report data from S3 — no Claude re-run on retrieval.

**Same pattern for GiR**
At `GET /courses/:courseId/report`, if `course_report_s3_key` is already populated, return the cached report from S3. Only run Claude if this field is null (first request after all 10 lessons complete).

**GiR fixed intro paragraph (stored as constant in code)**

```
"This portrait emerges from your own words. Over the course of our sessions, we recorded and
transcribed how you thought out loud in front of ten works of art. Each image came with its own
set of thinking prompts, designed to draw out different ways of looking and making meaning.
What stayed the same was you. This is your Growth in Range portrait. What follows is not a fixed
identity and it is not a score. It is a map of how many of the five perceptual modes you drew on
across ten encounters with progressively more challenging images: which modes appear to be home
for you, which others became available, and which did not appear in this sequence. We did not
assign this. We found it in your own words, across ten separate encounters, over time."
```

**GiR `home_base_archetype_description`**
The full archetype description for the home base mode is already stored as `ARCHETYPE_DESCRIPTIONS[archetypeName]` in `services/archetype.service.js`. The GiR function reads directly from that constant — no duplication, no external fetch.

**Sequential unlock — single query**
`GET /courses/:courseId` queries all `User_Lesson_Attempts` for `(user_id, course_id)` in one call, builds a Map of `lesson_id → status`, then iterates `Course_Lessons` ordered by `sort_order` applying lock logic in JS. No N+1 queries.

**Cross-course unlock — enforced in code, no extra column**
`POST .../start` checks: if `Courses.sort_order > 1`, look up `User_Course_Progress.status` for the previous course (`sort_order - 1`). If not `'completed'` → 403. No new DB field needed — `status` already exists on `User_Course_Progress`.

**`attempts` prefix for prompt routes**
Once the frontend has the `attempt_id` (returned from `start`), all prompt routes use `/attempts/:attemptId/...` instead of re-specifying `/:courseId/lessons/:lessonId/...`. Shorter paths, no redundant params.

**Admin panel (future)**
No new tables needed. Admin routes will be registered under `/api/v1/admin/` prefix using the same controller/service layer. A separate `routes/admin.routes.js` will be added when the admin panel frontend is introduced.
