export const metadata = {
  title: "Savjeti | Promar",
  description:
    "Praktični savjeti za obrte i male firme o web stranicama, online nastupu i digitalnim rješenjima.",
  alternates: {
    canonical: "/savjeti"
  }
};

import Button from "../../components/Button";
import SectionTitle from "../../components/SectionTitle";

export default function SavjetiPage() {
  return (
    <>
      <section className="section section-alt savjeti-hero">
        <div className="container">
          <SectionTitle
            kicker="SAVJETI"
            title="Praktični vodiči prije odluke o web stranici"
            subtitle="Kratki i konkretni tekstovi za obrte i male firme koje žele znati što im stvarno treba prije nego krenu u izradu weba."
            titleAs="h1"
            titleClassName="page-main-title"
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="article-listing-card article-listing-featured">
            <div className="article-listing-media">
              <img
                src="/images/savjeti-web-stranica.png"
                alt="Prikaz moderne web stranice na laptopu i mobitelu"
              />
            </div>

            <div className="article-listing-content">
              <p className="article-listing-meta">Web stranice • Obrti i male firme</p>
              <h2>Web stranica za obrt: kada je dovoljna osnovna stranica, a kada treba više?</h2>
              <p>
                Vodič za obrte i male firme koje žele ozbiljan online nastup,
                ali ne žele plaćati funkcionalnosti koje im trenutačno ne trebaju.
              </p>

              <div className="article-listing-actions">
                <Button
                  href="/savjeti/izrada-web-stranica-za-obrte-male-firme"
                  variant="primary"
                >
                  Pročitajte vodič
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
