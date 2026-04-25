export const metadata = {
  title: "Savjeti | Promar",
  description:
    "Korisni tekstovi za obrte i male firme o web stranicama, online nastupu i digitalnim rješenjima.",
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
            title="Korisni tekstovi za obrte i male firme"
            subtitle="Praktični vodiči koji pomažu da jasnije odlučite što vam treba za ozbiljan online nastup — bez nepotrebnog kompliciranja."
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
              <h2>Izrada web stranica za obrte i male firme već od 299 €</h2>
              <p>
                Treba vam jednostavna, moderna i profesionalna web stranica za
                obrt ili malu firmu? U ovom vodiču objašnjavamo zašto web
                stranica nije trošak, nego digitalni izlog koji radi za vas.
              </p>

              <div className="article-listing-actions">
                <Button
                  href="/savjeti/izrada-web-stranica-za-obrte-male-firme"
                  variant="primary"
                >
                  Pročitajte članak
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
