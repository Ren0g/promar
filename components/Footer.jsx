import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/images/logo-dark.png" alt="Promar logo" />
          <p>Studio za web, aplikacije i digitalni marketing.</p>
        </div>

        <div className="footer-links">
          <h4>Navigacija</h4>
          <Link href="/">Početna</Link>
          <Link href="/usluge">Usluge</Link>
          <Link href="/reference">Reference</Link>
          <Link href="/o-nama">O nama</Link>
          <Link href="/kontakt">Kontakt</Link>
        </div>

        <div className="footer-meta">
          <p>© {year} Promar. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  );
}