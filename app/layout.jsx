import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        <div className="app">
          <Header />
          <main className="page-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}