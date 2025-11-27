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

    return Response.json({ success: true });

  } catch (err) {
    // 🔥 umjesto console.error → vraćamo ERROR u response
    return Response.json(
      { success: false, message: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
