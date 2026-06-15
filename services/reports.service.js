const { AiReport, UserCourseProgress, Archetype } = require("../models");
const { getPresignedUrl } = require("./s3.service");
const { GIR_FIXED_INTRO } = require("./archetype.service");

const truncate = (text, max = 240) => {
  const t = (text || "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
};

const getAllUserReports = async (userId) => {
  const [aiReports, progresses, archetypes] = await Promise.all([
    AiReport.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    }),
    UserCourseProgress.findAll({
      where: { user_id: userId, status: "completed" },
      order: [["completed_at", "DESC"]],
    }),
    Archetype.findAll({ attributes: ["name", "icon_url"] }),
  ]);

  const iconByName = {};
  for (const a of archetypes) {
    if (a.name) iconByName[a.name.toLowerCase()] = a.icon_url || null;
  }
  const iconFor = (name) =>
    name ? iconByName[name.toLowerCase()] ?? null : null;

  const items = [];

  // 1. Onboarding archetype reports (skip failed runs with no JSON)
  for (const r of aiReports) {
    const json = r.report_json;
    if (!json) continue;
    const name = json?.archetype?.name ?? null;
    items.push({
      type: "archetype",
      title: "My Archetype Report",
      report_id: r.id,
      archetype: name,
      excerpt: truncate(json?.report?.intro || ""),
      image_url: iconFor(name),
      created_at: r.created_at,
    });
  }

  // 2. Growth in Range course reports.
  for (const p of progresses) {
    const json = p.course_report_json || null;
    const homeBase = json?.home_base ?? null;
    items.push({
      type: "growth_in_range",
      title: "Growth In Range",
      report_id: p.course_id,
      archetype: homeBase,
      excerpt: truncate(
        json?.report?.overview || json?.report?.fixed_intro || GIR_FIXED_INTRO,
      ),
      image_url: iconFor(homeBase),
      created_at: p.completed_at || p.updated_at,
    });
  }

  // Oldest first across all report types (ascending — earliest created shows first).
  items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return items;
};

// ─── Single Report
const getReportById = async (userId, reportId, type) => {
  const AppError = require("../utils/app-error");

  switch (type) {
    case "archetype": {
      const report = await AiReport.findOne({
        where: { id: reportId, user_id: userId },
      });
      if (!report || !report.report_json) {
        throw new AppError("Report not found", 404, "NOT_FOUND");
      }
      const pdf_url = report.pdf_s3_key
        ? await getPresignedUrl(report.pdf_s3_key)
        : null;
      return {
        type: "archetype",
        report_id: report.id,
        ...report.report_json,
        pdf_url,
        created_at: report.created_at,
      };
    }

    case "growth_in_range": {
      const { getCourseReport } = require("./course.service");
      const data = await getCourseReport(reportId, userId);
      return { type: "growth_in_range", report_id: Number(reportId), ...data };
    }

    default:
      throw new AppError(
        "Invalid report type. Use one of: archetype, growth_in_range",
        400,
        "VALIDATION_ERROR",
      );
  }
};

module.exports = { getAllUserReports, getReportById };
