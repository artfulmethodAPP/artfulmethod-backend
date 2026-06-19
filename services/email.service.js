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

// ─── Contact / "Get in touch" email to the support inbox ──────────────────────

const sendContactEmail = async ({ userId, fromName, fromEmail, message }) => {
  const to = process.env.SUPPORT_EMAIL || FROM_ADDRESS;
  const displayName = fromName || fromEmail || `User #${userId}`;
  const subject = `Get in touch — ${displayName}`;

  // Escape user-supplied values so they can't inject markup into the email.
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const initial = (fromName || fromEmail || "U").trim().charAt(0).toUpperCase();
  const sentAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to,
      replyTo: fromEmail || undefined,
      subject,
      html: `
        <div style="background:#f4f4f5; padding:24px 0; font-family:Arial, Helvetica, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto;">
            <tr>
              <td style="background:#1A1A1A; padding:24px 32px; border-radius:12px 12px 0 0;">
                <p style="margin:0; color:#fff; font-size:12px; letter-spacing:2px; text-transform:uppercase; opacity:.6;">Artful Method</p>
                <h1 style="margin:6px 0 0; color:#fff; font-size:20px; font-weight:700;">New "Get in touch" message</h1>
              </td>
            </tr>
            <tr>
              <td style="background:#fff; padding:28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin-bottom:20px;">
                  <tr>
                    <td style="width:44px; vertical-align:top;">
                      <div style="width:40px; height:40px; border-radius:50%; background:#1A1A1A; color:#fff; font-size:16px; font-weight:700; text-align:center; line-height:40px;">${esc(initial)}</div>
                    </td>
                    <td style="vertical-align:top; padding-left:12px;">
                      <p style="margin:0; font-size:15px; font-weight:700; color:#111;">${esc(fromName || "—")}</p>
                      <p style="margin:2px 0 0; font-size:13px; color:#666;">
                        <a href="mailto:${esc(fromEmail || "")}" style="color:#666; text-decoration:none;">${esc(fromEmail || "no email")}</a>
                        &nbsp;·&nbsp; User #${esc(userId)}
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#999;">Message</p>
                <div style="font-size:15px; line-height:1.6; color:#111; background:#f7f7f8; border-left:3px solid #1A1A1A; border-radius:6px; padding:16px 18px; white-space:pre-wrap;">${esc(message)}</div>

                <p style="margin:20px 0 0; font-size:13px; color:#444;">
                  Reply directly to ${esc(fromEmail || "this email")} to respond to ${esc(fromName || "the user")}.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#fff; padding:0 32px 24px; border-radius:0 0 12px 12px;">
                <hr style="border:none; border-top:1px solid #eee; margin:0 0 14px;" />
                <p style="margin:0; font-size:11px; color:#aaa;">Received ${esc(sentAt)} · © ${new Date().getFullYear()} Artful Method</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    await EmailLog.create({
      user_id: userId,
      email: to,
      email_type: "contact",
      subject,
      status: "sent",
      sent_at: new Date(),
    }).catch(() => {});
  } catch (error) {
    console.error("[sendContactEmail] error:", error.message);
    await EmailLog.create({
      user_id: userId,
      email: to,
      email_type: "contact",
      subject,
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    }).catch(() => {});
    // Non-fatal: the message is already saved to the user's feedback, so the
    // request still succeeds even if the support email fails to send.
  }
};

module.exports = { sendOTPEmail, sendResetPasswordLinkEmail, sendArchetypeReportEmail, sendCourseReportEmail, sendContactEmail };
