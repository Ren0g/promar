"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "./Button";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Početna" },
    { href: "/usluge", label: "Usluge" },
    { href: "/reference", label: "Reference" },
    { href: "/o-nama", label: "O nama" },
    { href: "/kontakt", label: "Kontakt" }
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo-area">
          <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img src="/images/logo-dark.png" alt="Promar logo" />
          </Link>

          <span className="brand-tagline">
            Promar — agencija za digitalna rješenja
          </span>
        </div>

        <nav className="nav" aria-label="Glavna navigacija">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-cta">
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
        </div>

        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Zatvori navigaciju" : "Otvori navigaciju"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div
        id="mobile-nav-menu"
        className={`mobile-nav-menu ${menuOpen ? "show" : ""}`}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}

        <Button
          href="/kontakt"
          variant="primary"
          style={{ marginTop: "14px", width: "100%" }}
        >
          Zatražite ponudu
        </Button>
      </div>
    </header>
  );
}
