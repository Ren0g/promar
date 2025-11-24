import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.mailchannels.net",
      port: 587,
      secure: false,
      auth: {
        user: "info@promar.hr",
        pass: "OVDJE_STAVI_LOZINKU"
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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
