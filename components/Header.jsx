"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "./Button";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
        {/* Logo */}
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src="/images/logo-dark.png" alt="Promar logo" />
        </Link>

        {/* Desktop navigacija */}
        <nav className="nav">
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

        {/* Desktop CTA */}
        <div className="header-cta">
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
        </div>

        {/* Mobile toggle (hamburger) */}
        <div
          className="mobile-nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Otvori navigaciju"
        >
          ☰
        </div>
      </div>

      {/* Mobile meni */}
      <div className={`mobile-nav-menu ${menuOpen ? "show" : ""}`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
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
