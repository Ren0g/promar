import "./globals.css";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "Promar – izrada web stranica, aplikacija i digitalnih rješenja",
  description:
    "Promar izrađuje moderne web stranice, web aplikacije i digitalna rješenja za obrte, male firme i projekte kojima treba ozbiljan online nastup.",
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
