import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = req.body;

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

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
}
