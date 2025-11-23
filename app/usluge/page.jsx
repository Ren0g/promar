export const metadata = {
  title: "Usluge | Promar – Web, aplikacije i marketing",
  description:
    "Izrada web stranica, web aplikacija, digitalni marketing te foto i video produkcija. Sve što vam treba za ozbiljan online nastup."
};

import SectionTitle from "../../components/SectionTitle";
import Button from "../../components/Button";

export default function UslugePage() {
  return (
    <section className="section">
      <div className="container">
        <SectionTitle
          kicker="USLUGE"
          title="Sve što vam treba za online nastup"
          subtitle="Web stranice, web aplikacije, digitalni marketing i foto/video produkcija."
        />

        <div className="cards-grid">
          <div className="card">
            <h3>Izrada web stranica</h3>
            <p>
              Moderne, brze i responzivne stranice. Dizajn, razvoj i osnovni SEO
              uključeni.
            </p>
          </div>

          <div className="card">
            <h3>Izrada web aplikacija</h3>
            <p>
              Booking sustavi, CRM funkcije, dashboardi i specijalne web
              funkcionalnosti prilagođene vašem poslovanju.
            </p>
          </div>

          <div className="card">
            <h3>Digitalni marketing</h3>
            <p>
              Vođenje društvenih mreža, oglasi, vizuali, analiza i strategija.
              Fokus na rezultate, a ne na “lajkove”.
            </p>
          </div>

          <div className="card">
            <h3>Foto &amp; video produkcija</h3>
            <p>
              Fotografija i videografija za evente, sport, reklame i brendove.
              Projekti poput Fotqa i VGB kao dokaz.
            </p>
          </div>
        </div>

        <div className="section-cta-centered">
          <Button href="/kontakt" variant="primary">
            Javite se za procjenu projekta
          </Button>
        </div>
      </div>
    </section>
  );
}