export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        pass: "TVOJ_APP_PASSWORD"
      }
    });

    await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: "info@promar.hr",
      subject: "Nova poruka sa Promar.hr",
      text: `
Ime: ${body.name}
Email: ${body.email}
Mobitel: ${body.phone}
Usluga: ${body.service}

Poruka:
${body.message}
      `
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
