import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.zoho.eu";
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_USER = process.env.SMTP_USER || "info@promar.hr";
  const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
  const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

  if (!SMTP_PASSWORD) {
    return Response.json({
      ok: false,
      stage: "config",
      smtpConfigured: false,
      recaptchaConfigured: Boolean(RECAPTCHA_SECRET)
    }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    }
  });

  try {
    await transporter.verify();
    return Response.json({
      ok: true,
      stage: "smtp",
      smtpConfigured: true,
      recaptchaConfigured: Boolean(RECAPTCHA_SECRET)
    });
  } catch (err) {
    return Response.json({
      ok: false,
      stage: "smtp",
      smtpConfigured: true,
      recaptchaConfigured: Boolean(RECAPTCHA_SECRET),
      code: err?.code || null,
      responseCode: err?.responseCode || null,
      command: err?.command || null
    }, { status: 500 });
  }
}
