import TransferPortalClient from "@/components/TransferPortalClient";

export const metadata = {
  title: "Promar Transfer",
  description:
    "Privremeni portal za upload i preuzimanje svadbenih materijala preko Backblaze B2 storagea.",
  robots: {
    index: false,
    follow: false
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
