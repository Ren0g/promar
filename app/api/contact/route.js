function generateAutoReplyHtml(name) {
  return `
  <!DOCTYPE html>
  <html lang="hr">
  <head>
    <meta charset="UTF-8" />
    <title>Hvala na poruci – Promar</title>

    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f4f4f4;
        font-family: Arial, Helvetica, sans-serif;
      }

      .container {
        max-width: 650px;
        background: #ffffff;
        margin: 30px auto;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #eaeaea;
      }

      .top-bar {
        height: 6px;
        background: #FB6A13;
        width: 100%;
      }

      .header {
        text-align: center;
        padding: 30px 20px 20px;
      }

      .logo img {
        max-width: 180px;
        height: auto;
        margin-bottom: 14px;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        color: #FB6A13;
        font-weight: 800;
      }

      p {
        font-size: 16px;
        color: #444;
        line-height: 1.7;
      }

      .content {
        padding: 0 30px 30px;
      }

      .button {
        text-align: center;
        margin: 25px 0;
      }

      .button a {
        background: #FB6A13;
        color: #fff !important;
        padding: 12px 26px;
        border-radius: 6px;
        text-decoration: none;
        font-size: 16px;
        display: inline-block;
      }

      .section-title {
        font-weight: 700;
        margin-top: 30px;
        font-size: 17px;
        color: #333;
      }

      .footer {
        background: #fafafa;
        padding: 20px;
        text-align: center;
        font-size: 13px;
        color: #777;
        border-top: 1px solid #eee;
      }

      .social {
        margin-top: 10px;
      }

      .social a {
        color: #FB6A13;
        text-decoration: none;
        margin: 0 6px;
      }

      @media only screen and (max-width: 600px) {
        .container { border-radius: 0; margin: 0; }
        .content { padding: 0 20px 20px; }
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
        <h2>Hvala na vašem upitu${name ? ", " + name : ""}!</h2>
      </div>

      <div class="content">
        <p>
          Zaprimili smo vašu poruku i javit ćemo vam se povratno u najkraćem mogućem roku.
          Ovo je automatska potvrda kako je vaš upit uspješno zaprimljen.
        </p>

        <div class="button">
          <a href="https://www.promar.hr" target="_blank">Posjeti web stranicu</a>
        </div>

        <div class="section-title">Što slijedi dalje?</div>
        <p>
          • Naš tim će pregledati vaš upit.<br/>
          • Uskoro ćete dobiti detaljan odgovor ili ponudu.<br/>
          • Ako je potrebno više informacija – javit ćemo se dodatno.
        </p>

        <div class="section-title">Imate dodatno pitanje?</div>
        <p>
          Slobodno nam se obratite putem e-maila ili telefona – uvijek smo tu da pomognemo.
        </p>

      </div>

      <div class="footer">
        Srdačan pozdrav,<br/>
        <strong>Promar</strong><br/>
        <a href="https://www.promar.hr" style="color:#FB6A13;text-decoration:none;">www.promar.hr</a>

        <div class="social">
          <a href="https://www.instagram.com/" target="_blank">Instagram</a> |
          <a href="https://www.facebook.com/" target="_blank">Facebook</a>
        </div>
      </div>

    </div>
  </body>
  </html>
  `;
}
