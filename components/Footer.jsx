import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">

        {/* LEFT COLUMN – LOGO + PROMAR + TAGLINE */}
        <div className="footer-brand">
          <img src="/images/logo-dark.png" alt="Promar logo" />

          {/* WRAPPER: PROMAR + TAGLINE */}
          <div className="footer-brand-text">
            <h2 className="footer-brand-title">Promar</h2>
            <p className="footer-tagline">
              Studio za web, aplikacije i digitalni marketing.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN – NAVIGACIJA */}
        <div className="footer-links">
          <h4>Navigacija</h4>
          <Link href="/">Početna</Link>
          <Link href="/usluge">Usluge</Link>
          <Link href="/reference">Reference</Link>
          <Link href="/o-nama">O nama</Link>
          <Link href="/kontakt">Kontakt</Link>
        </div>

      </div>

      {/* COPYRIGHT NA DNU */}
      <div className="footer-bottom">
        <p>© 2025 Promar. Sva prava pridržana.</p>
      </div>
    </footer>
  );
}
