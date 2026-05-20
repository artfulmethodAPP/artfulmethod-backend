"use strict";

/**
 * One-time backfill script.
 * Reads all UserLessonAttempt rows that have report_json_s3_key but no report_json,
 * fetches each JSON from S3, and writes it to the report_json DB column.
 * Also backfills UserCourseProgress.course_report_json from course_report_s3_key.
 *
 * Run once:
 *   node scripts/backfill-report-json.js
 */

require("dotenv").config();

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3.config");
const { UserLessonAttempt, UserCourseProgress } = require("../models");

const fetchJsonFromS3 = async (key) => {
  const res = await s3.send(
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key }),
  );
  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
};

const backfillLessonAttempts = async () => {
  const attempts = await UserLessonAttempt.findAll({
    where: { status: "completed" },
    attributes: ["id", "report_json_s3_key", "report_json"],
  });

  const toFix = attempts.filter((a) => a.report_json_s3_key && !a.report_json);
  console.log(`Found ${toFix.length} lesson attempts to backfill`);

  let success = 0;
  let failed = 0;

  for (const attempt of toFix) {
    try {
      const json = await fetchJsonFromS3(attempt.report_json_s3_key);
      await attempt.update({ report_json: json });
      console.log(`  ✓ Attempt ${attempt.id}`);
      success++;
    } catch (err) {
      console.error(`  ✗ Attempt ${attempt.id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`Lesson attempts: ${success} backfilled, ${failed} failed`);
};

const backfillCourseProgress = async () => {
  const records = await UserCourseProgress.findAll({
    where: { status: "completed" },
    attributes: ["id", "course_report_s3_key", "course_report_json"],
  });

  const toFix = records.filter((r) => r.course_report_s3_key && !r.course_report_json);
  console.log(`Found ${toFix.length} course progress records to backfill`);

  let success = 0;
  let failed = 0;

  for (const record of toFix) {
    try {
      const json = await fetchJsonFromS3(record.course_report_s3_key);
      await record.update({ course_report_json: json });
      console.log(`  ✓ CourseProgress ${record.id}`);
      success++;
    } catch (err) {
      console.error(`  ✗ CourseProgress ${record.id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`Course progress: ${success} backfilled, ${failed} failed`);
};

(async () => {
  try {
    console.log("Starting backfill...\n");
    await backfillLessonAttempts();
    console.log("");
    await backfillCourseProgress();
    console.log("\nDone.");
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
})();
