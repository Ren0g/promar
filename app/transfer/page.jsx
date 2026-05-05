import TransferPortalClient from "@/components/TransferPortalClient";

export const metadata = {
  title: "Promar Transfer",
  description: "Portal za razmjenu datoteka",
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "Promar Transfer",
    description: "Portal za razmjenu datoteka",
    url: "https://promar.hr/transfer",
    siteName: "Promar",
    images: [
      {
        url: "/images/transfer-logo.png",
        width: 1000,
        height: 1000,
        alt: "Promar Transfer"
      }
    ],
    locale: "hr_HR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Promar Transfer",
    description: "Portal za razmjenu datoteka",
    images: ["/images/transfer-logo.png"]
  }
};

export default function TransferPage() {
  return (
    <section className="transfer-page">
      <div className="container transfer-page-container">
        <TransferPortalClient />
      </div>
    </section>
  );
}
