const transporter = require("../config/email.config");
const { EmailLog, User } = require("../models");
const AppError = require("../utils/app-error");

const FROM_ADDRESS = "noreply@notification.artfulmethod.org";

const sendOTPEmail = async (email, otp_code, user_id) => {
  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp_code}</h1>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
      `,
    });

    await EmailLog.create({
      user_id,
      email,
      email_type: "otp",
      subject: "Email Verification OTP",
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    console.error("[sendOTPEmail] SMTP error:", error.message, error.code, error.response);
    await EmailLog.create({
      user_id,
      email,
      email_type: "otp",
      subject: "Email Verification OTP",
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    });

    throw new AppError("Failed to send OTP email", 500, "EMAIL_SEND_FAILED");
  }
};

const sendResetPasswordLinkEmail = async (email, resetLink, user_id) => {
  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "Forgotten password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #111;">
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">Password reset</h2>
          <p style="font-size: 14px; color: #444; margin-bottom: 24px;">
            Use the button below to set up a new password for your account. If you did not request to
            reset your password, ignore this email and the link will expire on its own within 1 hour.
          </p>
          <a href="${resetLink}"
             style="display: inline-block; background-color: #111; color: #fff; text-decoration: none;
                    font-size: 14px; font-weight: 700; letter-spacing: 1px; padding: 14px 32px;
                    border-radius: 4px; text-transform: uppercase;">
            RESET PASSWORD
          </a>
          <p style="font-size: 12px; color: #888; margin-top: 24px;">
            Link doesn't work? Copy and paste it into your browser:<br/>
            <span style="color: #444;">${resetLink}</span>
          </p>
          <p style="font-size: 11px; color: #aaa; margin-top: 32px;">© ${new Date().getFullYear()}</p>
        </div>
      `,
    });

    await EmailLog.create({
      user_id,
      email,
      email_type: "forgot-password",
      subject: "Forgotten password",
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    await EmailLog.create({
      user_id,
      email,
      email_type: "forgot-password",
      subject: "Forgotten password",
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    });

    throw new AppError("Failed to send reset password email", 500, "EMAIL_SEND_FAILED");
  }
};

// ─── Lesson Report Email ──────────────────────────────────────────────────────

const sendLessonReportEmail = async ({ userId, email, lessonTitle, lessonNumber, pdfBuffer }) => {
  const user = await User.findByPk(userId, { attributes: ["email_reports_enabled"] });
  if (!user?.email_reports_enabled) return;

  const subject = `Your Session ${lessonNumber} Report: ${lessonTitle}`;
  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #111; background: #fafafa;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1A1A1A;">Your Session ${lessonNumber} Report</h2>
          <p style="font-size: 14px; color: #444; margin-bottom: 6px;">
            You've completed <strong>${lessonTitle}</strong>.
          </p>
          <p style="font-size: 14px; color: #444; margin-bottom: 24px;">
            Your personal Aesthetic Archetype report for this session is attached as a PDF.
            It's yours to keep, you can return to it any time.
          </p>
          <p style="font-size: 12px; color: #888; margin-top: 32px;">© ${new Date().getFullYear()} Artful Method</p>
        </div>
      `,
      attachments: [
        {
          filename: `ArtfulMethod-Session-${lessonNumber}-Report.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await EmailLog.create({
      user_id: userId,
      email,
      email_type: "report",
      subject,
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    console.error("[sendLessonReportEmail] error:", error.message);
    await EmailLog.create({
      user_id: userId,
      email,
      email_type: "report",
      subject,
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    }).catch(() => {});
    // Non-fatal — lesson completion must not fail due to email
  }
};

// ─── Archetype Report Email (onboarding single-encounter portrait) ────────────

const sendArchetypeReportEmail = async ({ userId, email, archetypeName, pdfBuffer }) => {
  const user = await User.findByPk(userId, { attributes: ["email_reports_enabled"] });
  if (!user?.email_reports_enabled) return;

  const subject = `Your Aesthetic Archetype Report: The ${archetypeName}`;
  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #111; background: #fafafa;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1A1A1A;">Your Aesthetic Archetype Report</h2>
          <p style="font-size: 14px; color: #444; margin-bottom: 6px;">
            Your dominant archetype is <strong>The ${archetypeName}</strong>.
          </p>
          <p style="font-size: 14px; color: #444; margin-bottom: 24px;">
            Your personal Aesthetic Archetype report is attached as a PDF.
            It's yours to keep, you can return to it any time.
          </p>
          <p style="font-size: 12px; color: #888; margin-top: 32px;">© ${new Date().getFullYear()} Artful Method</p>
        </div>
      `,
      attachments: [
        {
          filename: `ArtfulMethod-Archetype-Report-${archetypeName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await EmailLog.create({
      user_id: userId,
      email,
      email_type: "report",
      subject,
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    console.error("[sendArchetypeReportEmail] error:", error.message);
    await EmailLog.create({
      user_id: userId,
      email,
      email_type: "report",
      subject,
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    }).catch(() => {});
    // Non-fatal: analysis response must not fail due to email
  }
};

// ─── Course Report Email (Growth in Range) ────────────────────────────────────

const sendCourseReportEmail = async ({ userId, email, courseName, pdfBuffer }) => {
  const user = await User.findByPk(userId, { attributes: ["email_reports_enabled"] });
  if (!user?.email_reports_enabled) return;

  const subject = `Your Growth in Range Report: ${courseName}`;
  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #111; background: #fafafa;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1A1A1A;">Your Growth in Range Report</h2>
          <p style="font-size: 14px; color: #444; margin-bottom: 6px;">
            Congratulations, you've completed <strong>${courseName}</strong>.
          </p>
          <p style="font-size: 14px; color: #444; margin-bottom: 24px;">
            Your full Growth in Range report is attached as a PDF. It maps how you moved across
            all five aesthetic archetypes throughout the course, yours to keep and revisit.
          </p>
          <p style="font-size: 12px; color: #888; margin-top: 32px;">© ${new Date().getFullYear()} Artful Method</p>
        </div>
      `,
      attachments: [
        {
          filename: `ArtfulMethod-${courseName.replace(/\s+/g, "-")}-GrowthInRange-Report.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await EmailLog.create({
      user_id: userId,
      email,
      email_type: "report",
      subject,
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    console.error("[sendCourseReportEmail] error:", error.message);
    await EmailLog.create({
      user_id: userId,
      email,
      email_type: "report",
      subject,
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    }).catch(() => {});
    // Non-fatal — course report response must not fail due to email
  }
};

module.exports = { sendOTPEmail, sendResetPasswordLinkEmail, sendArchetypeReportEmail, sendLessonReportEmail, sendCourseReportEmail };
