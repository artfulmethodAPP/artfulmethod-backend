const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const {
  getAllReports,
  getReportById,
  deleteReport,
} = require("../controller/reports.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Aggregated user reports (archetype, growth in range)
 */

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     summary: Get all reports for the logged-in user
 *     description: |
 *       Returns the authenticated user's reports as one list, sorted oldest
 *       first. Combines two sources, each identified by `type`:
 *       - `archetype` — onboarding "My Archetype Report"
 *       - `growth_in_range` — completed-course "Growth In Range" report
 *
 *       Every completed course produces a `growth_in_range` card. Its report JSON
 *       is generated lazily on first open, so `archetype`/`image_url` may be null
 *       until the report has been generated via the detail endpoint.
 *
 *       Each item carries what a list/carousel card needs (title, archetype,
 *       excerpt, image_url, created_at) plus `type` + `report_id` to open the
 *       full report via `GET /api/v1/reports/{report_id}?type={type}`.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reports retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     reports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [archetype, growth_in_range]
 *                             description: Pass this back to GET /reports/{report_id}?type={type}
 *                           title:
 *                             type: string
 *                             description: One of "My Archetype Report" or "Growth In Range"
 *                             example: My Archetype Report
 *                           report_id:
 *                             type: integer
 *                             description: AiReport id, lesson attempt id, or course id depending on the report
 *                           archetype:
 *                             type: string
 *                             nullable: true
 *                             example: Storyteller
 *                           excerpt:
 *                             type: string
 *                           image_url:
 *                             type: string
 *                             nullable: true
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getAllReports);

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   get:
 *     summary: Get a single report by id
 *     description: |
 *       Returns the full detail payload for one report. `type` is required because
 *       `report_id` is only unique within a report type (an Ai_Reports id, a lesson
 *       attempt id, or a course id). Pass the `type` from the list item.
 *
 *       The response shape depends on `type`:
 *       - `archetype` → stored archetype report JSON (archetype, teaserCards, quotesAndMeanings, report) + `pdf_url`
 *       - `growth_in_range` → `{ report, pdf_url, prepared_for }` (Growth in Range; generated on first open)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: report_id from the list (AiReport id, lesson attempt id, or course id)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [archetype, growth_in_range]
 *         description: The report type, taken from the list item
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *       400:
 *         description: Invalid or missing type
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.get("/:id", authenticate, getReportById);

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   delete:
 *     summary: Delete a report (soft delete)
 *     description: |
 *       Soft-deletes a single report so it stops appearing in `GET /api/v1/reports`.
 *       Nothing is permanently removed — the data is retained and only hidden:
 *       - `archetype` → the Ai_Reports row is marked deleted (`deleted_at`)
 *       - `growth_in_range` → only the report is hidden (`course_report_deleted_at`);
 *         the underlying course progress/completion is kept intact.
 *
 *       `type` is required because `report_id` is only unique within a report type.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: report_id from the list (AiReport id for archetype, course id for growth_in_range)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [archetype, growth_in_range]
 *         description: The report type, taken from the list item
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Report deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [archetype, growth_in_range]
 *                     report_id:
 *                       type: integer
 *       400:
 *         description: Invalid or missing type
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.delete("/:id", authenticate, deleteReport);

module.exports = router;
