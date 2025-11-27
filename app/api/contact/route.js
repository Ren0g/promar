// Force Node.js runtime i gasimo caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import nodemailer from "nodemailer";

// URL loga
const LOGO_URL =
  "https://raw.githubusercontent.com/Ren0g/promar/6dd632d22033e7ac5939cff1a1b427872fcac79b/public/images/logo-dark.png";

// HTML email template (glavni mail koji ide tebi)
function generateHtmlEmail(data) {
  return `
  <!DOCTYPE html>
  <html lang="hr">
  <head>
    <meta charset="UTF-8" />
    <title>Promar – Novi upit</title>

    <style>
      body { background:#f5f5f5; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; }
      .container { max-width:650px; background:#fff; margin:30px auto; padding:30px; border-radius:12px; border:1px solid #eaeaea; }
      .header { text-align:center; padding-bottom:20px; border-bottom:2px solid #FB6A13; }
      .logo img { max-width:180px; margin-bottom:12px; }
      h1 { margin:0; font-size:22px; color:#FB6A13; font-weight:800; }
      .section { margin-top:22px; }
      .label { font-weight:700; font-size:14px; margin-bottom:4px; color:#333; }
      .value { background:#fafafa; border:1px solid #eee; border-radius:6px; padding:12px; font-size:15px; color:#444; white-space:pre-wrap; line-height:1.5; }
      .footer { margin-top:30px; font-size:13px; color:#777; text-align:center; padding-top:10px; border-top:1px solid #eee; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo"><img src="${LOGO_URL}" alt="Promar logo" /></div>
        <h1>Novi upit preko kontakt forme</h1>
      </div>

      <div class="section"><div class="label">Ime i prezime:</div><div class="value">${data.name}</div></div>
      <div class="section"><div class="label">Email:</div><div class="value">${data.email}</div></div>
      <div class="section"><div class="label">Mobitel:</div><div class="value">${data.phone}</div></div>
      <div class="section"><div class="label">Usluga:</div><div class="value">${data.service}</div></div>
      <div class="section"><div class="label">Poruka:</div><div class="value">${data.message}</div></div>

      <div class="footer">
        Ova poruka je poslana preko kontakt forme na <strong>www.promar.hr</strong>.
      </div>
    </div>
  </body>
  </html>
`;
}

// HTML za automatski reply korisniku
function generateAutoReplyHtml(name) {
  return `
  <!DOCTYPE html>
  <html lang="hr">
  <head>
    <meta charset="UTF-8" />
    <title>Promar – Hvala na poruci</title>
    <style>
      body { background:#f5f5f5; font-family:Arial,Helvetica,sans-serif; padding:0; margin:0; }
      .container { max-width:600px; margin:30px auto; background:#fff; padding:30px; border-radius:12px; border:1px solid #eaeaea; }
      h2 { color:#FB6A13; font-size:22px; margin-top:0; }
      p { font-size:15px; color:#444; line-height:1.6; }
      .signature { margin-top:25px; border-top:1px solid #eee; padding-top:15px; font-size:14px; color:#666; }
      .logo img { max-width:160px; margin-bottom:20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <img src="${LOGO_URL}" alt="Promar logo" />
      </div>

      <h2>Hvala na vašoj poruci${name ? ", " + name : ""}!</h2>

      <p>
        Zaprimili smo vaš upit i javit ćemo vam se povratno u najkraćem mogućem roku.
      </p>

      <p>
        Ovo je automatska potvrda kako je vaša poruka uspješno zaprimljena.
      </p>

      <div class="signature">
        Srdačan pozdrav,<br/>
        <strong>Promar</strong><br/>
        www.promar.hr
      </div>
    </div>
  </body>
  </html>
  `;
}

// Anti-spam honeypot
function isSpam(body) {
  return !!body.honeypot;
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (isSpam(body)) return Response.json({ success: true });

    if (!body.name || !body.email || !body.message) {
      return Response.json({ success: false, error: "Nedostaju obavezna polja." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 587,
      secure: false,
      auth: {
        user: "info@promar.hr",
        pass: "BxzxeMJJrd38"
      },
      tls: { rejectUnauthorized: false }
    });

    // 1️⃣ — MAIL TEBI
    await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: "info@promar.hr",
      cc: "renato.galekovic@gmail.com",
      subject: `Novi upit - ${body.name}`,
      text: `
Ime i prezime: ${body.name}
Email: ${body.email}
Mobitel: ${body.phone}
Usluga: ${body.service}
Poruka: ${body.message}
      `,
      html: generateHtmlEmail(body)
    });

    // 2️⃣ — AUTOMATSKI ODGOVOR KORISNIKU
    await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: body.email,
      subject: "Hvala na vašoj poruci – Promar",
      text: `
Hvala na vašem upitu!

Zaprimili smo vaš zahtjev i javit ćemo se povratno u najkraćem mogućem roku.

Ovo je automatska potvrda kako je vaša poruka uspješno poslana.

Srdačan pozdrav,
Promar
      `,
      html: generateAutoReplyHtml(body.name)
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
