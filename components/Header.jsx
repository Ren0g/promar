"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Početna" },
    { href: "/usluge", label: "Usluge" },
    { href: "/reference", label: "Reference" },
    { href: "/o-nama", label: "O nama" },
    { href: "/kontakt", label: "Kontakt" }
  ];

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <img src="/images/logo-dark.png" alt="Promar logo" />
        </Link>

        <nav className="nav">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-cta">
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
        </div>
      </div>
    </header>
  );
}
