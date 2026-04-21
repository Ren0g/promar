import "./globals.css";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "Promar – Web, aplikacije i marketing",
  description:
    "Promar je studio specijaliziran za izradu modernih web stranica, web aplikacija, digitalni marketing te foto i video produkciju. Radimo brzo, uredno i bez kompliciranja.",
  metadataBase: new URL("https://promar.hr")
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}