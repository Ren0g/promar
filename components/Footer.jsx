import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/images/logo-dark.png" alt="Promar logo" />

          <div className="footer-brand-text">
            <h2 className="footer-brand-title">Promar</h2>
            <p className="footer-tagline">
              Web stranice, aplikacije i digitalna rješenja za obrte i male firme.
            </p>
          </div>
        </div>

        <div className="footer-links">
          <h4>Navigacija</h4>
          <Link href="/">Početna</Link>
          <Link href="/izrada-web-stranica">Web stranice</Link>
          <Link href="/usluge">Usluge</Link>
          <Link href="/reference">Primjeri radova</Link>
          <Link href="/savjeti">Savjeti</Link>
          <Link href="/o-nama">O nama</Link>
          <Link href="/kontakt">Kontakt</Link>
          <a href="/cjenik-promar.pdf" target="_blank" rel="noopener noreferrer">Kompletan cjenik (PDF)</a>
          <a href="/STUDIO_KURILOVECKA152_VELIKAGORICA_U01_0001_20261116_1832.csv" download>Objava cjenika (CSV)</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Promar. Sva prava pridržana.</p>
      </div>
    </footer>
  );
}
