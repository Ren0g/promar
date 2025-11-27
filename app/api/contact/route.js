// Force Node.js runtime i gasimo caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import nodemailer from "nodemailer";

// URL loga
const LOGO_URL =
  "https://raw.githubusercontent.com/Ren0g/promar/6dd632d22033e7ac5939cff1a1b427872fcac79b/public/images/logo-dark.png";

/* ============================================================================
   HTML TEMPLATE — MAIL KOJI STIŽE TEBI
============================================================================ */
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

      /* UNIVERSAL HEADER */
      .header { text-align:center; padding-bottom:20px; border-bottom:2px solid #FB6A13; }
      .header-inner {
        display:flex;
        align-items:center;
        justify-content:center;
        gap:22px;
        margin-top:10px;
      }
      .header-logo { width:60px; height:auto; display:block; }
      .header-text { text-align:left; }
      .brand { font-size:20px; font-weight:800; color:#FB6A13; line-height:1.2; }
      .subtitle { font-size:14px; font-weight:500; color:#555; margin-top:2px; }

      /* MOBILE FIX */
      @media only screen and (max-width: 480px) {
        .header-inner {
          flex-direction: column !important;
          gap: 12px !important;
        }
        .header-logo {
          margin-bottom: 6px !important;
        }
        .header-text {
          text-align:center !important;
        }
      }

      .title {
        font-size:22px;
        font-weight:700;
        color:#333;
        margin:25px 0 10px;
      }

      .section { margin-top:22px; }
      .label { font-weight:700; font-size:14px; margin-bottom:4px; color:#333; }
      .value {
        background:#fafafa; border:1px solid #eee;
        border-radius:6px; padding:12px;
        font-size:15px; color:#444;
        white-space:pre-wrap; line-height:1.5;
      }

      .footer {
        margin-top:30px; font-size:13px; color:#777;
        text-align:center; padding-top:10px;
        border-top:1px solid #eee;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <div class="header-inner">
          <img src="${LOGO_URL}" class="header-logo" />
          <div class="header-text">
            <div class="brand">Promar</div>
            <div class="subtitle">agencija za digitalna rješenja</div>
          </div>
        </div>
      </div>

      <div class="title">Novi upit preko kontakt forme</div>

      <div class="section"><div class="label">Ime i prezime:</div><div class="value">${data.name}</div></div>
      <div class="section"><div class="label">Email:</div><div class="value">${data.email}</div></div>
      <div class="section"><div class="label">Mobitel:</div><div class="value">${data.phone}</div></div>
      <div class="section"><div class="label">Usluga:</div><div class="value">${data.service}</div></div>
      <div class="section"><div class="label">Poruka:</div><div class="value">${data.message}</div></div>

      <div class="footer">
        Promar — agencija za digitalna rješenja<br/>
        Ova poruka je poslana preko <strong>www.promar.hr</strong>
      </div>
    </div>
  </body>
  </html>
  `;
}

/* ============================================================================
   AUTORESPONDER — MAIL KOJI DOBIVA KLIJENT
============================================================================ */
function generateAutoReplyHtml(name) {
  return `
  <!DOCTYPE html>
  <html lang="hr">
  <head>
    <meta charset="UTF-8" />
    <title>Hvala na vašoj poruci – Promar</title>

    <style>
      body { background:#f4f4f4; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; }
      .container { max-width:650px; background:#fff; margin:30px auto; border-radius:12px; overflow:hidden; border:1px solid #eaeaea; }
      .top-bar { height:6px; background:#FB6A13; }

      /* SAME HEADER AS MAIN MAIL */
      .header { text-align:center; padding-bottom:0; padding-top:20px; }
      .header-inner {
        display:flex;
        align-items:center;
        justify-content:center;
        gap:22px;
        margin-bottom:10px;
      }
      .header-logo { width:60px; height:auto; display:block; }
      .header-text { text-align:left; }
      .brand { font-size:20px; font-weight:800; color:#FB6A13; line-height:1.2; }
      .subtitle { font-size:14px; font-weight:500; color:#555; margin-top:2px; }

      /* MOBILE FIX */
      @media only screen and (max-width: 480px) {
        .header-inner {
          flex-direction: column !important;
          gap: 12px !important;
        }
        .header-logo {
          margin-bottom: 6px !important;
        }
        .header-text {
          text-align:center !important;
        }
      }

      .title {
        font-size:22px;
        font-weight:700;
        color:#333;
        margin:10px 0 20px;
        text-align:left;
      }

      .content { padding:0 30px 30px; }
      p { font-size:16px; color:#444; line-height:1.7; }

      .button { text-align:center; margin:25px 0; }
      .button a {
        background:#FB6A13; color:#fff; padding:12px 26px;
        border-radius:6px; text-decoration:none; font-size:16px;
      }

      .footer {
        background:#fafafa; padding:20px; text-align:center;
        font-size:13px; color:#777; border-top:1px solid #eee;
      }
    </style>
  </head>

  <body>
    <div class="container">
      
      <div class="top-bar"></div>

      <div class="header">
        <div class="header-inner">
          <img src="${LOGO_URL}" class="header-logo" />
          <div class="header-text">
            <div class="brand">Promar</div>
            <div class="subtitle">agencija za digitalna rješenja</div>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="title">Hvala na vašoj poruci${name ? ", " + name : ""}!</div>

        <p>
          Zaprimili smo vaš upit i javit ćemo vam se u najkraćem mogućem roku.
          Ovo je automatska potvrda da je vaša poruka uspješno zaprimljena.
        </p>

        <div class="button">
          <a href="https://www.promar.hr" target="_blank">Posjeti web stranicu</a>
        </div>

        <h3 style="font-size:17px;margin-top:30px;color:#333;">Što slijedi dalje?</h3>
        <p>
          • Naš tim će pregledati vaš upit.<br/>
          • Kontaktirat ćemo vas povratno s detaljima.<br/>
          • Ako bude potrebno više informacija — javit ćemo se dodatno.
        </p>

        <h3 style="font-size:17px;margin-top:25px;color:#333;">Imate dodatno pitanje?</h3>
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

/* ============================================================================
   ANTI-SPAM
============================================================================ */
function isSpam(body) {
  return !!body.honeypot;
}

/* ============================================================================
   MAIN HANDLER
============================================================================ */
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

    // 2️⃣ AUTOREPLY KLIJENTU
    await transporter.sendMail({
      from: "Promar <info@promar.hr>",
      to: body.email,
      subject: "Hvala na vašoj poruci – Promar",
      html: generateAutoReplyHtml(body.name)
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
