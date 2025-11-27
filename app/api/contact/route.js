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
      
      .header {
        display:flex;
        align-items:center;
        gap:20px;
        padding-bottom:20px;
        border-bottom:2px solid #FB6A13;
      }

      .logo img {
        width:120px; /* SMANJENO (50%+) */
        height:auto;
        display:block;
      }

      .header-title {
        font-size:20px;
        color:#FB6A13;
        font-weight:800;
        line-height:1.3;
      }

      .section { margin-top:22px; }
      .label { font-weight:700; font-size:14px; margin-bottom:4px; color:#333; }
      .value { background:#fafafa; border:1px solid #eee; border-radius:6px; padding:12px; font-size:15px; color:#444; white-space:pre-wrap; line-height:1.5; }

      .footer {
        margin-top:30px;
        font-size:13px;
        color:#777;
        text-align:center;
        padding-top:10px;
        border-top:1px solid #eee;
      }
    </style>
  </head>

  <body>
    <div class="container">
      
      <div class="header">
        <div class="logo">
          <img src="${LOGO_URL}" alt="Promar logo" />
        </div>
        <div class="header-title">
          Promar<br/>
          <span style="font-size:14px; font-weight:500; color:#555;">
            agencija za digitalna rješenja
          </span>
        </div>
      </div>

      <div class="section"><div class="label">Ime i prezime:</div><div class="value">${data.name}</div></div>
      <div class="section"><div class="label">Email:</div><div class="value">${data.email}</div></div>
      <div class="section"><div class="label">Mobitel:</div><div class="value">${data.phone}</div></div>
      <div class="section"><div class="label">Usluga:</div><div class="value">${data.service}</div></div>
      <div class="section"><div class="label">Poruka:</div><div class="value">${data.message}</div></div>

      <div class="footer">
        Promar — agencija za digitalna rješenja<br/>
        Ova poruka je poslana preko kontakt forme na <strong>www.promar.hr</strong>.
      </div>
    </div>
  </body>
  </html>
`;
}

// ----------------------------------------------------------------------------------
// PREMIUM HTML autoresponder (s tvojim izmjenama)
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
      
      .header {
        display:flex;
        align-items:center;
        gap:20px;
        padding:30px 30px 0;
      }

      .logo img {
        width:120px;  /* SMANJENO 50% */
        height:auto;
      }

      h2 {
        margin:0;
        font-size:22px;
        color:#FB6A13;
        font-weight:800;
      }

      .subtitle {
        font-size:14px;
        color:#555;
      }

      .content { padding:20px 30px 30px; }
      p { font-size:16px; color:#444; line-height:1.7; }

      .button { text-align:center; margin:25px 0; }
      .button a { background:#FB6A13; color:#fff; padding:12px 26px; border-radius:6px; text-decoration:none; font-size:16px; }

      .section-title { font-weight:700; margin-top:30px; font-size:17px; color:#333; }

      .footer {
        background:#fafafa;
        padding:20px;
        text-align:center;
        font-size:13px;
        color:#777;
        border-top:1px solid #eee;
      }

      @media(max-width:600px) {
        .container { border-radius:0; margin:0; }
        .header { flex-direction:column; text-align:center; }
      }
    </style>
  </head>

  <body>
    <div class="container">
      
      <div class="top-bar"></div>

      <div class="header">
        <div class="logo">
          <img src="${LOGO_URL}" alt="Promar logo" />
        </div>
        <div>
          <h2>Hvala na vašoj poruci${name ? ", " + name : ""}!</h2>
          <div class="subtitle">agencija za digitalna rješenja</div>
        </div>
      </div>

      <div class="content">
        <p>
          Zaprimili smo vašu poruku i javit ćemo vam se povratno u najkraćem mogućem roku.
          Ovo je automatska potvrda da je vaš upit uspješno zaprimljen.
        </p>

        <div class="button">
          <a href="https://www.promar.hr" target="_blank">Posjeti web stranicu</a>
        </div>

        <div class="section-title">Što slijedi dalje?</div>
        <p>
          • Naš tim će pregledati vaš upit.<br/>
          • Kontaktirat ćemo vas povratno s detaljima.<br/>
          • Ako je potrebno više informacija – javit ćemo se dodatno.
        </p>

        <div class="section-title">Imate dodatno pitanje?</div>
        <p>
          Slobodno nam se obratite — uvijek smo tu da pomognemo.
        </p>
      </div>

      <div class="footer">
        Promar — agencija za digitalna rješenja<br/>
        <a href="https://www.promar.hr" style="color:#FB6A13;text-decoration:none;">www.promar.hr</a>
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
      html: generateHtmlEmail(body)
    });

    // 2️⃣ AUTOMATSKI ODGOVOR KORISNIKU
    await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: body.email,
      subject: "Hvala na vašoj poruci – Promar",
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
