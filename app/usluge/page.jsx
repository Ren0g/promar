export const metadata = {
  title: "Usluge | Promar – web stranice, aplikacije i marketing",
  description:
    "Promar izrađuje web stranice, web aplikacije, digitalni marketing i foto/video sadržaj za obrte, male firme i digitalne projekte."
};

import SectionTitle from "../../components/SectionTitle";
import Button from "../../components/Button";

const usluge = [
  {
    naslov: "Izrada web stranica",
    opis:
      "Za obrte, firme i uslužne djelatnosti kojima treba jasan online nastup: ponuda, usluge, kontakt, osnovni SEO i mobilna prilagodba.",
    cta: "Pogledajte pakete",
    href: "/izrada-web-stranica"
  },
  {
    naslov: "Izrada web aplikacija",
    opis:
      "Za procese koje obična web stranica ne može riješiti: upitnici, rezervacije, interni paneli, evidencije, dashboardi i specifične funkcionalnosti.",
    cta: "Pošaljite upit",
    href: "/kontakt"
  },
  {
    naslov: "Digitalni marketing",
    opis:
      "Za projekte kojima nakon izrade weba treba vidljivost: sadržaj, oglasi, kampanje, vizuali i jasnije predstavljanje ponude.",
    cta: "Zatražite procjenu",
    href: "/kontakt"
  },
  {
    naslov: "Foto & video produkcija",
    opis:
      "Za webove i kampanje kojima trebaju vlastite fotografije, video materijali, sadržaj za društvene mreže ili snimanje događaja i projekata.",
    cta: "Dogovorite sadržaj",
    href: "/kontakt"
  }
];

export default function UslugePage() {
  return (
    <>
      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="USLUGE"
            title="Digitalna rješenja koja imaju konkretan zadatak"
            subtitle="Ne treba svima isti paket. Nekome treba jednostavan web, nekome aplikacija, a nekome sadržaj i marketing koji će webu dati smisao."
            titleAs="h1"
            titleClassName="page-main-title"
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cards-grid">
            {usluge.map((usluga) => (
              <div className="card" key={usluga.naslov}>
                <h3>{usluga.naslov}</h3>
                <p>{usluga.opis}</p>
                <div className="section-cta-centered">
                  <Button href={usluga.href} variant="secondary">
                    {usluga.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="KAKO ODABRATI"
            title="Krenite od cilja, ne od popisa funkcionalnosti"
            subtitle="Ako želite više upita, prvo treba jasna ponuda i dobra kontaktna struktura. Ako želite automatizirati proces, tada ima smisla web aplikacija. Ako želite više vidljivosti, tada treba sadržaj i marketing."
          />

          <ul className="list-check">
            <li>Za osnovnu online prisutnost krenite s web stranicom.</li>
            <li>Za složenije procese razmatramo web aplikaciju.</li>
            <li>Za oglašavanje i rast pripremamo sadržaj, vizuale i kampanje.</li>
            <li>Za bolji prvi dojam možemo izraditi fotografije i video materijale.</li>
          </ul>
        </div>
      </section>

      <section className="section section-cta">
        <div className="container cta-inner">
          <div>
            <h2>Niste sigurni što Vam treba?</h2>
            <p>Pošaljite osnovne informacije i predložit ćemo rješenje koje ima smisla.</p>
          </div>
          <Button href="/kontakt" variant="primary">
            Zatražite procjenu
          </Button>
        </div>
      </section>
    </>
  );
}
