// Force Node.js runtime i gasimo caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import nodemailer from "nodemailer";

// URL loga
const LOGO_URL =
  "https://raw.githubusercontent.com/Ren0g/promar/6dd632d22033e7ac5939cff1a1b427872fcac79b/public/images/logo-dark.png";

// ----------------------------------------------------------------------------------
// HTML email (upit tebi)
// ----------------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------------
// HTML autoresponder (premium dizajn)
// ----------------------------------------------------------------------------------
function generateAutoReplyHtml(name) {
  return `
  <!DOCTYPE html>
  <html lang="hr">
  <head>
    <meta charset="UTF-8" />
    <title>Hvala na poruci – Promar</title>

    <style>
      body { background:#f4f4f4; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; }
      .container { max-width:650px; background:#fff; margin:30px auto; border-radius:12px; overflow:hidden; border:1px solid #eaeaea; }
      .top-bar { height:6px; background:#FB6A13; }
      .header { text-align:center; padding:30px 20px 20px; }
      .logo img { max-width:180px; margin-bottom:14px; }
      h2 { margin:0; font-size:24px; color:#FB6A13; font-weight:800; }
      p { font-size:16px; color:#444; line-height:1.7; }
      .content { padding:0 30px 30px; }
      .button { text-align:center; margin:25px 0; }
      .button a { background:#FB6A13; color:#fff; padding:12px 26px; border-radius:6px; text-decoration:none; font-size:16px; }
      .section-title { font-weight:700; margin-top:30px; font-size:17px; color:#333; }
      .footer { background:#fafafa; padding:20px; text-align:center; font-size:13px; color:#777; border-top:1px solid #eee; }
      .social a { color:#FB6A13; text-decoration:none; margin:0 6px; }
      @media(max-width:600px) { .container{border-radius:0;margin:0;} .content{padding:0 20px 20px;} }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="top-bar"></div>

      <div class="header">
        <div class="logo"><img src="${LOGO_URL}" alt="Promar logo"></div>
        <h2>Hvala na vašoj poruci${name ? ", " + name : ""}!</h2>
      </div>

      <div class="content">
        <p>
          Zaprimili smo vaš upit i javit ćemo vam se u najkraćem mogućem roku.
          Ovo je automatska potvrda da je vaša poruka uspješno zaprimljena.
        </p>

        <div class="button">
          <a href="https://www.promar.hr" target="_blank">Posjeti web stranicu</a>
        </div>

        <div class="section-title">Što slijedi dalje?</div>
        <p>
          • Naš tim će pregledati vaš upit.<br>
          • Kontaktirat ćemo vas povratno sa detaljima.<br>
          • Ako je potrebno više informacija – javit ćemo se dodatno.
        </p>

        <div class="section-title">Imate dodatno pitanje?</div>
        <p>Slobodno nam se obratite — uvijek smo tu da pomognemo.</p>
      </div>

      <div class="footer">
        Srdačan pozdrav,<br>
        <strong>Promar</strong><br>
        <a href="https://www.promar.hr" style="color:#FB6A13;text-decoration:none;">www.promar.hr</a>
        <div class="social">
          <a href="https://www.instagram.com/">Instagram</a> |
          <a href="https://www.facebook.com/">Facebook</a>
        </div>
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

// ----------------------------------------------------------------------------------
// MAIN HANDLER
// ----------------------------------------------------------------------------------
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

    // 1️⃣ MAIL TEBI + CC
    await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: "info@promar.hr",
      cc: "renato.galekovic@gmail.com",
      subject: `Novi upit – ${body.name}`,
      text: `
Ime i prezime: ${body.name}
Email: ${body.email}
Mobitel: ${body.phone}
Usluga: ${body.service}
Poruka:
${body.message}
      `,
      html: generateHtmlEmail(body)
    });

    // 2️⃣ AUTOMATSKI ODGOVOR KORISNIKU
    await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: body.email,
      subject: "Hvala na vašoj poruci – Promar",
      text: `
Hvala na vašem upitu!
Zaprimili smo vaš zahtjev i ubrzo ćemo vam se javiti.
      `,
      html: generateAutoReplyHtml(body.name)
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
