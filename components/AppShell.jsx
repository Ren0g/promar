"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isTransferRoute = pathname === "/transfer" || pathname.startsWith("/transfer/");

  if (isTransferRoute) {
    return (
      <div className="app app-transfer-only">
        <main className="page-content">{children}</main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="page-content">{children}</main>
      <Footer />
    </div>
  );
}
