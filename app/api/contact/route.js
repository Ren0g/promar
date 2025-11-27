// Force Node.js runtime + disable all caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 587,
      secure: false,
      auth: {
        user: "info@promar.hr",
        pass: "OVDJE_STAVI_APP_PASSWORD"
      }
    });

    const info = await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: "info@promar.hr",
      subject: "Nova poruka sa Promar.hr",
      text: `
Ime i prezime: ${body.name}
Email: ${body.email}
Mobitel: ${body.phone}
Usluga: ${body.service}

Poruka:
${body.message}
      `
    });

    console.log("MAIL POSLAN:", info);

    return Response.json({ success: true });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
